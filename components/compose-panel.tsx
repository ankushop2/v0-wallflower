"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2Icon, CheckCircle2Icon, SparklesIcon, AlertTriangleIcon } from "lucide-react"
import { APIClient } from "@/lib/api/client"
import { getAnonymousToken } from "@/lib/anonymous-token"
import type { Grievance } from "@/lib/types"
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
    similarPosts: Array<{ id: string; title: string; similarity: number }>
    hasPii: boolean
    piiWarning?: string
  } | null>(null)

  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [pseudonym, setPseudonym] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [allGrievances, setAllGrievances] = useState<Grievance[]>([])

  useEffect(() => {
    const fetchGrievances = async () => {
      try {
        const response = await APIClient.listGrievances({ pageSize: 100 })
        setAllGrievances(response.grievances || [])
      } catch (err) {
        console.error("[v0] Error fetching grievances:", err)
      }
    }
    fetchGrievances()
  }, [])

  const handleGetAISuggestions = async () => {
    if (!title || !body) return

    setIsLoadingAI(true)
    setShowSuggestions(true)

    try {
      // Get AI assistance
      const aiResponse = await APIClient.assist(title + "\n\n" + body)

      // Find similar posts
      const searchText = (title + " " + body).toLowerCase()
      const keywords = searchText.split(/\s+/).filter((w) => w.length > 3)

      const similar = allGrievances
        .map((grievance) => {
          const grievanceText = (
            (grievance.title || "") +
            " " +
            (grievance.description || grievance.body || "")
          ).toLowerCase()
          const matches = keywords.filter((kw) => grievanceText.includes(kw)).length
          const similarity = keywords.length > 0 ? matches / keywords.length : 0
          return {
            id: grievance.id,
            title: grievance.title || "",
            similarity,
          }
        })
        .filter((item) => item.similarity >= 0.5)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3)

      setAiSuggestions({
        improvedTitle: aiResponse.rewrite?.suggestion?.title || title,
        improvedDescription: aiResponse.rewrite?.suggestion?.body || body,
        category: aiResponse.categorize?.suggestion?.category || "",
        impact: aiResponse.severity?.suggestion?.level || "medium",
        frequency: "occasional",
        similarPosts: similar,
        hasPii: (aiResponse.pii?.suggestion?.redactions?.length || 0) > 0,
        piiWarning: aiResponse.pii?.suggestion?.redactions?.length
          ? `Found ${aiResponse.pii.suggestion.redactions.length} potential PII item(s)`
          : undefined,
      })
    } catch (err) {
      console.error("[v0] Error getting AI suggestions:", err)
      alert("Failed to get AI suggestions. Please try again.")
    } finally {
      setIsLoadingAI(false)
    }
  }

  const handleAcceptAndSubmit = async () => {
    if (!aiSuggestions) return

    setIsSubmitting(true)

    try {
      const anonymousToken = getAnonymousToken()

      await APIClient.createGrievance({
        title: aiSuggestions.improvedTitle,
        description: aiSuggestions.improvedDescription,
        category: aiSuggestions.category,
        impact: aiSuggestions.impact as any,
        frequency: aiSuggestions.frequency as any,
        anonymous_token: anonymousToken,
      })

      const generatedPseudonym = `Anon-${anonymousToken.slice(-4)}`
      setPseudonym(generatedPseudonym)
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
        <h3 className="text-2xl font-semibold mb-2">Grievance Submitted</h3>
        <p className="text-muted-foreground mb-4">
          Your concern has been submitted successfully. You've been assigned the pseudonym:
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary font-mono font-semibold">
          {pseudonym}
        </div>
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

        <div className="flex justify-end">
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

          {aiSuggestions.similarPosts.length > 0 && (
            <Alert className="border-amber-500/50 bg-amber-500/10">
              <AlertTriangleIcon className="h-4 w-4 text-amber-600" />
              <AlertDescription>
                <p className="font-semibold text-amber-900 dark:text-amber-200 mb-2">Similar grievances found:</p>
                <ul className="space-y-2">
                  {aiSuggestions.similarPosts.map((post) => (
                    <li key={post.id}>
                      <a
                        href={`/thread/${post.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-amber-900 dark:text-amber-200 hover:underline"
                      >
                        {post.title} ({Math.round(post.similarity * 100)}% match)
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-2">
                  Consider upvoting an existing grievance instead of creating a duplicate
                </p>
              </AlertDescription>
            </Alert>
          )}

          {aiSuggestions.hasPii && (
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
