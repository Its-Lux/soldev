import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { Footer, ThemeToggle } from '@/shared/ui'
import { ResponsiveNavbar, type MobileNavVariant } from '@/shared/ui/layout'
import { useFullBleed } from '@/app/router/useFullBleed'
// plop:nav-icon-import
import { FaMapLocation } from 'react-icons/fa6'
import { FaHome, FaBook } from 'react-icons/fa'

// 'drawer' = hamburger and slide-in menu, 'bottom' = fixed bottom bar
const mobileVariant: MobileNavVariant = 'bottom'

// A fixed bottom bar sits over the page, so reserve its height below md
const bottomInset =
  mobileVariant === 'bottom' ? 'max-md:pb-[calc(3.75rem_+_env(safe-area-inset-bottom,0px))]' : ''

export function Layout() {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const fullBleed = useFullBleed()

  const items = [
    { label: 'Home', href: '/todos', icon: FaHome, isActive: pathname === '/todos' },
    // NOTE: Do not remove the following line. It is used by plop to add new navigation links.
    // plop:nav-link
    { label: 'Sites', href: '/sites', icon: FaMapLocation, isActive: pathname === '/sites' },
    ...(import.meta.env.DEV
      ? [{ label: 'Guide', href: '/guide', icon: FaBook, isActive: pathname === '/guide' }]
      : []),
  ]

  // Full-bleed pages fill the window exactly and run under the floating
  // navbar; the page itself never scrolls, its panels do.
  const shell = fullBleed ? 'h-dvh overflow-hidden' : 'min-h-screen'
  const mainSpacing = fullBleed ? 'relative flex min-h-0 flex-col' : 'pt-6 md:pt-24'

  return (
    <div className={`flex flex-col bg-background text-foreground ${shell}`}>
      <ResponsiveNavbar
        brand="Soldev UI"
        items={items}
        actions={<ThemeToggle />}
        mobileVariant={mobileVariant}
        onNavigate={(href) => navigate({ to: href })}
      />
      <main className={`flex-1 ${mainSpacing} ${bottomInset}`}>
        <Outlet />
      </main>
      {!fullBleed && (
        <Footer copyright={`\u00a9 ${new Date().getFullYear()} Soldev UI`} hideOnMobile />
      )}
    </div>
  )
}
