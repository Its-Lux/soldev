import { forwardRef, type InputHTMLAttributes } from 'react'

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, className = '', id, ...rest },
  ref,
) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-foreground">
      <input
        ref={ref}
        type="radio"
        id={id}
        className={`h-4 w-4 border-border text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...rest}
      />
      {label}
    </label>
  )
})
