"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SparklesIcon, SendIcon, Loader2Icon, BotIcon, UserIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  toolInvocations?: Array<{
    toolCallId: string
    state: string
    result?: { message?: string }
  }>
}

export function ModeratorCopilotChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your AI copilot for moderation. I can help you with:\n\n• Check pending grievances\n• Search for specific issues\n• Get platform statistics\n• Analyze trends by category\n• View moderator workload\n• Monitor webhook status\n\nWhat would you like to know?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const apiMessages = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch("/api/moderator/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...apiMessages, { role: "user", content: input }],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (reader) {
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (!line.trim()) continue

            console.log("[v0] Stream line:", line)

            // AI SDK text delta format
            if (line.startsWith("0:")) {
              try {
                const jsonStr = line.slice(2).trim()
                if (!jsonStr) continue

                const parsed = JSON.parse(jsonStr)
                console.log("[v0] Parsed chunk:", parsed)

                // Extract text from different possible formats
                let text = ""
                if (typeof parsed === "string") {
                  text = parsed
                } else if (parsed.type === "text-delta" && parsed.textDelta) {
                  text = parsed.textDelta
                } else if (parsed.content) {
                  text = parsed.content
                }

                if (text) {
                  assistantMessage.content += text
                  setMessages((prev) => {
                    const newMessages = [...prev]
                    newMessages[newMessages.length - 1] = { ...assistantMessage }
                    return newMessages
                  })
                }
              } catch (e) {
                console.error("[v0] Parse error:", e, "Line:", line)
              }
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim()) {
          console.log("[v0] Remaining buffer:", buffer)
        }
      }
    } catch (error) {
      console.error("[v0] Error in copilot chat:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex flex-col h-[600px] border-primary/20">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b bg-primary/5">
        <SparklesIcon className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Moderator Copilot</h3>
        <Badge variant="secondary" className="ml-auto">
          AI Assistant
        </Badge>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <BotIcon className="h-4 w-4 text-primary" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>

                {/* Tool calls display */}
                {message.toolInvocations?.map((toolInvocation) => (
                  <div key={toolInvocation.toolCallId} className="mt-2 text-xs opacity-70">
                    {toolInvocation.state === "result" && (
                      <div className="italic">✓ {toolInvocation.result?.message || "Tool executed"}</div>
                    )}
                  </div>
                ))}
              </div>

              {message.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                  <UserIcon className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <BotIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2Icon className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about grievances, stats, or moderation..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
            <SendIcon className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </form>
    </Card>
  )
}
