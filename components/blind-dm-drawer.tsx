"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { BlindMessage } from "@/lib/types"
import { safeFormatDistanceToNow } from "@/lib/date-utils"
import { SendIcon, ShieldIcon, UserIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getAnonymousToken } from "@/lib/anonymous-token"

interface BlindDmDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  messages: BlindMessage[]
  grievanceId: string
  posterPseudonym: string
  onMessagesUpdate?: (messages: BlindMessage[]) => void
}

export function BlindDmDrawer({
  open,
  onOpenChange,
  messages: initialMessages,
  grievanceId,
  posterPseudonym,
  onMessagesUpdate,
}: BlindDmDrawerProps) {
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState<BlindMessage[]>(initialMessages)
  const [anonymousToken, setAnonymousToken] = useState<string>("")

  useEffect(() => {
    setAnonymousToken(getAnonymousToken())
  }, [])

  useEffect(() => {
    if (open) {
      fetchMessages()
    }
  }, [open, grievanceId])

  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/grievances/${grievanceId}/messages`)
      if (!response.ok) throw new Error("Failed to fetch messages")

      const data = await response.json()
      setMessages(data.messages || [])

      if (onMessagesUpdate) {
        onMessagesUpdate(data.messages || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching messages:", error)
    }
  }

  const handleSend = async () => {
    if (!newMessage.trim()) return

    setIsSending(true)
    try {
      const response = await fetch(`/api/grievances/${grievanceId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage,
          anonymous_token: anonymousToken,
          is_from_moderator: false,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const data = await response.json()

      // Add new message to local state
      const updatedMessages = [...messages, data.message]
      setMessages(updatedMessages)

      if (onMessagesUpdate) {
        onMessagesUpdate(updatedMessages)
      }

      setNewMessage("")
    } catch (error) {
      console.error("[v0] Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col">
        <SheetHeader>
          <SheetTitle>Blind Direct Messages</SheetTitle>
          <SheetDescription>Anonymous conversation with {posterPseudonym}. Identities are protected.</SheetDescription>
        </SheetHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="mb-4 text-4xl opacity-20">💬</div>
              <p className="text-sm text-muted-foreground">
                No messages yet. Start a conversation to get more context.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} posterPseudonym={posterPseudonym} />
            ))
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border pt-4 space-y-3">
          <Textarea
            placeholder="Type your message... (This conversation is anonymous)"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <Button onClick={handleSend} disabled={!newMessage.trim() || isSending} className="w-full gap-2">
            <SendIcon className="h-4 w-4" />
            {isSending ? "Sending..." : "Send Message"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface MessageBubbleProps {
  message: BlindMessage
  posterPseudonym: string
}

function MessageBubble({ message, posterPseudonym }: MessageBubbleProps) {
  const isPoster = message.from === "poster"

  return (
    <div className={`flex gap-3 ${isPoster ? "flex-row" : "flex-row-reverse"}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isPoster ? "bg-blue-500/10 text-blue-500" : "bg-green-500/10 text-green-500"
        }`}
      >
        {isPoster ? <UserIcon className="h-4 w-4" /> : <ShieldIcon className="h-4 w-4" />}
      </div>

      <div className={`flex-1 space-y-1 ${isPoster ? "" : "flex flex-col items-end"}`}>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {isPoster ? posterPseudonym : message.from === "moderator" ? "Moderator" : "Team Owner"}
          </Badge>
          <time className="text-xs text-muted-foreground">
            {safeFormatDistanceToNow(message.createdAt, { addSuffix: true })}
          </time>
        </div>
        <div
          className={`rounded-lg p-3 max-w-[85%] ${
            isPoster ? "bg-blue-500/10 text-foreground" : "bg-muted text-foreground"
          }`}
        >
          <p className="text-sm leading-relaxed text-pretty">{message.body}</p>
        </div>
      </div>
    </div>
  )
}
