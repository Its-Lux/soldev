import type { ReactNode } from 'react'

export interface FooterLink {
  label: string
  href: string
}

export interface FooterColumn {
  heading: string
  links: FooterLink[]
}

export type FooterVariant = 'default' | 'columns'

interface FooterProps {
  copyright: string
  links?: FooterLink[]
  columns?: FooterColumn[]
  extra?: ReactNode
  variant?: FooterVariant
  /** Hide the footer below the md breakpoint, for layouts where a mobile nav takes its place. */
  hideOnMobile?: boolean
}

export function Footer({
  copyright,
  links,
  columns,
  extra,
  variant = 'default',
  hideOnMobile = false,
}: FooterProps) {
  const visibility = hideOnMobile ? 'max-md:hidden' : ''

  if (variant === 'columns' && columns && columns.length > 0) {
    return (
      <footer className={`border-t border-border bg-background ${visibility}`}>
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.heading}>
                <h3 className="text-sm font-semibold text-foreground">{col.heading}</h3>
                <ul className="mt-3 flex flex-col gap-2">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
            <span>{copyright}</span>
            {extra}
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className={`border-t border-border bg-background ${visibility}`}>
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
        <span>{copyright}</span>
        {links && links.length > 0 && (
          <nav aria-label="Footer" className="flex gap-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
        {extra}
      </div>
    </footer>
  )
}
