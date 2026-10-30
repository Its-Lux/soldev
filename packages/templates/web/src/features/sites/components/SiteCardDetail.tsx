import { useSite } from '../hooks/useSite'
import { formatCapacity, formatDate } from '../libs/formatters'

interface SiteCardDetailProps {
  siteId: string
  id: string
}

/** Connected: fetches and shows detail for one site, inside its card. */
export function SiteCardDetail({ siteId, id }: SiteCardDetailProps) {
  const { data: site, isLoading, isError } = useSite(siteId)

  return (
    <div id={id} className="border-t border-border px-6 pb-5 pt-4 text-sm">
      {isLoading && <p className="text-muted">Loading details...</p>}
      {isError && <p className="text-rose-700 dark:text-rose-400">Details could not be loaded.</p>}
      {site && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
          <dt className="text-muted">Client</dt>
          <dd className="text-foreground">{site.client}</dd>
          <dt className="text-muted">Capacity</dt>
          <dd className="text-foreground">{formatCapacity(site.capacityKwp)}</dd>
          <dt className="text-muted">Inverters</dt>
          <dd className="text-foreground">{site.inverterCount}</dd>
          <dt className="text-muted">Commissioned</dt>
          <dd className="text-foreground">{formatDate(site.commissionedOn)}</dd>
        </dl>
      )}
    </div>
  )
}
