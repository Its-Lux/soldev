import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FaSun } from 'react-icons/fa'

import type { NavItem } from '../NavBar'

interface MegaMenuNavbarProps {
  items: NavItem[]
  brand?: string
  onNavigate?: (href: string) => void
  actions?: ReactNode
  /** Max children per column before wrapping into an additional column. */
  itemsPerColumn?: number
}

/**
 * Same NavItem/onNavigate contract as every other variant: an item with
 * children becomes a mega-trigger, auto-laid-out into columns of
 * `itemsPerColumn` (default 4) rather than requiring a bespoke
 * columns/featured-card data shape. This trades away the richer
 * multi-category-with-descriptions layout from the original design brief
 * in exchange for working unchanged with Layout.tsx's existing flat items
 * array — if the richer layout matters more than drop-in compatibility,
 * that's a real design call worth revisiting deliberately, not something
 * to silently keep half-supporting here.
 */
export function MegaMenuNavbar({
  items,
  brand = 'Solink',
  onNavigate,
  actions,
  itemsPerColumn = 4,
}: MegaMenuNavbarProps) {
  const [openLabel, setOpenLabel] = useState<string | null>(null)

  const chunk = (list: NavItem[]) => {
    const columns: NavItem[][] = []
    for (let i = 0; i < list.length; i += itemsPerColumn) {
      columns.push(list.slice(i, i + itemsPerColumn))
    }
    return columns
  }

  return (
    <header
      className="sticky top-0 z-50 border-b border-border bg-background"
      onMouseLeave={() => setOpenLabel(null)}
    >
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <FaSun className="h-5 w-5 text-accent" aria-hidden="true" />
          {brand}
        </div>

        <nav aria-label="Main" className="flex items-center gap-1">
          {items.map((item) => {
            const Icon = item.icon

            if (item.children && item.children.length > 0) {
              const isGroupActive = item.children.some((child) => child.isActive)
              return (
                <button
                  key={item.label}
                  type="button"
                  onMouseEnter={() => setOpenLabel(item.label)}
                  onClick={() => setOpenLabel((cur) => (cur === item.label ? null : item.label))}
                  aria-expanded={openLabel === item.label}
                  aria-haspopup="true"
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    openLabel === item.label || isGroupActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                  {item.label}
                </button>
              )
            }

            return (
              <a
                key={item.href}
                href={item.href}
                onMouseEnter={() => setOpenLabel(null)}
                onClick={(e) => {
                  if (onNavigate && item.href) {
                    e.preventDefault()
                    onNavigate(item.href)
                  }
                }}
                aria-current={item.isActive ? 'page' : undefined}
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

      <AnimatePresence>
        {items.map(
          (item) =>
            item.children &&
            item.children.length > 0 &&
            openLabel === item.label && (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-x-0 top-full border-b border-border bg-background shadow-lg"
              >
                <div className="mx-auto max-w-6xl px-6 py-6">
                  <div className="grid auto-cols-fr grid-flow-col gap-8">
                    {chunk(item.children).map((column, columnIndex) => (
                      <ul key={columnIndex} className="space-y-3">
                        {column.map((child) => {
                          const ChildIcon = child.icon
                          return (
                            <li key={child.href}>
                              <a
                                href={child.href}
                                onClick={(e) => {
                                  setOpenLabel(null)
                                  if (onNavigate && child.href) {
                                    e.preventDefault()
                                    onNavigate(child.href)
                                  }
                                }}
                                aria-current={child.isActive ? 'page' : undefined}
                                className="group flex items-center gap-2 focus-visible:outline-none"
                              >
                                {ChildIcon && (
                                  <ChildIcon
                                    className="h-4 w-4 shrink-0 text-accent"
                                    aria-hidden="true"
                                  />
                                )}
                                <span
                                  className={`text-sm font-medium group-hover:underline ${
                                    child.isActive ? 'text-foreground' : 'text-foreground'
                                  }`}
                                >
                                  {child.label}
                                </span>
                              </a>
                            </li>
                          )
                        })}
                      </ul>
                    ))}
                  </div>
                </div>
              </motion.div>
            ),
        )}
      </AnimatePresence>
    </header>
  )
}
