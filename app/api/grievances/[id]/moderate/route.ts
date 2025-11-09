import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { fireWebhooks } from "@/lib/webhooks"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()
    const { action, reason } = body // action: 'approve' | 'reject'

    const { id: grievanceId } = await params

    console.log(`[v0] Moderating grievance ${grievanceId} with action: ${action}`)

    // Check user is authenticated and has moderator role
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!userData || !["admin", "moderator", "owner"].includes(userData.role)) {
      return NextResponse.json({ error: "Forbidden - requires moderator role" }, { status: 403 })
    }

    if (action === "approve") {
      const { data, error } = await supabase
        .from("grievances")
        .update({
          moderation_status: "approved",
          needs_moderation: false,
          is_hidden: false,
          status: "open",
          moderated_by: user.id,
          moderated_at: new Date().toISOString(),
          moderation_reason: reason || null,
        })
        .eq("id", grievanceId)
        .select()
        .single()

      if (error) throw error

      if (data) {
        console.log(`[v0] Grievance approved, firing webhooks for category: ${data.category}`)
        fireWebhooks(data, data.category).catch((err) => console.error("[v0] Failed to fire webhooks:", err))
      }

      return NextResponse.json({ success: true, grievance: data })
    } else if (action === "reject") {
      const { data, error } = await supabase
        .from("grievances")
        .update({
          moderation_status: "rejected",
          needs_moderation: false,
          is_hidden: true,
          moderated_by: user.id,
          moderated_at: new Date().toISOString(),
          moderation_reason: reason || null,
        })
        .eq("id", grievanceId)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ success: true, grievance: data })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("[v0] Moderation error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
