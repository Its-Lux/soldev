import { FaMagnifyingGlass } from 'react-icons/fa6'
import { STATUS_ORDER, SITE_STATUS } from '../libs/siteStatus'
import type { SiteStatus, SiteSummary } from '../types'
import { SiteCard } from './SiteCard'

interface SitesPanelProps {
  items: SiteSummary[]
  counts: Record<SiteStatus, number>
  selectedId: string | null
  onSelect: (id: string | null) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  isLoading?: boolean
  isError?: boolean
  className?: string
}

/** Floating desktop panel: title, status summary, search and site cards. */
export function SitesPanel({
  items,
  counts,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  isLoading = false,
  isError = false,
  className = '',
}: SitesPanelProps) {
  return (
    <section
      aria-labelledby="sites-heading"
      className={`flex flex-col overflow-hidden rounded-3xl bg-background shadow-xl shadow-black/10 ${className}`}
    >
      <header className="flex flex-col gap-4 border-b border-border px-5 pb-5 pt-6">
        <div className="flex items-baseline justify-between">
          <h1 id="sites-heading" className="text-2xl font-semibold text-foreground">
            Sites
          </h1>
          <span className="text-sm text-muted">
            {items.length} {items.length === 1 ? 'site' : 'sites'}
          </span>
        </div>

        <ul aria-label="Sites by status" className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {STATUS_ORDER.map((status) => (
            <li key={status} className="flex items-center gap-2 text-muted">
              <span
                aria-hidden="true"
                className={`h-2.5 w-2.5 rounded-full ${SITE_STATUS[status].dotClass}`}
              />
              <span className="font-semibold text-foreground">{counts[status]}</span>
              {SITE_STATUS[status].label}
            </li>
          ))}
        </ul>

        <label className="relative block">
          <span className="sr-only">Search sites</span>
          <FaMagnifyingGlass
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            placeholder="Search sites"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl bg-surface py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted focus-visible:outline-2 focus-visible:outline-accent"
          />
        </label>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {isLoading && <p className="px-3 py-2 text-sm text-muted">Loading sites...</p>}
        {isError && (
          <p className="px-3 py-2 text-sm text-rose-700 dark:text-rose-400">
            Sites could not be loaded.
          </p>
        )}
        {!isLoading && !isError && items.length === 0 && (
          <p className="px-3 py-2 text-sm text-muted">
            {searchQuery ? 'No sites match your search.' : 'No sites yet.'}
          </p>
        )}
        <ul className="flex flex-col gap-3">
          {items.map((site) => (
            <li key={site.id}>
              <SiteCard site={site} selected={site.id === selectedId} onSelect={onSelect} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
