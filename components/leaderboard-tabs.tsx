"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { LeaderboardTab, TimeframeFilter } from "@/lib/types"
import { TimeframeSwitch } from "@/components/timeframe-switch"
import { GrievanceList } from "@/components/grievance-list"
import { mockGrievances } from "@/lib/mock-data"
import { sortNew, sortRising, sortTop } from "@/lib/scoring"

export function LeaderboardTabs() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("new")
  const [timeframe, setTimeframe] = useState<TimeframeFilter>("week")

  const getSortedGrievances = () => {
    switch (activeTab) {
      case "new":
        return sortNew(mockGrievances)
      case "rising":
        return sortRising(mockGrievances)
      case "top":
        return sortTop(mockGrievances, true)
      default:
        return mockGrievances
    }
  }

  const sortedGrievances = getSortedGrievances()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LeaderboardTab)} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto">
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="rising">Rising</TabsTrigger>
            <TabsTrigger value="top">Top</TabsTrigger>
          </TabsList>
        </Tabs>

        <TimeframeSwitch value={timeframe} onChange={setTimeframe} />
      </div>

      <div>
        {sortedGrievances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 text-6xl opacity-20">💬</div>
            <h3 className="text-lg font-semibold mb-2">Quiet today</h3>
            <p className="text-muted-foreground text-pretty max-w-sm">Be the first to share what's slowing you down.</p>
          </div>
        ) : (
          <GrievanceList grievances={sortedGrievances} />
        )}
      </div>
    </div>
  )
}
