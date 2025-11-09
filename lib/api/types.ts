// Type definitions matching the OpenAPI spec

export type Role = "employee" | "moderator" | "owner" | "admin"

export type Status = "open" | "in_progress" | "needs_info" | "resolved" | "declined" | "archived"

export type Severity = 1 | 2 | 3 | 4 | 5

export interface Grievance {
  id: string
  pseudonym: string
  title: string
  body: string
  category: string
  tags?: string[]
  severity: Severity
  status: Status
  score: number
  up: number
  down: number
  reactions: Record<string, number>
  approvedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ThreadEvent {
  id: string
  type: "status" | "comment" | "poster_reply" | "system" | "resolution"
  body?: string | null
  statusTo?: Status
  actor: "poster" | "moderator" | "owner" | "admin" | "system"
  createdAt: string
}

export interface Pagination {
  page: number
  pageSize: number
  nextPage: number | null
  total: number
}

export interface GrievanceListResponse {
  items: Grievance[]
  pagination: Pagination
}

export interface CreateGrievanceRequest {
  title: string
  body: string
  category?: string | null
  impact?: "low" | "medium" | "high" | null
  frequency?: "once" | "weekly" | "daily" | null
  agentAccepts?: {
    rewrite?: boolean
    pii?: boolean
    categorize?: boolean
    severity?: boolean
  }
}

export interface VoteRequest {
  value: 1 | -1
}

export interface ReactRequest {
  emoji: string
}

export interface StatusRequest {
  status: Status
}

export interface CommentRequest {
  body: string
}

export interface HideRequest {
  reason?: string
}

export interface MergeRequest {
  intoId: string
}

export interface TextOnlyRequest {
  text: string
}

export interface CategorizeResponse {
  category: string
  tags?: string[]
  confidence: number
}

export interface SimilarItem {
  id: string
  title: string
  snippet?: string | null
  category: string
  status: Status
  score?: number | null
  similarity: number
  createdAt: string
}

export interface AssistResponse {
  rewrite?: {
    title_suggested: string
    body_suggested: string
    changes: string[]
    confidence: number
    rationale: string
  }
  pii?: {
    safe_text: string
    redactions: Array<{
      start: number
      end: number
      type: string
    }>
    confidence: number
    block: boolean
    message?: string | null
  }
  categorize?: CategorizeResponse
  severity?: {
    severity: Severity
    confidence: number
    rationale: string
  }
  similar?: SimilarItem[]
}

export interface Destination {
  key: string
  connector: "internal_web" | "slack" | "teams"
  target?: string | null
  name: string
}

export type RoutingCondition =
  | { type: "category_in"; anyOfValues: string[] }
  | { type: "severity_gte"; value: Severity }
  | { type: "keywords_any"; values: string[] }
  | { type: "text_regex"; pattern: string; flags?: string }
  | { type: "tags_any"; values: string[] }
  | { type: "orgunit_in"; anyOfValues: string[] }
  | { type: "location_in"; anyOfValues: string[] }

export interface ConditionGroup {
  all?: Array<RoutingCondition | ConditionGroup>
  any?: Array<RoutingCondition | ConditionGroup>
}

export interface RoutingRule {
  id: string
  name: string
  priority: number
  enabled: boolean
  when: ConditionGroup
  then: {
    destinations: Destination[]
    stopProcessing?: boolean
  }
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface RoutingRuleUpsertRequest {
  name: string
  priority: number
  enabled: boolean
  when: ConditionGroup
  then: {
    destinations: Destination[]
    stopProcessing?: boolean
  }
  notes?: string | null
}

export interface RoutingDecision {
  destinations: Destination[]
  matchedRules: Array<{
    ruleId: string
    name: string
    priority: number
    matched: string[]
  }>
  categoryUsed: string
  categoryConfidence: number
  severityUsed: Severity
  severityConfidence: number
  confidence: number
  needsReview: boolean
}

export interface RouteLog {
  id: string
  grievanceId?: string | null
  at: string
  input: {
    snippet: string
    category?: string | null
    severity: Severity
  }
  decision: RoutingDecision
  actor: string
  connectorPosts: Array<{
    destination: Destination
    status: "posted" | "failed" | "skipped"
    externalRefPresent: boolean
  }>
}

// Auth types
export interface User {
  id: string
  email: string
  role: Role
  name?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  name?: string
}
