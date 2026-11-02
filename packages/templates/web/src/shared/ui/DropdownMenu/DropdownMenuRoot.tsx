import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { Button } from '../Button'
import { DropdownMenuContext } from './DropdownMenuContext'

interface DropdownMenuRootProps {
  /** The trigger button's content. */
  label: ReactNode
  children: ReactNode
  align?: 'start' | 'end'
}

const getEnabledItems = (menu: HTMLElement | null): HTMLElement[] =>
  Array.from(menu?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? [])

/**
 * A menu button following the ARIA menu button pattern. Opening moves focus to
 * the first item (or the last, when opened with the up arrow). Arrow keys, Home
 * and End move between enabled items, Escape closes and returns focus to the
 * trigger, and Tab or a click outside closes.
 *
 * The menu is positioned below the trigger with no collision detection, so near
 * a screen edge use align="end" or move it to a layout with more room.
 */
export function DropdownMenuRoot({ label, children, align = 'start' }: DropdownMenuRootProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const startAt = useRef<'first' | 'last'>('first')
  const triggerId = useId()
  const menuId = useId()

  const close = useCallback((options?: { restoreFocus?: boolean }) => {
    setOpen(false)
    if (options?.restoreFocus) triggerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    const items = getEnabledItems(menuRef.current)
    const target = startAt.current === 'last' ? items[items.length - 1] : items[0]
    target?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      startAt.current = event.key === 'ArrowUp' ? 'last' : 'first'
      setOpen(true)
    }
  }

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = getEnabledItems(menuRef.current)
    const index = items.findIndex((item) => item === document.activeElement)
    const last = items.length - 1

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        items[index === -1 ? 0 : (index + 1) % items.length]?.focus()
        break
      case 'ArrowUp':
        event.preventDefault()
        items[index === -1 ? last : (index - 1 + items.length) % items.length]?.focus()
        break
      case 'Home':
        event.preventDefault()
        items[0]?.focus()
        break
      case 'End':
        event.preventDefault()
        items[last]?.focus()
        break
      case 'Escape':
        event.preventDefault()
        close({ restoreFocus: true })
        break
      case 'Tab':
        close()
        break
    }
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <Button
        ref={triggerRef}
        id={triggerId}
        variant="outline"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          startAt.current = 'first'
          setOpen((current) => !current)
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        {label}
      </Button>
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-labelledby={triggerId}
          onKeyDown={handleMenuKeyDown}
          className={`absolute z-20 mt-1 min-w-[10rem] rounded-md border border-border bg-background py-1 shadow-md ${
            align === 'end' ? 'right-0' : 'left-0'
          }`}
        >
          <DropdownMenuContext.Provider value={{ close }}>{children}</DropdownMenuContext.Provider>
        </div>
      )}
    </div>
  )
}
