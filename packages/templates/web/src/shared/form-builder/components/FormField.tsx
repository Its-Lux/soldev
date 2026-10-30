import type { AnyFieldApi } from '@tanstack/react-form'
import { Label } from '../../ui/Label'
import { fieldRegistry } from './fieldRegistry'
import type { FieldSchema } from '../types'

interface FormFieldProps {
  fieldSchema: FieldSchema
  field: AnyFieldApi
}

/** One labelled field: the label, the registered input for its type, and its
 * first error. */
export function FormField({ fieldSchema, field }: FormFieldProps) {
  const firstError: unknown = field.state.meta.errors[0]
  const errorMessage = typeof firstError === 'string' ? firstError : undefined
  const renderField = fieldRegistry[fieldSchema.type]

  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={fieldSchema.name} required={fieldSchema.required}>
        {fieldSchema.label}
      </Label>
      {renderField({ fieldSchema, field, errorMessage })}
    </div>
  )
}
