import type { SiteStatus } from '../types'

/**
 * Label and colours per status. Raw palette colours on purpose: a fault should
 * read as red whatever the brand palette is (same rule as the shared Badge).
 */
export const SITE_STATUS: Record<
  SiteStatus,
  { label: string; dotClass: string; textClass: string }
> = {
  online: {
    label: 'Online',
    dotClass: 'bg-emerald-500',
    textClass: 'text-emerald-700 dark:text-emerald-400',
  },
  maintenance: {
    label: 'Maintenance',
    dotClass: 'bg-amber-500',
    textClass: 'text-amber-700 dark:text-amber-400',
  },
  offline: {
    label: 'Offline',
    dotClass: 'bg-rose-500',
    textClass: 'text-rose-700 dark:text-rose-400',
  },
}

/** Display order for summaries. */
export const STATUS_ORDER: SiteStatus[] = ['online', 'maintenance', 'offline']
