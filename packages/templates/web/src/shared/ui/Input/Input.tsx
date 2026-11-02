import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { error, className = '', id, ...rest },
  ref,
) {
  return (
    <div className="flex flex-col gap-1">
      <input
        ref={ref}
        id={id}
        aria-invalid={!!error}
        aria-describedby={error && id ? `${id}-error` : undefined}
        className={`h-10 rounded-md border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? 'border-red-500' : 'border-border'
        } ${className}`}
        {...rest}
      />
      {error && (
        <p id={id ? `${id}-error` : undefined} className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  )
})
