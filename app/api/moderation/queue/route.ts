import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is admin/moderator
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const queue = searchParams.get("queue") || "new"

    let query = supabase.from("grievances").select("*").eq("is_hidden", false)

    if (queue === "new") {
      query = query.eq("status", "open").order("created_at", { ascending: false })
    } else if (queue === "in_progress") {
      query = query.eq("status", "in_progress").order("updated_at", { ascending: false })
    } else if (queue === "resolved") {
      query = query.eq("status", "resolved").order("updated_at", { ascending: false })
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ grievances: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
