import { formatDistanceToNow, format, parseISO } from "date-fns"

/**
 * Safely format a date to relative time (e.g., "2 hours ago")
 * Returns "recently" if the date is invalid
 */
export function safeFormatDistanceToNow(
  date: string | Date | null | undefined,
  options?: { addSuffix?: boolean },
): string {
  if (!date) return "recently"

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date
    if (isNaN(dateObj.getTime())) return "recently"
    return formatDistanceToNow(dateObj, options)
  } catch {
    return "recently"
  }
}

/**
 * Safely format a date with a specific format string
 * Returns fallback string if the date is invalid
 */
export function safeFormat(date: string | Date | null | undefined, formatStr: string, fallback = "N/A"): string {
  if (!date) return fallback

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date
    if (isNaN(dateObj.getTime())) return fallback
    return format(dateObj, formatStr)
  } catch {
    return fallback
  }
}

/**
 * Check if a date string or Date object is valid
 */
export function isValidDate(date: string | Date | null | undefined): boolean {
  if (!date) return false

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date
    return !isNaN(dateObj.getTime())
  } catch {
    return false
  }
}
