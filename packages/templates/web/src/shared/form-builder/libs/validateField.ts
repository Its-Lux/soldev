import type { FieldSchema } from '../types'

// Deliberately simple. It catches typing mistakes, not every address the
// standard allows. The server must validate the address for real.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isEmptyNumber = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  value === '' ||
  (typeof value === 'number' && Number.isNaN(value))

/**
 * Checks one field's value against its description. Returns a message to show,
 * or undefined when the value is valid. Runs on every change, and on submit for
 * fields the person never touched.
 */
export function validateField(field: FieldSchema, value: unknown): string | undefined {
  const rules = field.validation
  const custom = rules?.message

  if (field.type === 'checkbox') {
    return field.required && value !== true ? (custom ?? 'Required') : undefined
  }

  if (field.type === 'number') {
    // An emptied number input reports NaN, which counts as empty.
    if (isEmptyNumber(value)) return field.required ? (custom ?? 'Required') : undefined
    if (typeof value !== 'number') return custom ?? 'Enter a number'
    if (rules?.min !== undefined && value < rules.min)
      return custom ?? `Must be at least ${rules.min}`
    if (rules?.max !== undefined && value > rules.max)
      return custom ?? `Must be at most ${rules.max}`
    return undefined
  }

  const text = value === undefined || value === null ? '' : String(value)

  if (text === '') return field.required ? (custom ?? 'Required') : undefined

  if (field.type === 'email') {
    return EMAIL_PATTERN.test(text) ? undefined : (custom ?? 'Enter a valid email')
  }

  if (rules?.minLength !== undefined && text.length < rules.minLength) {
    return custom ?? `Must be at least ${rules.minLength} characters`
  }
  if (rules?.maxLength !== undefined && text.length > rules.maxLength) {
    return custom ?? `Must be at most ${rules.maxLength} characters`
  }
  if (rules?.pattern !== undefined && !new RegExp(rules.pattern).test(text)) {
    return custom ?? 'Invalid format'
  }
  return undefined
}
