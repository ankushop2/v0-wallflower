// Scoring algorithms for leaderboards

/**
 * Wilson Lower Bound for binomial proportion confidence interval
 * Used for "Top" sorting with time-boxed data
 */
export function wilsonLowerBound(
  positive: number,
  total: number,
  z = 1.96, // 95% confidence
): number {
  if (total === 0) return 0

  const phat = positive / total
  const zsq = z * z
  const denominator = 1 + zsq / total

  const numerator = phat + zsq / (2 * total) - z * Math.sqrt((phat * (1 - phat) + zsq / (4 * total)) / total)

  return numerator / denominator
}

/**
 * Simple score calculation for time-boxed Top sorting
 */
export function simpleScore(up: number, down: number): number {
  return up - down
}

/**
 * Rising score with exponential decay
 * Measures velocity with recency bias
 */
export function risingScore(history: Array<{ ts: number; score: number }>, now: number): number {
  if (history.length < 2) return 0

  // Get most recent 6 hours of data
  const sixHoursAgo = now - 6 * 60 * 60 * 1000
  const recentHistory = history.filter((h) => h.ts >= sixHoursAgo)

  if (recentHistory.length < 2) return 0

  // Calculate velocity (change in score / change in hours)
  const oldest = recentHistory[0]
  const newest = recentHistory[recentHistory.length - 1]
  const deltaScore = newest.score - oldest.score
  const deltaHours = (newest.ts - oldest.ts) / (60 * 60 * 1000)

  if (deltaHours === 0) return 0

  const velocity = deltaScore / deltaHours

  // Apply exponential decay based on age (48-hour half-life)
  const ageHours = (now - newest.ts) / (60 * 60 * 1000)
  const decayFactor = Math.exp(-ageHours / 48)

  return velocity * decayFactor
}

/**
 * Sort grievances by New (most recently approved)
 */
export function sortNew(grievances: Array<{ approvedAt?: string; createdAt: string }>) {
  return [...grievances].sort((a, b) => {
    const aTime = new Date(a.approvedAt || a.createdAt).getTime()
    const bTime = new Date(b.approvedAt || b.createdAt).getTime()
    return bTime - aTime
  })
}

/**
 * Sort grievances by Rising score
 */
export function sortRising(
  grievances: Array<{
    id: string
    score: number
    createdAt: string
    scoreHistory?: Array<{ ts: number; score: number }>
  }>,
) {
  const now = Date.now()

  const withRisingScores = grievances.map((g) => ({
    ...g,
    risingScore: risingScore(
      g.scoreHistory || [
        { ts: new Date(g.createdAt).getTime(), score: 0 },
        { ts: now, score: g.score },
      ],
      now,
    ),
  }))

  return withRisingScores.sort((a, b) => b.risingScore - a.risingScore)
}

/**
 * Sort grievances by Top (Wilson or simple, depending on config)
 */
export function sortTop(grievances: Array<{ up: number; down: number }>, useWilson = true) {
  return [...grievances].sort((a, b) => {
    if (useWilson) {
      const aScore = wilsonLowerBound(a.up, a.up + a.down)
      const bScore = wilsonLowerBound(b.up, b.up + b.down)
      return bScore - aScore
    } else {
      return simpleScore(b.up, b.down) - simpleScore(a.up, a.down)
    }
  })
}
