"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slack, Github } from "lucide-react"

interface Integration {
  id: string
  name: string
  description: string
  iconType: "slack" | "github" | "jira"
  connected: boolean
  features: string[]
}

const IntegrationIcon = ({ type }: { type: Integration["iconType"] }) => {
  switch (type) {
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
      id: "slack",
      name: "Slack",
      description: "Send notifications and updates to your Slack workspace",
      iconType: "slack",
      connected: false,
      features: [
        "Real-time grievance notifications",
        "Status update alerts",
        "Direct messaging support",
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

  const handleConnect = (id: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === id
          ? { ...integration, connected: !integration.connected }
          : integration
      )
    )
  }

  return (
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
            {integration.connected ? "Disconnect" : "Connect"}
          </Button>
        </Card>
      ))}
    </div>
  )
}
