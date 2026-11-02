/// <reference types="google.maps" />
import { Pin } from '@vis.gl/react-google-maps'

export type MapPinProps = {
  /** Pin fill. Any CSS colour value. */
  background?: string
  borderColor?: string
  glyphColor?: string
  /** Short text inside the pin, for example a number or initial. */
  glyphText?: string
  /** Image inside the pin, instead of text. */
  glyphSrc?: string
  /** Size multiplier. Defaults to 1. */
  scale?: number
}

/**
 * Google's standard teardrop pin, recoloured. Use as the child of a
 * MapMarker on cloud maps. On code-styled maps it is ignored, like any
 * marker content.
 */
export function MapPin(props: MapPinProps) {
  return <Pin {...props} />
}
