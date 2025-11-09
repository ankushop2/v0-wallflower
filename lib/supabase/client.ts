import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

let client: SupabaseClient | null = null
let isInitializing = false

export function createClient() {
  // Return existing client if already created
  if (client) {
    return client
  }

  // Prevent concurrent initialization
  if (isInitializing) {
    throw new Error("Supabase client is already being initialized")
  }

  isInitializing = true

  client = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  isInitializing = false

  return client
}

// Export a getter that ensures client exists
export function getClient() {
  if (!client) {
    return createClient()
  }
  return client
}
