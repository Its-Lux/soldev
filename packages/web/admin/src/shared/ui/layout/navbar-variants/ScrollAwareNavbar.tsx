import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { FaSun } from 'react-icons/fa'

import type { NavItem } from '../NavBar'

interface ScrollAwareNavbarProps {
  items: NavItem[]
  brand?: string
  onNavigate?: (href: string) => void
  actions?: ReactNode
}

/**
 * Hides on scroll-down, reappears on scroll-up. Otherwise renders the same
 * items/groups as the production NavBar (hover-panel groups included) —
 * the only difference from NavBar is the scroll-linked show/hide, so that's
 * the only thing this component adds on top of the shared rendering logic.
 */
export function ScrollAwareNavbar({
  items,
  brand = 'Solink',
  onNavigate,
  actions,
}: ScrollAwareNavbarProps) {
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      const scrolledDown = currentY > lastScrollY.current
      const pastThreshold = currentY > 80

      setHidden(scrolledDown && pastThreshold)
      lastScrollY.current = currentY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      animate={{ y: hidden ? '-100%' : '0%' }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <FaSun className="h-5 w-5 text-accent" aria-hidden="true" />
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
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      isGroupActive
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
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
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  item.isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                {item.label}
              </a>
            )
          })}
        </nav>
        {actions && <div className="ml-2 flex items-center gap-2">{actions}</div>}
      </div>
    </motion.header>
  )
}
