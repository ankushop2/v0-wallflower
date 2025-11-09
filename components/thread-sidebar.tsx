"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Grievance } from "@/lib/types"
import { severityDescriptions } from "@/lib/categories"
import { format } from "date-fns"
import { CalendarIcon, TagIcon, MapPinIcon } from "lucide-react"

interface ThreadSidebarProps {
  grievance: Grievance
}

export function ThreadSidebar({ grievance }: ThreadSidebarProps) {
  const severityConfig = severityDescriptions[grievance.severity] || severityDescriptions[3]

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Details</h3>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Category</p>
            <Badge variant="outline">{grievance.category}</Badge>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Severity</p>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-2 w-6 rounded ${level <= grievance.severity ? "bg-primary" : "bg-muted"}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{severityConfig.label}</span>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Impact</p>
            <Badge variant="secondary" className="capitalize">
              {grievance.impact}
            </Badge>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Frequency</p>
            <Badge variant="secondary" className="capitalize">
              {grievance.frequency}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      {grievance.routedTo && grievance.routedTo.length > 0 && (
        <>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <MapPinIcon className="h-4 w-4" />
              Routed To
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {grievance.routedTo.map((dest) => (
                <Badge key={dest} variant="outline">
                  {dest}
                </Badge>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {grievance.tags.length > 0 && (
        <>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <TagIcon className="h-4 w-4" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {grievance.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          Timeline
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span className="font-medium">{format(new Date(grievance.createdAt), "MMM d, yyyy")}</span>
          </div>
          {grievance.approvedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Approved:</span>
              <span className="font-medium">{format(new Date(grievance.approvedAt), "MMM d, yyyy")}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Updated:</span>
            <span className="font-medium">{format(new Date(grievance.updatedAt), "MMM d, yyyy")}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
