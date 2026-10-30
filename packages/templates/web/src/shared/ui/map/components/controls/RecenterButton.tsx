/// <reference types="google.maps" />
import { FaCrosshairs } from 'react-icons/fa6'
import { useMapActions, type MapPadding } from '../../hooks/useMapActions'
import { CONTROL_BUTTON, CONTROL_SURFACE } from './controlStyles'

export type RecenterButtonProps = {
  /** The points to frame, for example every visible site. */
  points: google.maps.LatLngLiteral[]
  /** Space (px) to keep clear, for example under a floating panel. */
  padding?: MapPadding
  label?: string
  className?: string
}

/** Frames the given points. Must sit inside GoogleMap (children or controls). */
export function RecenterButton({
  points,
  padding,
  label = 'Show all on map',
  className = '',
}: RecenterButtonProps) {
  const { ready, fitTo } = useMapActions()
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={!ready || points.length === 0}
      onClick={() => fitTo(points, { padding })}
      className={`${CONTROL_SURFACE} ${CONTROL_BUTTON} rounded-full ${className}`}
    >
      <FaCrosshairs aria-hidden="true" />
    </button>
  )
}
