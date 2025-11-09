"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ComposeAgentBundle } from "@/lib/types"
import { SparklesIcon, CheckIcon, InfoIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AgentSuggestionsProps {
  suggestions: ComposeAgentBundle | null
  isLoading: boolean
  onAcceptRewrite: () => void
  onAcceptCategory: () => void
  onAcceptPii: () => void
}

export function AgentSuggestions({
  suggestions,
  isLoading,
  onAcceptRewrite,
  onAcceptCategory,
  onAcceptPii,
}: AgentSuggestionsProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="h-5 w-5 text-primary animate-pulse" />
          <h3 className="font-semibold">AI Compose Coach</h3>
        </div>
        <div className="space-y-3">
          <div className="h-20 bg-muted animate-pulse rounded" />
          <div className="h-20 bg-muted animate-pulse rounded" />
          <div className="h-20 bg-muted animate-pulse rounded" />
        </div>
      </Card>
    )
  }

  if (!suggestions) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Compose Coach</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Fill out the title and description, then click "Get AI Suggestions" to receive help with:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <CheckIcon className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
            Rewriting for clarity
          </li>
          <li className="flex gap-2">
            <CheckIcon className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
            Detecting PII
          </li>
          <li className="flex gap-2">
            <CheckIcon className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
            Suggesting categories
          </li>
          <li className="flex gap-2">
            <CheckIcon className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
            Estimating severity
          </li>
        </ul>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <SparklesIcon className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">AI Suggestions</h3>
      </div>

      <div className="space-y-4">
        {/* Rewrite Suggestion */}
        {suggestions.rewrite && (
          <SuggestionCard
            title="Rewrite"
            confidence={suggestions.rewrite.confidence}
            rationale={suggestions.rewrite.rationale}
            onAccept={onAcceptRewrite}
          >
            <div className="space-y-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Title:</p>
                <p className="text-sm">{suggestions.rewrite.suggestion?.title || "No title provided"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Body preview:</p>
                <p className="text-sm line-clamp-3">{suggestions.rewrite.suggestion?.body || "No body provided"}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {(suggestions.rewrite.suggestion?.changes || []).map((change, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {change}
                  </Badge>
                ))}
              </div>
            </div>
          </SuggestionCard>
        )}

        {/* PII Suggestion */}
        {suggestions.pii && (
          <SuggestionCard
            title="Privacy Check"
            confidence={suggestions.pii.confidence}
            rationale={suggestions.pii.rationale}
            onAccept={suggestions.pii.suggestion.redactions.length > 0 ? onAcceptPii : undefined}
          >
            <div className="space-y-2">
              {!suggestions.pii.suggestion?.redactions || suggestions.pii.suggestion.redactions.length === 0 ? (
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                  <CheckIcon className="h-4 w-4" />
                  No PII detected
                </p>
              ) : (
                <div>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">
                    Found {suggestions.pii.suggestion.redactions.length} potential PII issue(s)
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {suggestions.pii.suggestion.redactions.map((r, i) => (
                      <Badge key={i} variant="destructive" className="text-xs">
                        {r.type}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SuggestionCard>
        )}

        {/* Category Suggestion */}
        {suggestions.categorize && (
          <SuggestionCard
            title="Category"
            confidence={suggestions.categorize.confidence}
            rationale={suggestions.categorize.rationale}
            onAccept={onAcceptCategory}
          >
            <div className="space-y-2">
              <Badge variant="outline" className="text-sm">
                {suggestions.categorize.suggestion?.category || "Other"}
              </Badge>
              <div className="flex flex-wrap gap-1">
                {(suggestions.categorize.suggestion?.tags || []).map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </SuggestionCard>
        )}

        {/* Severity Suggestion */}
        {suggestions.severity && (
          <SuggestionCard
            title="Severity Estimate"
            confidence={suggestions.severity.confidence}
            rationale={suggestions.severity.rationale}
          >
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-2 w-8 rounded ${
                      level <= (suggestions.severity?.suggestion?.severity || 1) ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">Level {suggestions.severity.suggestion?.severity || 1}</span>
            </div>
          </SuggestionCard>
        )}
      </div>
    </Card>
  )
}

interface SuggestionCardProps {
  title: string
  confidence: number
  rationale: string
  onAccept?: () => void
  children: React.ReactNode
}

function SuggestionCard({ title, confidence, rationale, onAccept, children }: SuggestionCardProps) {
  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium">{title}</h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <InfoIcon className="h-3.5 w-3.5" />
                  <span className="sr-only">Why this suggestion?</span>
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">{rationale}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Badge variant="secondary" className="text-xs shrink-0">
          {Math.round(confidence * 100)}% confident
        </Badge>
      </div>

      {children}

      {onAccept && (
        <Button onClick={onAccept} size="sm" className="w-full">
          <CheckIcon className="mr-2 h-4 w-4" />
          Accept
        </Button>
      )}
    </div>
  )
}
