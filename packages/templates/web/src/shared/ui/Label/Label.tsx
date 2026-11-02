import type { LabelHTMLAttributes } from 'react'

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export function Label({ required, children, className = '', ...rest }: LabelProps) {
  return (
    <label className={`text-sm font-medium text-foreground ${className}`} {...rest}>
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  )
}
