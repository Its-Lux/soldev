import { useId } from 'react'
import { formatRelativeTime } from '../libs/formatters'
import { SITE_STATUS } from '../libs/siteStatus'
import type { SiteSummary } from '../types'
import { SiteCardDetail } from './SiteCardDetail'

interface SiteCardProps {
  site: SiteSummary
  selected: boolean
  /** Called with the site id, or null when the selected card is clicked again. */
  onSelect: (id: string | null) => void
  className?: string
}

/** A site in the list. The selected card expands to show its details. */
export function SiteCard({ site, selected, onSelect, className = '' }: SiteCardProps) {
  const status = SITE_STATUS[site.status]
  // useId, not the site id: the same site has a card in both the desktop
  // panel and the mobile carousel, and element ids must be unique.
  const detailId = `${useId()}-detail`

  return (
    <div
      className={`overflow-hidden rounded-2xl bg-background ${
        selected ? 'border-2 border-foreground' : 'border-2 border-border'
      } ${className}`}
    >
      <button
        type="button"
        aria-expanded={selected}
        aria-controls={selected ? detailId : undefined}
        onClick={() => onSelect(selected ? null : site.id)}
        className="flex w-full flex-col gap-1.5 px-6 py-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent"
      >
        <span className="flex items-center justify-between gap-3">
          <span className="truncate text-base font-semibold text-foreground">{site.name}</span>
          <span
            className={`flex shrink-0 items-center gap-2 text-sm font-medium ${status.textClass}`}
          >
            <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${status.dotClass}`} />
            {status.label}
          </span>
        </span>
        <span className="text-sm text-muted">
          {site.region} &middot; {formatRelativeTime(site.lastSeenAt)}
        </span>
      </button>
      {selected && <SiteCardDetail siteId={site.id} id={detailId} />}
    </div>
  )
}
