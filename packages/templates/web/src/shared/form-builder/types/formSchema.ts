// Plain TypeScript types for a form description. A description written in
// code is checked by the compiler. One that arrives at runtime, for example from
// an API, must go through parseFormSchema first, because these types alone do
// not check anything at runtime.

/** Every supported field type. The FieldType union is derived from this list,
 * so the runtime check in parseFormSchema and the type cannot disagree. */
export const FIELD_TYPES = [
  'text',
  'email',
  'password',
  'number',
  'textarea',
  'select',
  'checkbox',
] as const

export type FieldType = (typeof FIELD_TYPES)[number]

export interface FieldOption {
  label: string
  value: string
}

export interface FieldValidation {
  /** Text fields: fewest characters allowed. */
  minLength?: number
  /** Text fields: most characters allowed. */
  maxLength?: number
  /** Number fields: smallest value allowed. */
  min?: number
  /** Number fields: largest value allowed. */
  max?: number
  /** Text fields: a regular expression the whole value must match. */
  pattern?: string
  /** Replaces the default message for every rule on this field. */
  message?: string
}

export interface FieldSchema {
  /** Key of the value in the submitted object. Unique within a form. */
  name: string
  label: string
  type: FieldType
  placeholder?: string
  /** For a checkbox, required means it must be ticked. */
  required?: boolean
  /** Choices for a select field. */
  options?: FieldOption[]
  defaultValue?: string | number | boolean
  validation?: FieldValidation
}

export interface FormSchema {
  id: string
  title?: string
  submitLabel?: string
  fields: FieldSchema[]
}

/** What the form holds and submits, keyed by field name. */
export type FormValues = Record<string, unknown>
