import type { ReactNode } from 'react'
import { BottomNavBar, DrawerNavbar, IslandNavbar } from './navbar-variants'
import type { NavItem } from './NavBar'

export type MobileNavVariant = 'drawer' | 'bottom'

interface ResponsiveNavbarProps {
  brand: string
  items: NavItem[]
  actions?: ReactNode
  onNavigate?: (href: string) => void
  mobileVariant?: MobileNavVariant
}

export function ResponsiveNavbar({
  brand,
  items,
  actions,
  onNavigate,
  mobileVariant = 'drawer',
}: ResponsiveNavbarProps) {
  return (
    <>
      <div className="hidden md:block">
        <IslandNavbar brand={brand} items={items} actions={actions} onNavigate={onNavigate} />
      </div>
      <div className="contents md:hidden">
        {mobileVariant === 'bottom' ? (
          <BottomNavBar items={items} actions={actions} onNavigate={onNavigate} />
        ) : (
          <DrawerNavbar brand={brand} items={items} actions={actions} onNavigate={onNavigate} />
        )}
      </div>
    </>
  )
}
