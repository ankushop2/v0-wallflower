import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { generateObject } from "ai"
import { z } from "zod"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log("[v0] Triage analysis requested")
    const { id } = await params
    console.log("[v0] Grievance ID:", id)

    const supabase = await createServerClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("[v0] User authenticated:", !!user)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is moderator
    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle()

    console.log("[v0] User role:", userData?.role)

    // if (userData?.role !== "moderator") {
    //   return NextResponse.json({ error: "Forbidden - Moderators only" }, { status: 403 })
    // }

    // Fetch the grievance
    const { data: grievance, error: grievanceError } = await supabase
      .from("grievances")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    console.log("[v0] Grievance found:", !!grievance)

    if (grievanceError || !grievance) {
      console.error("[v0] Grievance error:", grievanceError)
      return NextResponse.json({ error: "Grievance not found" }, { status: 404 })
    }

    // Find similar grievances based on category and keywords
    const { data: similarGrievances } = await supabase
      .from("grievances")
      .select("id, title, body, category")
      .eq("category", grievance.category)
      .neq("id", id)
      .limit(20)

    console.log("[v0] Similar grievances found:", similarGrievances?.length || 0)

    console.log("[v0] Starting AI analysis...")

    const { object: triageSuggestion } = await generateObject({
      model: "anthropic/claude-sonnet-4.5",
      schema: z.object({
        tldr: z.string().describe("A brief 1-2 sentence summary of the grievance"),
        similarIssuesCount: z.number().describe("Estimated number of similar issues based on patterns"),
        whyTrending: z.string().optional().describe("If this issue is getting attention, explain why it matters"),
        duplicates: z
          .array(
            z.object({
              id: z.string(),
              title: z.string(),
              similarity: z.number().min(0).max(1),
            }),
          )
          .describe("List of potential duplicate grievances with similarity scores"),
        suggestedOwners: z
          .array(z.string())
          .optional()
          .describe("Suggested team/person who should own this based on category"),
        suggestedChannels: z.array(z.string()).optional().describe("Suggested communication channels for updates"),
        askForInfoDraft: z
          .string()
          .optional()
          .describe("Draft message to ask the poster for more information if needed"),
        suggestedActions: z.array(z.string()).describe("Recommended next steps for the moderator to take"),
        estimatedResolutionTime: z
          .string()
          .optional()
          .describe("Estimated time to resolve based on category and severity"),
      }),
      messages: [
        {
          role: "system",
          content: `You are a triage copilot for WallFlower, an anonymous workplace grievance platform. 
          Analyze grievances and provide actionable insights for moderators.
          
          Consider:
          - Severity and urgency of the issue
          - How many other users might be affected
          - Whether this is part of a larger pattern
          - What information is missing
          - Who should handle this
          - Estimated resolution complexity`,
        },
        {
          role: "user",
          content: `Analyze this grievance for triage:

Title: ${grievance.title}
Body: ${grievance.body}
Category: ${grievance.category}
Severity: ${grievance.severity}
Impact: ${grievance.impact}
Frequency: ${grievance.frequency}

Similar grievances found in the same category:
${similarGrievances?.map((g) => `- ${g.title}: ${g.body.substring(0, 200)}`).join("\n") || "None found"}

Provide triage analysis including:
1. A concise summary
2. Estimate how many users might have similar issues based on the description
3. Find potential duplicates from the list above (be strict - only mark as duplicates if very similar)
4. Suggest who should own this
5. Provide a draft message if more info is needed
6. Recommend next steps
7. Estimate resolution time`,
        },
      ],
    })

    console.log("[v0] AI analysis complete")

    return NextResponse.json({
      success: true,
      suggestion: triageSuggestion,
    })
  } catch (error) {
    console.error("[v0] Error generating triage suggestion:", error)
    return NextResponse.json(
      {
        error: "Failed to generate triage suggestion",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
