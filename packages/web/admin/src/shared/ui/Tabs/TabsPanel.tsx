import type { ReactNode } from 'react'
import { useTabsContext } from './TabsContext'

interface TabsPanelProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsPanel({ value, children, className = '' }: TabsPanelProps) {
  const { value: activeValue, baseId } = useTabsContext()
  if (activeValue !== value) return null

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      tabIndex={0}
      className={`pt-4 ${className}`}
    >
      {children}
    </div>
  )
}
