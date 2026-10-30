import type { SiteStatus, SiteSummary } from '../types'

/** Number of sites per status, with every status present (zero if none). */
export function countByStatus(items: SiteSummary[]): Record<SiteStatus, number> {
  const counts: Record<SiteStatus, number> = { online: 0, maintenance: 0, offline: 0 }
  for (const site of items) counts[site.status] += 1
  return counts
}
