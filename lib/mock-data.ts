// Mock data for development and testing

import type { Grievance, ThreadEvent, BlindMessage, RoutingRule, TriageSuggestion } from "./types"

export const mockGrievances: Grievance[] = [
  {
    id: "1",
    pseudonym: "Anon-7321",
    title: "Meeting overload affecting productivity",
    body: "Our team has back-to-back meetings 4+ hours daily, leaving no deep work time. This has been happening for 3 months and productivity is down significantly.",
    category: "Time Management",
    tags: ["meetings", "productivity", "culture"],
    severity: 4,
    status: "open",
    impact: "high",
    frequency: "daily",
    score: 47,
    up: 52,
    down: 5,
    reactions: { "👍": 23, "😞": 12, "🔥": 8 },
    approvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    routedTo: ["Engineering", "Product"],
    subscribers: [],
  },
  {
    id: "2",
    pseudonym: "Anon-4892",
    title: "Outdated hardware slowing down development",
    body: "Still using 5-year-old laptops with 8GB RAM. Build times are 10+ minutes, testing is painful. Requested upgrades 6 months ago but nothing happened.",
    category: "Equipment",
    tags: ["hardware", "tools", "performance"],
    severity: 3,
    status: "in_progress",
    impact: "medium",
    frequency: "daily",
    score: 34,
    up: 38,
    down: 4,
    reactions: { "👍": 18, "💻": 9 },
    approvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    routedTo: ["IT", "Engineering"],
    subscribers: [],
  },
  {
    id: "3",
    pseudonym: "Anon-1156",
    title: "Unclear promotion criteria causing frustration",
    body: "No transparent path to promotion. Performance reviews are vague, no clear milestones. Multiple high performers left recently citing this issue.",
    category: "Career Development",
    tags: ["promotion", "career", "transparency"],
    severity: 5,
    status: "open",
    impact: "high",
    frequency: "weekly",
    suggestedFix: "Publish promotion rubrics and criteria publicly, conduct quarterly calibration sessions",
    score: 89,
    up: 94,
    down: 5,
    reactions: { "👍": 42, "😞": 21, "⭐": 15 },
    approvedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    routedTo: ["HR", "Leadership"],
    subscribers: [],
  },
]

export const mockThreadEvents: Record<string, ThreadEvent[]> = {
  "1": [
    {
      id: "e1",
      type: "approval",
      body: "Grievance approved and posted to the board",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      actor: "system",
    },
    {
      id: "e2",
      type: "comment",
      body: "Thank you for raising this. We're reviewing the meeting culture across teams. Can you share which team you're on so we can investigate specifics?",
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      actor: "moderator",
      actorName: "Moderator Team",
    },
  ],
  "2": [
    {
      id: "e3",
      type: "approval",
      body: "Grievance approved and posted to the board",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      actor: "system",
    },
    {
      id: "e4",
      type: "status",
      statusTo: "in_progress",
      body: "IT has acknowledged and is working on hardware refresh plan",
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      actor: "owner",
      actorName: "IT Team",
    },
    {
      id: "e5",
      type: "comment",
      body: "Hardware refresh budget approved. Will begin rolling out new laptops next quarter, starting with development team.",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      actor: "owner",
      actorName: "IT Team",
    },
  ],
}

export const mockBlindMessages: Record<string, BlindMessage[]> = {
  "1": [
    {
      id: "m1",
      from: "moderator",
      body: "Can you share more details about which teams this affects? This will help us route to the right stakeholders.",
      createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: "m2",
      from: "poster",
      body: "It's mainly the Product and Engineering teams. Cross-functional syncs are taking up most of the calendar.",
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      read: true,
    },
  ],
}

export const mockRoutingRules: RoutingRule[] = [
  {
    id: "r1",
    name: "High Severity to Leadership",
    conditions: {
      severityMin: 4,
    },
    destinations: ["Leadership", "HR"],
    enabled: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "r2",
    name: "Equipment Issues to IT",
    conditions: {
      categories: ["Equipment", "Tools"],
      keywords: ["hardware", "laptop", "software", "tools"],
    },
    destinations: ["IT", "Operations"],
    enabled: true,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "r3",
    name: "Career Development to HR",
    conditions: {
      categories: ["Career Development", "Compensation"],
      keywords: ["promotion", "salary", "career", "growth"],
    },
    destinations: ["HR", "Leadership"],
    enabled: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export function generateMockAICompose(): any {
  return {
    rewrite: {
      suggestion: {
        title: "Meeting overload reducing deep work time",
        body: "Our team schedules 4+ hours of back-to-back meetings daily, which leaves insufficient time for focused deep work. This pattern has persisted for three months and measurably reduced team productivity.",
        changes: ["More concise title", "Professional tone", "Removed emotional language"],
      },
      confidence: 0.85,
      rationale: "Rephrased for clarity and professional tone while maintaining core message",
    },
    pii: {
      suggestion: {
        safeText: "Our team has back-to-back meetings 4+ hours daily...",
        redactions: [],
      },
      confidence: 0.95,
      rationale: "No PII detected in the text",
    },
    categorize: {
      suggestion: {
        category: "Time Management",
        tags: ["meetings", "productivity", "work-life-balance"],
      },
      confidence: 0.92,
      rationale: "Content clearly relates to time management and meeting culture",
    },
    severity: {
      suggestion: {
        severity: 4,
      },
      confidence: 0.78,
      rationale: "High impact on team productivity with sustained duration suggests severity 4",
    },
  }
}

export function generateMockTriageSuggestion(id: string): TriageSuggestion {
  return {
    tldr: "Team experiencing excessive meeting load (4+ hrs/day) for 3 months, impacting productivity",
    whyTrending: "Resonating with many employees (52 upvotes); common pain point across teams",
    duplicates: [
      { id: "12", title: "Too many status meetings interrupting flow", similarity: 0.78 },
      { id: "34", title: "Calendar fragmentation preventing deep work", similarity: 0.65 },
    ],
    suggestedOwners: ["Engineering Leadership", "Product Leadership"],
    suggestedChannels: ["#eng-leadership", "#product-team"],
    askForInfoDraft:
      "Thank you for raising this. To help us address this effectively: 1) Which specific meeting types are most problematic? 2) Are there recurring meetings that could be async? 3) What time blocks would be most valuable for deep work?",
  }
}
