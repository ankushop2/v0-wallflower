import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"

const assistSchema = z.object({
  improvedTitle: z.string().describe("Improved, concise title"),
  improvedDescription: z.string().describe("Improved description with better clarity and PII removed"),
  category: z
    .enum([
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
    ])
    .describe("Most appropriate category"),
  impact: z.enum(["low", "medium", "high", "critical"]).describe("Impact severity level"),
  frequency: z.enum(["once", "occasional", "frequent", "constant"]).describe("How often this occurs"),
  hasPII: z.boolean().describe("Whether PII was detected"),
  piiWarning: z.string().optional().describe("Warning message about PII found"),
  similarExists: z.boolean().describe("Whether similar grievances might exist"),
  needsModeration: z.boolean().describe("Whether this needs moderator review before publishing"),
  moderationReason: z.string().optional().describe("Why moderation is needed"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const text = body.text || `${body.title}\n\n${body.description}`

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    console.log("[v0] Analyzing grievance with AI...")

    const { object } = await generateObject({
      model: "anthropic/claude-sonnet-4.5",
      schema: assistSchema,
      messages: [
        {
          role: "system",
          content: `You are an AI assistant helping employees submit workplace grievances.

Your tasks:
1. Improve the title and description for clarity and professionalism while keeping the original meaning
2. Categorize into the most appropriate category
3. Assess impact severity (low/medium/high/critical)
4. Determine frequency (once/occasional/frequent/constant)
5. Detect and remove PII (names, emails, phone numbers, employee IDs, addresses)
6. Check if similar grievances might exist based on the topic
7. Determine if moderator review is needed (offensive language, legal threats, serious accusations, violence)

Important:
- Keep the employee's voice and concerns intact
- Make text more objective and less emotional
- Remove any identifying information
- Flag for moderation if content contains: offensive language, threats, serious accusations, legal issues, violence, or unclear intent`,
        },
        {
          role: "user",
          content: `Analyze this workplace grievance:\n\n${text}`,
        },
      ],
    })

    console.log("[v0] AI analysis complete:", object)

    return NextResponse.json(object)
  } catch (error: any) {
    console.error("[v0] Error in assist API:", error)
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 })
  }
}
