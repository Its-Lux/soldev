import { FaMagnifyingGlass } from 'react-icons/fa6'

interface SitesMobileSearchProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  className?: string
}

/** Mobile top bar: page title and search, floating over the map. */
export function SitesMobileSearch({
  searchQuery,
  onSearchChange,
  className = '',
}: SitesMobileSearchProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl bg-background px-4 py-3 shadow-lg shadow-black/10 ${className}`}
    >
      <h1 className="shrink-0 border-r border-border pr-3 text-lg font-semibold text-foreground">
        Sites
      </h1>
      <label className="relative flex min-w-0 flex-1 items-center">
        <span className="sr-only">Search sites</span>
        <FaMagnifyingGlass
          aria-hidden="true"
          className="pointer-events-none absolute left-1 text-muted"
        />
        <input
          type="search"
          placeholder="Search sites"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-transparent py-1 pl-8 pr-1 text-base text-foreground placeholder:text-muted focus-visible:outline-none"
        />
      </label>
    </div>
  )
}
