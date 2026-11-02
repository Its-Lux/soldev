import type { ReactNode } from 'react'
import { useDropdownMenuContext } from './DropdownMenuContext'

interface DropdownMenuItemProps {
  children: ReactNode
  onSelect: () => void
  disabled?: boolean
  /** Styles the item as a destructive action, such as Delete. */
  destructive?: boolean
}

export function DropdownMenuItem({
  children,
  onSelect,
  disabled,
  destructive,
}: DropdownMenuItemProps) {
  const { close } = useDropdownMenuContext()

  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      disabled={disabled}
      onClick={() => {
        onSelect()
        close({ restoreFocus: true })
      }}
      className={`block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-surface focus-visible:bg-surface focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
        destructive ? 'text-red-600 dark:text-red-400' : 'text-foreground'
      }`}
    >
      {children}
    </button>
  )
}
