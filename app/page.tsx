"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LeaderboardTabs } from "@/components/leaderboard-tabs"
import { ComposePanel } from "@/components/compose-panel"
import { PlusIcon, SettingsIcon, LogOutIcon } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"

export default function HomePage() {
  const router = useRouter()
  const { user, logout, hasRole } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
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
            {user && hasRole(["moderator", "owner", "admin"]) && (
              <>
                <Link href="/moderation" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Moderation
                </Link>
                <Link href="/routing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Routing
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.name || user.email} ({user.role})
                </span>
                <Link href="/settings">
                  <Button variant="outline" size="icon">
                    <SettingsIcon className="h-4 w-4" />
                    <span className="sr-only">Settings</span>
                  </Button>
                </Link>
                <Button variant="outline" size="icon" onClick={handleLogout}>
                  <LogOutIcon className="h-4 w-4" />
                  <span className="sr-only">Logout</span>
                </Button>
                <Link href="/new">
                  <Button className="gap-2">
                    <PlusIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">New Grievance</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/auth/login">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-balance mb-2">Share Your Concern</h2>
            <p className="text-muted-foreground text-pretty max-w-2xl mx-auto">
              Submit your workplace concern anonymously. Our AI will help you improve your message and check for similar
              issues.
            </p>
          </div>
          <ComposePanel />
        </section>

        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-balance">Recent Grievances</h2>
          <p className="mt-2 text-muted-foreground text-pretty">
            Browse and support concerns from your colleagues. Track resolutions transparently.
          </p>
        </div>

        <Suspense fallback={<div className="flex items-center justify-center py-12">Loading...</div>}>
          {/* Leaderboard */}
          <LeaderboardTabs />
        </Suspense>
      </main>
    </div>
  )
}
