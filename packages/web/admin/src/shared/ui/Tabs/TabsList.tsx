import type { KeyboardEvent, ReactNode } from 'react'

interface TabsListProps {
  children: ReactNode
  label?: string
  className?: string
}

export function TabsList({ children, label, className = '' }: TabsListProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return

    const tabs = Array.from(
      e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'),
    )
    const index = tabs.findIndex((tab) => tab === document.activeElement)
    if (index === -1) return

    const nextIndex =
      e.key === 'ArrowRight' ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length
    const target = tabs[nextIndex]
    if (!target) return

    e.preventDefault()
    target.focus()
    target.click()
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={`flex gap-1 border-b border-border ${className}`}
    >
      {children}
    </div>
  )
}
