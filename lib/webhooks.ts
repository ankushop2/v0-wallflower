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
 * @param grievance The grievance data to send
 * @param category The category to match webhooks against
 */
export async function fireWebhooks(grievance: any, category: string) {
  try {
    const supabase = await createServiceClient()

    console.log(`[v0] Checking webhooks for category: ${category}`)

    // Fetch all active webhooks for this category
    const { data: webhooks, error } = await supabase
      .from("webhook_integrations")
      .select("*")
      .eq("category", category)
      .eq("is_active", true)

    if (error) {
      console.error("[v0] Error fetching webhooks:", error)
      return
    }

    if (!webhooks || webhooks.length === 0) {
      console.log(`[v0] No active webhooks found for category: ${category}`)
      return
    }

    console.log(`[v0] Found ${webhooks.length} webhook(s) for category: ${category}`)

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

    // Fire all webhooks in parallel
    const webhookPromises = webhooks.map(async (webhook) => {
      try {
        console.log(`[v0] Firing webhook: ${webhook.name} (${webhook.webhook_url})`)

        const response = await fetch(webhook.webhook_url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event: "grievance.created",
            data: payload,
            webhook_name: webhook.name,
            timestamp: new Date().toISOString(),
          }),
        })

        if (!response.ok) {
          console.error(`[v0] Webhook ${webhook.name} failed with status ${response.status}`)
        } else {
          console.log(`[v0] Webhook ${webhook.name} fired successfully`)
        }
      } catch (error: any) {
        console.error(`[v0] Error firing webhook ${webhook.name}:`, error.message)
      }
    })

    // Wait for all webhooks to complete (don't block the response though)
    await Promise.allSettled(webhookPromises)
  } catch (error: any) {
    console.error("[v0] Error in fireWebhooks:", error.message)
  }
}
