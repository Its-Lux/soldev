import { useEffect, useState, type ReactNode } from 'react'
import { FaSun } from 'react-icons/fa'

import type { NavItem } from '../NavBar'

interface TransparentToSolidNavbarProps {
  items: NavItem[]
  brand?: string
  onNavigate?: (href: string) => void
  actions?: ReactNode
  /** Scroll distance (px) after which the bar solidifies. */
  threshold?: number
}

/**
 * Starts transparent over a hero, solidifies past a scroll threshold.
 * Group dropdown panels always render on a solid background regardless of
 * the bar's own transparency state — legibility for menu content matters
 * more than visual consistency with a bar that might be see-through.
 */
export function TransparentToSolidNavbar({
  items,
  brand = 'Solink',
  onNavigate,
  actions,
  threshold = 240,
}: TransparentToSolidNavbarProps) {
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    const handleScroll = () => setSolid(window.scrollY > threshold)
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid
          ? 'border-b border-border bg-background/80 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div
          className={`flex items-center gap-2 font-semibold transition-colors duration-300 ${
            solid ? 'text-foreground' : 'text-white'
          }`}
        >
          <FaSun className={`h-5 w-5 ${solid ? 'text-accent' : 'text-white'}`} aria-hidden="true" />
          {brand}
        </div>

        <nav aria-label="Main" className="relative flex items-center gap-1">
          {items.map((item) => {
            const Icon = item.icon

            if (item.children && item.children.length > 0) {
              const isGroupActive = item.children.some((child) => child.isActive)
              return (
                <div key={item.label} className="group relative">
                  <button
                    type="button"
                    aria-haspopup="true"
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      solid
                        ? isGroupActive
                          ? 'text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                        : 'text-white/90 hover:text-white'
                    }`}
                  >
                    {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                    {item.label}
                  </button>
                  <div className="invisible absolute left-0 top-full z-10 min-w-[10rem] rounded-md border border-border bg-background py-1 opacity-0 shadow-md transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
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
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  solid
                    ? item.isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                    : 'text-white/90 hover:text-white'
                }`}
              >
                {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                {item.label}
              </a>
            )
          })}
        </nav>
        {actions && (
          <div className={`ml-2 flex items-center gap-2 ${solid ? '' : 'text-white'}`}>
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}
