import { Badge } from "@/components/ui/badge"
import type { Status } from "@/lib/types"
import { statusDescriptions } from "@/lib/categories"

interface StatusPillProps {
  status: Status
}

export function StatusPill({ status }: StatusPillProps) {
  const config = statusDescriptions[status] || statusDescriptions["open"]

  const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    blue: "default",
    yellow: "secondary",
    purple: "outline",
    green: "default",
    red: "destructive",
    gray: "secondary",
  }

  return (
    <Badge variant={variantMap[config.color] || "default"} className="shrink-0">
      {config.label}
    </Badge>
  )
}
