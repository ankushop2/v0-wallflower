// Predefined categories and tags for grievances

export const categories = [
  "facilities",
  "compensation",
  "management",
  "safety",
  "workload",
  "discrimination",
  "communication",
  "benefits",
  "equipment",
  "other",
] as const

export const CATEGORIES = categories

export const commonTags = [
  "meetings",
  "productivity",
  "hardware",
  "software",
  "promotion",
  "salary",
  "benefits",
  "culture",
  "communication",
  "remote",
  "office",
  "process",
  "tools",
  "training",
  "management",
  "team",
  "workload",
  "deadline",
  "feedback",
]

export const severityDescriptions: Record<number, { label: string; description: string }> = {
  1: { label: "Minor", description: "Minor inconvenience, low impact" },
  2: { label: "Low", description: "Noticeable but manageable impact" },
  3: { label: "Medium", description: "Moderate impact on work or morale" },
  4: { label: "High", description: "Significant impact, needs attention" },
  5: { label: "Critical", description: "Severe impact, urgent action required" },
}

export const statusDescriptions: Record<string, { label: string; color: string }> = {
  open: { label: "Open", color: "blue" },
  in_progress: { label: "In Progress", color: "yellow" },
  needs_info: { label: "Needs Info", color: "purple" },
  resolved: { label: "Resolved", color: "green" },
  declined: { label: "Declined", color: "red" },
  archived: { label: "Archived", color: "gray" },
}
