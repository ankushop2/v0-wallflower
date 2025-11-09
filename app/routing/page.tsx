import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import { RoutingRuleBuilder } from "@/components/routing-rule-builder"

export default function RoutingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
              <span className="sr-only">Back to home</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-bold text-sm">WF</span>
            </div>
            <h1 className="text-xl font-semibold">Routing Rules</h1>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-balance">Automatic Routing</h2>
          <p className="mt-2 text-muted-foreground text-pretty">
            Configure rules to automatically route grievances to the right teams and channels.
          </p>
        </div>
        <RoutingRuleBuilder />
      </main>
    </div>
  )
}
