import { createContext, useContext } from 'react'

export interface TabsContextValue {
  value: string
  setValue: (value: string) => void
  baseId: string
}

export const TabsContext = createContext<TabsContextValue | undefined>(undefined)

export function useTabsContext() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>')
  return ctx
}
