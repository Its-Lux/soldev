import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

import type { IconType } from 'react-icons'

export interface NavItem {
  label: string
  href?: string
  icon?: IconType
  isActive?: boolean
  children?: NavItem[]
}

export type NavBarVariant = 'default' | 'centered'

interface NavBarProps {
  brand: ReactNode
  items: NavItem[]
  actions?: ReactNode
  onNavigate?: (href: string) => void
  variant?: NavBarVariant
}

export function NavBar({ brand, items, actions, onNavigate, variant = 'default' }: NavBarProps) {
  const navLinks = (
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
                className={`relative flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isGroupActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isGroupActive && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-md bg-surface"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                {Icon && <Icon className="relative h-4 w-4" aria-hidden="true" />}
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
                layoutId="nav-active-pill"
                className="absolute inset-0 rounded-md bg-surface"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            {Icon && <Icon className="relative h-4 w-4" aria-hidden="true" />}
            <span className="relative">{item.label}</span>
          </a>
        )
      })}
    </nav>
  )

  return (
    <header className="border-b border-border bg-background">
      <div
        className={`mx-auto flex h-14 max-w-6xl items-center px-4 ${
          variant === 'centered' ? 'grid grid-cols-3' : 'justify-between'
        }`}
      >
        <div className="font-semibold text-foreground">{brand}</div>
        {variant === 'centered' ? <div className="flex justify-center">{navLinks}</div> : navLinks}
        {actions && (
          <div className={`flex items-center gap-2 ${variant === 'centered' ? 'justify-end' : ''}`}>
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}
