# Authentication Setup Guide

## Overview

WallFlower uses JWT Bearer token authentication with role-based access control (RBAC).

## Roles

- **employee**: Can view and create grievances, vote, and react
- **moderator**: Employee permissions + moderation queue access
- **owner**: Moderator permissions + routing configuration
- **admin**: Full system access

## Mock Mode (Development)

When `NEXT_PUBLIC_MOCK_API=true`, the system uses mock JWT generation and predefined test accounts.

### Test Accounts

\`\`\`
Email: employee@example.com
Password: password123
Role: employee

Email: moderator@example.com
Password: password123
Role: moderator

Email: admin@example.com  
Password: password123
Role: admin
\`\`\`

### How It Works

1. Mock JWTs are generated client-side using base64 encoding
2. Tokens are stored in localStorage
3. Token expiration is set to 24 hours
4. No real cryptography (development only!)

## Production Mode

When `NEXT_PUBLIC_MOCK_API=false`:

1. Set `NEXT_PUBLIC_API_URL` to your backend API
2. Backend must implement:
   - `POST /api/auth/login` - Returns `{ token, user }`
   - `POST /api/auth/signup` - Returns `{ token, user }`
3. All API requests include `Authorization: Bearer <token>` header
4. Backend validates JWT and enforces RBAC

## Environment Variables

\`\`\`bash
# Development (Mock Mode)
NEXT_PUBLIC_MOCK_API=true

# Production (Real Backend)
NEXT_PUBLIC_MOCK_API=false
NEXT_PUBLIC_API_URL=https://api.yourcompany.com
\`\`\`

## Protected Routes

Navigation items are conditionally rendered based on user role:

- **Home**: All users
- **Moderation**: moderator, owner, admin only
- **Routing**: moderator, owner, admin only
- **Settings**: All authenticated users

## Usage in Components

\`\`\`tsx
import { useAuth } from '@/lib/auth/auth-context'

function MyComponent() {
  const { user, isAuthenticated, hasRole, logout } = useAuth()

  if (!isAuthenticated) {
    return <div>Please log in</div>
  }

  if (hasRole(['moderator', 'admin'])) {
    return <div>Moderation tools</div>
  }

  return <div>Hello {user.email}</div>
}
\`\`\`

## Security Notes

⚠️ **Mock mode is for development only!**

- Mock JWTs are NOT cryptographically secure
- Anyone can decode and forge mock tokens
- Never use mock mode in production
- Always use real JWT signing with proper secrets in production
