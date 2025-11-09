# WallFlower - Anonymous Workplace Grievance Platform

An internal web platform for employees to anonymously share workplace concerns with full transparency, AI-assisted workflows, and human oversight.

## Features

### For Employees
- **Anonymous Posting**: Submit concerns with auto-generated pseudonyms
- **AI Compose Coach**: Get suggestions for clarity, PII detection, categorization
- **Public Leaderboards**: View concerns by New, Rising, or Top
- **Thread Discussions**: Follow resolution progress via timeline
- **Blind Direct Messages**: Anonymously communicate with moderators

### For Moderators
- **Moderation Queue**: Review, approve, hide, or merge submissions
- **AI Triage Copilot**: Get summaries, duplicate detection, routing suggestions
- **Bulk Actions**: Process multiple items efficiently
- **Status Management**: Track resolution progress

### For Admins
- **Routing Rules**: Auto-route concerns to appropriate teams
- **Rule Simulator**: Test routing logic before deployment
- **Analytics Dashboard**: Track trends, response times, resolutions
- **CSV Export**: Extract data for external analysis

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Real-time**: Server-Sent Events (SSE)

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Run development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
├── app/
│   ├── page.tsx              # Home (leaderboards)
│   ├── new/                  # Grievance submission
│   ├── thread/[id]/          # Thread view
│   ├── moderation/           # Moderation queue
│   ├── routing/              # Routing rules
│   ├── analytics/            # Analytics dashboard
│   └── api/realtime/         # SSE endpoint
├── components/
│   ├── grievance-card.tsx    # Grievance display
│   ├── compose-panel.tsx     # Submission form
│   ├── agent-suggestions.tsx # AI coach UI
│   ├── thread-timeline.tsx   # Event timeline
│   ├── blind-dm-drawer.tsx   # Anonymous DMs
│   ├── triage-copilot.tsx    # Moderation AI
│   └── ...
├── lib/
│   ├── types.ts              # TypeScript definitions
│   ├── scoring.ts            # Leaderboard algorithms
│   ├── categories.ts         # Category config
│   ├── mock-data.ts          # Development data
│   └── realtime.ts           # SSE client
└── hooks/
    └── use-realtime.ts       # Real-time hook
\`\`\`

## Key Algorithms

### Rising Score
\`\`\`typescript
rising_score = (Δscore/Δhours) * exp(-age_hours/48)
\`\`\`

### Wilson Lower Bound (Top)
\`\`\`typescript
wilson = (p̂ + z²/2n - z√[(p̂(1-p̂) + z²/4n)/n]) / (1 + z²/n)
\`\`\`

## Accessibility

- WCAG 2.1 AA compliant
- Full keyboard navigation
- Screen reader optimized
- 44px minimum touch targets
- prefers-reduced-motion support

## Security & Privacy

- Server-side pseudonym generation
- PII detection and redaction
- Anonymous blind messaging
- No identity exposure in frontend

## Development Notes

Currently using mock data. In production:
- Connect to real backend API
- Implement authentication
- Add rate limiting
- Enable chat connectors (Slack/Teams)
- Set up monitoring

## License

Internal use only.
