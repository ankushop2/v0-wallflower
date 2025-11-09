"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slack, Github, Webhook, Trash2 } from "lucide-react"
import { WebhookIntegrationDialog } from "@/components/webhook-integration-dialog"

interface Integration {
  id: string
  name: string
  description: string
  iconType: "slack" | "github" | "jira" | "webhook"
  connected: boolean
  features: string[]
}

interface WebhookIntegration {
  id: string
  name: string
  category: string
  webhook_url: string
  is_active: boolean
  created_at: string
}

const IntegrationIcon = ({ type }: { type: Integration["iconType"] }) => {
  switch (type) {
    case "webhook":
      return <Webhook className="h-8 w-8" />
    case "slack":
      return <Slack className="h-8 w-8" />
    case "github":
      return <Github className="h-8 w-8" />
    case "jira":
      return (
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.757a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0Z" />
        </svg>
      )
  }
}

export function SettingsIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "webhook",
      name: "Webhook Integration",
      description: "Send notifications to any webhook endpoint (Slack, Discord, Teams, etc.)",
      iconType: "webhook",
      connected: false,
      features: [
        "Real-time grievance notifications",
        "Category-based routing",
        "Custom webhook support",
      ],
    },
    {
      id: "github",
      name: "GitHub",
      description: "Automatically create issues for grievances",
      iconType: "github",
      connected: false,
      features: [
        "Auto-create issues from grievances",
        "Sync status updates",
        "Link to existing issues",
      ],
    },
    {
      id: "jira",
      name: "Jira",
      description: "Track grievances as Jira tickets",
      iconType: "jira",
      connected: false,
      features: [
        "Create Jira tickets from grievances",
        "Two-way status sync",
        "Custom field mapping",
      ],
    },
  ])

  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false)
  const [webhookIntegrations, setWebhookIntegrations] = useState<WebhookIntegration[]>([])
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null)

  // Fetch webhook integrations
  const fetchWebhookIntegrations = async () => {
    try {
      const response = await fetch("/api/integrations/webhooks")
      if (response.ok) {
        const data = await response.json()
        setWebhookIntegrations(data.integrations || [])
        
        // Update the connected status
        setIntegrations((prev) =>
          prev.map((integration) =>
            integration.id === "webhook"
              ? { ...integration, connected: data.integrations.length > 0 }
              : integration
          )
        )
      }
    } catch (error) {
      console.error("Failed to fetch webhook integrations:", error)
    }
  }

  useEffect(() => {
    fetchWebhookIntegrations()
  }, [])

  const handleConnect = (id: string) => {
    if (id === "webhook") {
      setWebhookDialogOpen(true)
    } else {
      // For other integrations, toggle connection (placeholder)
      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.id === id
            ? { ...integration, connected: !integration.connected }
            : integration
        )
      )
    }
  }

  const handleWebhookSuccess = () => {
    fetchWebhookIntegrations()
  }

  const handleDeleteIntegration = async (integrationId: string) => {
    if (!confirm("Are you sure you want to delete this webhook integration?")) {
      return
    }

    setLoadingDelete(integrationId)
    try {
      const response = await fetch(`/api/integrations/webhooks?id=${integrationId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchWebhookIntegrations()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete integration")
      }
    } catch (error) {
      console.error("Failed to delete integration:", error)
      alert("An error occurred while deleting the integration")
    } finally {
      setLoadingDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.id} className="p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-foreground">
                  <IntegrationIcon type={integration.iconType} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{integration.name}</h3>
                  {integration.connected && (
                    <Badge variant="default" className="mt-1 bg-green-600">
                      Connected
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {integration.description}
            </p>

            <div className="mb-6 flex-grow">
              <h4 className="text-sm font-medium mb-2">Features:</h4>
              <ul className="space-y-1">
                {integration.features.map((feature, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start">
                    <span className="mr-2">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={() => handleConnect(integration.id)}
              variant={integration.connected ? "outline" : "default"}
              className="w-full"
            >
              {integration.id === "webhook" ? "Add New" : integration.connected ? "Disconnect" : "Connect"}
            </Button>
          </Card>
        ))}
      </div>

      {/* Show configured webhook integrations */}
      {webhookIntegrations.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Configured Webhooks</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {webhookIntegrations.map((webhook) => (
              <Card key={webhook.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Webhook className="h-5 w-5 text-muted-foreground" />
                      <h4 className="font-medium">{webhook.name}</h4>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Category: {webhook.category}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {webhook.webhook_url}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created {new Date(webhook.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteIntegration(webhook.id)}
                    disabled={loadingDelete === webhook.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <WebhookIntegrationDialog
        open={webhookDialogOpen}
        onOpenChange={setWebhookDialogOpen}
        onSuccess={handleWebhookSuccess}
      />
    </div>
  )
}
