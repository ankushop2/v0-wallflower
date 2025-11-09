"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2Icon, CheckCircle2Icon, SparklesIcon, AlertTriangleIcon } from "lucide-react"
import { getAnonymousToken } from "@/lib/anonymous-token"
import { useRouter } from "next/navigation"

export function ComposePanel() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")

  const [aiSuggestions, setAiSuggestions] = useState<{
    improvedTitle: string
    improvedDescription: string
    category: string
    impact: string
    frequency: string
    hasPII: boolean
    piiWarning?: string
    similarExists: boolean
    needsModeration: boolean
    moderationReason?: string
  } | null>(null)

  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [needsModeration, setNeedsModeration] = useState(false)
  const [pseudonym, setPseudonym] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleGetAISuggestions = async () => {
    if (!title || !body) return

    setIsLoadingAI(true)
    setShowSuggestions(true)

    try {
      const response = await fetch("/api/grievances/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description: body }),
      })

      if (!response.ok) throw new Error("Failed to get AI suggestions")

      const data = await response.json()

      setAiSuggestions({
        improvedTitle: data.improvedTitle || title,
        improvedDescription: data.improvedDescription || body,
        category: data.category || "other",
        impact: data.impact || "medium",
        frequency: data.frequency || "occasional",
        hasPII: data.hasPII || false,
        piiWarning: data.piiWarning,
        similarExists: data.similarExists || false,
        needsModeration: data.needsModeration || false,
        moderationReason: data.moderationReason,
      })
    } catch (err) {
      console.error("[v0] Error getting AI suggestions:", err)
      alert("Failed to get AI suggestions. Please try again.")
    } finally {
      setIsLoadingAI(false)
    }
  }

  const handleDirectSubmit = async () => {
    if (!title || !body) return

    setIsSubmitting(true)

    try {
      // Get AI analysis for categorization and moderation
      const aiResponse = await fetch("/api/grievances/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description: body }),
      })

      if (!aiResponse.ok) throw new Error("Failed to analyze grievance")

      const aiData = await aiResponse.json()

      const anonymousToken = getAnonymousToken()

      // Submit with original title/description but AI-analyzed fields
      const response = await fetch("/api/grievances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: body,
          category: aiData.category || "other",
          impact: aiData.impact || "medium",
          frequency: aiData.frequency || "occasional",
          anonymous_token: anonymousToken,
          needsModeration: aiData.needsModeration || false,
          moderationReason: aiData.moderationReason,
        }),
      })

      if (!response.ok) throw new Error("Failed to submit grievance")

      const result = await response.json()

      const generatedPseudonym = `Anon-${anonymousToken.slice(-4)}`
      setPseudonym(generatedPseudonym)
      setNeedsModeration(result.needsModeration || false)
      setSubmitted(true)

      setTimeout(() => {
        router.push("/")
      }, 3000)
    } catch (err) {
      console.error("[v0] Error submitting grievance:", err)
      alert("Failed to submit grievance. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAcceptAndSubmit = async () => {
    if (!aiSuggestions) return

    setIsSubmitting(true)

    try {
      const anonymousToken = getAnonymousToken()

      const response = await fetch("/api/grievances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: aiSuggestions.improvedTitle,
          description: aiSuggestions.improvedDescription,
          category: aiSuggestions.category,
          impact: aiSuggestions.impact,
          frequency: aiSuggestions.frequency,
          anonymous_token: anonymousToken,
          needsModeration: aiSuggestions.needsModeration,
          moderationReason: aiSuggestions.moderationReason,
        }),
      })

      if (!response.ok) throw new Error("Failed to submit grievance")

      const result = await response.json()

      const generatedPseudonym = `Anon-${anonymousToken.slice(-4)}`
      setPseudonym(generatedPseudonym)
      setNeedsModeration(result.needsModeration || false)
      setSubmitted(true)

      setTimeout(() => {
        router.push("/")
      }, 3000)
    } catch (err) {
      console.error("[v0] Error submitting grievance:", err)
      alert("Failed to submit grievance. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Card className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2Icon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <h3 className="text-2xl font-semibold mb-2">
          {needsModeration ? "Grievance Submitted for Review" : "Grievance Submitted"}
        </h3>
        <p className="text-muted-foreground mb-4">
          {needsModeration
            ? "Your concern has been submitted and will be reviewed by a moderator before being published. You've been assigned the pseudonym:"
            : "Your concern has been submitted successfully. You've been assigned the pseudonym:"}
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary font-mono font-semibold">
          {pseudonym}
        </div>
        {needsModeration && (
          <Alert className="mt-6 border-amber-500/50 bg-amber-500/10">
            <AlertTriangleIcon className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-900 dark:text-amber-200">
              Your grievance is awaiting moderator approval. You'll be able to track it once it's published.
            </AlertDescription>
          </Alert>
        )}
        <p className="text-sm text-muted-foreground mt-6">Redirecting to home...</p>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            placeholder="Brief summary of your concern"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="text-base"
            disabled={showSuggestions}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="body"
            placeholder="Describe the issue in detail. Include context, impact, and how long this has been happening."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            required
            className="resize-none text-base"
            disabled={showSuggestions}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            type="button"
            onClick={handleDirectSubmit}
            disabled={!title || !body || isLoadingAI || showSuggestions || isSubmitting}
          >
            {isSubmitting && <Loader2Icon className="h-4 w-4 animate-spin mr-2" />}
            Submit As-Is
          </Button>
          <Button
            type="button"
            onClick={handleGetAISuggestions}
            disabled={!title || !body || isLoadingAI || showSuggestions}
            className="gap-2"
          >
            {isLoadingAI && <Loader2Icon className="h-4 w-4 animate-spin" />}
            <SparklesIcon className="h-4 w-4" />
            Get AI Suggestions
          </Button>
        </div>
      </Card>

      {showSuggestions && aiSuggestions && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">AI Suggestions</h3>
          </div>

          {aiSuggestions.needsModeration && (
            <Alert className="border-amber-500/50 bg-amber-500/10">
              <AlertTriangleIcon className="h-4 w-4 text-amber-600" />
              <AlertDescription>
                <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">Moderator Review Required</p>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  {aiSuggestions.moderationReason || "This grievance will be reviewed before being published."}
                </p>
              </AlertDescription>
            </Alert>
          )}

          {aiSuggestions.similarExists && (
            <Alert className="border-blue-500/50 bg-blue-500/10">
              <AlertTriangleIcon className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-900 dark:text-blue-200">
                Similar grievances may already exist. Consider searching before submitting.
              </AlertDescription>
            </Alert>
          )}

          {aiSuggestions.hasPII && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertTriangleIcon className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900 dark:text-red-200">
                {aiSuggestions.piiWarning} - We've removed them from the improved version
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Improved Title</Label>
              <p className="text-base font-medium mt-1">{aiSuggestions.improvedTitle}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Improved Description</Label>
              <p className="text-base mt-1 whitespace-pre-wrap">{aiSuggestions.improvedDescription}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                <p className="text-base font-medium mt-1 capitalize">{aiSuggestions.category}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Impact</Label>
                <p className="text-base font-medium mt-1 capitalize">{aiSuggestions.impact}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Frequency</Label>
                <p className="text-base font-medium mt-1 capitalize">{aiSuggestions.frequency}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuggestions(false)
                setAiSuggestions(null)
              }}
              disabled={isSubmitting}
            >
              Edit Original
            </Button>
            <Button onClick={handleAcceptAndSubmit} disabled={isSubmitting} className="flex-1 gap-2">
              {isSubmitting && <Loader2Icon className="h-4 w-4 animate-spin" />}
              Accept & Submit Grievance
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
