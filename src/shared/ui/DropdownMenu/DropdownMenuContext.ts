import { createContext, useContext } from 'react'

export interface DropdownMenuContextValue {
  close: (options?: { restoreFocus?: boolean }) => void
}

export const DropdownMenuContext = createContext<DropdownMenuContextValue | undefined>(undefined)

export function useDropdownMenuContext() {
  const ctx = useContext(DropdownMenuContext)
  if (!ctx) throw new Error('DropdownMenu.Item must be used within <DropdownMenu>')
  return ctx
}
