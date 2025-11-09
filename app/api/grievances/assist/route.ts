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
  console.log("[v0] Assist API called")

  try {
    let body
    try {
      body = await request.json()
      console.log("[v0] Request body:", body)
    } catch (parseError) {
      console.error("[v0] Failed to parse request body:", parseError)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const text = body.text || `${body.title || ""}\n\n${body.description || ""}`

    if (!text || text.trim().length === 0) {
      console.log("[v0] No text provided")
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    console.log("[v0] Analyzing grievance with AI...")
    console.log("[v0] Text to analyze:", text.substring(0, 100) + "...")
    console.log("[v0] Using model: anthropic/claude-sonnet-4.5")
    console.log("[v0] ANTHROPIC_API_KEY present:", !!process.env.ANTHROPIC_API_KEY)

    let result
    try {
      result = await generateObject({
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
7. Intelligently determine if moderator review is needed

Moderation Criteria - Flag needsModeration as TRUE only if ANY of these apply:
- Impact is "high" or "critical" severity
- Contains potentially defamatory statements or accusations against specific individuals
- Involves legal concerns (discrimination, harassment, safety violations)
- Contains threats or aggressive language
- Involves sensitive topics that could damage reputation
- Requires human judgment on severity or validity

Do NOT require moderation for:
- Low/medium severity routine issues (facilities smell, minor equipment problems, etc.)
- General feedback without specific accusations
- Simple requests or suggestions
- Minor inconveniences

Important:
- Keep the employee's voice and concerns intact
- Make text more objective and less emotional
- Remove any identifying information
- Be selective with moderation - only escalate when truly needed
- Provide specific reasoning when flagging for moderation`,
          },
          {
            role: "user",
            content: `Analyze this workplace grievance:\n\n${text}`,
          },
        ],
      })
    } catch (aiError: any) {
      console.error("[v0] AI generation failed:", aiError)
      console.error("[v0] AI error details:", {
        message: aiError.message,
        stack: aiError.stack,
        name: aiError.name,
        cause: aiError.cause,
      })
      return NextResponse.json(
        {
          error: "AI analysis failed",
          details: aiError.message || "Unknown error during AI processing",
        },
        { status: 500 },
      )
    }

    console.log("[v0] AI analysis complete")

    const object = result.object

    console.log("[v0] Returning response:", object)
    return NextResponse.json(object)
  } catch (error: any) {
    console.error("[v0] Unexpected error in assist API:", error)
    console.error("[v0] Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message || "Failed to process request",
      },
      { status: 500 },
    )
  }
}
