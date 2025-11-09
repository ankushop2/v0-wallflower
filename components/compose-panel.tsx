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
import { Badge } from "@/components/ui/badge"
import { Loader2Icon, AlertTriangleIcon, CheckCircle2Icon, SparklesIcon } from "lucide-react"
import { generateMockAICompose, mockGrievances } from "@/lib/mock-data"
import { findSimilarPosts } from "@/lib/similarity"
import { autoCategorize } from "@/lib/auto-categorize"
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
  const [frequency, setFrequency] = useState<Frequency>("weekly")
  const [suggestedFix, setSuggestedFix] = useState("")
  const [agentSuggestions, setAgentSuggestions] = useState<ComposeAgentBundle | null>(null)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [pseudonym, setPseudonym] = useState("")
  const [piiDetected, setPiiDetected] = useState(false)
  const [similarPosts, setSimilarPosts] = useState<Array<{ post: Grievance; similarity: number }>>([])
  const [similarPostsDismissed, setSimilarPostsDismissed] = useState(false)

  useEffect(() => {
    if (title.length > 10 || body.length > 50) {
      const result = autoCategorize(title, body)
      setSuggestedCategory(result)

      if (result.confidence > 0.7 && !category) {
        setCategory(result.category)
      }
    }
  }, [title, body])

  useEffect(() => {
    const timer = setTimeout(() => {
      if ((title.length > 15 || body.length > 100) && !similarPostsDismissed) {
        const similar = findSimilarPosts(title, body, mockGrievances)
        setSimilarPosts(similar)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [title, body, similarPostsDismissed])

  const handleGetSuggestions = async () => {
    setIsLoadingSuggestions(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const suggestions = generateMockAICompose()
    setAgentSuggestions(suggestions)
    setPiiDetected(suggestions.pii?.suggestion.redactions.length > 0)
    setIsLoadingSuggestions(false)
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
      setPiiDetected(false)
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

    if (piiDetected) {
      return
    }

    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const generatedPseudonym = `Anon-${Math.floor(1000 + Math.random() * 9000)}`
    setPseudonym(generatedPseudonym)
    setSubmitted(true)
    setIsSubmitting(false)

    setTimeout(() => {
      router.push("/")
    }, 3000)
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
          Your concern is pending moderation. You've been assigned the pseudonym:
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
          <SimilarPostsAlert similarPosts={similarPosts} onMerge={handleMerge} onDismiss={handleDismissSimilar} />
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
            {piiDetected && (
              <Alert variant="destructive">
                <AlertTriangleIcon className="h-4 w-4" />
                <AlertDescription>
                  We found private info (emails/IDs). Apply redactions before posting.
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
                    <div className="flex flex-wrap gap-1 mt-1">
                      {suggestedCategory.keywords.slice(0, 3).map((kw, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {kw}
                        </Badge>
                      ))}
                    </div>
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

            <Button
              type="submit"
              disabled={!title || !body || !category || isSubmitting || piiDetected}
              className="sm:min-w-32"
            >
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
