"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { TimeframeFilter } from "@/lib/types"

interface TimeframeSwitchProps {
  value: TimeframeFilter
  onChange: (value: TimeframeFilter) => void
}

export function TimeframeSwitch({ value, onChange }: TimeframeSwitchProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as TimeframeFilter)}
      className="justify-start"
    >
      <ToggleGroupItem value="today" aria-label="Today">
        Today
      </ToggleGroupItem>
      <ToggleGroupItem value="week" aria-label="This week">
        Week
      </ToggleGroupItem>
      <ToggleGroupItem value="month" aria-label="This month">
        Month
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
