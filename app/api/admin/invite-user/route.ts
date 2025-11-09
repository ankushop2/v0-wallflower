import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated and is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 })
    }

    // Get request data
    const { email, role, name } = await request.json()

    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 })
    }

    if (!["admin", "moderator"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Create user in auth.users using admin API
    // Note: This requires service role key, so we'll use the admin API
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-12), // Temporary password
      email_confirm: true,
      user_metadata: { name },
    })

    if (createError) {
      throw createError
    }

    // Create user profile
    const { error: profileError } = await supabase.from("users").insert({
      id: newUser.user.id,
      email,
      role,
      name,
    })

    if (profileError) {
      throw profileError
    }

    // Send password reset email so user can set their own password
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/reset-password`,
    })

    if (resetError) {
      console.error("Error sending password reset email:", resetError)
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.user.id,
        email,
        role,
        name,
      },
      message: "User invited successfully. Password reset email sent.",
    })
  } catch (error: any) {
    console.error("Error inviting user:", error)
    return NextResponse.json({ error: error.message || "Failed to invite user" }, { status: 500 })
  }
}
