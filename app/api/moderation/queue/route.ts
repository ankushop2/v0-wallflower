import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()
    if (!userData || !["admin", "moderator", "owner"].includes(userData.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const queue = searchParams.get("queue") || "new"

    let query = supabase.from("grievances").select("*")

    if (queue === "new") {
      query = query
        .eq("needs_moderation", true)
        .eq("moderation_status", "pending")
        .order("created_at", { ascending: false })
    } else if (queue === "flagged") {
      query = query
        .eq("needs_moderation", true)
        .eq("moderation_status", "pending")
        .order("created_at", { ascending: false })
    } else if (queue === "needs_info") {
      query = query.eq("status", "needs_info").order("updated_at", { ascending: false })
    } else if (queue === "escalated") {
      query = query.eq("impact", "critical").eq("needs_moderation", true).order("created_at", { ascending: false })
    }

    const { data, error } = await query

    if (error) throw error

    const grievances = (data || []).map((row: any) => ({
      id: row.id,
      pseudonym: row.anonymous_token?.substring(0, 8) || "anon",
      title: row.title,
      body: row.description,
      category: row.category,
      tags: [],
      severity: row.impact === "critical" ? 5 : row.impact === "high" ? 4 : row.impact === "medium" ? 3 : 2,
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
    console.error("[v0] Moderation queue error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
