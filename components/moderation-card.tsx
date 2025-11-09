"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { Grievance } from "@/lib/types"
import { CheckIcon, XIcon, MessageSquareIcon, GitMergeIcon, UsersIcon, Trash2Icon, SparklesIcon } from "lucide-react"
import { safeFormatDistanceToNow } from "@/lib/date-utils"
import Link from "next/link"
import { TriageCopilot } from "@/components/triage-copilot"

interface ModerationCardProps {
  grievance: Grievance
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onActionComplete?: () => void
}

export function ModerationCard({ grievance, isSelected, onToggleSelect, onActionComplete }: ModerationCardProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [triageSuggestion, setTriageSuggestion] = useState<any>(null)
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false)

  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch(`/api/grievances/${grievance.id}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      })

      if (!response.ok) throw new Error("Failed to approve")

      console.log("[v0] Approved:", grievance.id)
      onActionComplete?.()
    } catch (error) {
      console.error("[v0] Approve error:", error)
      alert("Failed to approve grievance. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleHide = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch(`/api/grievances/${grievance.id}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason: "Hidden by moderator" }),
      })

      if (!response.ok) throw new Error("Failed to hide")

      console.log("[v0] Hidden:", grievance.id)
      onActionComplete?.()
    } catch (error) {
      console.error("[v0] Hide error:", error)
      alert("Failed to hide grievance. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAskForInfo = () => {
    console.log("Ask for info:", grievance.id)
  }

  const handleMerge = () => {
    console.log("Merge:", grievance.id)
  }

  const handleSetOwner = () => {
    console.log("Set owner:", grievance.id)
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this grievance? This action cannot be undone.")) {
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/grievances/${grievance.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      console.log("[v0] Deleted:", grievance.id)
      onActionComplete?.()
    } catch (error) {
      console.error("[v0] Delete error:", error)
      alert("Failed to delete grievance. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGetAnalysis = async () => {
    if (triageSuggestion) {
      setShowAnalysis(!showAnalysis)
      return
    }

    setIsLoadingAnalysis(true)
    try {
      const response = await fetch(`/api/grievances/${grievance.id}/triage`)
      if (!response.ok) throw new Error("Failed to get analysis")

      const data = await response.json()
      setTriageSuggestion(data.suggestion)
      setShowAnalysis(true)
    } catch (error) {
      console.error("[v0] Error getting analysis:", error)
      alert("Failed to get AI analysis. Please try again.")
    } finally {
      setIsLoadingAnalysis(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className={`p-6 transition-colors ${isSelected ? "border-primary" : ""}`}>
        <div className="flex gap-4">
          <div className="pt-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(grievance.id)}
              aria-label={`Select grievance ${grievance.id}`}
            />
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Link href={`/thread/${grievance.id}`} className="group inline-block">
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors text-balance mb-2">
                    {grievance.title}
                  </h3>
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm text-muted-foreground">{grievance.pseudonym}</span>
                  <span className="text-muted-foreground">·</span>
                  <Badge variant="outline">{grievance.category}</Badge>
                  <span className="text-muted-foreground">·</span>
                  <Badge variant="secondary">Severity {grievance.severity || 3}</Badge>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground">{safeFormatDistanceToNow(grievance.createdAt)}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 text-pretty">{grievance.body}</p>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetAnalysis}
                disabled={isLoadingAnalysis}
                className="gap-2 bg-primary/5 border-primary/20 hover:bg-primary/10"
              >
                <SparklesIcon className="h-4 w-4" />
                {isLoadingAnalysis
                  ? "Analyzing..."
                  : triageSuggestion
                    ? (showAnalysis ? "Hide" : "Show") + " AI Analysis"
                    : "Get AI Analysis"}
              </Button>
              <Button variant="default" size="sm" onClick={handleApprove} disabled={isProcessing} className="gap-2">
                <CheckIcon className="h-4 w-4" />
                Approve & Publish
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleHide}
                disabled={isProcessing}
                className="gap-2 bg-transparent"
              >
                <XIcon className="h-4 w-4" />
                Reject & Hide
              </Button>
              <Button variant="outline" size="sm" onClick={handleMerge} className="gap-2 bg-transparent">
                <GitMergeIcon className="h-4 w-4" />
                Merge
              </Button>
              <Button variant="outline" size="sm" onClick={handleAskForInfo} className="gap-2 bg-transparent">
                <MessageSquareIcon className="h-4 w-4" />
                Ask for Info
              </Button>
              <Button variant="outline" size="sm" onClick={handleSetOwner} className="gap-2 bg-transparent">
                <UsersIcon className="h-4 w-4" />
                Set Owner
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isProcessing}
                className="gap-2 bg-transparent text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2Icon className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {showAnalysis && triageSuggestion && <TriageCopilot suggestion={triageSuggestion} />}
    </div>
  )
}
