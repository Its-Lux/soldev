import { useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleDown, FaSun } from 'react-icons/fa'

import type { NavItem } from '../NavBar'

interface CollapsibleSidebarProps {
  items: NavItem[]
  brand?: string
  onNavigate?: (href: string) => void
  actions?: ReactNode
}

/**
 * Left-aligned navigation rail. When expanded, a group renders as an
 * inline accordion (click toggles its children indented beneath it) —
 * the natural sidebar pattern. When collapsed to icons-only, a group
 * instead opens a flyout to the right on click, since there's no room
 * for an inline accordion at 72px wide.
 */
export function CollapsibleSidebar({
  items,
  brand = 'Solink',
  onNavigate,
  actions,
}: CollapsibleSidebarProps) {
  const [expanded, setExpanded] = useState(true)
  const [openLabel, setOpenLabel] = useState<string | null>(null)

  const handleClick = (href: string | undefined, onClose?: () => void) => (e: MouseEvent) => {
    onClose?.()
    if (onNavigate && href) {
      e.preventDefault()
      onNavigate(href)
    }
  }

  return (
    <motion.aside
      animate={{ width: expanded ? 220 : 72 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-background"
    >
      <div className="flex h-16 items-center gap-2 overflow-hidden border-b border-border px-4 font-semibold text-foreground">
        <FaSun className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
        {expanded && <span className="whitespace-nowrap">{brand}</span>}
      </div>

      <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const Icon = item.icon

          if (item.children && item.children.length > 0) {
            const isGroupActive = item.children.some((child) => child.isActive)
            const isOpen = openLabel === item.label

            return (
              <div key={item.label} className="relative">
                <button
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={isOpen}
                  onClick={() => setOpenLabel(isOpen ? null : item.label)}
                  className={`flex w-full items-center gap-3 overflow-hidden rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isGroupActive
                      ? 'bg-surface text-foreground'
                      : 'text-muted-foreground hover:bg-surface/60 hover:text-foreground'
                  }`}
                  title={!expanded ? item.label : undefined}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
                  {expanded && (
                    <>
                      <span className="flex-1 whitespace-nowrap text-left">{item.label}</span>
                      <FaAngleDown
                        className={`h-3 w-3 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      />
                    </>
                  )}
                </button>

                {expanded && isOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon
                      return (
                        <a
                          key={child.href}
                          href={child.href}
                          aria-current={child.isActive ? 'page' : undefined}
                          onClick={handleClick(child.href)}
                          className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                            child.isActive
                              ? 'text-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {ChildIcon && <ChildIcon className="h-3.5 w-3.5" aria-hidden="true" />}
                          {child.label}
                        </a>
                      )
                    })}
                  </div>
                )}

                {!expanded && isOpen && (
                  <div className="absolute left-full top-0 z-10 ml-2 min-w-[10rem] rounded-lg border border-border bg-background py-1 shadow-lg">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon
                      return (
                        <a
                          key={child.href}
                          href={child.href}
                          aria-current={child.isActive ? 'page' : undefined}
                          onClick={handleClick(child.href, () => setOpenLabel(null))}
                          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
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
              </div>
            )
          }

          return (
            <a
              key={item.href}
              href={item.href}
              aria-current={item.isActive ? 'page' : undefined}
              onClick={handleClick(item.href)}
              className={`flex items-center gap-3 overflow-hidden rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                item.isActive
                  ? 'bg-surface text-foreground'
                  : 'text-muted-foreground hover:bg-surface/60 hover:text-foreground'
              }`}
              title={!expanded ? item.label : undefined}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
              {expanded && <span className="whitespace-nowrap">{item.label}</span>}
            </a>
          )
        })}
      </nav>

      {actions && (
        <div
          className={`flex border-t border-border p-3 ${expanded ? 'justify-start' : 'justify-center'}`}
        >
          {actions}
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setExpanded((v) => !v)
          setOpenLabel(null)
        }}
        aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        className="flex items-center gap-2 border-t border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
      >
        {expanded ? (
          <FaAngleDoubleLeft className="h-4 w-4" aria-hidden="true" />
        ) : (
          <FaAngleDoubleRight className="h-4 w-4" aria-hidden="true" />
        )}
        {expanded && <span>Collapse</span>}
      </button>
    </motion.aside>
  )
}
