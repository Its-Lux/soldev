import type { SiteSummary } from '../types'

/** Case-insensitive match on site name. An empty query keeps every site. */
export function filterSites(items: SiteSummary[], query: string): SiteSummary[] {
  const q = query.trim().toLowerCase()
  return q ? items.filter((s) => s.name.toLowerCase().includes(q)) : items
}
