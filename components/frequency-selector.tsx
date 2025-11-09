"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Frequency } from "@/lib/types"

interface FrequencySelectorProps {
  value: Frequency
  onChange: (value: Frequency) => void
}

export function FrequencySelector({ value, onChange }: FrequencySelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="once">Once</SelectItem>
        <SelectItem value="weekly">Weekly</SelectItem>
        <SelectItem value="daily">Daily</SelectItem>
      </SelectContent>
    </Select>
  )
}
