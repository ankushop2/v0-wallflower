"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SmileIcon } from "lucide-react"

interface ReactionBarProps {
  reactions: Record<string, number>
  onReact: (emoji: string) => void
}

const availableEmojis = ["👍", "😞", "🔥", "💯", "👀", "❤️", "🎯", "⭐"]

export function ReactionBar({ reactions, onReact }: ReactionBarProps) {
  const topReactions = Object.entries(reactions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return (
    <div className="flex items-center gap-2">
      {topReactions.map(([emoji, count]) => (
        <Button
          key={emoji}
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 px-2 bg-transparent"
          onClick={() => onReact(emoji)}
        >
          <span>{emoji}</span>
          <span className="text-xs">{count}</span>
        </Button>
      ))}

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" aria-label="Add reaction">
            <SmileIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-1">
            {availableEmojis.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-lg hover:scale-125 transition-transform"
                onClick={() => onReact(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
