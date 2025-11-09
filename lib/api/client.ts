// API client with mock/real backend switching
import { MockAPIService } from "./mock-service"
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
  AuthResponse,
  LoginRequest,
  SignupRequest,
} from "./types"

const USE_MOCK = process.env.NEXT_PUBLIC_MOCK_API === "true"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

export class APIClient {
  private static getAuthToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("auth_token")
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (USE_MOCK) {
      // Mock mode - not used for actual requests
      throw new Error("Use MockAPIService directly in mock mode")
    }

    const token = this.getAuthToken()
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

  // Auth
  static async login(req: LoginRequest): Promise<AuthResponse> {
    if (USE_MOCK) return MockAPIService.login(req)
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(req),
    })
  }

  static async signup(req: SignupRequest): Promise<AuthResponse> {
    if (USE_MOCK) return MockAPIService.signup(req)
    return this.request("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(req),
    })
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
    if (USE_MOCK) return MockAPIService.listGrievances(params)

    const query = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, String(value))
      })
    }

    return this.request(`/api/grievances?${query}`)
  }

  static async getGrievance(id: string): Promise<{ grievance: Grievance }> {
    if (USE_MOCK) return MockAPIService.getGrievance(id)
    return this.request(`/api/grievances/${id}`)
  }

  static async createGrievance(req: CreateGrievanceRequest): Promise<{ grievance: Grievance }> {
    if (USE_MOCK) return MockAPIService.createGrievance(req)
    return this.request("/api/grievances", {
      method: "POST",
      body: JSON.stringify(req),
    })
  }

  static async vote(id: string, value: 1 | -1): Promise<{ up: number; down: number; score: number }> {
    if (USE_MOCK) return MockAPIService.vote(id, value)
    return this.request(`/api/grievances/${id}/vote`, {
      method: "POST",
      body: JSON.stringify({ value }),
    })
  }

  static async react(id: string, emoji: string): Promise<{ reactions: Record<string, number> }> {
    if (USE_MOCK) return MockAPIService.react(id, emoji)
    return this.request(`/api/grievances/${id}/react`, {
      method: "POST",
      body: JSON.stringify({ emoji }),
    })
  }

  // Thread
  static async getThread(id: string): Promise<{ timeline: ThreadEvent[] }> {
    if (USE_MOCK) return MockAPIService.getThread(id)
    return this.request(`/api/grievances/${id}/thread`)
  }

  static async addComment(id: string, body: string): Promise<{ event: ThreadEvent }> {
    if (USE_MOCK) return MockAPIService.addComment(id, body)
    return this.request(`/api/grievances/${id}/comment`, {
      method: "POST",
      body: JSON.stringify({ body }),
    })
  }

  static async updateStatus(id: string, status: string): Promise<{ grievance: Grievance }> {
    if (USE_MOCK) return MockAPIService.updateStatus(id, status)
    return this.request(`/api/grievances/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    })
  }

  // AI Assist
  static async assist(text: string): Promise<AssistResponse> {
    if (USE_MOCK) return MockAPIService.assist(text)
    return this.request("/api/grievances/assist", {
      method: "POST",
      body: JSON.stringify({ text }),
    })
  }

  // Moderation
  static async getModerationQueue(filter?: string): Promise<GrievanceListResponse> {
    if (USE_MOCK) return MockAPIService.getModerationQueue(filter)
    const query = filter ? `?filter=${filter}` : ""
    return this.request(`/api/moderation/queue${query}`)
  }

  static async approve(id: string): Promise<{ grievance: Grievance; routedDestinations: any[] }> {
    if (USE_MOCK) return MockAPIService.approve(id)
    return this.request(`/api/moderation/${id}/approve`, { method: "POST" })
  }

  // Routing
  static async simulateRouting(data: any): Promise<RoutingDecision> {
    if (USE_MOCK) return MockAPIService.simulateRouting(data)
    return this.request("/api/routing/simulate", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  static async listRoutingRules(): Promise<{ items: RoutingRule[] }> {
    if (USE_MOCK) return MockAPIService.listRoutingRules()
    return this.request("/api/routing/rules")
  }

  static async createRoutingRule(req: RoutingRuleUpsertRequest): Promise<RoutingRule> {
    if (USE_MOCK) return MockAPIService.createRoutingRule(req)
    return this.request("/api/routing/rules", {
      method: "POST",
      body: JSON.stringify(req),
    })
  }

  static async updateRoutingRule(id: string, req: RoutingRuleUpsertRequest): Promise<RoutingRule> {
    if (USE_MOCK) return MockAPIService.updateRoutingRule(id, req)
    return this.request(`/api/routing/rules/${id}`, {
      method: "PUT",
      body: JSON.stringify(req),
    })
  }

  static async deleteRoutingRule(id: string): Promise<void> {
    if (USE_MOCK) return MockAPIService.deleteRoutingRule(id)
    await this.request(`/api/routing/rules/${id}`, { method: "DELETE" })
  }

  static async getRoutingLogs(): Promise<{ items: RouteLog[] }> {
    if (USE_MOCK) return MockAPIService.getRoutingLogs()
    return this.request("/api/routing/logs")
  }

  // Blind DM
  static async startBlindDM(grievanceId: string): Promise<{ threadId: string }> {
    if (USE_MOCK) return MockAPIService.startBlindDM(grievanceId)
    return this.request(`/api/blind-dm/${grievanceId}/start`, { method: "POST" })
  }

  static async sendBlindDM(threadId: string, body: string, to: "poster" | "channel"): Promise<{ ok: boolean }> {
    if (USE_MOCK) return MockAPIService.sendBlindDM(threadId, body, to)
    return this.request(`/api/blind-dm/${threadId}/send`, {
      method: "POST",
      body: JSON.stringify({ body, to }),
    })
  }

  // Admin actions
  static async merge(id: string, intoId: string): Promise<{ canonicalId: string }> {
    if (USE_MOCK) return MockAPIService.merge(id, intoId)
    return this.request(`/api/grievances/${id}/merge`, {
      method: "POST",
      body: JSON.stringify({ intoId }),
    })
  }

  static async hide(id: string, reason?: string): Promise<void> {
    if (USE_MOCK) return MockAPIService.hide(id, reason)
    await this.request(`/api/grievances/${id}/hide`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    })
  }
}
