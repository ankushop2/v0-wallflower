import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("grievance_id", id)
      .order("created_at", { ascending: true })

    if (error) throw error

    return NextResponse.json({ events: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
