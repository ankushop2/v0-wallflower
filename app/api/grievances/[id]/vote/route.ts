import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { vote_type, type, anonymous_token } = body
    const voteType = vote_type || type

    if (!voteType || !["up", "down"].includes(voteType)) {
      return NextResponse.json({ error: "Invalid vote_type. Must be 'up' or 'down'" }, { status: 400 })
    }

    if (!anonymous_token) {
      return NextResponse.json({ error: "Missing anonymous_token" }, { status: 400 })
    }

    // Ensure anonymous token exists
    await supabase.from("anonymous_tokens").upsert({ token: anonymous_token, last_seen: new Date().toISOString() })

    const { data: existingVote } = await supabase
      .from("votes")
      .select("*")
      .eq("grievance_id", id)
      .eq("anonymous_token", anonymous_token)
      .maybeSingle()

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote
        await supabase.from("votes").delete().eq("id", existingVote.id)

        return NextResponse.json({ message: "Vote removed" })
      } else {
        // Update vote
        await supabase.from("votes").update({ vote_type: voteType }).eq("id", existingVote.id)

        return NextResponse.json({ message: "Vote updated" })
      }
    } else {
      // Insert new vote
      await supabase.from("votes").insert({
        grievance_id: id,
        anonymous_token,
        vote_type: voteType,
      })

      return NextResponse.json({ message: "Vote added" })
    }
  } catch (error: any) {
    console.error("[v0] Vote API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
