import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LeaderboardTabs } from "@/components/leaderboard-tabs"
import { PlusIcon, SettingsIcon } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-bold text-sm">WF</span>
            </div>
            <h1 className="text-xl font-semibold">WallFlower</h1>
          </div>

          <nav className="hidden gap-6 md:flex">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-foreground/80">
              Home
            </Link>
            <Link href="/moderation" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Moderation
            </Link>
            <Link href="/routing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Routing
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/settings">
              <Button variant="outline" size="icon">
                <SettingsIcon className="h-4 w-4" />
                <span className="sr-only">Settings</span>
              </Button>
            </Link>
            <Link href="/new">
              <Button className="gap-2">
                <PlusIcon className="h-4 w-4" />
                <span className="hidden sm:inline">New Grievance</span>
                <span className="sm:hidden">New</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-balance">Workplace Grievances</h2>
          <p className="mt-2 text-muted-foreground text-pretty">
            Share concerns anonymously and track resolutions transparently. Your voice matters.
          </p>
        </div>

        <Suspense fallback={<div className="flex items-center justify-center py-12">Loading...</div>}>
          <LeaderboardTabs />
        </Suspense>
      </main>
    </div>
  )
}
