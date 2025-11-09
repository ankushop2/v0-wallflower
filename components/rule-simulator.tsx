"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import type { RoutingRule } from "@/lib/types"
import { PlayIcon, AlertCircleIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RuleSimulatorProps {
  rules: RoutingRule[]
}

export function RuleSimulator({ rules }: RuleSimulatorProps) {
  const [sampleText, setSampleText] = useState("")
  const [results, setResults] = useState<{
    category: string
    severity: number
    destinations: string[]
    confidence: number
  } | null>(null)

  const handleSimulate = () => {
    // Mock simulation logic
    const matchedRules = rules.filter((rule) => rule.enabled)
    const allDestinations = new Set<string>()

    matchedRules.forEach((rule) => {
      rule.destinations.forEach((dest) => allDestinations.add(dest))
    })

    setResults({
      category: "Time Management",
      severity: 4,
      destinations: Array.from(allDestinations),
      confidence: 0.87,
    })
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <PlayIcon className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Rule Simulator</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sample-text">Sample Grievance Text</Label>
          <Textarea
            id="sample-text"
            placeholder="Paste a sample grievance to see which rules would match and where it would be routed..."
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>

        <Button onClick={handleSimulate} disabled={!sampleText.trim()} className="w-full gap-2">
          <PlayIcon className="h-4 w-4" />
          Simulate Routing
        </Button>

        {results && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Predicted Category:</p>
              <Badge variant="outline">{results.category}</Badge>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Predicted Severity:</p>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-2 w-6 rounded ${level <= results.severity ? "bg-primary" : "bg-muted"}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">Level {results.severity}</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Would route to:</p>
              {results.destinations.length === 0 ? (
                <Alert variant="destructive">
                  <AlertCircleIcon className="h-4 w-4" />
                  <AlertDescription>No matching rules. This grievance would need manual routing.</AlertDescription>
                </Alert>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {results.destinations.map((dest) => (
                    <Badge key={dest} variant="secondary">
                      {dest}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Confidence:</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${results.confidence * 100}%` }} />
                </div>
                <span className="text-sm font-medium">{Math.round(results.confidence * 100)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
