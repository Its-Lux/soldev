import { FaMinus, FaPlus } from 'react-icons/fa6'
import { useMapActions } from '../../hooks/useMapActions'
import { CONTROL_BUTTON, CONTROL_SURFACE } from './controlStyles'

export type ZoomControlsProps = { className?: string }

/** Stacked + and - buttons. Must sit inside GoogleMap (children or controls). */
export function ZoomControls({ className = '' }: ZoomControlsProps) {
  const { ready, zoomIn, zoomOut } = useMapActions()
  return (
    <div
      role="group"
      aria-label="Zoom"
      className={`${CONTROL_SURFACE} flex flex-col divide-y divide-border overflow-hidden ${className}`}
    >
      <button
        type="button"
        aria-label="Zoom in"
        disabled={!ready}
        onClick={zoomIn}
        className={CONTROL_BUTTON}
      >
        <FaPlus aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Zoom out"
        disabled={!ready}
        onClick={zoomOut}
        className={CONTROL_BUTTON}
      >
        <FaMinus aria-hidden="true" />
      </button>
    </div>
  )
}
