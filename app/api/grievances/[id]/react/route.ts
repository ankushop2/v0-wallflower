import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { emoji, anonymous_token } = body

    await supabase.from("anonymous_tokens").upsert({ token: anonymous_token, last_seen: new Date().toISOString() })

    // Check for existing reaction
    const { data: existingReaction } = await supabase
      .from("reactions")
      .select("*")
      .eq("grievance_id", id)
      .eq("anonymous_token", anonymous_token)
      .eq("emoji", emoji)
      .single()

    if (existingReaction) {
      // Remove reaction
      await supabase.from("reactions").delete().eq("id", existingReaction.id)

      return NextResponse.json({ message: "Reaction removed" })
    } else {
      // Add reaction
      await supabase.from("reactions").insert({
        grievance_id: id,
        anonymous_token,
        emoji,
      })

      return NextResponse.json({ message: "Reaction added" })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
