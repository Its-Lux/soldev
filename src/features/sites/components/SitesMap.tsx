import {
  FullscreenButton,
  GoogleMap,
  MapMarker,
  MapTypeToggle,
  ZoomControls,
  type MapBaseLayer,
} from '@/shared/ui'
import type { ReactNode } from 'react'
import type { SiteSummary } from '../types'
import { MapCamera } from './MapCamera'
import { SiteMarker } from './SiteMarker'

interface SitesMapProps {
  /** Sites to show as pins (the filtered list). */
  sites: SiteSummary[]
  /** Every site, for camera moves. */
  allSites: SiteSummary[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  baseLayer: MapBaseLayer
  onBaseLayerChange: (layer: MapBaseLayer) => void
  /** Mobile-only content pinned to the bottom of the map, such as cards. */
  mobileBottom?: ReactNode
  className?: string
}

export function SitesMap({
  sites,
  allSites,
  selectedId,
  onSelect,
  baseLayer,
  onBaseLayerChange,
  mobileBottom,
  className,
}: SitesMapProps) {
  return (
    <GoogleMap
      variant="clean"
      baseLayer={baseLayer}
      className={className}
      onClick={() => onSelect(null)}
      controls={
        <>
          <div className="hidden md:block">
            <div className="absolute right-5 top-20 flex flex-col items-end gap-3">
              <MapTypeToggle value={baseLayer} onChange={onBaseLayerChange} />
              <FullscreenButton target="page" />
            </div>
            <ZoomControls className="absolute bottom-8 right-5" />
          </div>
          <div className="md:hidden">
            <div className="absolute inset-x-4 top-[calc(env(safe-area-inset-top,0px)+5.5rem)] flex items-start justify-between">
              <MapTypeToggle value={baseLayer} onChange={onBaseLayerChange} />
              <FullscreenButton target="page" />
            </div>
            <div className="absolute inset-x-0 bottom-0">{mobileBottom}</div>
          </div>
        </>
      }
    >
      <MapCamera sites={allSites} selectedId={selectedId} />
      {sites.map((site) => (
        <MapMarker
          key={site.id}
          position={{ lat: site.lat, lng: site.lng }}
          title={site.name}
          anchor="center"
          onClick={() => onSelect(site.id)}
        >
          <SiteMarker label={site.label} status={site.status} selected={site.id === selectedId} />
        </MapMarker>
      ))}
    </GoogleMap>
  )
}
