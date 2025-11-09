"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { TimeframeSwitch } from "@/components/timeframe-switch"
import type { TimeframeFilter } from "@/lib/types"
import { TrendingUpIcon, ClockIcon, CheckCircle2Icon, AlertCircleIcon, DownloadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, LineChart } from "recharts"

export function AnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState<TimeframeFilter>("week")

  // Mock data
  const stats = {
    total: 127,
    avgTimeToResponse: 4.2,
    resolved: 89,
    open: 38,
  }

  const trendData = [
    { date: "Mon", count: 12 },
    { date: "Tue", count: 19 },
    { date: "Wed", count: 15 },
    { date: "Thu", count: 22 },
    { date: "Fri", count: 18 },
    { date: "Sat", count: 8 },
    { date: "Sun", count: 5 },
  ]

  const categoryData = [
    { category: "Time Management", count: 34 },
    { category: "Equipment", count: 28 },
    { category: "Career Development", count: 22 },
    { category: "Work Environment", count: 18 },
    { category: "Communication", count: 15 },
    { category: "Other", count: 10 },
  ]

  const statusData = [
    { status: "Resolved", count: 89, color: "bg-green-500" },
    { status: "In Progress", count: 24, color: "bg-blue-500" },
    { status: "Open", count: 14, color: "bg-yellow-500" },
  ]

  const handleExport = () => {
    console.log("Export CSV")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TimeframeSwitch value={timeframe} onChange={setTimeframe} />
        <Button variant="outline" onClick={handleExport} className="gap-2 bg-transparent">
          <DownloadIcon className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Grievances"
          value={stats.total.toString()}
          icon={<TrendingUpIcon className="h-4 w-4" />}
          trend="+12% from last period"
        />
        <StatCard
          title="Avg. Time to Response"
          value={`${stats.avgTimeToResponse}h`}
          icon={<ClockIcon className="h-4 w-4" />}
          trend="-1.2h from last period"
          trendPositive
        />
        <StatCard
          title="Resolved"
          value={stats.resolved.toString()}
          icon={<CheckCircle2Icon className="h-4 w-4" />}
          trend={`${Math.round((stats.resolved / stats.total) * 100)}% resolution rate`}
        />
        <StatCard
          title="Open"
          value={stats.open.toString()}
          icon={<AlertCircleIcon className="h-4 w-4" />}
          trend="Needs attention"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trend Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Submission Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" tick={{ fill: "currentColor" }} />
              <YAxis className="text-xs" tick={{ fill: "currentColor" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Top Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" className="text-xs" tick={{ fill: "currentColor" }} />
              <YAxis
                type="category"
                dataKey="category"
                className="text-xs"
                tick={{ fill: "currentColor" }}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Status Distribution</h3>
        <div className="space-y-4">
          {statusData.map((item) => {
            const percentage = (item.count / stats.total) * 100
            return (
              <div key={item.status} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${item.color}`} />
                    <span className="text-sm font-medium">{item.status}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {item.count} ({Math.round(percentage)}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} transition-all`} style={{ width: `${percentage}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  trend: string
  trendPositive?: boolean
}

function StatCard({ title, value, icon, trend, trendPositive }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <p className="text-3xl font-bold tracking-tight mb-1">{value}</p>
      <p className={`text-xs ${trendPositive ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
        {trend}
      </p>
    </Card>
  )
}
