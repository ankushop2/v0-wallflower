"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ModerationCard } from "@/components/moderation-card"
import { mockGrievances } from "@/lib/mock-data"
import { CheckIcon, XIcon } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type QueueType = "new" | "flagged" | "needs_info" | "escalated"

export function ModerationQueue() {
  const [activeQueue, setActiveQueue] = useState<QueueType>("new")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState<"approve" | "hide" | null>(null)

  // Mock data - in real app, filter by status
  const newItems = mockGrievances.slice(0, 2)
  const flaggedItems: typeof mockGrievances = []
  const needsInfoItems: typeof mockGrievances = []
  const escalatedItems = mockGrievances.slice(2, 3)

  const getCurrentItems = () => {
    switch (activeQueue) {
      case "new":
        return newItems
      case "flagged":
        return flaggedItems
      case "needs_info":
        return needsInfoItems
      case "escalated":
        return escalatedItems
      default:
        return []
    }
  }

  const items = getCurrentItems()

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(items.map((i) => i.id))
    }
  }

  const handleBulkApprove = () => {
    setBulkAction("approve")
  }

  const handleBulkHide = () => {
    setBulkAction("hide")
  }

  const confirmBulkAction = () => {
    console.log(`Bulk ${bulkAction}:`, selectedIds)
    setSelectedIds([])
    setBulkAction(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={activeQueue} onValueChange={(v) => setActiveQueue(v as QueueType)} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-4 sm:w-auto">
            <TabsTrigger value="new" className="relative">
              New
              {newItems.length > 0 && (
                <span className="ml-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                  {newItems.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="flagged">
              AI-Flagged
              {flaggedItems.length > 0 && (
                <span className="ml-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1.5 text-xs text-destructive-foreground">
                  {flaggedItems.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="needs_info">Needs Info</TabsTrigger>
            <TabsTrigger value="escalated">
              Escalated
              {escalatedItems.length > 0 && (
                <span className="ml-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs text-white">
                  {escalatedItems.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
            <Button variant="outline" size="sm" onClick={handleBulkApprove} className="gap-2 bg-transparent">
              <CheckIcon className="h-4 w-4" />
              Approve
            </Button>
            <Button variant="outline" size="sm" onClick={handleBulkHide} className="gap-2 bg-transparent">
              <XIcon className="h-4 w-4" />
              Hide
            </Button>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <Card className="p-4">
          <Button variant="ghost" size="sm" onClick={handleSelectAll} className="mb-2">
            {selectedIds.length === items.length ? "Deselect All" : "Select All"}
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        {items.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mb-4 text-5xl opacity-20">✅</div>
            <h3 className="text-lg font-semibold mb-2">All clear!</h3>
            <p className="text-sm text-muted-foreground">No items in this queue right now.</p>
          </Card>
        ) : (
          items.map((item) => (
            <ModerationCard
              key={item.id}
              grievance={item}
              isSelected={selectedIds.includes(item.id)}
              onToggleSelect={handleToggleSelect}
            />
          ))
        )}
      </div>

      {/* Bulk Action Confirmation */}
      <AlertDialog open={bulkAction !== null} onOpenChange={() => setBulkAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk {bulkAction === "approve" ? "Approval" : "Hide"}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {bulkAction} {selectedIds.length} grievance(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkAction}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
