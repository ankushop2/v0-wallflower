"use client"

import { useState } from "react"
import type { Grievance, ThreadEvent, BlindMessage, TriageSuggestion } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusPill } from "@/components/status-pill"
import { VoteButtons } from "@/components/vote-buttons"
import { ReactionBar } from "@/components/reaction-bar"
import { ThreadTimeline } from "@/components/thread-timeline"
import { ThreadSidebar } from "@/components/thread-sidebar"
import { BlindDmDrawer } from "@/components/blind-dm-drawer"
import { TriageCopilot } from "@/components/triage-copilot"
import { safeFormatDistanceToNow } from "@/lib/date-utils"
import { ClockIcon, MessageSquareIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ThreadViewProps {
  grievance: Grievance
  events?: ThreadEvent[] // Made events optional
  messages?: BlindMessage[] // Made messages optional
  triageSuggestion: TriageSuggestion | null // Made triageSuggestion optional
}

export function ThreadView({ grievance, events = [], messages = [], triageSuggestion }: ThreadViewProps) {
  const [localUp, setLocalUp] = useState(grievance.up)
  const [localDown, setLocalDown] = useState(grievance.down)
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null)
  const [isDmDrawerOpen, setIsDmDrawerOpen] = useState(false)

  const handleVote = (type: "up" | "down") => {
    if (userVote === type) {
      if (type === "up") {
        setLocalUp(localUp - 1)
      } else {
        setLocalDown(localDown - 1)
      }
      setUserVote(null)
    } else {
      if (userVote === "up") {
        setLocalUp(localUp - 1)
        setLocalDown(localDown + 1)
      } else if (userVote === "down") {
        setLocalDown(localDown - 1)
        setLocalUp(localUp + 1)
      } else {
        if (type === "up") {
          setLocalUp(localUp + 1)
        } else {
          setLocalDown(localDown + 1)
        }
      }
      setUserVote(type)
    }
  }

  const handleReact = (emoji: string) => {
    console.log("React with", emoji)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
      {/* Main Content */}
      <div className="space-y-6">
        {/* Grievance Header */}
        <Card className="p-6">
          <div className="flex gap-4">
            <div className="shrink-0">
              <VoteButtons upvotes={localUp} downvotes={localDown} userVote={userVote} onVote={handleVote} />
            </div>

            <div className="flex-1 min-w-0 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold tracking-tight text-balance mb-3">{grievance.title}</h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm text-muted-foreground">{grievance.pseudonym}</span>
                    <span className="text-muted-foreground">·</span>
                    <Badge variant="outline">{grievance.category}</Badge>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <ClockIcon className="h-3.5 w-3.5" />
                      {safeFormatDistanceToNow(grievance.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <StatusPill status={grievance.status} />
              </div>

              <p className="text-foreground leading-relaxed text-pretty whitespace-pre-wrap">{grievance.body}</p>

              {grievance.suggestedFix && (
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Suggested Fix:</p>
                  <p className="text-sm text-foreground text-pretty">{grievance.suggestedFix}</p>
                </div>
              )}

              {grievance.tags && grievance.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {grievance.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <ReactionBar reactions={grievance.reactions || []} onReact={handleReact} />

                <Button variant="outline" size="sm" onClick={() => setIsDmDrawerOpen(true)} className="gap-2">
                  <MessageSquareIcon className="h-4 w-4" />
                  Messages ({messages.length})
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Triage Copilot (Moderator View) */}
        {triageSuggestion && <TriageCopilot suggestion={triageSuggestion} />}

        {/* Timeline */}
        <ThreadTimeline events={events} />
      </div>

      {/* Sidebar */}
      <div className="lg:sticky lg:top-20 lg:h-fit">
        <ThreadSidebar grievance={grievance} />
      </div>

      {/* Blind DM Drawer */}
      <BlindDmDrawer
        open={isDmDrawerOpen}
        onOpenChange={setIsDmDrawerOpen}
        messages={messages}
        grievanceId={grievance.id}
        posterPseudonym={grievance.pseudonym}
      />
    </div>
  )
}
