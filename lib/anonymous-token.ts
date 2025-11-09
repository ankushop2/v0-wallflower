"use client"

// Generate and manage anonymous tokens for non-logged-in users
export function getAnonymousToken(): string {
  if (typeof window === "undefined") return ""

  const STORAGE_KEY = "wallflower_anon_token"
  let token = localStorage.getItem(STORAGE_KEY)

  if (!token) {
    // Generate a unique token
    token = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem(STORAGE_KEY, token)
  }

  return token
}

export function clearAnonymousToken() {
  if (typeof window === "undefined") return
  localStorage.removeItem("wallflower_anon_token")
}
