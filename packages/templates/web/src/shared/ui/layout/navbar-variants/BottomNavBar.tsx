import { useState, type ReactNode } from 'react'

import type { NavItem } from '../NavBar'

interface BottomNavBarProps {
  items: NavItem[]
  onNavigate?: (href: string) => void
  actions?: ReactNode
}

/**
 * Mobile-optimized bar anchored to the bottom safe area. A group item
 * (children) opens a small card above the bar on tap rather than a hover
 * panel — hover doesn't exist on touch, and a full-height sheet would be
 * overkill for what's usually 2-4 sub-links.
 */
export function BottomNavBar({ items, onNavigate, actions }: BottomNavBarProps) {
  const [openLabel, setOpenLabel] = useState<string | null>(null)

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="relative mx-auto flex max-w-md items-stretch justify-between px-2">
        {items.map((item) => {
          const Icon = item.icon

          if (item.children && item.children.length > 0) {
            const isGroupActive = item.children.some((child) => child.isActive)
            const isOpen = openLabel === item.label
            return (
              <div key={item.label} className="relative flex flex-1">
                {isOpen && (
                  <div className="absolute bottom-full left-1/2 z-10 mb-2 min-w-[9rem] -translate-x-1/2 rounded-lg border border-border bg-background py-1 shadow-lg">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon
                      return (
                        <a
                          key={child.href}
                          href={child.href}
                          aria-current={child.isActive ? 'page' : undefined}
                          onClick={(e) => {
                            setOpenLabel(null)
                            if (onNavigate && child.href) {
                              e.preventDefault()
                              onNavigate(child.href)
                            }
                          }}
                          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors ${
                            child.isActive
                              ? 'bg-surface text-foreground'
                              : 'text-muted-foreground hover:bg-surface hover:text-foreground'
                          }`}
                        >
                          {ChildIcon && <ChildIcon className="h-3.5 w-3.5" aria-hidden="true" />}
                          {child.label}
                        </a>
                      )
                    })}
                  </div>
                )}
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={isOpen}
                  onClick={() => setOpenLabel(isOpen ? null : item.label)}
                  className="flex min-h-11 flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
                >
                  <span className="relative flex items-center justify-center">
                    {Icon && (
                      <Icon
                        className={`h-5 w-5 transition-colors ${
                          isGroupActive || isOpen ? 'text-accent' : 'text-muted-foreground'
                        }`}
                        aria-hidden="true"
                      />
                    )}
                    {isGroupActive && (
                      <span className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-accent" />
                    )}
                  </span>
                  <span className={isGroupActive ? 'text-foreground' : 'text-muted-foreground'}>
                    {item.label}
                  </span>
                </button>
              </div>
            )
          }

          const isActive = item.isActive
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                if (onNavigate && item.href) {
                  e.preventDefault()
                  onNavigate(item.href)
                }
              }}
              aria-current={isActive ? 'page' : undefined}
              className="flex min-h-11 flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
            >
              <span className="relative flex items-center justify-center">
                {Icon && (
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      isActive ? 'text-accent' : 'text-muted-foreground'
                    }`}
                    aria-hidden="true"
                  />
                )}
                {isActive && (
                  <span className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-accent" />
                )}
              </span>
              <span className={isActive ? 'text-foreground' : 'text-muted-foreground'}>
                {item.label}
              </span>
            </a>
          )
        })}
        {actions && <div className="flex min-h-11 items-center justify-center px-2">{actions}</div>}
      </div>
    </nav>
  )
}
