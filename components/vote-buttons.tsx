"use client"

import { Button } from "@/components/ui/button"
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"

interface VoteButtonsProps {
  upvotes: number
  downvotes: number
  userVote: "up" | "down" | null
  onVote: (type: "up" | "down") => void
}

export function VoteButtons({ upvotes, downvotes, userVote, onVote }: VoteButtonsProps) {
  const score = upvotes - downvotes

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant={userVote === "up" ? "default" : "ghost"}
        size="icon"
        className="h-8 w-8"
        onClick={() => onVote("up")}
        aria-label="Upvote"
      >
        <ArrowUpIcon className="h-4 w-4" />
      </Button>

      <span
        className={`font-semibold text-sm min-w-[2ch] text-center ${
          score > 0
            ? "text-green-600 dark:text-green-400"
            : score < 0
              ? "text-red-600 dark:text-red-400"
              : "text-muted-foreground"
        }`}
      >
        {score > 0 ? `+${score}` : score}
      </span>

      <Button
        variant={userVote === "down" ? "default" : "ghost"}
        size="icon"
        className="h-8 w-8"
        onClick={() => onVote("down")}
        aria-label="Downvote"
      >
        <ArrowDownIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}
