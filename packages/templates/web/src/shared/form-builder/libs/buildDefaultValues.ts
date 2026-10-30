import type { FormSchema, FormValues } from '../types'

/** Starting values: each field's defaultValue, or an empty value of its type. */
export function buildDefaultValues(formSchema: FormSchema): FormValues {
  const defaults: FormValues = {}
  for (const field of formSchema.fields) {
    if (field.defaultValue !== undefined) {
      defaults[field.name] = field.defaultValue
    } else if (field.type === 'checkbox') {
      defaults[field.name] = false
    } else if (field.type === 'number') {
      defaults[field.name] = 0
    } else {
      defaults[field.name] = ''
    }
  }
  return defaults
}
