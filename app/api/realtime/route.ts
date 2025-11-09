// Mock SSE endpoint for real-time updates
// In production, this would connect to a real-time service

export const runtime = "edge"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get("org")
  const threadId = searchParams.get("thread")

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const message = {
        type: "connected",
        orgId,
        threadId,
        timestamp: Date.now(),
      }

      controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`))

      // Mock: Send periodic updates
      const interval = setInterval(() => {
        const update = {
          type: "vote",
          grievanceId: "1",
          data: { up: Math.floor(Math.random() * 100), down: Math.floor(Math.random() * 20) },
          timestamp: Date.now(),
        }

        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}\n\n`))
        } catch (e) {
          clearInterval(interval)
        }
      }, 10000)

      // Cleanup on disconnect
      request.signal.addEventListener("abort", () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
