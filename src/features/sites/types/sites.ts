// Plain TypeScript types. They exist at compile time only: nothing checks at
// runtime that the server actually sends these shapes.

export type SiteStatus = 'online' | 'offline' | 'maintenance'

/** What the map and list need for every site. Returned by /sites/getAll. */
export interface SiteSummary {
  id: string
  name: string
  /** Short name for map pins, for example "Benoni". */
  label: string
  /** Province or area, for example "Gauteng". */
  region: string
  /** When the site last reported, as an ISO date-time. */
  lastSeenAt: string
  lat: number
  lng: number
  status: SiteStatus
}

/** Everything about one site. Returned by /sites/getById. */
export interface SiteDetail extends SiteSummary {
  client: string
  capacityKwp: number
  /** A whole number. TypeScript has no integer type, so this is not enforced. */
  inverterCount: number
  /** ISO date, for example 2023-04-18. */
  commissionedOn: string
}
