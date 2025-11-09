"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { categories } from "@/lib/categories"

interface WebhookIntegrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function WebhookIntegrationDialog({
  open,
  onOpenChange,
  onSuccess,
}: WebhookIntegrationDialogProps) {
  const [name, setName] = useState<string>("")
  const [category, setCategory] = useState<string>("")
  const [webhookUrl, setWebhookUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const handleSubmit = async () => {
    // Validate inputs
    if (!name.trim()) {
      setError("Please enter a name for this webhook")
      return
    }

    if (!category) {
      setError("Please select a category")
      return
    }

    if (!webhookUrl) {
      setError("Please enter a webhook URL")
      return
    }

    // Basic webhook URL validation
    if (!webhookUrl.startsWith("http://") && !webhookUrl.startsWith("https://")) {
      setError("Invalid webhook URL. It should start with 'http://' or 'https://'")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/integrations/webhooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          category,
          webhook_url: webhookUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create integration")
      }

      // Success - reset form and close
      setName("")
      setCategory("")
      setWebhookUrl("")
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setName("")
    setCategory("")
    setWebhookUrl("")
    setError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Webhook Integration</DialogTitle>
          <DialogDescription>
            Configure a webhook to receive notifications when grievances are created in a specific category.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="My Slack Channel"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              A friendly name to identify this webhook
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://hooks.slack.com/services/... or any webhook URL"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Can be Slack, Discord, Teams, or any custom webhook endpoint
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Webhook"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
