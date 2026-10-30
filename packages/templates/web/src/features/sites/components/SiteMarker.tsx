import { SITE_STATUS } from '../libs/siteStatus'
import type { SiteStatus } from '../types'

interface SiteMarkerProps {
  label: string
  status: SiteStatus
  selected: boolean
}

/** Map pin: a pill with a status dot and short name, inverted when selected. */
export function SiteMarker({ label, status, selected }: SiteMarkerProps) {
  return (
    <span
      className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium shadow-md shadow-black/15 ${
        selected ? 'bg-foreground text-background' : 'bg-background text-foreground'
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-2.5 w-2.5 rounded-full ${SITE_STATUS[status].dotClass}`}
      />
      {label}
    </span>
  )
}
