import { CONTROL_SURFACE } from './controlStyles'

export type MapBaseLayer = 'map' | 'satellite'

export type MapTypeToggleProps = {
  value: MapBaseLayer
  onChange: (value: MapBaseLayer) => void
  className?: string
}

const OPTIONS: { value: MapBaseLayer; label: string }[] = [
  { value: 'map', label: 'Map' },
  { value: 'satellite', label: 'Satellite' },
]

/**
 * Segmented Map / Satellite switch. Controlled: pass the same value to
 * GoogleMap's `baseLayer`. Usable anywhere, it does not need the map.
 */
export function MapTypeToggle({ value, onChange, className = '' }: MapTypeToggleProps) {
  return (
    <div role="group" aria-label="Map type" className={`${CONTROL_SURFACE} flex p-1 ${className}`}>
      {OPTIONS.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              active ? 'bg-foreground text-background' : 'text-foreground hover:bg-surface'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
