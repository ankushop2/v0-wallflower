import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"

const assistSchema = z.object({
  rewrite: z.object({
    suggestion: z.object({
      title: z.string().describe("Improved, concise title"),
      body: z.string().describe("Improved description with better clarity"),
    }),
    changes: z.array(z.string()).describe("List of improvements made"),
    rationale: z.string().describe("Why these changes improve the grievance"),
  }),
  categorize: z.object({
    suggestion: z.object({
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
    }),
    confidence: z.number().min(0).max(1).describe("Confidence in categorization"),
  }),
  severity: z.object({
    suggestion: z.object({
      level: z.enum(["low", "medium", "high", "critical"]).describe("Impact severity level"),
    }),
    confidence: z.number().min(0).max(1).describe("Confidence in severity assessment"),
    rationale: z.string().describe("Why this severity level was chosen"),
  }),
  pii: z.object({
    suggestion: z.object({
      redactions: z
        .array(
          z.object({
            type: z.string().describe("Type of PII found (name, email, phone, etc)"),
            text: z.string().describe("The actual PII text found"),
          }),
        )
        .describe("List of PII items found"),
    }),
    safe_text: z.string().describe("Text with PII removed/redacted"),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const { object } = await generateObject({
      model: "anthropic/claude-sonnet-4.5",
      schema: assistSchema,
      messages: [
        {
          role: "system",
          content: `You are an AI assistant helping employees submit workplace grievances. 
          
Your tasks:
1. Rewrite: Improve the title and description for clarity and professionalism while keeping the original meaning
2. Categorize: Classify into the most appropriate category
3. Severity: Assess the impact level based on how it affects work/wellbeing
4. PII Detection: Find any personally identifiable information (names, emails, phone numbers, employee IDs, specific dates with people)

Important:
- Keep the employee's voice and concerns intact
- Make text more objective and less emotional
- Remove any identifying information
- Be concise but complete`,
        },
        {
          role: "user",
          content: `Analyze this workplace grievance:\n\n${text}`,
        },
      ],
    })

    return NextResponse.json(object)
  } catch (error: any) {
    console.error("[v0] Error in assist API:", error)
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 })
  }
}
