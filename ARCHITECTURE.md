# WallFlower Architecture

## Overview
WallFlower is an anonymous workplace grievance platform built with Next.js 16, React 19, and TypeScript. The platform enables employees to anonymously submit workplace concerns while maintaining transparency through status tracking and public resolution threads.

## Core Principles
1. **Anonymous by Default**: All submissions use pseudonyms; identities never exposed
2. **Human-in-the-Loop**: AI assists but humans approve all actions
3. **Accessibility First**: WCAG 2.1 AA compliant throughout
4. **Privacy Focused**: PII detection and redaction built-in

## System Architecture

### Frontend (Next.js App Router)
- **Pages**: Home (leaderboards), New Post, Thread View, Moderation, Routing, Analytics
- **Components**: Modular, accessible components with keyboard navigation
- **State Management**: React Query for server state, optimistic updates
- **Real-time**: SSE client for live updates (votes, comments, status changes)

### Data Flow

#### Posting Flow
1. User fills compose form → AI suggestions generated
2. PII detection runs → User applies redactions
3. Submit → Pending moderation queue
4. Moderator approves → Posted with pseudonym
5. Routing rules apply → Assigned to teams

#### Thread Flow
1. User views thread → Timeline rendered
2. Votes/reactions → Optimistic update → Server sync
3. Status changes → Event logged → Real-time broadcast
4. Blind DM → Anonymized conversation

#### Moderation Flow
1. Items enter queue (New/Flagged/Needs Info/Escalated)
2. Triage copilot provides AI suggestions
3. Moderator reviews → Approve/Hide/Merge/Ask for Info
4. Bulk actions supported with confirmation

## Key Features

### AI Integration
- **Compose Coach**: Rewrite, PII detection, categorization, severity estimation
- **Triage Copilot**: Summary, trending analysis, duplicate detection, routing suggestions
- **Resolution Drafter**: AI-generated resolution drafts (not implemented yet)

### Scoring Algorithms
- **New**: Sort by approval timestamp (desc)
- **Rising**: Velocity score with exponential decay (48h half-life)
- **Top**: Wilson lower bound OR simple up-down (configurable)

### Routing System
- **Rule-based**: Category, keywords, severity, location conditions
- **Destinations**: Internal teams + optional chat connectors
- **Simulator**: Test rules with sample text

### Analytics
- Submission trends over time
- Category distribution
- Status breakdown
- Time-to-first-response metrics
- CSV export capability

## Data Contracts

See `lib/types.ts` for full TypeScript definitions:
- `Grievance`: Core grievance entity
- `ThreadEvent`: Timeline events (status, comments, system)
- `BlindMessage`: Anonymous DM messages
- `RoutingRule`: Auto-routing configuration
- `ComposeAgentBundle`: AI suggestions for compose
- `TriageSuggestion`: AI suggestions for moderation

## Security Considerations

### Anonymity Protection
- Pseudonyms generated server-side
- No user identifiers in frontend state
- Blind DM system prevents identity leaks
- Moderator/owner identities shown as roles only

### PII Protection
- Inline detection during compose
- Redaction suggestions before submit
- Preview warnings for sensitive data
- Server-side validation

### Access Control (Not Implemented - Design Only)
- Role-based permissions (Poster/Moderator/Owner/Admin)
- Queue access gated by role
- Routing config admin-only
- Analytics view role-based

## Real-time Updates

### SSE Connection
- Client connects to `/api/realtime?org={id}&thread={id}`
- Server broadcasts: vote updates, new comments, status changes, merges
- Automatic reconnection on disconnect

### Optimistic UI
- Votes immediately reflected in UI
- Server response reconciles state
- Rollback on error

## Accessibility Features

### Keyboard Navigation
- Tab order follows visual flow
- Enter/Space activate buttons
- Arrow keys navigate lists
- Escape closes modals/drawers

### Screen Reader Support
- ARIA labels on all interactive elements
- Status announcements for async actions
- Semantic HTML (main, header, nav, article)
- Skip links for navigation

### Visual Accessibility
- 44px minimum touch targets
- High contrast mode support
- prefers-reduced-motion respected
- Focus indicators on all interactive elements

## Internationalization (i18n)

### Structure
- English default
- Scaffold for multi-language support
- Locale detection (not implemented)
- Date/time formatting uses date-fns

## Future Enhancements
1. Real backend integration (currently mock data)
2. Chat connectors (Slack/Teams) for mirrored interactions
3. Resolution drafter AI agent
4. Advanced analytics (BI integration)
5. Email notifications
6. Mobile app (React Native)
7. Advanced search/filtering
8. Export to PDF
9. Admin dashboard for system config
10. A/B testing for AI suggestions
