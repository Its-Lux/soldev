import { createContext, useContext, type RefObject } from 'react'

export type MapFrame = {
  /** Id given to the underlying map, so controls outside it can find it. */
  mapId: string
  /** The GoogleMap outer container, used as the fullscreen target. */
  containerRef: RefObject<HTMLDivElement | null>
}

export const MapFrameContext = createContext<MapFrame | null>(null)

/** Internal: the frame of the GoogleMap the caller sits inside. */
export function useMapFrame(): MapFrame {
  const frame = useContext(MapFrameContext)
  if (frame === null) {
    throw new Error('Map controls must be used inside <GoogleMap> (children or controls).')
  }
  return frame
}
