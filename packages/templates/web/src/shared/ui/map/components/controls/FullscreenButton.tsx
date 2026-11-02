import { useSyncExternalStore } from 'react'
import { FaCompress, FaExpand } from 'react-icons/fa6'
import { useMapFrame } from '../../hooks/useMapFrame'
import { CONTROL_BUTTON, CONTROL_SURFACE } from './controlStyles'

export type FullscreenButtonProps = {
  /**
   * 'map' (default) fills the screen with the map and its controls only.
   * 'page' fills it with the whole page, keeping floating panels visible.
   */
  target?: 'map' | 'page'
  className?: string
}

const subscribe = (onChange: () => void) => {
  document.addEventListener('fullscreenchange', onChange)
  return () => document.removeEventListener('fullscreenchange', onChange)
}
const noSubscribe = () => () => {}
// Truthy check: the property is undefined, not null, where it is unsupported.
const isFullscreen = () => Boolean(document.fullscreenElement)
const isSupported = () => document.fullscreenEnabled === true
const onServer = () => false

/**
 * Enters and leaves browser fullscreen. Renders nothing where the browser
 * does not allow it (for example Safari on iPhone).
 */
export function FullscreenButton({ target = 'map', className = '' }: FullscreenButtonProps) {
  const { containerRef } = useMapFrame()
  const active = useSyncExternalStore(subscribe, isFullscreen, onServer)
  const supported = useSyncExternalStore(noSubscribe, isSupported, onServer)

  if (!supported) return null

  const toggle = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
      return
    }
    const element = target === 'page' ? document.documentElement : containerRef.current
    void element?.requestFullscreen()
  }

  const label = active ? 'Exit fullscreen' : 'Enter fullscreen'
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={toggle}
      className={`${CONTROL_SURFACE} ${CONTROL_BUTTON} ${className}`}
    >
      {active ? <FaCompress aria-hidden="true" /> : <FaExpand aria-hidden="true" />}
    </button>
  )
}
