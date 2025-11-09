"use client"

import { useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusPill } from "@/components/status-pill"
import { VoteButtons } from "@/components/vote-buttons"
import { ReactionBar } from "@/components/reaction-bar"
import type { Grievance } from "@/lib/types"
import { MessageSquareIcon, ClockIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface GrievanceCardProps {
  grievance: Grievance
  compact?: boolean
}

export function GrievanceCard({ grievance, compact = false }: GrievanceCardProps) {
  const [localUp, setLocalUp] = useState(grievance.up)
  const [localDown, setLocalDown] = useState(grievance.down)
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null)

  const handleVote = (type: "up" | "down") => {
    if (userVote === type) {
      // Remove vote
      if (type === "up") {
        setLocalUp(localUp - 1)
      } else {
        setLocalDown(localDown - 1)
      }
      setUserVote(null)
    } else {
      // Add or change vote
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
    // In real app, this would update server
    console.log("React with", emoji)
  }

  const getTimeAgo = () => {
    try {
      const date = new Date(grievance.createdAt)
      if (isNaN(date.getTime())) {
        return "recently"
      }
      return formatDistanceToNow(date, { addSuffix: true })
    } catch {
      return "recently"
    }
  }

  return (
    <Card className="p-6 hover:border-primary/50 transition-colors">
      <div className="flex gap-4">
        {/* Vote Section */}
        <div className="shrink-0">
          <VoteButtons upvotes={localUp} downvotes={localDown} userVote={userVote} onVote={handleVote} />
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Link href={`/thread/${grievance.id}`} className="group inline-block">
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors text-balance">
                  {grievance.title}
                </h3>
              </Link>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="font-mono text-sm text-muted-foreground">{grievance.pseudonym}</span>
                <span className="text-muted-foreground">·</span>
                <Badge variant="outline">{grievance.category}</Badge>
                <span className="text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <ClockIcon className="h-3.5 w-3.5" />
                  {getTimeAgo()}
                </span>
              </div>
            </div>
            <StatusPill status={grievance.status} />
          </div>

          {/* Body Preview */}
          {!compact && <p className="text-muted-foreground line-clamp-2 text-pretty">{grievance.body}</p>}

          {/* Tags */}
          {grievance.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {grievance.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <ReactionBar reactions={grievance.reactions} onReact={handleReact} />

            <Link
              href={`/thread/${grievance.id}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageSquareIcon className="h-4 w-4" />
              <span>View thread</span>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}
