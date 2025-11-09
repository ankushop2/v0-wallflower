import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// GET /api/grievances/[id]/messages - Get all messages for a grievance
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createServerClient()

  const { id } = await params

  // Get or create thread for this grievance
  const { data: thread, error: threadError } = await supabase
    .from("blind_dm_threads")
    .select("id")
    .eq("grievance_id", id)
    .maybeSingle()

  if (threadError) {
    console.error("[v0] Error fetching thread:", threadError)
    return NextResponse.json({ error: threadError.message }, { status: 500 })
  }

  if (!thread) {
    // No thread exists yet, return empty messages
    return NextResponse.json({ messages: [] })
  }

  // Fetch messages for this thread
  const { data: messages, error: messagesError } = await supabase
    .from("blind_dm_messages")
    .select("*")
    .eq("thread_id", thread.id)
    .order("created_at", { ascending: true })

  if (messagesError) {
    console.error("[v0] Error fetching messages:", messagesError)
    return NextResponse.json({ error: messagesError.message }, { status: 500 })
  }

  // Transform to frontend format
  const formattedMessages = messages.map((msg: any) => ({
    id: msg.id,
    from: msg.is_from_moderator ? "moderator" : "poster",
    body: msg.content,
    createdAt: msg.created_at,
    read: true,
  }))

  return NextResponse.json({ messages: formattedMessages })
}

// POST /api/grievances/[id]/messages - Send a new message
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient()

    const { id } = await params
    const body = await request.json()
    const { content, anonymous_token, is_from_moderator = false } = body

    console.log("[v0] Sending message for grievance:", id)

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    // Get or create thread for this grievance
    let threadId: string

    const { data: existingThread, error: threadFetchError } = await supabase
      .from("blind_dm_threads")
      .select("id")
      .eq("grievance_id", id)
      .maybeSingle()

    if (threadFetchError) {
      console.error("[v0] Error fetching thread:", threadFetchError)
      return NextResponse.json({ error: "Failed to fetch thread" }, { status: 500 })
    }

    if (existingThread) {
      threadId = existingThread.id
      console.log("[v0] Using existing thread:", threadId)
    } else {
      // Create new thread without requiring a moderator
      console.log("[v0] Creating new thread for grievance:", id)

      const { data: newThread, error: threadError } = await supabase
        .from("blind_dm_threads")
        .insert({
          grievance_id: id,
          anonymous_token: anonymous_token || `anon_${Date.now()}`,
          moderator_id: null, // Allow null moderator initially
        })
        .select("id")
        .single()

      if (threadError || !newThread) {
        console.error("[v0] Error creating thread:", threadError)
        return NextResponse.json({ error: "Failed to create thread" }, { status: 500 })
      }

      threadId = newThread.id
      console.log("[v0] Created new thread:", threadId)
    }

    // Insert message
    const { data: message, error: messageError } = await supabase
      .from("blind_dm_messages")
      .insert({
        thread_id: threadId,
        is_from_moderator,
        content: content.trim(),
      })
      .select("*")
      .single()

    if (messageError || !message) {
      console.error("[v0] Error creating message:", messageError)
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }

    console.log("[v0] Message sent successfully:", message.id)

    // Transform to frontend format
    const formattedMessage = {
      id: message.id,
      from: message.is_from_moderator ? "moderator" : "poster",
      body: message.content,
      createdAt: message.created_at,
      read: true,
    }

    return NextResponse.json({ message: formattedMessage })
  } catch (error) {
    console.error("[v0] Unexpected error in POST /api/grievances/[id]/messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
