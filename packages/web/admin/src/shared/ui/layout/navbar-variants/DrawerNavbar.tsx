import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FaAngleDown, FaBars, FaSun, FaTimes } from 'react-icons/fa'

import type { NavItem } from '../NavBar'

interface DrawerNavbarProps {
  items: NavItem[]
  brand?: string
  onNavigate?: (href: string) => void
  actions?: ReactNode
}

/**
 * Compact header with a hamburger trigger opening a right-side drawer.
 * A group renders as an inline accordion inside the drawer (mobile menus
 * don't have room for a hover or side-flyout panel) — tapping a group
 * expands its children in place; tapping a leaf link navigates and closes
 * the whole drawer.
 */
export function DrawerNavbar({ items, brand = 'Solink', onNavigate, actions }: DrawerNavbarProps) {
  const [open, setOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  const closeDrawer = () => {
    setOpen(false)
    setOpenGroup(null)
  }

  return (
    <>
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background px-4">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <FaSun className="h-5 w-5 text-accent" aria-hidden="true" />
          {brand}
        </div>
        <div className="flex items-center gap-1">
          {actions}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="rounded-md p-2 text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <FaBars className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 z-40 bg-black/40"
              aria-hidden="true"
            />
            <motion.div
              key="drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col border-l border-border bg-background"
            >
              <div className="flex h-16 items-center justify-between border-b border-border px-4">
                <span className="font-semibold text-foreground">Menu</span>
                <button
                  type="button"
                  onClick={closeDrawer}
                  aria-label="Close menu"
                  className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <FaTimes className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto p-3">
                {items.map((item) => {
                  const Icon = item.icon

                  if (item.children && item.children.length > 0) {
                    const isOpen = openGroup === item.label
                    return (
                      <div key={item.label}>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => setOpenGroup(isOpen ? null : item.label)}
                          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                          {Icon && (
                            <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                          )}
                          <span className="flex-1 text-left">{item.label}</span>
                          <FaAngleDown
                            className={`h-3 w-3 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                          />
                        </button>
                        {isOpen && (
                          <div className="ml-4 space-y-1 border-l border-border pl-3">
                            {item.children.map((child) => {
                              const ChildIcon = child.icon
                              return (
                                <a
                                  key={child.href}
                                  href={child.href}
                                  onClick={(e) => {
                                    closeDrawer()
                                    if (onNavigate && child.href) {
                                      e.preventDefault()
                                      onNavigate(child.href)
                                    }
                                  }}
                                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                >
                                  {ChildIcon && (
                                    <ChildIcon className="h-3.5 w-3.5" aria-hidden="true" />
                                  )}
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
                      onClick={(e) => {
                        closeDrawer()
                        if (onNavigate && item.href) {
                          e.preventDefault()
                          onNavigate(item.href)
                        }
                      }}
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {Icon && (
                        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      )}
                      {item.label}
                    </a>
                  )
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
