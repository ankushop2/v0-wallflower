import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const supabase = await createClient()

    const { data, error } = await supabase.from("grievances").select("*").eq("id", id).single()

    if (error) throw error

    // Transform database row to match frontend types
    const grievance = {
      id: data.id,
      title: data.title,
      body: data.body,
      pseudonym: data.pseudonym,
      anonymousToken: data.anonymous_token,
      category: data.category,
      impact: data.impact,
      frequency: data.frequency,
      suggestedFix: data.suggested_fix,
      status: data.status,
      up: data.upvotes || 0,
      down: data.downvotes || 0,
      tags: data.tags || [],
      reactions: data.reactions || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }

    return NextResponse.json({ grievance })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const supabase = await createClient()
    const body = await request.json()

    // Check if user is admin/moderator
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase.from("grievances").update(body).eq("id", id).select().single()

    if (error) throw error

    return NextResponse.json({ grievance: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
