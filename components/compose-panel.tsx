"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { CategorySelector } from "@/components/category-selector"
import { ImpactSelector } from "@/components/impact-selector"
import { FrequencySelector } from "@/components/frequency-selector"
import { AgentSuggestions } from "@/components/agent-suggestions"
import { PiiHighlighter } from "@/components/pii-highlighter"
import { SimilarPostsAlert } from "@/components/similar-posts-alert"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2Icon, AlertTriangleIcon, CheckCircle2Icon, SparklesIcon } from "lucide-react"
import { APIClient } from "@/lib/api/client"
import { getAnonymousToken } from "@/lib/anonymous-token"
import type { ComposeAgentBundle, Impact, Frequency, Grievance } from "@/lib/types"
import { useRouter } from "next/navigation"

export function ComposePanel() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [category, setCategory] = useState("")
  const [suggestedCategory, setSuggestedCategory] = useState<{
    category: string
    confidence: number
    keywords: string[]
  } | null>(null)
  const [impact, setImpact] = useState<Impact>("medium")
  const [frequency, setFrequency] = useState<Frequency>("occasional")
  const [suggestedFix, setSuggestedFix] = useState("")
  const [agentSuggestions, setAgentSuggestions] = useState<ComposeAgentBundle | null>(null)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [pseudonym, setPseudonym] = useState("")
  const [piiWarning, setPiiWarning] = useState(false)
  const [similarPosts, setSimilarPosts] = useState<Grievance[]>([])
  const [similarPostsDismissed, setSimilarPostsDismissed] = useState(false)
  const [allGrievances, setAllGrievances] = useState<Grievance[]>([])

  useEffect(() => {
    const fetchGrievances = async () => {
      try {
        const response = await APIClient.listGrievances({ pageSize: 100 })
        setAllGrievances(response.grievances || [])
      } catch (err) {
        console.error("[v0] Error fetching grievances for similarity:", err)
      }
    }
    fetchGrievances()
  }, [])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (title.length > 10 || body.length > 50) {
        try {
          const response = await APIClient.assist(title + " " + body)
          if (response.categorize) {
            setSuggestedCategory({
              category: response.categorize.suggestion.category,
              confidence: response.categorize.confidence || 0.8,
              keywords: [],
            })

            if (response.categorize.confidence && response.categorize.confidence > 0.7 && !category) {
              setCategory(response.categorize.suggestion.category)
            }
          }
        } catch (err) {
          console.error("[v0] Error auto-categorizing:", err)
        }
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [title, body])

  useEffect(() => {
    const timer = setTimeout(() => {
      if ((title.length > 15 || body.length > 100) && !similarPostsDismissed && allGrievances.length > 0) {
        const searchText = (title + " " + body).toLowerCase()
        const keywords = searchText.split(/\s+/).filter((w) => w.length > 3)

        const similar = allGrievances
          .map((grievance) => {
            const grievanceText = (grievance.title + " " + grievance.description).toLowerCase()
            const matches = keywords.filter((kw) => grievanceText.includes(kw)).length
            const similarity = keywords.length > 0 ? matches / keywords.length : 0
            return { grievance, similarity }
          })
          .filter((item) => item.similarity >= 0.5)
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 3)
          .map((item) => item.grievance)

        setSimilarPosts(similar)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [title, body, similarPostsDismissed, allGrievances])

  const handleGetSuggestions = async () => {
    setIsLoadingSuggestions(true)

    try {
      const response = await APIClient.assist(title + "\n\n" + body)
      setAgentSuggestions(response as ComposeAgentBundle)
      setPiiWarning(response.pii?.suggestion.redactions && response.pii.suggestion.redactions.length > 0)
    } catch (err) {
      console.error("[v0] Error getting AI suggestions:", err)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const handleAcceptRewrite = () => {
    if (agentSuggestions?.rewrite) {
      setTitle(agentSuggestions.rewrite.suggestion.title)
      setBody(agentSuggestions.rewrite.suggestion.body)
    }
  }

  const handleAcceptCategory = () => {
    if (agentSuggestions?.categorize) {
      setCategory(agentSuggestions.categorize.suggestion.category)
    }
  }

  const handleAcceptPii = () => {
    if (agentSuggestions?.pii) {
      setBody(agentSuggestions.pii.suggestion.safeText)
      setPiiWarning(false)
    }
  }

  const handleMerge = (postId: string) => {
    console.log("[v0] Merging with post:", postId)
    router.push(`/thread/${postId}?action=merge`)
  }

  const handleDismissSimilar = () => {
    setSimilarPostsDismissed(true)
    setSimilarPosts([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)

    try {
      const anonymousToken = getAnonymousToken()

      const response = await APIClient.createGrievance({
        title,
        description: body,
        category,
        impact,
        frequency,
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
    <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
      <form onSubmit={handleSubmit} className="space-y-6">
        {similarPosts.length > 0 && !similarPostsDismissed && (
          <SimilarPostsAlert
            similarPosts={similarPosts.map((p) => ({ post: p, similarity: 0.7 }))}
            onMerge={handleMerge}
            onDismiss={handleDismissSimilar}
          />
        )}

        <Card className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Brief summary of your concern (max 80 characters)"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 80))}
              maxLength={80}
              required
              className="text-base"
            />
            <p className="text-xs text-muted-foreground text-right">{title.length}/80 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">
              Description <span className="text-destructive">*</span>
            </Label>
            <PiiHighlighter text={body} redactions={agentSuggestions?.pii?.suggestion.redactions || []}>
              <Textarea
                id="body"
                placeholder="Describe the issue in detail. Include context, impact, and how long this has been happening."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                required
                className="resize-none text-base"
              />
            </PiiHighlighter>
            {piiWarning && (
              <Alert className="border-amber-500/50 bg-amber-500/10">
                <AlertTriangleIcon className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-900 dark:text-amber-200">
                  We detected potential private info. Consider applying redactions before posting.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <CategorySelector value={category} onChange={setCategory} />
              {suggestedCategory && suggestedCategory.category !== category && (
                <div className="flex items-start gap-2 p-2 rounded-md bg-primary/5 border border-primary/20">
                  <SparklesIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">
                      AI suggests:{" "}
                      <button
                        type="button"
                        onClick={() => setCategory(suggestedCategory.category)}
                        className="font-medium text-primary hover:underline"
                      >
                        {suggestedCategory.category}
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="impact">
                Impact <span className="text-destructive">*</span>
              </Label>
              <ImpactSelector value={impact} onChange={setImpact} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">
              Frequency <span className="text-destructive">*</span>
            </Label>
            <FrequencySelector value={frequency} onChange={setFrequency} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suggested-fix">Suggested Fix (Optional)</Label>
            <Textarea
              id="suggested-fix"
              placeholder="Do you have ideas for how this could be resolved?"
              value={suggestedFix}
              onChange={(e) => setSuggestedFix(e.target.value)}
              rows={3}
              className="resize-none text-base"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleGetSuggestions}
              disabled={!title || !body || isLoadingSuggestions}
            >
              {isLoadingSuggestions && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Get AI Suggestions
            </Button>

            <Button type="submit" disabled={!title || !body || !category || isSubmitting} className="sm:min-w-32">
              {isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              Submit Grievance
            </Button>
          </div>
        </Card>
      </form>

      <div className="lg:sticky lg:top-20 lg:h-fit">
        <AgentSuggestions
          suggestions={agentSuggestions}
          isLoading={isLoadingSuggestions}
          onAcceptRewrite={handleAcceptRewrite}
          onAcceptCategory={handleAcceptCategory}
          onAcceptPii={handleAcceptPii}
        />
      </div>
    </div>
  )
}
