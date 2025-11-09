import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { vote_type, anonymous_token } = body

    // Ensure anonymous token exists
    await supabase.from("anonymous_tokens").upsert({ token: anonymous_token, last_seen: new Date().toISOString() })

    // Check for existing vote
    const { data: existingVote } = await supabase
      .from("votes")
      .select("*")
      .eq("grievance_id", id)
      .eq("anonymous_token", anonymous_token)
      .single()

    if (existingVote) {
      if (existingVote.vote_type === vote_type) {
        // Remove vote
        await supabase.from("votes").delete().eq("id", existingVote.id)

        return NextResponse.json({ message: "Vote removed" })
      } else {
        // Update vote
        await supabase.from("votes").update({ vote_type }).eq("id", existingVote.id)

        return NextResponse.json({ message: "Vote updated" })
      }
    } else {
      // Insert new vote
      await supabase.from("votes").insert({
        grievance_id: id,
        anonymous_token,
        vote_type,
      })

      return NextResponse.json({ message: "Vote added" })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
