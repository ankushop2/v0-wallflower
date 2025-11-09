// Auto-categorization logic

import { CATEGORIES } from "./categories"

interface CategoryMatch {
  category: string
  confidence: number
  keywords: string[]
}

// Keyword mappings for each category
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Time Management": [
    "meeting",
    "overtime",
    "schedule",
    "deadline",
    "work-life",
    "hours",
    "calendar",
    "time",
    "crunch",
  ],
  Equipment: ["laptop", "hardware", "software", "tools", "computer", "device", "upgrade", "outdated", "broken"],
  "Career Development": [
    "promotion",
    "career",
    "growth",
    "advancement",
    "development",
    "training",
    "learning",
    "skill",
  ],
  Compensation: ["salary", "pay", "bonus", "equity", "compensation", "raise", "wage", "benefit"],
  Communication: ["communication", "feedback", "transparency", "information", "update", "notification", "clarity"],
  Process: ["process", "workflow", "procedure", "inefficient", "bureaucracy", "approval", "documentation"],
  Culture: ["culture", "environment", "atmosphere", "morale", "team", "respect", "inclusion", "values"],
  Safety: ["safety", "harassment", "discrimination", "threat", "unsafe", "hostile", "bullying", "health"],
  "Remote Work": ["remote", "hybrid", "office", "wfh", "location", "commute", "flexible", "workspace"],
  Other: [],
}

export function autoCategorize(title: string, body: string): CategoryMatch {
  const text = `${title} ${body}`.toLowerCase()
  const words = text.split(/\s+/)

  const scores: Record<string, { count: number; keywords: string[] }> = {}

  // Initialize all categories
  for (const category of CATEGORIES) {
    scores[category] = { count: 0, keywords: [] }
  }

  // Count keyword matches for each category
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        scores[category].count++
        scores[category].keywords.push(keyword)
      }
    }
  }

  // Find category with highest score
  let bestCategory = "Other"
  let bestScore = 0
  let matchedKeywords: string[] = []

  for (const [category, { count, keywords }] of Object.entries(scores)) {
    if (count > bestScore) {
      bestScore = count
      bestCategory = category
      matchedKeywords = keywords
    }
  }

  // Calculate confidence based on number of matches
  const confidence = Math.min(0.95, 0.5 + bestScore * 0.1)

  return {
    category: bestCategory,
    confidence,
    keywords: matchedKeywords,
  }
}
