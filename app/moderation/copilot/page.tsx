"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SettingsIcon, LogOutIcon, ArrowLeftIcon } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import { ModeratorCopilotChat } from "@/components/moderator-copilot-chat"

export default function ModeratorCopilotPage() {
  const router = useRouter()
  const { user, logout, hasRole } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/auth/login")
  }

  if (!hasRole(["moderator", "owner", "admin"])) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">This page is only accessible to moderators.</p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </div>
    )
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
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Home
            </Link>
            {user && hasRole(["moderator", "owner", "admin"]) && (
              <>
                <Link href="/moderation" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Moderation
                </Link>
                <Link
                  href="/moderation/copilot"
                  className="text-sm font-medium text-foreground hover:text-foreground/80"
                >
                  AI Copilot
                </Link>
                <Link href="/routing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Routing
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {user && (
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
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" className="gap-2 mb-4" onClick={() => router.back()}>
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Moderation
          </Button>

          <h2 className="text-3xl font-bold tracking-tight text-balance">AI Moderator Copilot</h2>
          <p className="mt-2 text-muted-foreground text-pretty">
            Chat with your AI assistant to get insights, search grievances, and analyze platform data in real-time.
          </p>
        </div>

        <div className="max-w-4xl">
          <ModeratorCopilotChat />
        </div>
      </main>
    </div>
  )
}
