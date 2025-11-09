import type {
  GrievanceListResponse,
  Grievance,
  CreateGrievanceRequest,
  ThreadEvent,
  AssistResponse,
  RoutingRule,
  RoutingDecision,
  RouteLog,
  RoutingRuleUpsertRequest,
} from "./types"

const API_BASE_URL = "" // Empty string means relative URLs to same Next.js app

export class APIClient {
  private static async getAuthToken(): Promise<string | null> {
    if (typeof window === "undefined") return null

    const { getClient } = await import("@/lib/supabase/client")
    const supabase = getClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    return session?.access_token || null
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAuthToken()
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Grievances
  static async listGrievances(params?: {
    sort?: "new" | "rising" | "top"
    period?: "today" | "week" | "month"
    status?: string
    category?: string
    q?: string
    page?: number
    pageSize?: number
  }): Promise<GrievanceListResponse> {
    const query = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, String(value))
      })
    }

    return this.request(`/api/grievances?${query}`)
  }

  static async getGrievance(id: string): Promise<{ grievance: Grievance }> {
    return this.request(`/api/grievances/${id}`)
  }

  static async createGrievance(req: CreateGrievanceRequest): Promise<{ grievance: Grievance }> {
    return this.request("/api/grievances", {
      method: "POST",
      body: JSON.stringify(req),
    })
  }

  static async vote(id: string, value: 1 | -1): Promise<{ up: number; down: number; score: number }> {
    return this.request(`/api/grievances/${id}/vote`, {
      method: "POST",
      body: JSON.stringify({ value }),
    })
  }

  static async react(id: string, emoji: string): Promise<{ reactions: Record<string, number> }> {
    return this.request(`/api/grievances/${id}/react`, {
      method: "POST",
      body: JSON.stringify({ emoji }),
    })
  }

  // Thread
  static async getThread(id: string): Promise<{ timeline: ThreadEvent[] }> {
    return this.request(`/api/grievances/${id}/thread`)
  }

  static async addComment(id: string, body: string): Promise<{ event: ThreadEvent }> {
    return this.request(`/api/grievances/${id}/comment`, {
      method: "POST",
      body: JSON.stringify({ body }),
    })
  }

  static async updateStatus(id: string, status: string): Promise<{ grievance: Grievance }> {
    return this.request(`/api/grievances/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    })
  }

  // AI Assist
  static async assist(text: string): Promise<AssistResponse> {
    return this.request("/api/grievances/assist", {
      method: "POST",
      body: JSON.stringify({ text }),
    })
  }

  // Moderation
  static async getModerationQueue(filter?: string): Promise<GrievanceListResponse> {
    const query = filter ? `?filter=${filter}` : ""
    return this.request(`/api/moderation/queue${query}`)
  }

  static async approve(id: string): Promise<{ grievance: Grievance; routedDestinations: any[] }> {
    return this.request(`/api/moderation/${id}/approve`, { method: "POST" })
  }

  // Routing
  static async simulateRouting(data: any): Promise<RoutingDecision> {
    return this.request("/api/routing/simulate", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  static async listRoutingRules(): Promise<{ items: RoutingRule[] }> {
    return this.request("/api/routing/rules")
  }

  static async createRoutingRule(req: RoutingRuleUpsertRequest): Promise<RoutingRule> {
    return this.request("/api/routing/rules", {
      method: "POST",
      body: JSON.stringify(req),
    })
  }

  static async updateRoutingRule(id: string, req: RoutingRuleUpsertRequest): Promise<RoutingRule> {
    return this.request(`/api/routing/rules/${id}`, {
      method: "PUT",
      body: JSON.stringify(req),
    })
  }

  static async deleteRoutingRule(id: string): Promise<void> {
    await this.request(`/api/routing/rules/${id}`, { method: "DELETE" })
  }

  static async getRoutingLogs(): Promise<{ items: RouteLog[] }> {
    return this.request("/api/routing/logs")
  }

  // Blind DM
  static async startBlindDM(grievanceId: string): Promise<{ threadId: string }> {
    return this.request(`/api/blind-dm/${grievanceId}/start`, { method: "POST" })
  }

  static async sendBlindDM(threadId: string, body: string, to: "poster" | "channel"): Promise<{ ok: boolean }> {
    return this.request(`/api/blind-dm/${threadId}/send`, {
      method: "POST",
      body: JSON.stringify({ body, to }),
    })
  }

  // Admin actions
  static async merge(id: string, intoId: string): Promise<{ canonicalId: string }> {
    return this.request(`/api/grievances/${id}/merge`, {
      method: "POST",
      body: JSON.stringify({ intoId }),
    })
  }

  static async hide(id: string, reason?: string): Promise<void> {
    await this.request(`/api/grievances/${id}/hide`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    })
  }

  static async voteGrievance(
    id: string,
    req: { type: "up" | "down" | "unvote"; anonymous_token: string },
  ): Promise<{ up: number; down: number; score: number }> {
    return this.request(`/api/grievances/${id}/vote`, {
      method: "POST",
      body: JSON.stringify(req),
    })
  }

  static async reactToGrievance(
    id: string,
    req: { emoji: string; anonymous_token: string },
  ): Promise<{ message: string }> {
    return this.request(`/api/grievances/${id}/react`, {
      method: "POST",
      body: JSON.stringify(req),
    })
  }
}

export const apiClient = APIClient
