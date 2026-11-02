import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { IconType } from 'react-icons'
import { FaSun } from 'react-icons/fa'

import type { NavItem } from '../NavBar'

interface ClassicTopBarProps {
  items: NavItem[]
  brand?: string
  onNavigate?: (href: string) => void
  onSignIn?: () => void
  onGetStarted?: () => void
  Icon?: IconType
  actions?: ReactNode
}

/**
 * The standard full-width header: brand fixed to the left, primary nav
 * centered, calls-to-action fixed to the right. Group items render the
 * same hover-panel pattern as the production NavBar, since this is just
 * NavBar's layout with two extra CTA buttons — not a different
 * interaction model.
 */
export function ClassicTopBar({
  items,
  brand = 'Solink',
  onNavigate,
  onSignIn,
  onGetStarted,
  Icon = FaSun,
  actions,
}: ClassicTopBarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
          {brand}
        </div>

        <nav aria-label="Main" className="relative flex items-center gap-1">
          {items.map((item) => {
            const ItemIcon = item.icon

            if (item.children && item.children.length > 0) {
              const isGroupActive = item.children.some((child) => child.isActive)
              return (
                <div key={item.label} className="group relative">
                  <button
                    type="button"
                    aria-haspopup="true"
                    className={`relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      isGroupActive
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isGroupActive && (
                      <motion.span
                        layoutId="classic-nav-active-pill"
                        className="absolute inset-0 rounded-md bg-surface"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    {ItemIcon && <ItemIcon className="relative h-4 w-4" aria-hidden="true" />}
                    <span className="relative">{item.label}</span>
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
                className={`relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  item.isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.isActive && (
                  <motion.span
                    layoutId="classic-nav-active-pill"
                    className="absolute inset-0 rounded-md bg-surface"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                {ItemIcon && <ItemIcon className="relative h-4 w-4" aria-hidden="true" />}
                <span className="relative">{item.label}</span>
              </a>
            )
          })}
        </nav>

        <div className="flex items-center justify-end gap-3">
          {actions}
          <button
            type="button"
            onClick={onSignIn}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={onGetStarted}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Request a quote
          </button>
        </div>
      </div>
    </header>
  )
}
