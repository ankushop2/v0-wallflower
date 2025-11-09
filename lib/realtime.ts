// Real-time updates client using Server-Sent Events (SSE)

export interface RealtimeUpdate {
  type: "vote" | "comment" | "status" | "new_grievance" | "merge"
  grievanceId: string
  data: any
  timestamp: number
}

export class RealtimeClient {
  private eventSource: EventSource | null = null
  private listeners: Map<string, Set<(update: RealtimeUpdate) => void>> = new Map()

  connect(orgId: string, threadId?: string) {
    const url = new URL("/api/realtime", window.location.origin)
    url.searchParams.set("org", orgId)
    if (threadId) {
      url.searchParams.set("thread", threadId)
    }

    this.eventSource = new EventSource(url.toString())

    this.eventSource.addEventListener("message", (event) => {
      try {
        const update: RealtimeUpdate = JSON.parse(event.data)
        this.notifyListeners(update.type, update)
      } catch (error) {
        console.error("[v0] Failed to parse realtime update:", error)
      }
    })

    this.eventSource.addEventListener("error", (error) => {
      console.error("[v0] Realtime connection error:", error)
      this.reconnect(orgId, threadId)
    })
  }

  subscribe(eventType: string, callback: (update: RealtimeUpdate) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType)!.add(callback)

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(callback)
    }
  }

  private notifyListeners(eventType: string, update: RealtimeUpdate) {
    this.listeners.get(eventType)?.forEach((callback) => callback(update))
    // Also notify wildcard listeners
    this.listeners.get("*")?.forEach((callback) => callback(update))
  }

  private reconnect(orgId: string, threadId?: string) {
    setTimeout(() => {
      console.log("[v0] Reconnecting to realtime...")
      this.connect(orgId, threadId)
    }, 5000)
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
    this.listeners.clear()
  }
}

// Singleton instance
let realtimeClient: RealtimeClient | null = null

export function getRealtimeClient(): RealtimeClient {
  if (!realtimeClient) {
    realtimeClient = new RealtimeClient()
  }
  return realtimeClient
}

// Hook for React components
export function useRealtime(eventType: string, callback: (update: RealtimeUpdate) => void, deps: any[] = []) {
  // This would be implemented with useEffect in actual usage
  // For now, this is just the interface
}
