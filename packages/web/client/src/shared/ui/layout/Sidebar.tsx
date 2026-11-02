import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface SidebarItem {
  label: string
  href: string
  isActive?: boolean
  icon?: ReactNode
}

export type SidebarVariant = 'default' | 'compact'

interface SidebarProps {
  items: SidebarItem[]
  onNavigate?: (href: string) => void
  defaultCollapsed?: boolean
  variant?: SidebarVariant
}

export function Sidebar({
  items,
  onNavigate,
  defaultCollapsed = false,
  variant = 'default',
}: SidebarProps) {
  const isCompact = variant === 'compact'
  const [collapsed, setCollapsed] = useState(isCompact ? true : defaultCollapsed)
  const isNarrow = collapsed || isCompact
  const width = isNarrow ? 64 : 224

  return (
    <motion.aside
      animate={{ width }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex h-full flex-col overflow-hidden border-r border-border bg-background"
    >
      {!isCompact && (
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="m-2 self-end rounded-md p-2 text-muted-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {collapsed ? '>' : '<'}
        </button>
      )}
      <nav aria-label="Sidebar" className="flex flex-col gap-1 px-2">
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            aria-current={item.isActive ? 'page' : undefined}
            title={isNarrow ? item.label : undefined}
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault()
                onNavigate(item.href)
              }
            }}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              item.isActive
                ? 'bg-surface text-foreground'
                : 'text-muted-foreground hover:bg-surface hover:text-foreground'
            }`}
          >
            {item.icon}
            <AnimatePresence initial={false}>
              {!isNarrow && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </a>
        ))}
      </nav>
    </motion.aside>
  )
}
