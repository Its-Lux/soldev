import {
  FIELD_TYPES,
  type FieldOption,
  type FieldSchema,
  type FieldType,
  type FieldValidation,
  type FormSchema,
} from '../types'

/** Thrown by parseFormSchema. issues lists every problem found, each with its
 * path, for example "fields[2].type: must be one of text, email, ...". */
export class FormSchemaError extends Error {
  readonly issues: string[]

  constructor(issues: string[]) {
    super(`Invalid form schema:\n- ${issues.join('\n- ')}`)
    this.name = 'FormSchemaError'
    this.issues = issues
  }
}

export type FormSchemaResult = { ok: true; schema: FormSchema } | { ok: false; issues: string[] }

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isFieldType = (value: unknown): value is FieldType =>
  typeof value === 'string' && (FIELD_TYPES as readonly string[]).includes(value)

// Each reader records a problem in issues and returns undefined, rather than
// throwing, so one pass reports everything wrong with a description.

function requiredString(
  obj: UnknownRecord,
  key: string,
  path: string,
  issues: string[],
): string | undefined {
  const value = obj[key]
  if (typeof value !== 'string' || value.trim() === '') {
    issues.push(`${path}.${key}: must be a non-empty string`)
    return undefined
  }
  return value
}

function optionalString(
  obj: UnknownRecord,
  key: string,
  path: string,
  issues: string[],
): string | undefined {
  const value = obj[key]
  if (value === undefined) return undefined
  if (typeof value !== 'string') {
    issues.push(`${path}.${key}: must be a string`)
    return undefined
  }
  return value
}

function optionalNumber(
  obj: UnknownRecord,
  key: string,
  path: string,
  issues: string[],
): number | undefined {
  const value = obj[key]
  if (value === undefined) return undefined
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    issues.push(`${path}.${key}: must be a number`)
    return undefined
  }
  return value
}

function optionalBoolean(
  obj: UnknownRecord,
  key: string,
  path: string,
  issues: string[],
): boolean | undefined {
  const value = obj[key]
  if (value === undefined) return undefined
  if (typeof value !== 'boolean') {
    issues.push(`${path}.${key}: must be true or false`)
    return undefined
  }
  return value
}

function readValidation(
  value: unknown,
  path: string,
  issues: string[],
): FieldValidation | undefined {
  if (value === undefined) return undefined
  if (!isRecord(value)) {
    issues.push(`${path}: must be an object`)
    return undefined
  }
  const minLength = optionalNumber(value, 'minLength', path, issues)
  const maxLength = optionalNumber(value, 'maxLength', path, issues)
  const min = optionalNumber(value, 'min', path, issues)
  const max = optionalNumber(value, 'max', path, issues)
  const message = optionalString(value, 'message', path, issues)
  let pattern = optionalString(value, 'pattern', path, issues)
  if (pattern !== undefined) {
    // An invalid pattern would otherwise throw while the person types.
    try {
      new RegExp(pattern)
    } catch {
      issues.push(`${path}.pattern: is not a valid regular expression`)
      pattern = undefined
    }
  }
  return {
    ...(minLength !== undefined && { minLength }),
    ...(maxLength !== undefined && { maxLength }),
    ...(min !== undefined && { min }),
    ...(max !== undefined && { max }),
    ...(pattern !== undefined && { pattern }),
    ...(message !== undefined && { message }),
  }
}

function readOptions(value: unknown, path: string, issues: string[]): FieldOption[] | undefined {
  if (value === undefined) return undefined
  if (!Array.isArray(value)) {
    issues.push(`${path}: must be an array`)
    return undefined
  }
  const options: FieldOption[] = []
  value.forEach((item: unknown, index) => {
    const itemPath = `${path}[${index}]`
    if (!isRecord(item)) {
      issues.push(`${itemPath}: must be an object`)
      return
    }
    const label = optionalString(item, 'label', itemPath, issues)
    const optionValue = optionalString(item, 'value', itemPath, issues)
    if (label === undefined || optionValue === undefined) {
      if (item.label === undefined) issues.push(`${itemPath}.label: is required`)
      if (item.value === undefined) issues.push(`${itemPath}.value: is required`)
      return
    }
    options.push({ label, value: optionValue })
  })
  return options
}

function readField(value: unknown, path: string, issues: string[]): FieldSchema | undefined {
  if (!isRecord(value)) {
    issues.push(`${path}: must be an object`)
    return undefined
  }
  const before = issues.length

  const name = requiredString(value, 'name', path, issues)
  const label = requiredString(value, 'label', path, issues)
  const type = value.type
  if (!isFieldType(type)) {
    issues.push(`${path}.type: must be one of ${FIELD_TYPES.join(', ')}`)
  }
  const placeholder = optionalString(value, 'placeholder', path, issues)
  const required = optionalBoolean(value, 'required', path, issues)
  const options = readOptions(value.options, `${path}.options`, issues)
  const validation = readValidation(value.validation, `${path}.validation`, issues)

  const defaultValue = value.defaultValue
  if (
    defaultValue !== undefined &&
    typeof defaultValue !== 'string' &&
    typeof defaultValue !== 'number' &&
    typeof defaultValue !== 'boolean'
  ) {
    issues.push(`${path}.defaultValue: must be a string, number or boolean`)
  }

  if (issues.length > before || name === undefined || label === undefined || !isFieldType(type)) {
    return undefined
  }

  // Built field by field, so keys the template does not know are dropped.
  return {
    name,
    label,
    type,
    ...(placeholder !== undefined && { placeholder }),
    ...(required !== undefined && { required }),
    ...(options !== undefined && { options }),
    ...(defaultValue !== undefined && { defaultValue: defaultValue as string | number | boolean }),
    ...(validation !== undefined && { validation }),
  }
}

/**
 * Checks a form description that arrived at runtime, for example from an API,
 * and returns either the typed schema or every problem found. Unknown keys are
 * dropped from the result.
 */
export function validateFormSchema(data: unknown): FormSchemaResult {
  const issues: string[] = []

  if (!isRecord(data)) {
    return { ok: false, issues: ['form: must be an object'] }
  }

  const id = requiredString(data, 'id', 'form', issues)
  const title = optionalString(data, 'title', 'form', issues)
  const submitLabel = optionalString(data, 'submitLabel', 'form', issues)

  const fields: FieldSchema[] = []
  if (!Array.isArray(data.fields) || data.fields.length === 0) {
    issues.push('form.fields: must be an array with at least one field')
  } else {
    const seen = new Set<string>()
    data.fields.forEach((item: unknown, index) => {
      const field = readField(item, `fields[${index}]`, issues)
      if (field === undefined) return
      // Two fields with one name would share, and overwrite, one value.
      if (seen.has(field.name)) {
        issues.push(`fields[${index}].name: "${field.name}" is used by an earlier field`)
        return
      }
      seen.add(field.name)
      fields.push(field)
    })
  }

  if (issues.length > 0 || id === undefined) {
    return { ok: false, issues }
  }

  return {
    ok: true,
    schema: {
      id,
      ...(title !== undefined && { title }),
      ...(submitLabel !== undefined && { submitLabel }),
      fields,
    },
  }
}

/**
 * The throwing form of validateFormSchema. Its signature matches the parse
 * option of request(), so a feature can fetch and check a description in one
 * call: request({ path, parse: parseFormSchema }).
 */
export function parseFormSchema(data: unknown): FormSchema {
  const result = validateFormSchema(data)
  if (!result.ok) throw new FormSchemaError(result.issues)
  return result.schema
}
