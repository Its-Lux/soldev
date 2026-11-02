import type { ReactNode } from 'react'
import { FaSun } from 'react-icons/fa'

import type { NavItem } from '../NavBar'

interface IslandNavbarProps {
  brand: ReactNode
  items: NavItem[]
  actions?: ReactNode
  onNavigate?: (href: string) => void
}

export function IslandNavbar({ brand, items, actions, onNavigate }: IslandNavbarProps) {
  return (
    <div className="fixed left-1/2 top-4 z-50 w-[min(92vw,44rem)] -translate-x-1/2">
      <nav
        aria-label="Main"
        className="flex items-center justify-between gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-2 shadow-lg shadow-black/5 backdrop-blur-md"
      >
        <div className="flex items-center gap-1.5 px-2 text-sm font-semibold text-foreground">
          <FaSun className="h-4 w-4 text-accent" aria-hidden="true" />
          {brand}
        </div>

        <div className="flex items-center gap-1">
          {items.map((item) => {
            const Icon = item.icon

            if (item.children && item.children.length > 0) {
              const isGroupActive = item.children.some((child) => child.isActive)
              return (
                <div key={item.label} className="group relative">
                  <button
                    type="button"
                    aria-haspopup="true"
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      isGroupActive
                        ? 'bg-surface text-foreground'
                        : 'text-muted-foreground hover:bg-surface/60 hover:text-foreground'
                    }`}
                  >
                    {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                  <div className="invisible absolute left-1/2 top-full z-10 mt-2 min-w-[10rem] -translate-x-1/2 rounded-xl border border-border bg-background/95 py-1 opacity-0 shadow-lg backdrop-blur-md transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
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
                          <span>{child.label}</span>
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
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  item.isActive
                    ? 'bg-surface text-foreground'
                    : 'text-muted-foreground hover:bg-surface/60 hover:text-foreground'
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
                <span className="hidden sm:inline">{item.label}</span>
              </a>
            )
          })}
        </div>
        {actions && <div className="flex items-center pl-1">{actions}</div>}
      </nav>
    </div>
  )
}
