"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import { ThreadView } from "@/components/thread-view"
import { APIClient } from "@/lib/api/client"
import type { Grievance } from "@/lib/types"

export default function ThreadPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [grievance, setGrievance] = useState<Grievance | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      if (!id) return

      try {
        setLoading(true)
        const [grievanceResponse, threadResponse] = await Promise.all([
          APIClient.getGrievance(id),
          APIClient.getThread(id),
        ])

        setGrievance(grievanceResponse.grievance)
        setEvents(threadResponse.events || threadResponse.timeline || [])
        setError(null)
      } catch (err) {
        console.error("[v0] Error loading thread:", err)
        setError("Failed to load thread")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading thread...</p>
        </div>
      </div>
    )
  }

  if (error || !grievance) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Thread Not Found</h1>
          <p className="text-muted-foreground mb-4">The thread you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
              <span className="sr-only">Back to leaderboard</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-bold text-sm">WF</span>
            </div>
            <h1 className="text-xl font-semibold">WallFlower</h1>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8">
        <ThreadView grievance={grievance} events={events} messages={[]} triageSuggestion={null} />
      </main>
    </div>
  )
}
