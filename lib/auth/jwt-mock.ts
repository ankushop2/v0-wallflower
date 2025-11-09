// Mock JWT generation for development
import type { Role, User } from "@/lib/api/types"

// Simple base64 encoding for mock JWTs
function base64Encode(str: string): string {
  if (typeof window !== "undefined") {
    return btoa(str)
  }
  return Buffer.from(str).toString("base64")
}

function base64Decode(str: string): string {
  if (typeof window !== "undefined") {
    return atob(str)
  }
  return Buffer.from(str, "base64").toString()
}

export interface JWTPayload {
  sub: string // user id
  email: string
  role: Role
  name?: string
  iat: number
  exp: number
}

export function generateMockJWT(user: User): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  }

  const payload: JWTPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
  }

  const headerEncoded = base64Encode(JSON.stringify(header))
  const payloadEncoded = base64Encode(JSON.stringify(payload))

  // Mock signature (not cryptographically secure, for development only)
  const signature = base64Encode("mock-signature")

  return `${headerEncoded}.${payloadEncoded}.${signature}`
}

export function decodeMockJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const payload = JSON.parse(base64Decode(parts[1]))

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export function validateMockJWT(token: string): boolean {
  const payload = decodeMockJWT(token)
  return payload !== null
}
