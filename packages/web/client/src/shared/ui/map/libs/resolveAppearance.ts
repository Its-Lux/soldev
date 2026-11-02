import type { MapProps } from '@vis.gl/react-google-maps'
import type { AppTheme, MapPreset } from '../types'

/** Google's documented demo Map ID. Works for development only. */
export const DEMO_MAP_ID = 'DEMO_MAP_ID'

export type MapAppearance = Partial<
  Pick<MapProps, 'mapId' | 'styles' | 'colorScheme' | 'renderingType'>
>

/**
 * Turns a preset plus the app theme into the appearance props for <Map>.
 * Pure, so the kind rules can be checked without a browser.
 */
export function resolveAppearance(
  preset: MapPreset,
  theme: AppTheme,
  defaultMapId: string,
): MapAppearance {
  if (preset.kind === 'cloud') {
    return {
      mapId: preset.mapId || defaultMapId || DEMO_MAP_ID,
      colorScheme: theme === 'dark' ? 'DARK' : 'LIGHT',
    }
  }
  return {
    // JSON styles only apply to raster maps without a Map ID.
    renderingType: 'RASTER',
    styles: theme === 'dark' ? (preset.darkStyles ?? preset.styles) : preset.styles,
  }
}
