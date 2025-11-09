"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import type { RoutingRule } from "@/lib/types"
import { mockRoutingRules } from "@/lib/mock-data"
import { PlusIcon, TrashIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { RuleSimulator } from "@/components/rule-simulator"
import { Separator } from "@/components/ui/separator"

export function RoutingRuleBuilder() {
  const [rules, setRules] = useState<RoutingRule[]>(mockRoutingRules)
  const [showSimulator, setShowSimulator] = useState(true)

  const handleToggleRule = (id: string) => {
    setRules((prev) => prev.map((rule) => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule)))
  }

  const handleDeleteRule = (id: string) => {
    setRules((prev) => prev.filter((rule) => rule.id !== id))
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
      {/* Rules List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Active Rules</h3>
          <Button className="gap-2">
            <PlusIcon className="h-4 w-4" />
            New Rule
          </Button>
        </div>

        {rules.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mb-4 text-5xl opacity-20">🎯</div>
            <h3 className="text-lg font-semibold mb-2">No routing rules yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create rules to automatically route grievances to the right teams.
            </p>
            <Button className="gap-2">
              <PlusIcon className="h-4 w-4" />
              Create First Rule
            </Button>
          </Card>
        ) : (
          rules.map((rule) => (
            <RuleCard key={rule.id} rule={rule} onToggle={handleToggleRule} onDelete={handleDeleteRule} />
          ))
        )}
      </div>

      {/* Simulator */}
      {showSimulator && (
        <div className="lg:sticky lg:top-20 lg:h-fit">
          <RuleSimulator rules={rules} />
        </div>
      )}
    </div>
  )
}

interface RuleCardProps {
  rule: RoutingRule
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

function RuleCard({ rule, onToggle, onDelete }: RuleCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-lg font-semibold">{rule.name}</h4>
            <Badge variant={rule.enabled ? "default" : "secondary"}>{rule.enabled ? "Active" : "Disabled"}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Created {formatDistanceToNow(new Date(rule.createdAt), { addSuffix: true })}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Switch checked={rule.enabled} onCheckedChange={() => onToggle(rule.id)} aria-label={`Toggle ${rule.name}`} />
          <Button variant="ghost" size="icon" onClick={() => onDelete(rule.id)} aria-label="Delete rule">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Conditions */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Conditions:</p>
          <div className="flex flex-wrap gap-2">
            {rule.conditions.categories && rule.conditions.categories.length > 0 && (
              <>
                {rule.conditions.categories.map((cat) => (
                  <Badge key={cat} variant="outline">
                    Category: {cat}
                  </Badge>
                ))}
              </>
            )}
            {rule.conditions.keywords && rule.conditions.keywords.length > 0 && (
              <Badge variant="outline">Keywords: {rule.conditions.keywords.join(", ")}</Badge>
            )}
            {rule.conditions.severityMin && <Badge variant="outline">Severity ≥ {rule.conditions.severityMin}</Badge>}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Route to:</p>
          <div className="flex flex-wrap gap-2">
            {rule.destinations.map((dest) => (
              <Badge key={dest} variant="secondary">
                {dest}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
