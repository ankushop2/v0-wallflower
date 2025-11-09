import { createServiceClient } from "@/lib/supabase/server"

interface WebhookPayload {
  id: string
  title: string
  description: string
  category: string
  impact: string
  frequency: string
  status: string
  anonymous_token: string
  created_at: string
  pseudonym: string
}

/**
 * Fires all active webhooks for a given category
 * Fire-and-forget: sends webhooks without waiting for responses
 * @param grievance The grievance data to send
 * @param category The category to match webhooks against
 */
export async function fireWebhooks(grievance: any, category: string) {
  try {
    console.log(`[v0] fireWebhooks called for category: ${category}, grievance ID: ${grievance.id}`)
    console.log(`[v0] Grievance data:`, JSON.stringify(grievance, null, 2))

    const supabase = await createServiceClient()

    console.log(`[v0] Fetching active webhooks from database...`)
    const { data: webhooks, error } = await supabase.from("webhook_integrations").select("*").eq("is_active", true)

    if (error) {
      console.error("[v0] Error fetching webhooks:", error)
      return
    }

    console.log(`[v0] Found ${webhooks?.length || 0} active webhooks in database`)
    if (webhooks && webhooks.length > 0) {
      console.log(
        `[v0] All webhooks:`,
        webhooks.map((w) => ({ name: w.name, category: w.category, url: w.webhook_url })),
      )
    }

    if (!webhooks || webhooks.length === 0) {
      console.log(`[v0] No active webhooks found in database`)
      return
    }

    const matchingWebhooks = webhooks.filter((webhook) => webhook.category === category || webhook.category === "all")

    if (matchingWebhooks.length === 0) {
      console.log(`[v0] No webhooks match category: ${category} (found ${webhooks.length} total webhooks)`)
      console.log(
        `[v0] Available webhook categories:`,
        webhooks.map((w) => w.category),
      )
      return
    }

    console.log(`[v0] Found ${matchingWebhooks.length} matching webhook(s) for category: ${category}`)

    // Prepare the webhook payload
    const payload: WebhookPayload = {
      id: grievance.id,
      title: grievance.title,
      description: grievance.description,
      category: grievance.category,
      impact: grievance.impact,
      frequency: grievance.frequency,
      status: grievance.status,
      anonymous_token: grievance.anonymous_token,
      created_at: grievance.created_at,
      pseudonym: grievance.anonymous_token.substring(0, 8),
    }

    matchingWebhooks.forEach((webhook) => {
      console.log(`[v0] Firing webhook: ${webhook.name} to ${webhook.webhook_url}`)
      const webhookPayload = {
        event: "grievance.published",
        data: payload,
        webhook_name: webhook.name,
        timestamp: new Date().toISOString(),
      }
      console.log(`[v0] Webhook payload:`, JSON.stringify(webhookPayload, null, 2))

      fetch(webhook.webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookPayload),
        mode: "no-cors",
      })
        .then(() => {
          console.log(`[v0] Webhook ${webhook.name} fired successfully (no-cors mode)`)
        })
        .catch((error) => {
          // Silently log errors but don't block execution
          console.log(`[v0] Webhook ${webhook.name} attempted (error ignored):`, error.message)
        })
    })

    console.log(`[v0] All ${matchingWebhooks.length} webhooks dispatched (fire-and-forget)`)
  } catch (error: any) {
    console.error("[v0] Error in fireWebhooks:", error.message)
    console.error("[v0] fireWebhooks stack trace:", error.stack)
  }
}
