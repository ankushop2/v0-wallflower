// Core type definitions for WallFlower grievance platform

export type Status = "open" | "in_progress" | "needs_info" | "resolved" | "declined" | "archived"
export type Severity = 1 | 2 | 3 | 4 | 5
export type Impact = "low" | "medium" | "high"
export type Frequency = "once" | "weekly" | "daily"
export type ActorType = "poster" | "moderator" | "owner" | "system"
export type LeaderboardTab = "new" | "rising" | "top"
export type TimeframeFilter = "today" | "week" | "month"

export interface Grievance {
  id: string
  pseudonym: string
  title: string
  body: string
  category: string
  tags: string[]
  severity: Severity
  status: Status
  impact: Impact
  frequency: Frequency
  suggestedFix?: string
  score: number
  up: number
  down: number
  reactions: Record<string, number>
  approvedAt?: string
  createdAt: string
  updatedAt: string
  routedTo?: string[]
  subscribers?: string[]
}

export interface AgentSuggestion<T> {
  suggestion: T
  confidence: number
  rationale: string
}

export interface RewriteSuggestion {
  title: string
  body: string
  changes: string[]
}

export interface PiiSuggestion {
  safeText: string
  redactions: { start: number; end: number; type: string }[]
}

export interface CategorizeSuggestion {
  category: string
  tags: string[]
}

export interface SeveritySuggestion {
  severity: Severity
}

export interface ComposeAgentBundle {
  rewrite?: AgentSuggestion<RewriteSuggestion>
  pii?: AgentSuggestion<PiiSuggestion>
  categorize?: AgentSuggestion<CategorizeSuggestion>
  severity?: AgentSuggestion<SeveritySuggestion>
}

export interface ThreadEvent {
  id: string
  type: "status" | "comment" | "poster_reply" | "system" | "resolution" | "merge" | "approval"
  body?: string
  statusTo?: Status
  createdAt: string
  actor: ActorType
  actorName?: string
}

export interface BlindMessage {
  id: string
  from: ActorType
  body: string
  createdAt: string
  read: boolean
}

export interface RoutingRule {
  id: string
  name: string
  conditions: {
    categories?: string[]
    keywords?: string[]
    severityMin?: Severity
    severityMax?: Severity
    location?: string
  }
  destinations: string[]
  enabled: boolean
  createdAt: string
}

export interface TriageSuggestion {
  tldr: string
  whyTrending?: string
  duplicates?: Array<{ id: string; title: string; similarity: number }>
  suggestedOwners?: string[]
  suggestedChannels?: string[]
  askForInfoDraft?: string
}

export interface AnalyticsData {
  period: TimeframeFilter
  totalGrievances: number
  statusDistribution: Record<Status, number>
  topCategories: Array<{ category: string; count: number }>
  avgTimeToFirstResponse: number
  trend: Array<{ date: string; count: number }>
}
