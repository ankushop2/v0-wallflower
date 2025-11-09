import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("webhook_integrations")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ integrations: data || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, category, webhook_url } = body

    // Validate inputs
    if (!name || !category || !webhook_url) {
      return NextResponse.json(
        { error: "Name, category and webhook URL are required" },
        { status: 400 }
      )
    }

    // Validate webhook URL format
    if (!webhook_url.startsWith("http://") && !webhook_url.startsWith("https://")) {
      return NextResponse.json(
        { error: "Invalid webhook URL" },
        { status: 400 }
      )
    }

    // Create the integration
    const { data, error } = await supabase
      .from("webhook_integrations")
      .insert({
        name: name.trim(),
        category,
        webhook_url,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ integration: data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Integration ID is required" },
        { status: 400 }
      )
    }

    // Delete the integration (RLS will ensure user can only delete their own)
    const { error } = await supabase
      .from("webhook_integrations")
      .delete()
      .eq("id", id)
      .eq("created_by", user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

