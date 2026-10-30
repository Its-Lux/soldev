import { minimalDarkStyles, minimalLightStyles } from './mapStyles'
import type { MapPreset, MapVariant } from '../types'

/** Used when the caller gives no camera. Centred on South Africa. */
export const DEFAULT_CAMERA = {
  center: { lat: -28.5, lng: 24.7 },
  zoom: 2,
} as const

/**
 * Built-in looks. Add a variant by adding an entry here and its name to
 * MapVariant in types/index.ts. For a one-off look, pass `preset` to
 * GoogleMap instead of adding a variant.
 */
export const MAP_PRESETS = {
  /** Full Google map, cloud-styled, Advanced Markers available. */
  default: {
    kind: 'cloud',
    behaviour: { gestureHandling: 'cooperative' },
  },
  /** Aerial imagery with labels. Useful for site and array layouts. */
  satellite: {
    kind: 'cloud',
    behaviour: {
      mapTypeId: 'hybrid',
      gestureHandling: 'cooperative',
      streetViewControl: false,
    },
  },
  /** Muted, code-styled base for data overlays. Legacy markers only. */
  minimal: {
    kind: 'code',
    styles: minimalLightStyles,
    darkStyles: minimalDarkStyles,
    behaviour: {
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'cooperative',
    },
  },
  /**
   * Cloud-styled map with every Google control hidden. Gestures still work
   * (Ctrl + scroll or pinch to zoom, drag to pan).
   */
  clean: {
    kind: 'cloud',
    behaviour: {
      mapTypeControl: false,
      fullscreenControl: false,
      cameraControl: false,
      streetViewControl: false,
      gestureHandling: 'cooperative',
    },
  },
  /** Non-interactive thumbnail, for cards and summaries. */
  preview: {
    kind: 'cloud',
    behaviour: {
      disableDefaultUI: true,
      gestureHandling: 'none',
      keyboardShortcuts: false,
      clickableIcons: false,
    },
  },
} satisfies Record<MapVariant, MapPreset>

/**
 * Variants whose preset is cloud-styled, worked out from MAP_PRESETS itself.
 * Use it for props that render custom marker content, which only cloud maps
 * can show. A new code-styled variant is excluded automatically.
 */
export type CloudMapVariant = {
  [K in MapVariant]: (typeof MAP_PRESETS)[K]['kind'] extends 'cloud' ? K : never
}[MapVariant]
