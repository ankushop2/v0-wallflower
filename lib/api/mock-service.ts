// Comprehensive mock service matching OpenAPI spec
import type {
  Grievance,
  GrievanceListResponse,
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
  User,
} from "./types"
import { generateMockJWT } from "../auth/jwt-mock"
import { CATEGORIES } from "../categories"

// Mock data storage
const mockGrievances: Grievance[] = [
  {
    id: "1",
    pseudonym: "Anon-7321",
    title: "Conference room booking system is broken",
    body: "The booking system has been down for three weeks. Multiple meetings had to be rescheduled.",
    category: "Facilities & IT",
    tags: ["it", "facilities"],
    severity: 3,
    status: "open",
    score: 47,
    up: 52,
    down: 5,
    reactions: { "🔥": 12, "👍": 8 },
    approvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    pseudonym: "Anon-4892",
    title: "Unclear promotion criteria",
    body: "No one knows what the actual criteria are for promotions. This creates confusion and frustration.",
    category: "Performance & Growth",
    tags: ["career", "transparency"],
    severity: 4,
    status: "in_progress",
    score: 83,
    up: 91,
    down: 8,
    reactions: { "💀": 15, "🔥": 23 },
    approvedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
]

const mockUsers: Map<string, User & { password: string }> = new Map([
  [
    "employee@example.com",
    {
      id: "1",
      email: "employee@example.com",
      password: "password123",
      role: "employee",
      name: "John Doe",
    },
  ],
  [
    "moderator@example.com",
    {
      id: "2",
      email: "moderator@example.com",
      password: "password123",
      role: "moderator",
      name: "Jane Smith",
    },
  ],
  [
    "admin@example.com",
    {
      id: "3",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
      name: "Admin User",
    },
  ],
])

let grievanceIdCounter = mockGrievances.length + 1

function generatePseudonym(): string {
  return `Anon-${Math.floor(1000 + Math.random() * 9000)}`
}

export class MockAPIService {
  private static delay(ms = 300) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Auth endpoints
  static async login(req: LoginRequest): Promise<AuthResponse> {
    await this.delay()

    const user = mockUsers.get(req.email)
    if (!user || user.password !== req.password) {
      throw new Error("Invalid credentials")
    }

    const { password, ...userWithoutPassword } = user
    const token = generateMockJWT(userWithoutPassword)

    return {
      token,
      user: userWithoutPassword,
    }
  }

  static async signup(req: SignupRequest): Promise<AuthResponse> {
    await this.delay()

    if (mockUsers.has(req.email)) {
      throw new Error("User already exists")
    }

    const newUser: User & { password: string } = {
      id: String(mockUsers.size + 1),
      email: req.email,
      password: req.password,
      role: "employee",
      name: req.name,
    }

    mockUsers.set(req.email, newUser)

    const { password, ...userWithoutPassword } = newUser
    const token = generateMockJWT(userWithoutPassword)

    return {
      token,
      user: userWithoutPassword,
    }
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
    await this.delay()

    let filtered = [...mockGrievances]

    // Apply filters
    if (params?.status) {
      filtered = filtered.filter((g) => g.status === params.status)
    }
    if (params?.category) {
      filtered = filtered.filter((g) => g.category === params.category)
    }
    if (params?.q) {
      const query = params.q.toLowerCase()
      filtered = filtered.filter((g) => g.title.toLowerCase().includes(query) || g.body.toLowerCase().includes(query))
    }

    // Sort
    const sort = params?.sort || "new"
    if (sort === "new") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sort === "top") {
      filtered.sort((a, b) => b.score - a.score)
    } else if (sort === "rising") {
      filtered.sort((a, b) => {
        const aRecent = new Date(a.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
        const bRecent = new Date(b.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
        if (aRecent && !bRecent) return -1
        if (!aRecent && bRecent) return 1
        return b.score - a.score
      })
    }

    // Paginate
    const page = params?.page || 1
    const pageSize = params?.pageSize || 20
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const items = filtered.slice(start, end)

    return {
      items,
      pagination: {
        page,
        pageSize,
        nextPage: end < filtered.length ? page + 1 : null,
        total: filtered.length,
      },
    }
  }

  static async getGrievance(id: string): Promise<{ grievance: Grievance }> {
    await this.delay()
    const grievance = mockGrievances.find((g) => g.id === id)
    if (!grievance) throw new Error("Grievance not found")
    return { grievance }
  }

  static async createGrievance(req: CreateGrievanceRequest): Promise<{ grievance: Grievance }> {
    await this.delay(500)

    const newGrievance: Grievance = {
      id: String(grievanceIdCounter++),
      pseudonym: generatePseudonym(),
      title: req.title,
      body: req.body,
      category: req.category || "Uncategorized",
      tags: [],
      severity: 3,
      status: "open",
      score: 0,
      up: 0,
      down: 0,
      reactions: {},
      approvedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockGrievances.unshift(newGrievance)
    return { grievance: newGrievance }
  }

  static async vote(id: string, value: 1 | -1): Promise<{ up: number; down: number; score: number }> {
    await this.delay(200)
    const grievance = mockGrievances.find((g) => g.id === id)
    if (!grievance) throw new Error("Grievance not found")

    if (value === 1) {
      grievance.up++
    } else {
      grievance.down++
    }
    grievance.score = grievance.up - grievance.down

    return {
      up: grievance.up,
      down: grievance.down,
      score: grievance.score,
    }
  }

  static async react(id: string, emoji: string): Promise<{ reactions: Record<string, number> }> {
    await this.delay(200)
    const grievance = mockGrievances.find((g) => g.id === id)
    if (!grievance) throw new Error("Grievance not found")

    grievance.reactions[emoji] = (grievance.reactions[emoji] || 0) + 1

    return { reactions: grievance.reactions }
  }

  static async getThread(id: string): Promise<{ timeline: ThreadEvent[] }> {
    await this.delay()

    const mockTimeline: ThreadEvent[] = [
      {
        id: "1",
        type: "system",
        body: "Grievance submitted for review",
        actor: "system",
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "2",
        type: "status",
        body: "Approved and assigned to facilities team",
        statusTo: "in_progress",
        actor: "moderator",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "3",
        type: "comment",
        body: "We are investigating this issue with IT",
        actor: "moderator",
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
    ]

    return { timeline: mockTimeline }
  }

  static async addComment(id: string, body: string): Promise<{ event: ThreadEvent }> {
    await this.delay()

    const event: ThreadEvent = {
      id: String(Date.now()),
      type: "comment",
      body,
      actor: "moderator",
      createdAt: new Date().toISOString(),
    }

    return { event }
  }

  static async updateStatus(id: string, status: string): Promise<{ grievance: Grievance }> {
    await this.delay()
    const grievance = mockGrievances.find((g) => g.id === id)
    if (!grievance) throw new Error("Grievance not found")

    grievance.status = status as any
    grievance.updatedAt = new Date().toISOString()

    return { grievance }
  }

  // AI Assist
  static async assist(text: string): Promise<AssistResponse> {
    await this.delay(800)

    const categories = CATEGORIES.map((c) => c.value)
    const matchedCategory = categories.find((cat) => text.toLowerCase().includes(cat.toLowerCase())) || "Uncategorized"

    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g
    const emails = text.match(emailRegex) || []
    const phones = text.match(phoneRegex) || []

    const redactions: Array<{ start: number; end: number; type: string }> = []
    let safeText = text

    emails.forEach((email) => {
      const index = safeText.indexOf(email)
      redactions.push({ start: index, end: index + email.length, type: "email" })
      safeText = safeText.replace(email, "[REDACTED-EMAIL]")
    })

    phones.forEach((phone) => {
      const index = safeText.indexOf(phone)
      redactions.push({ start: index, end: index + phone.length, type: "phone" })
      safeText = safeText.replace(phone, "[REDACTED-PHONE]")
    })

    const severity = text.length > 200 ? 4 : text.length > 100 ? 3 : 2

    return {
      rewrite: {
        title_suggested: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
        body_suggested: safeText,
        changes: redactions.length > 0 ? ["Removed PII"] : [],
        confidence: 0.85,
        rationale: "Improved clarity and removed potential PII",
      },
      pii: {
        safe_text: safeText,
        redactions,
        confidence: 0.9,
        block: false,
        message: redactions.length > 0 ? "We found potential PII. Consider applying redactions." : null,
      },
      categorize: {
        category: matchedCategory,
        tags: [matchedCategory.toLowerCase().replace(/\s+/g, "_")],
        confidence: 0.8,
      },
      severity: {
        severity: severity as any,
        confidence: 0.75,
        rationale: `Based on content length and urgency indicators`,
      },
      similar: [],
    }
  }

  // Moderation
  static async getModerationQueue(filter?: string): Promise<GrievanceListResponse> {
    await this.delay()

    let filtered = mockGrievances.filter((g) => !g.approvedAt || g.status === "open")

    if (filter === "new") {
      filtered = filtered.filter((g) => !g.approvedAt)
    } else if (filter === "needs_info") {
      filtered = filtered.filter((g) => g.status === "needs_info")
    }

    return {
      items: filtered,
      pagination: {
        page: 1,
        pageSize: 20,
        nextPage: null,
        total: filtered.length,
      },
    }
  }

  static async approve(id: string): Promise<{ grievance: Grievance; routedDestinations: any[] }> {
    await this.delay()
    const grievance = mockGrievances.find((g) => g.id === id)
    if (!grievance) throw new Error("Grievance not found")

    grievance.approvedAt = new Date().toISOString()
    grievance.status = "in_progress"

    return {
      grievance,
      routedDestinations: [],
    }
  }

  // Routing
  static async simulateRouting(data: any): Promise<RoutingDecision> {
    await this.delay()

    return {
      destinations: [
        {
          key: "facilities",
          connector: "slack",
          target: "#facilities-team",
          name: "Facilities Team",
        },
      ],
      matchedRules: [
        {
          ruleId: "1",
          name: "Route facilities issues",
          priority: 100,
          matched: ["category_in"],
        },
      ],
      categoryUsed: data.category || "Uncategorized",
      categoryConfidence: 0.85,
      severityUsed: data.severity || 3,
      severityConfidence: 0.8,
      confidence: 0.82,
      needsReview: false,
    }
  }

  static async listRoutingRules(): Promise<{ items: RoutingRule[] }> {
    await this.delay()

    const mockRules: RoutingRule[] = [
      {
        id: "1",
        name: "Route facilities issues",
        priority: 100,
        enabled: true,
        when: {
          any: [{ type: "category_in", anyOfValues: ["Facilities & IT"] }],
        },
        then: {
          destinations: [
            {
              key: "facilities",
              connector: "slack",
              target: "#facilities-team",
              name: "Facilities Team",
            },
          ],
          stopProcessing: false,
        },
        notes: "All facilities-related issues go to Slack",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    return { items: mockRules }
  }

  static async createRoutingRule(req: RoutingRuleUpsertRequest): Promise<RoutingRule> {
    await this.delay()

    const newRule: RoutingRule = {
      id: String(Date.now()),
      ...req,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return newRule
  }

  static async updateRoutingRule(id: string, req: RoutingRuleUpsertRequest): Promise<RoutingRule> {
    await this.delay()

    return {
      id,
      ...req,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  static async deleteRoutingRule(id: string): Promise<void> {
    await this.delay()
  }

  static async getRoutingLogs(): Promise<{ items: RouteLog[] }> {
    await this.delay()
    return { items: [] }
  }

  // Blind DM
  static async startBlindDM(grievanceId: string): Promise<{ threadId: string }> {
    await this.delay()
    return { threadId: `thread-${grievanceId}` }
  }

  static async sendBlindDM(threadId: string, body: string, to: string): Promise<{ ok: boolean }> {
    await this.delay()
    return { ok: true }
  }

  static async merge(id: string, intoId: string): Promise<{ canonicalId: string }> {
    await this.delay()
    return { canonicalId: intoId }
  }

  static async hide(id: string, reason?: string): Promise<void> {
    await this.delay()
  }
}
