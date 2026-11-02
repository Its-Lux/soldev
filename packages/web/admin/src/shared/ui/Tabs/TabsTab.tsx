import type { ReactNode } from 'react'
import { useTabsContext } from './TabsContext'

interface TabsTabProps {
  value: string
  children: ReactNode
  disabled?: boolean
}

export function TabsTab({ value, children, disabled }: TabsTabProps) {
  const { value: activeValue, setValue, baseId } = useTabsContext()
  const selected = activeValue === value

  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      onClick={() => setValue(value)}
      className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 ${
        selected
          ? 'border-accent text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}
