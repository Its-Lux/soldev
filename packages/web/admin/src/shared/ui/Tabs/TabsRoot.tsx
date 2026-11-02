import { useId, useState, type ReactNode } from 'react'
import { TabsContext } from './TabsContext'

interface TabsRootProps {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  children: ReactNode
  className?: string
}

export function TabsRoot({
  defaultValue,
  value,
  onValueChange,
  children,
  className = '',
}: TabsRootProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const baseId = useId()
  const isControlled = value !== undefined
  const current = isControlled ? value : internalValue

  const setValue = (next: string) => {
    if (!isControlled) setInternalValue(next)
    onValueChange?.(next)
  }

  return (
    <TabsContext.Provider value={{ value: current, setValue, baseId }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}
