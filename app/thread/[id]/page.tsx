import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import { ThreadView } from "@/components/thread-view"
import { mockGrievances, mockThreadEvents, mockBlindMessages, generateMockTriageSuggestion } from "@/lib/mock-data"

interface ThreadPageProps {
  params: Promise<{ id: string }>
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { id } = await params
  const grievance = mockGrievances.find((g) => g.id === id)

  if (!grievance) {
    notFound()
  }

  const events = mockThreadEvents[id] || []
  const messages = mockBlindMessages[id] || []
  const triageSuggestion = generateMockTriageSuggestion(id)

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
        <ThreadView grievance={grievance} events={events} messages={messages} triageSuggestion={triageSuggestion} />
      </main>
    </div>
  )
}
