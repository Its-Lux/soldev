/// <reference types="google.maps" />
import type { ReactNode } from 'react'
import { AdvancedMarker, Marker } from '@vis.gl/react-google-maps'
import { useMapKind } from '../hooks/useMapKind'

/** Which point of the pin sits exactly on the position. */
export type MarkerAnchor = 'bottom' | 'center'

export type MarkerIcon = {
  /** Image URL, imported asset or data URI (SVG works well). */
  url: string
  /** Rendered width and height in pixels. Defaults to 32. */
  size?: number
}

export type MapMarkerProps = {
  position: google.maps.LatLngLiteral
  title?: string
  onClick?: () => void
  /**
   * 'bottom' (default) suits teardrop pins whose tip marks the spot.
   * 'center' suits round dots and badges.
   */
  anchor?: MarkerAnchor
  /**
   * An image pin that works on both kinds of map. On cloud maps it is used
   * when there are no children; on code-styled maps it is the only way to
   * replace the default pin.
   */
  icon?: MarkerIcon
  /**
   * Custom marker content (HTML/React, or a MapPin). Cloud maps only. On
   * code-styled maps it is ignored: `icon` is used if given, otherwise the
   * default pin.
   */
  children?: ReactNode
}

const DEFAULT_ICON_SIZE = 32

/** Translate offsets for Advanced Marker content, per anchor. */
const ADVANCED_ANCHOR: Record<MarkerAnchor, { anchorLeft: string; anchorTop: string }> = {
  bottom: { anchorLeft: '-50%', anchorTop: '-100%' },
  center: { anchorLeft: '-50%', anchorTop: '-50%' },
}

/** Legacy marker icon. Only called inside a rendered map, so `google` exists. */
function toLegacyIcon(icon: MarkerIcon, anchor: MarkerAnchor): google.maps.Icon {
  const size = icon.size ?? DEFAULT_ICON_SIZE
  return {
    url: icon.url,
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, anchor === 'center' ? size / 2 : size),
  }
}

/**
 * A marker that works on either kind of map: an Advanced Marker on cloud
 * maps, a legacy marker on code-styled maps (which cannot use Advanced
 * Markers because they have no Map ID).
 */
export function MapMarker({
  position,
  title,
  onClick,
  anchor = 'bottom',
  icon,
  children,
}: MapMarkerProps) {
  const kind = useMapKind()
  const handleClick = onClick ? () => onClick() : undefined

  if (kind === 'cloud') {
    const size = icon?.size ?? DEFAULT_ICON_SIZE
    const content =
      children ??
      (icon ? <img src={icon.url} alt="" width={size} height={size} draggable={false} /> : null)

    return (
      <AdvancedMarker
        position={position}
        title={title}
        onClick={handleClick}
        {...(content ? ADVANCED_ANCHOR[anchor] : {})}
      >
        {content}
      </AdvancedMarker>
    )
  }

  return (
    <Marker
      position={position}
      title={title}
      onClick={handleClick}
      icon={icon ? toLegacyIcon(icon, anchor) : undefined}
    />
  )
}
