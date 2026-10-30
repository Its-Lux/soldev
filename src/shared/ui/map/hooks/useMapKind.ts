import { createContext, useContext } from 'react'
import type { MapKind } from '../types'

export const MapKindContext = createContext<MapKind | null>(null)

/**
 * Which kind of map the caller sits inside. Marker components use it to choose
 * Advanced Markers (cloud) or legacy markers (code).
 */
export function useMapKind(): MapKind {
  const kind = useContext(MapKindContext)
  if (kind === null) {
    throw new Error('useMapKind must be used inside <GoogleMap>.')
  }
  return kind
}
