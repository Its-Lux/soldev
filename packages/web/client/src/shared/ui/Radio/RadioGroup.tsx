import { useId, type ReactNode } from 'react'
import { Radio } from './Radio'

export interface RadioOption {
  label: string
  value: string
  disabled?: boolean
}

interface RadioGroupProps {
  name: string
  legend: ReactNode
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  error?: string
  orientation?: 'vertical' | 'horizontal'
}

/**
 * A set of radio buttons with a legend and an error message. Radios that share
 * a name are one tab stop in the browser, and the arrow keys move between them.
 */
export function RadioGroup({
  name,
  legend,
  options,
  value,
  onChange,
  error,
  orientation = 'vertical',
}: RadioGroupProps) {
  const errorId = useId()

  return (
    <fieldset
      role="radiogroup"
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
      className="flex flex-col gap-2"
    >
      <legend className="mb-1 text-sm font-medium text-foreground">{legend}</legend>
      <div
        className={orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'flex flex-col gap-2'}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            disabled={option.disabled}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
        ))}
      </div>
      {error && (
        <p id={errorId} className="text-sm text-red-500">
          {error}
        </p>
      )}
    </fieldset>
  )
}
