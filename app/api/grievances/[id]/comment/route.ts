import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { content, anonymous_token } = body

    // Check if user is authenticated (moderator/admin) or anonymous
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Moderator/admin comment
      const { data, error } = await supabase
        .from("comments")
        .insert({
          grievance_id: id,
          user_id: user.id,
          content,
          comment_type: "comment",
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ comment: data })
    } else {
      // Anonymous comment
      await supabase.from("anonymous_tokens").upsert({ token: anonymous_token, last_seen: new Date().toISOString() })

      const { data, error } = await supabase
        .from("comments")
        .insert({
          grievance_id: id,
          anonymous_token,
          content,
          comment_type: "comment",
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ comment: data })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
