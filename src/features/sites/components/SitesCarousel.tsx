import { useEffect, useRef } from 'react'
import { RecenterButton } from '@/shared/ui'
import type { SiteSummary } from '../types'
import { SiteCard } from './SiteCard'

interface SitesCarouselProps {
  items: SiteSummary[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

// How long scrolling must pause before the centred card counts as chosen.
const SETTLE_MS = 150

/**
 * Mobile bottom sheet: site count, recentre button and a row of cards to
 * swipe through. Swiping to a card selects it; selecting elsewhere (a pin)
 * scrolls its card into view. Must sit inside GoogleMap's controls.
 */
export function SitesCarousel({ items, selectedId, onSelect }: SitesCarouselProps) {
  const scrollerRef = useRef<HTMLUListElement>(null)
  const settleTimer = useRef<number | undefined>(undefined)

  // Bring the selected card into view, whatever selected it.
  useEffect(() => {
    if (!selectedId) return
    const card = scrollerRef.current?.querySelector<HTMLElement>(`[data-site-id="${selectedId}"]`)
    card?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [selectedId])

  useEffect(() => () => window.clearTimeout(settleTimer.current), [])

  // When a swipe settles, select the card nearest the middle.
  const handleScroll = () => {
    window.clearTimeout(settleTimer.current)
    settleTimer.current = window.setTimeout(() => {
      const scroller = scrollerRef.current
      if (!scroller) return
      const middle = scroller.scrollLeft + scroller.clientWidth / 2
      let nearestId: string | null = null
      let nearestDistance = Infinity
      for (const card of scroller.querySelectorAll<HTMLElement>('[data-site-id]')) {
        const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - middle)
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestId = card.dataset.siteId ?? null
        }
      }
      if (nearestId && nearestId !== selectedId) onSelect(nearestId)
    }, SETTLE_MS)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between px-4">
        <span className="pointer-events-auto rounded-lg bg-background/90 px-3 py-1 text-sm font-medium text-foreground shadow-sm">
          {items.length} {items.length === 1 ? 'site' : 'sites'}
        </span>
        <RecenterButton
          points={items.map((s) => ({ lat: s.lat, lng: s.lng }))}
          padding={{ top: 160, right: 32, bottom: 240, left: 32 }}
        />
      </div>

      {items.length > 0 && (
        <ul
          ref={scrollerRef}
          onScroll={handleScroll}
          aria-label="Sites"
          className="pointer-events-auto flex snap-x snap-mandatory items-end gap-3 overflow-x-auto px-[10vw] pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((site) => (
            <li
              key={site.id}
              data-site-id={site.id}
              className="w-[80vw] max-w-sm shrink-0 snap-center"
            >
              <SiteCard
                site={site}
                selected={site.id === selectedId}
                onSelect={onSelect}
                className="shadow-lg shadow-black/10"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
