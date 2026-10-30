import { useEffect, useRef } from 'react'
import { useMapActions, type MapPadding } from '@/shared/ui'
import type { SiteSummary } from '../types'

// Keeps sites clear of the floating panel (left) and controls (right).
const DESKTOP_PADDING: MapPadding = { top: 96, right: 96, bottom: 48, left: 420 }
// Keeps sites clear of the top bar and the cards along the bottom.
const MOBILE_PADDING: MapPadding = { top: 160, right: 32, bottom: 240, left: 32 }

interface MapCameraProps {
  /** Every site, not just the filtered ones, so selection always resolves. */
  sites: SiteSummary[]
  selectedId: string | null
}

/**
 * Moves the camera: frames all sites once when they first load, then pans to
 * a site whenever one is selected. Renders nothing; place inside GoogleMap.
 */
export function MapCamera({ sites, selectedId }: MapCameraProps) {
  const { ready, fitTo, panTo } = useMapActions()
  const framed = useRef(false)

  useEffect(() => {
    if (!ready || framed.current || sites.length === 0) return
    framed.current = true
    const desktop = window.matchMedia('(min-width: 768px)').matches
    fitTo(
      sites.map((s) => ({ lat: s.lat, lng: s.lng })),
      { padding: desktop ? DESKTOP_PADDING : MOBILE_PADDING },
    )
  }, [ready, sites, fitTo])

  // Pan only when the selection changes. A refetch also gives a new `sites`
  // array (fresh last-seen times), which must not drag the map back.
  const pannedTo = useRef<string | null>(null)
  useEffect(() => {
    if (!ready || selectedId === pannedTo.current) return
    pannedTo.current = selectedId
    if (!selectedId) return
    const site = sites.find((s) => s.id === selectedId)
    if (site) panTo({ lat: site.lat, lng: site.lng })
  }, [ready, selectedId, sites, panTo])

  return null
}
