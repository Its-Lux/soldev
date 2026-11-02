import type { ReactNode } from 'react'
import { FaSun } from 'react-icons/fa'

import type { NavItem } from '../NavBar'

interface SplitNavbarProps {
  items: NavItem[]
  brand?: string
  onNavigate?: (href: string) => void
  actions?: ReactNode
}

/**
 * Symmetric layout: the brand mark sits dead-center, with items split
 * evenly on either side. Takes a single flat `items` array (matching every
 * other variant's contract) and auto-splits at the midpoint, rather than
 * requiring the caller to pre-split into two arrays — Layout.tsx's
 * existing items array works here unchanged.
 */
export function SplitNavbar({ items, brand = 'SOLINK', onNavigate, actions }: SplitNavbarProps) {
  const midpoint = Math.ceil(items.length / 2)
  const leftItems = items.slice(0, midpoint)
  const rightItems = items.slice(midpoint)

  const renderItem = (item: NavItem) => {
    const Icon = item.icon

    if (item.children && item.children.length > 0) {
      const isGroupActive = item.children.some((child) => child.isActive)
      return (
        <div key={item.label} className="group relative">
          <button
            type="button"
            aria-haspopup="true"
            className={`flex items-center gap-1.5 text-sm font-medium tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              isGroupActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
            {item.label}
          </button>
          <div className="invisible absolute left-1/2 top-full z-10 mt-2 min-w-[10rem] -translate-x-1/2 rounded-md border border-border bg-background py-1 opacity-0 shadow-md transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
            {item.children.map((child) => {
              const ChildIcon = child.icon
              return (
                <a
                  key={child.href}
                  href={child.href}
                  aria-current={child.isActive ? 'page' : undefined}
                  onClick={(e) => {
                    if (onNavigate && child.href) {
                      e.preventDefault()
                      onNavigate(child.href)
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                    child.isActive
                      ? 'bg-surface text-foreground'
                      : 'text-muted-foreground hover:bg-surface hover:text-foreground'
                  }`}
                >
                  {ChildIcon && <ChildIcon className="h-4 w-4" aria-hidden="true" />}
                  {child.label}
                </a>
              )
            })}
          </div>
        </div>
      )
    }

    return (
      <a
        key={item.href}
        href={item.href}
        aria-current={item.isActive ? 'page' : undefined}
        onClick={(e) => {
          if (onNavigate && item.href) {
            e.preventDefault()
            onNavigate(item.href)
          }
        }}
        className={`flex items-center gap-1.5 text-sm font-medium tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          item.isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
        {item.label}
      </a>
    )
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6">
        <nav aria-label="Primary" className="flex items-center justify-end gap-8">
          {leftItems.map(renderItem)}
        </nav>

        <div className="flex items-center justify-center gap-2 px-8 font-semibold text-foreground">
          <FaSun className="h-5 w-5 text-accent" aria-hidden="true" />
          <span className="tracking-[0.15em]">{brand}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <nav aria-label="Secondary" className="flex items-center justify-start gap-8">
            {rightItems.map(renderItem)}
          </nav>
          {actions}
        </div>
      </div>
    </header>
  )
}
