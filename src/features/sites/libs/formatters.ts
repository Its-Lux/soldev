/** 450 -> "450 kWp", 1250 -> "1.25 MWp". */
export function formatCapacity(kwp: number): string {
  return kwp >= 1000 ? `${(kwp / 1000).toFixed(2)} MWp` : `${kwp} kWp`
}

const dateFormat = new Intl.DateTimeFormat('en-ZA', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

/** "2023-04-18" -> "18 Apr 2023". Read as UTC so the day never shifts. */
export function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? isoDate : dateFormat.format(date)
}

/**
 * Compact time since an ISO date-time: "just now", "12 min ago", "3 h ago",
 * "2 d ago". A future time (clock skew) reads as "just now".
 */
export function formatRelativeTime(isoDateTime: string, now: number = Date.now()): string {
  const then = new Date(isoDateTime).getTime()
  if (Number.isNaN(then)) return ''
  const minutes = Math.floor((now - then) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  return `${Math.floor(hours / 24)} d ago`
}
