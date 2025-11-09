"use client"

import { useEffect, useRef } from "react"
import { getRealtimeClient, type RealtimeUpdate } from "@/lib/realtime"

/**
 * Hook to subscribe to real-time updates
 * @param eventType - Type of events to listen for ('vote', 'comment', 'status', etc. or '*' for all)
 * @param callback - Function to call when updates are received
 * @param enabled - Whether the subscription is enabled
 */
export function useRealtime(eventType: string, callback: (update: RealtimeUpdate) => void, enabled = true) {
  const callbackRef = useRef(callback)

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return

    const client = getRealtimeClient()

    const unsubscribe = client.subscribe(eventType, (update) => {
      callbackRef.current(update)
    })

    return () => {
      unsubscribe()
    }
  }, [eventType, enabled])
}

/**
 * Hook to connect to real-time updates for an organization/thread
 */
export function useRealtimeConnection(orgId: string, threadId?: string) {
  useEffect(() => {
    const client = getRealtimeClient()
    client.connect(orgId, threadId)

    return () => {
      client.disconnect()
    }
  }, [orgId, threadId])
}
