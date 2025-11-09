import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: currentUser } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ users: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: currentUser } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (currentUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, role } = body

    // Create auth user using admin API
    const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role },
    })

    if (authError) throw authError

    return NextResponse.json({ user: newUser.user }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
