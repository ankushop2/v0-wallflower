import { streamText, tool } from "ai"
import { z } from "zod"
import { createServiceClient } from "@/lib/supabase/server"

export const maxDuration = 60

const getPendingGrievancesTool = tool({
  description: "Get the count of pending grievances waiting for moderation",
  inputSchema: z.object({}),
  async execute() {
    const supabase = await createServiceClient()

    const { count, error } = await supabase
      .from("grievances")
      .select("*", { count: "exact", head: true })
      .eq("needs_moderation", true)
      .eq("moderation_status", "pending")

    if (error) throw error

    return {
      count: count || 0,
      message: `There are ${count || 0} grievances pending moderation.`,
    }
  },
})

const getGrievancesByCategoryTool = tool({
  description: "Get statistics about grievances grouped by category",
  inputSchema: z.object({
    limit: z.number().optional().describe("Maximum number of categories to return"),
  }),
  async execute({ limit = 10 }) {
    const supabase = await createServiceClient()

    const { data, error } = await supabase.from("grievances").select("category, id").eq("is_hidden", false)

    if (error) throw error

    const categoryCount = data.reduce((acc: any, g: any) => {
      acc[g.category] = (acc[g.category] || 0) + 1
      return acc
    }, {})

    const sorted = Object.entries(categoryCount)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, limit)

    return {
      categories: sorted.map(([category, count]) => ({ category, count })),
      message: `Top categories: ${sorted.map(([cat, cnt]) => `${cat} (${cnt})`).join(", ")}`,
    }
  },
})

const searchGrievancesTool = tool({
  description: "Search for grievances by keyword in title or description",
  inputSchema: z.object({
    keyword: z.string().describe("The keyword to search for"),
    limit: z.number().optional().describe("Maximum number of results to return"),
  }),
  async execute({ keyword, limit = 5 }) {
    const supabase = await createServiceClient()

    const { data, error } = await supabase
      .from("grievances")
      .select("id, title, description, category, status, created_at")
      .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error

    return {
      results: data,
      count: data.length,
      message: `Found ${data.length} grievances matching "${keyword}"`,
    }
  },
})

const getGrievanceByIdTool = tool({
  description: "Get detailed information about a specific grievance by its ID",
  inputSchema: z.object({
    grievanceId: z.string().describe("The UUID of the grievance"),
  }),
  async execute({ grievanceId }) {
    const supabase = await createServiceClient()

    const { data, error } = await supabase.from("grievances").select("*").eq("id", grievanceId).maybeSingle()

    if (error) throw error
    if (!data) return { error: "Grievance not found" }

    // Get vote count
    const { data: votes } = await supabase.from("votes").select("vote_type").eq("grievance_id", grievanceId)

    const upvotes = votes?.filter((v) => v.vote_type === "up").length || 0
    const downvotes = votes?.filter((v) => v.vote_type === "down").length || 0

    return {
      ...data,
      upvotes,
      downvotes,
      message: `Found grievance: "${data.title}" (${data.category}, ${data.status})`,
    }
  },
})

const getStatisticsTool = tool({
  description: "Get overall platform statistics including total grievances, status breakdown, and moderation queue",
  inputSchema: z.object({}),
  async execute() {
    const supabase = await createServiceClient()

    const { data: grievances, error } = await supabase
      .from("grievances")
      .select("status, needs_moderation, moderation_status, is_hidden")

    if (error) throw error

    const stats = {
      total: grievances.length,
      byStatus: grievances.reduce((acc: any, g: any) => {
        acc[g.status] = (acc[g.status] || 0) + 1
        return acc
      }, {}),
      pending: grievances.filter((g) => g.needs_moderation && g.moderation_status === "pending").length,
      approved: grievances.filter((g) => g.moderation_status === "approved").length,
      rejected: grievances.filter((g) => g.moderation_status === "rejected").length,
      hidden: grievances.filter((g) => g.is_hidden).length,
    }

    return {
      ...stats,
      message: `Platform stats: ${stats.total} total grievances, ${stats.pending} pending moderation, ${stats.approved} approved, ${stats.rejected} rejected`,
    }
  },
})

const getRecentActivityTool = tool({
  description: "Get recent grievances submitted in the last N hours",
  inputSchema: z.object({
    hours: z.number().optional().describe("Number of hours to look back (default: 24)"),
  }),
  async execute({ hours = 24 }) {
    const supabase = await createServiceClient()

    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from("grievances")
      .select("id, title, category, status, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })

    if (error) throw error

    return {
      results: data,
      count: data.length,
      message: `${data.length} grievances submitted in the last ${hours} hours`,
    }
  },
})

const getModeratorWorkloadTool = tool({
  description: "Get workload statistics for moderators including pending items per moderator",
  inputSchema: z.object({}),
  async execute() {
    const supabase = await createServiceClient()

    const { data: moderators, error: modError } = await supabase
      .from("users")
      .select("id, email, role")
      .in("role", ["moderator", "owner", "admin"])

    if (modError) throw modError

    const { data: pendingGrievances, error: grievError } = await supabase
      .from("grievances")
      .select("id, moderated_by")
      .eq("needs_moderation", true)
      .eq("moderation_status", "pending")

    if (grievError) throw grievError

    const workload = moderators.map((mod) => {
      const assigned = pendingGrievances.filter((g) => g.moderated_by === mod.id).length
      return {
        email: mod.email,
        role: mod.role,
        assigned,
      }
    })

    return {
      moderators: workload,
      totalPending: pendingGrievances.length,
      message: `${moderators.length} moderators, ${pendingGrievances.length} pending items total`,
    }
  },
})

const getWebhookStatusTool = tool({
  description: "Get status of active webhook integrations by category",
  inputSchema: z.object({}),
  async execute() {
    const supabase = await createServiceClient()

    const { data, error } = await supabase
      .from("webhook_integrations")
      .select("id, name, category, is_active, created_at")
      .eq("is_active", true)

    if (error) throw error

    return {
      webhooks: data,
      count: data.length,
      message: `${data.length} active webhook integrations configured`,
    }
  },
})

const tools = {
  getPendingGrievances: getPendingGrievancesTool,
  getGrievancesByCategory: getGrievancesByCategoryTool,
  searchGrievances: searchGrievancesTool,
  getGrievanceById: getGrievanceByIdTool,
  getStatistics: getStatisticsTool,
  getRecentActivity: getRecentActivityTool,
  getModeratorWorkload: getModeratorWorkloadTool,
  getWebhookStatus: getWebhookStatusTool,
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    console.log("[v0] Copilot request with", messages.length, "messages")

    const result = streamText({
      model: "anthropic/claude-sonnet-4.5",
      messages,
      system: `You are an AI copilot assistant for WallFlower moderators. Your role is to help moderators:

1. Get real-time insights about grievances and moderation queue
2. Search and analyze grievances by category, keyword, or status
3. Provide statistics and trends
4. Help identify urgent items that need attention
5. Answer questions about platform usage and metrics

You have access to tools that query the live database. Use them to provide accurate, up-to-date information.

When providing information:
- Be concise and actionable
- Highlight urgent items (high severity, pending long time)
- Suggest next steps for moderators
- Use data to support recommendations
- ALWAYS provide a text response that explains the tool results in a conversational way

Remember: You're assisting moderators in maintaining platform quality and responding to workplace concerns.`,
      tools,
      maxSteps: 15, // Increase maxSteps to ensure AI generates final text response after tool calls
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("[v0] Copilot error:", error)
    return new Response(JSON.stringify({ error: "Failed to process chat" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
