import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams

    const sort = searchParams.get("sort") || "new"
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let query = supabase.from("grievances").select("*").eq("is_hidden", false)

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
      query = query
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order("upvotes", { ascending: false })
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ grievances: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { title, description, category, impact, frequency, anonymous_token } = body

    // Ensure anonymous token exists
    const { data: tokenData, error: tokenError } = await supabase
      .from("anonymous_tokens")
      .select("token")
      .eq("token", anonymous_token)
      .single()

    if (tokenError) {
      // Create token if it doesn't exist
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
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ grievance: data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
