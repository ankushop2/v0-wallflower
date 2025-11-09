"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { categories, statusDescriptions } from "@/lib/categories"
import { CheckIcon, XIcon, PencilIcon, SparklesIcon } from "lucide-react"
import type { Grievance } from "@/lib/types"

interface AdminEditPanelProps {
  grievance: Grievance
  onUpdate?: () => void
}

export function AdminEditPanel({ grievance, onUpdate }: AdminEditPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [summary, setSummary] = useState<any>(null)

  const [formData, setFormData] = useState({
    title: grievance.title,
    body: grievance.body,
    category: grievance.category,
    status: grievance.status,
    suggestedFix: grievance.suggestedFix || "",
  })

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(`/api/grievances/${grievance.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          body: formData.body,
          category: formData.category,
          status: formData.status,
          suggested_fix: formData.suggestedFix,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update grievance")
      }

      setSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSuccess(false), 3000)

      if (onUpdate) {
        onUpdate()
      }
    } catch (err: any) {
      console.error("[v0] Error updating grievance:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      title: grievance.title,
      body: grievance.body,
      category: grievance.category,
      status: grievance.status,
      suggestedFix: grievance.suggestedFix || "",
    })
    setIsEditing(false)
    setError(null)
  }

  const handleSummarise = async () => {
    setLoadingSummary(true)
    setError(null)

    try {
      const response = await fetch(`/api/grievances/${grievance.id}/triage`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to generate summary")
      }

      const data = await response.json()
      setSummary(data.suggestion)
    } catch (err: any) {
      console.error("[v0] Error generating summary:", err)
      setError(err.message)
    } finally {
      setLoadingSummary(false)
    }
  }

  if (!isEditing && !summary) {
    return (
      <Card className="p-4 bg-muted/50 border-2 border-dashed">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <PencilIcon className="h-4 w-4" />
            <span>Admin Controls</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSummarise} disabled={loadingSummary}>
              <SparklesIcon className="h-4 w-4 mr-1" />
              {loadingSummary ? "Analysing..." : "Summarise"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit Grievance
            </Button>
          </div>
        </div>
        {success && (
          <Alert className="mt-3">
            <AlertDescription>Grievance updated successfully!</AlertDescription>
          </Alert>
        )}
      </Card>
    )
  }

  if (summary) {
    return (
      <Card className="p-6 border-2 border-primary/20">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">AI Summary & Analysis</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSummary(null)}>
              Close
            </Button>
          </div>

          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Summary</p>
              <p className="text-sm text-muted-foreground">{summary.tldr}</p>
            </div>

            {/* Similar Issues Count */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium mb-1">Similar Issues</p>
                <p className="text-2xl font-bold text-primary">{summary.similarIssuesCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Estimated users affected</p>
              </div>

              {summary.estimatedResolutionTime && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium mb-1">Est. Resolution</p>
                  <p className="text-2xl font-bold text-primary">{summary.estimatedResolutionTime}</p>
                </div>
              )}
            </div>

            {/* Potential Duplicates */}
            {summary.duplicates && summary.duplicates.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Potential Duplicates</p>
                <div className="space-y-2">
                  {summary.duplicates.map((dup: any) => (
                    <div key={dup.id} className="bg-muted/50 rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{dup.title}</span>
                        <span className="text-xs text-muted-foreground">{Math.round(dup.similarity * 100)}% match</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Next Steps */}
            <div>
              <p className="text-sm font-medium mb-2">Suggested Next Steps</p>
              <ul className="space-y-2">
                {summary.suggestedActions.map((action: string, idx: number) => (
                  <li key={idx} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-medium">{idx + 1}.</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggested Owners */}
            {summary.suggestedOwners && summary.suggestedOwners.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Suggested Owners</p>
                <div className="flex flex-wrap gap-2">
                  {summary.suggestedOwners.map((owner: string) => (
                    <span key={owner} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                      {owner}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Draft Message */}
            {summary.askForInfoDraft && (
              <div>
                <p className="text-sm font-medium mb-2">Draft Message for Poster</p>
                <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                  {summary.askForInfoDraft}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 border-2 border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Edit Grievance</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel} disabled={loading}>
              <XIcon className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={loading}>
              <CheckIcon className="h-4 w-4 mr-1" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Description</Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              disabled={loading}
              rows={6}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                disabled={loading}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                disabled={loading}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(statusDescriptions).map((status) => (
                    <SelectItem key={status} value={status}>
                      {statusDescriptions[status].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="suggestedFix">Suggested Fix (Optional)</Label>
            <Textarea
              id="suggestedFix"
              value={formData.suggestedFix}
              onChange={(e) => setFormData({ ...formData, suggestedFix: e.target.value })}
              disabled={loading}
              rows={3}
              placeholder="Add a suggested solution or fix..."
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
