"use client"

import { Card } from "@/components/ui/card"
import type { ThreadEvent } from "@/lib/types"
import { formatDistanceToNow, format } from "date-fns"
import {
  CheckCircle2Icon,
  MessageSquareIcon,
  AlertCircleIcon,
  GitMergeIcon,
  CheckIcon,
  UserIcon,
  ShieldIcon,
  CrownIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ThreadTimelineProps {
  events: ThreadEvent[]
}

export function ThreadTimeline({ events }: ThreadTimelineProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-6">Activity Timeline</h2>

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
      ) : (
        <div className="space-y-6">
          {events.map((event, index) => (
            <TimelineEvent key={event.id} event={event} isLast={index === events.length - 1} />
          ))}
        </div>
      )}
    </Card>
  )
}

interface TimelineEventProps {
  event: ThreadEvent
  isLast: boolean
}

function TimelineEvent({ event, isLast }: TimelineEventProps) {
  const getEventIcon = () => {
    switch (event.type) {
      case "approval":
        return <CheckIcon className="h-4 w-4" />
      case "status":
        return <AlertCircleIcon className="h-4 w-4" />
      case "comment":
        return <MessageSquareIcon className="h-4 w-4" />
      case "poster_reply":
        return <MessageSquareIcon className="h-4 w-4" />
      case "resolution":
        return <CheckCircle2Icon className="h-4 w-4" />
      case "merge":
        return <GitMergeIcon className="h-4 w-4" />
      case "system":
        return <AlertCircleIcon className="h-4 w-4" />
      default:
        return <AlertCircleIcon className="h-4 w-4" />
    }
  }

  const getActorIcon = () => {
    switch (event.actor) {
      case "poster":
        return <UserIcon className="h-3.5 w-3.5" />
      case "moderator":
        return <ShieldIcon className="h-3.5 w-3.5" />
      case "owner":
        return <CrownIcon className="h-3.5 w-3.5" />
      case "system":
        return null
      default:
        return null
    }
  }

  const getActorLabel = () => {
    if (event.actorName) return event.actorName
    switch (event.actor) {
      case "poster":
        return "Original Poster"
      case "moderator":
        return "Moderator"
      case "owner":
        return "Team Owner"
      case "system":
        return "System"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="flex gap-4">
      {/* Icon & Line */}
      <div className="flex flex-col items-center">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            event.type === "resolution"
              ? "bg-green-500/10 text-green-500"
              : event.type === "status"
                ? "bg-blue-500/10 text-blue-500"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {getEventIcon()}
        </div>
        {!isLast && <div className="w-px flex-1 bg-border mt-2" style={{ minHeight: "2rem" }} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-6">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {event.actor !== "system" && (
              <Badge variant="outline" className="gap-1">
                {getActorIcon()}
                {getActorLabel()}
              </Badge>
            )}
            {event.type === "status" && event.statusTo && (
              <>
                <span className="text-sm text-muted-foreground">changed status to</span>
                <Badge>{event.statusTo.replace("_", " ")}</Badge>
              </>
            )}
          </div>
          <time
            className="text-xs text-muted-foreground shrink-0"
            dateTime={event.createdAt}
            title={format(new Date(event.createdAt), "PPpp")}
          >
            {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
          </time>
        </div>

        {event.body && <p className="text-sm text-foreground leading-relaxed text-pretty">{event.body}</p>}
      </div>
    </div>
  )
}
