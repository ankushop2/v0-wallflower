"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { TriageSuggestion } from "@/lib/types"
import { SparklesIcon, CheckIcon, TrendingUpIcon, GitMergeIcon, UsersIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface TriageCopilotProps {
  suggestion: TriageSuggestion | null
}

export function TriageCopilot({ suggestion }: TriageCopilotProps) {
  if (!suggestion) {
    return null
  }

  const handleCopyDraft = () => {
    if (suggestion.askForInfoDraft) {
      navigator.clipboard.writeText(suggestion.askForInfoDraft)
    }
  }

  return (
    <Card className="p-6 bg-primary/5 border-primary/20">
      <div className="flex items-center gap-2 mb-6">
        <SparklesIcon className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Triage Copilot</h2>
        <Badge variant="secondary" className="ml-auto">
          Moderator View
        </Badge>
      </div>

      <div className="space-y-6">
        {/* TL;DR */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Summary</h3>
          <p className="text-sm text-foreground leading-relaxed text-pretty">{suggestion.tldr}</p>
        </div>

        {/* Why Trending */}
        {suggestion.whyTrending && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <TrendingUpIcon className="h-4 w-4" />
                Why Trending
              </h3>
              <p className="text-sm text-foreground text-pretty">{suggestion.whyTrending}</p>
            </div>
          </>
        )}

        {/* Duplicates */}
        {suggestion.duplicates && suggestion.duplicates.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <GitMergeIcon className="h-4 w-4" />
                Possible Duplicates
              </h3>
              <div className="space-y-2">
                {suggestion.duplicates.map((dup) => (
                  <div
                    key={dup.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border p-3 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{dup.title || "Untitled"}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {Math.round((dup.similarity || 0) * 100)}% similar
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      Merge
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Suggested Owners */}
        {suggestion.suggestedOwners && suggestion.suggestedOwners.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <UsersIcon className="h-4 w-4" />
                Suggested Owners
              </h3>
              <div className="flex flex-wrap gap-2">
                {suggestion.suggestedOwners.map((owner) => (
                  <Badge key={owner} variant="outline">
                    {owner}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Ask for Info Draft */}
        {suggestion.askForInfoDraft && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Ask for More Info (Draft)</h3>
              <div className="rounded-lg bg-muted/50 p-3 border border-border">
                <p className="text-sm text-foreground leading-relaxed text-pretty whitespace-pre-wrap">
                  {suggestion.askForInfoDraft}
                </p>
              </div>
              <Button variant="outline" size="sm" className="mt-3 gap-2 bg-transparent" onClick={handleCopyDraft}>
                <CheckIcon className="h-4 w-4" />
                Copy to DM
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
