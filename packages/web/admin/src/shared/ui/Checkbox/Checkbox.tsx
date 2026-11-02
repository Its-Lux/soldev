import { forwardRef, type InputHTMLAttributes } from 'react'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className = '', id, ...rest },
  ref,
) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-foreground">
      <input
        ref={ref}
        type="checkbox"
        id={id}
        className={`h-4 w-4 rounded border-border text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
        {...rest}
      />
      {label}
    </label>
  )
})
