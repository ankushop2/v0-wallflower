# WallFlower API Setup Guide

## Overview

WallFlower uses a flexible API architecture that supports both **mock mode** (for development) and **real backend** (for production). The system includes full JWT authentication with role-based access control.

## Environment Variables

### Required for Development (Mock Mode)

\`\`\`bash
# Enable mock API (default: false)
NEXT_PUBLIC_MOCK_API=true

# Optional: Real backend URL (only needed when mock mode is disabled)
NEXT_PUBLIC_API_URL=https://your-api.example.com
\`\`\`

### Authentication

The app includes built-in JWT mock generation for development. No additional auth configuration needed in mock mode.

## Mock Mode Features

### Pre-configured Test Users

When `NEXT_PUBLIC_MOCK_API=true`, you can sign in with these accounts:

| Email | Password | Role | Access |
|-------|----------|------|--------|
| `employee@example.com` | `password123` | Employee | View & post grievances |
| `moderator@example.com` | `password123` | Moderator | + Moderation queue, routing |
| `admin@example.com` | `password123` | Admin | + Full access, routing rules |

### Mock Data

The mock service includes:
- 2 sample grievances with votes, reactions, and timelines
- Full AI assist capabilities (PII detection, categorization, similarity matching)
- Routing rules simulation
- Blind DM system
- Moderation queue

## API Endpoints

### Authentication

#### `POST /api/auth/login`
\`\`\`typescript
Request: { email: string; password: string }
Response: { token: string; user: User }
\`\`\`

#### `POST /api/auth/signup`
\`\`\`typescript
Request: { email: string; password: string; name?: string }
Response: { token: string; user: User }
\`\`\`

### Grievances

#### `GET /api/grievances`
List grievances with filtering and sorting
\`\`\`typescript
Query params:
  - sort: "new" | "rising" | "top"
  - period: "today" | "week" | "month"
  - status: Status
  - category: string
  - q: string (search)
  - page: number
  - pageSize: number

Response: GrievanceListResponse
\`\`\`

#### `POST /api/grievances`
Create anonymous grievance
\`\`\`typescript
Request: CreateGrievanceRequest
Response: { grievance: Grievance }
\`\`\`

#### `GET /api/grievances/{id}`
Get single grievance

#### `POST /api/grievances/{id}/vote`
Vote up/down
\`\`\`typescript
Request: { value: 1 | -1 }
Response: { up: number; down: number; score: number }
\`\`\`

#### `POST /api/grievances/{id}/react`
Add emoji reaction
\`\`\`typescript
Request: { emoji: string }
Response: { reactions: Record<string, number> }
\`\`\`

### AI Assist

#### `POST /api/grievances/assist`
Get comprehensive AI assistance
\`\`\`typescript
Request: { text: string }
Response: AssistResponse {
  rewrite?: { title_suggested, body_suggested, changes, confidence, rationale }
  pii?: { safe_text, redactions, confidence, block, message }
  categorize?: { category, tags, confidence }
  severity?: { severity, confidence, rationale }
  similar?: SimilarItem[]
}
\`\`\`

### Thread Management

#### `GET /api/grievances/{id}/thread`
Get timeline events

#### `POST /api/grievances/{id}/comment`
Add comment

#### `PUT /api/grievances/{id}/status`
Update status (moderator+ only)

### Moderation (Moderator/Owner/Admin only)

#### `GET /api/moderation/queue`
Get moderation queue
\`\`\`typescript
Query params:
  - filter: "new" | "ai_flagged" | "needs_info" | "escalated"

Response: GrievanceListResponse
\`\`\`

#### `POST /api/moderation/{id}/approve`
Approve and route grievance

### Routing Rules (Moderator/Owner/Admin only)

#### `GET /api/routing/rules`
List all routing rules

#### `POST /api/routing/rules`
Create routing rule

#### `PUT /api/routing/rules/{id}`
Update routing rule

#### `DELETE /api/routing/rules/{id}`
Delete routing rule

#### `POST /api/routing/simulate`
Simulate routing decision
\`\`\`typescript
Request: {
  text: string
  category?: string
  severity?: Severity
  orgUnit?: string
  location?: string
}
Response: RoutingDecision
\`\`\`

#### `GET /api/routing/logs`
Get routing logs

### Blind DMs

#### `POST /api/blind-dm/{grievanceId}/start`
Start blind DM thread (moderator+ only)

#### `POST /api/blind-dm/{threadId}/send`
Send blind DM message

### Admin Actions

#### `POST /api/grievances/{id}/merge`
Merge grievance into another (moderator+ only)

#### `POST /api/grievances/{id}/hide`
Hide grievance (moderator+ only)

## Role-Based Access Control

### Employee
- View all approved grievances
- Post anonymous grievances
- Vote and react
- Comment on threads
- Reply via blind DM (if moderator initiates)

### Moderator
- All employee permissions
- Access moderation queue
- Approve/decline grievances
- Update grievance status
- Start blind DM conversations
- View routing rules
- Simulate routing

### Owner/Admin
- All moderator permissions
- Create/edit/delete routing rules
- Hide grievances
- Merge grievances
- View routing logs

## JWT Authentication

### Token Structure

Mock JWTs contain:
\`\`\`json
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": "employee|moderator|owner|admin",
  "name": "User Name",
  "iat": 1234567890,
  "exp": 1234654290
}
\`\`\`

### Token Storage

- Stored in `localStorage` as `auth_token`
- Automatically included in API requests via `Authorization: Bearer {token}` header
- Expires after 24 hours

### Switching to Real Backend

1. Set up your backend API matching the OpenAPI spec
2. Update environment variables:
   \`\`\`bash
   NEXT_PUBLIC_MOCK_API=false
   NEXT_PUBLIC_API_URL=https://your-api.example.com
   \`\`\`
3. Ensure your backend returns JWTs with the same payload structure
4. All API calls will automatically route to the real backend

## Error Handling

All API calls throw errors with descriptive messages:
\`\`\`typescript
try {
  const result = await APIClient.login({ email, password })
} catch (error) {
  // error.message contains user-friendly error description
  console.error(error.message)
}
\`\`\`

## Type Safety

All API requests and responses are fully typed using TypeScript interfaces matching the OpenAPI spec. See `lib/api/types.ts` for complete type definitions.

## Next Steps

1. **Development**: Use mock mode with pre-configured test users
2. **Backend Integration**: Implement backend API following the OpenAPI spec in `user_read_only_context/text_attachments/pasted-text-xN8Ax.txt`
3. **Production**: Switch to real backend by updating environment variables
