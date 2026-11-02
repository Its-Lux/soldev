import type { ReactNode } from 'react'

interface CardProps {
  title?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
}

export function Card({ title, footer, children, className = '' }: CardProps) {
  return (
    <div className={`rounded-lg border border-border bg-background ${className}`}>
      {title && (
        <div className="border-b border-border px-4 py-3 font-semibold text-foreground">
          {title}
        </div>
      )}
      <div className="px-4 py-4">{children}</div>
      {footer && <div className="border-t border-border px-4 py-3">{footer}</div>}
    </div>
  )
}
