import { useContext, useId, useMemo, useRef, type ReactNode } from 'react'
import { APIProvider, APIProviderContext, Map } from '@vis.gl/react-google-maps'
import { env } from '@/shared/config'
import { useTheme } from '@/shared/lib'
import { MapKindContext } from '../hooks/useMapKind'
import { MapFrameContext, type MapFrame } from '../hooks/useMapFrame'
import { DEFAULT_CAMERA, MAP_PRESETS } from '../presets/presets'
import { resolveAppearance } from '../libs/resolveAppearance'
import type { MapBehaviour, MapPreset, MapVariant } from '../types'
import type { MapBaseLayer } from './controls/MapTypeToggle'

const DEFAULT_CONTAINER = 'h-96 w-full rounded-lg border border-border'

const BASE_LAYER_TYPE: Record<MapBaseLayer, string> = {
  map: 'roadmap',
  satellite: 'hybrid',
}

export type GoogleMapProps = MapBehaviour & {
  /** Built-in look. Ignored when `preset` is given. Defaults to 'default'. */
  variant?: MapVariant
  /** A one-off look, built from the same rules as the built-in presets. */
  preset?: MapPreset
  /**
   * Map or satellite imagery, for a MapTypeToggle. Overrides the preset's
   * map type when given.
   */
  baseLayer?: MapBaseLayer
  /**
   * Classes for the outer container: size, radius, border, shadow.
   * Replaces the default classes rather than merging with them.
   */
  className?: string
  /**
   * Floating controls, drawn over the map in a layer that ignores clicks
   * except on the controls themselves. Position them with your own classes.
   */
  controls?: ReactNode
  /** Markers, shapes, info windows. */
  children?: ReactNode
}

export function GoogleMap({
  variant = 'default',
  preset,
  baseLayer,
  className = DEFAULT_CONTAINER,
  controls,
  children,
  ...overrides
}: GoogleMapProps) {
  const { theme } = useTheme()
  const hasProvider = useContext(APIProviderContext) !== null
  const apiKey = env.MAPS_API_KEY ?? ''
  const mapId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const frame = useMemo<MapFrame>(() => ({ mapId, containerRef }), [mapId])

  const active = preset ?? MAP_PRESETS[variant]
  const appearance = resolveAppearance(active, theme, env.MAPS_ID ?? '')
  const hasCamera = overrides.center !== undefined || overrides.defaultCenter !== undefined

  const map = (
    <MapFrameContext.Provider value={frame}>
      <MapKindContext.Provider value={active.kind}>
        <Map
          id={mapId}
          defaultCenter={hasCamera ? undefined : DEFAULT_CAMERA.center}
          defaultZoom={hasCamera ? undefined : DEFAULT_CAMERA.zoom}
          {...active.behaviour}
          {...overrides}
          {...(baseLayer ? { mapTypeId: BASE_LAYER_TYPE[baseLayer] } : {})}
          {...appearance}
          style={{ width: '100%', height: '100%' }}
        >
          {children}
        </Map>
        {controls && <div className="pointer-events-none absolute inset-0 z-10">{controls}</div>}
      </MapKindContext.Provider>
    </MapFrameContext.Provider>
  )

  if (!hasProvider && !apiKey) {
    return (
      <div
        role="status"
        className={`${className} flex items-center justify-center bg-surface p-4 text-center text-sm text-muted`}
      >
        Map unavailable: no Google Maps API key is configured.
      </div>
    )
  }

  return (
    // The outer box takes the caller's classes untouched, so positioning such
    // as `absolute inset-0` is never overridden. `isolate` keeps Google's high
    // internal z-index values inside it, so navbars and panels stay on top.
    // The inner box is the positioned layer the map and controls fill.
    <div ref={containerRef} className={`${className} isolate overflow-hidden`}>
      <div className="relative h-full w-full">
        {hasProvider ? map : <APIProvider apiKey={apiKey}>{map}</APIProvider>}
      </div>
    </div>
  )
}
