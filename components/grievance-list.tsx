"use client"

import type { Grievance } from "@/lib/types"
import { GrievanceCard } from "@/components/grievance-card"

interface GrievanceListProps {
  grievances: Grievance[]
}

export function GrievanceList({ grievances }: GrievanceListProps) {
  return (
    <div className="space-y-4">
      {grievances.map((grievance) => (
        <GrievanceCard key={grievance.id} grievance={grievance} />
      ))}
    </div>
  )
}
