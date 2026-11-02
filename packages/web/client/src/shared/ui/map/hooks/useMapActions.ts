/// <reference types="google.maps" />
import { useMemo } from 'react'
import { useMap } from '@vis.gl/react-google-maps'
import { useMapFrame } from './useMapFrame'

export type MapPadding = number | google.maps.Padding

export type MapActions = {
  /** False until the map has been created; actions do nothing until then. */
  ready: boolean
  zoomIn: () => void
  zoomOut: () => void
  /** Move smoothly to a point, optionally changing the zoom. */
  panTo: (position: google.maps.LatLngLiteral, zoom?: number) => void
  /**
   * Frame a set of points. Padding (px) keeps them clear of floating panels.
   * One point pans to it at `singleZoom`; no points does nothing.
   */
  fitTo: (
    points: google.maps.LatLngLiteral[],
    options?: { padding?: MapPadding; singleZoom?: number },
  ) => void
}

/**
 * Camera actions for the GoogleMap the caller sits inside: its children,
 * or its `controls` slot. Lets features drive the map without importing
 * the Google library.
 */
export function useMapActions(): MapActions {
  const { mapId } = useMapFrame()
  const map = useMap(mapId)

  return useMemo<MapActions>(() => {
    const zoomBy = (delta: number) => {
      if (!map) return
      map.setZoom((map.getZoom() ?? 0) + delta)
    }
    return {
      ready: map !== null,
      zoomIn: () => zoomBy(1),
      zoomOut: () => zoomBy(-1),
      panTo: (position, zoom) => {
        if (!map) return
        map.panTo(position)
        if (zoom !== undefined) map.setZoom(zoom)
      },
      fitTo: (points, { padding = 48, singleZoom = 12 } = {}) => {
        if (!map || points.length === 0) return
        const [first] = points
        if (points.length === 1 && first) {
          map.panTo(first)
          map.setZoom(singleZoom)
          return
        }
        const bounds = new google.maps.LatLngBounds()
        for (const p of points) bounds.extend(p)
        map.fitBounds(bounds, padding)
      },
    }
  }, [map])
}
