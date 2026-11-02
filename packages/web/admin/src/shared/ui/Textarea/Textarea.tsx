import { forwardRef, type TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { error, className = '', id, rows = 4, ...rest },
  ref,
) {
  return (
    <div className="flex flex-col gap-1">
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={error && id ? `${id}-error` : undefined}
        className={`rounded-md border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 ${
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
