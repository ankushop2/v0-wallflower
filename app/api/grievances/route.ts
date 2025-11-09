import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { fireWebhooks } from "@/lib/webhooks"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams

    const sort = searchParams.get("sort") || "new"
    const period = searchParams.get("period") || "week"
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = supabase.from("grievances").select("*").eq("is_hidden", false)

    const now = new Date()
    let startDate: Date

    if (period === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (period === "week") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (period === "month") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    } else {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // default to week
    }

    query = query.gte("created_at", startDate.toISOString())

    // Apply filters
    if (status) {
      query = query.eq("status", status)
    }
    if (category) {
      query = query.eq("category", category)
    }

    // Apply sorting
    if (sort === "new") {
      query = query.order("created_at", { ascending: false })
    } else if (sort === "top") {
      query = query.order("upvotes", { ascending: false })
    } else if (sort === "rising") {
      // Rising: Recent posts with good upvote ratio
      query = query.order("upvotes", { ascending: false })
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) throw error

    const grievances = (data || []).map((row: any) => ({
      id: row.id,
      pseudonym: row.anonymous_token.substring(0, 8),
      title: row.title,
      body: row.description,
      category: row.category,
      tags: [],
      severity: 3,
      status: row.status,
      impact: row.impact,
      frequency: row.frequency,
      score: row.upvotes - row.downvotes,
      up: row.upvotes,
      down: row.downvotes,
      reactions: {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    return NextResponse.json({ grievances })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { title, description, category, impact, frequency, anonymous_token, needsModeration, moderationReason } = body

    // Ensure anonymous token exists
    const { data: tokenData, error: tokenError } = await supabase
      .from("anonymous_tokens")
      .select("token")
      .eq("token", anonymous_token)
      .maybeSingle()

    if (!tokenData) {
      await supabase.from("anonymous_tokens").insert({ token: anonymous_token })
    }

    const { data, error } = await supabase
      .from("grievances")
      .insert({
        title,
        description,
        category,
        impact,
        frequency,
        anonymous_token,
        needs_moderation: needsModeration || false,
        moderation_status: needsModeration ? "pending" : null,
        moderation_reason: moderationReason || null,
        is_hidden: needsModeration || false, // Hide until approved if needs moderation
      })
      .select()
      .single()

    if (error) throw error

    if (!needsModeration) {
      // Fire webhooks asynchronously (don't wait for completion)
      fireWebhooks(data, category).catch((err) => console.error("[v0] Failed to fire webhooks:", err))
    }

    return NextResponse.json(
      {
        grievance: data,
        needsModeration: needsModeration || false,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("[v0] Create grievance error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
