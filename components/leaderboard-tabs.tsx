"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { LeaderboardTab, TimeframeFilter, Grievance } from "@/lib/types"
import { TimeframeSwitch } from "@/components/timeframe-switch"
import { GrievanceList } from "@/components/grievance-list"
import { APIClient } from "@/lib/api/client"
import { Loader2Icon } from "lucide-react"

export function LeaderboardTabs() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("new")
  const [timeframe, setTimeframe] = useState<TimeframeFilter>("week")
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGrievances = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await APIClient.listGrievances({
          sort: activeTab,
          period: timeframe,
        })
        setGrievances(response.grievances || [])
      } catch (err) {
        console.error("[v0] Error fetching grievances:", err)
        setError("Failed to load grievances")
        setGrievances([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchGrievances()
  }, [activeTab, timeframe])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="text-sm text-primary hover:underline">
          Try again
        </button>
      </div>
    )
  }

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
        {grievances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 text-6xl opacity-20">💬</div>
            <h3 className="text-lg font-semibold mb-2">Quiet today</h3>
            <p className="text-muted-foreground text-pretty max-w-sm">Be the first to share what's slowing you down.</p>
          </div>
        ) : (
          <GrievanceList grievances={grievances} />
        )}
      </div>
    </div>
  )
}
