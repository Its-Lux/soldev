import { forwardRef, type ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-foreground hover:opacity-90',
  secondary: 'bg-surface text-foreground hover:bg-border',
  outline: 'border border-border bg-transparent text-foreground hover:bg-surface',
  ghost: 'bg-transparent text-foreground hover:bg-surface',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled,
    className = '',
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {isLoading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
})
