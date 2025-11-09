import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { status } = body

    // Check if user is admin/moderator
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update status
    const { data: grievance, error: updateError } = await supabase
      .from("grievances")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (updateError) throw updateError

    // Add system comment
    await supabase.from("comments").insert({
      grievance_id: id,
      user_id: user.id,
      content: `Status changed to ${status}`,
      comment_type: "status_change",
    })

    return NextResponse.json({ grievance })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
