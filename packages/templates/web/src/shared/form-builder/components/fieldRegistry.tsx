import type { ReactNode } from 'react'
import type { AnyFieldApi } from '@tanstack/react-form'
import { Input } from '../../ui/Input'
import { Textarea } from '../../ui/Textarea'
import { Select } from '../../ui/Select'
import { Checkbox } from '../../ui/Checkbox'
import type { FieldSchema, FieldType } from '../types'

export interface FieldRendererProps {
  fieldSchema: FieldSchema
  field: AnyFieldApi
  errorMessage?: string
}

type FieldRenderer = (props: FieldRendererProps) => ReactNode

export const fieldRegistry: Record<FieldType, FieldRenderer> = {
  text: ({ fieldSchema, field, errorMessage }) => (
    <Input
      id={fieldSchema.name}
      type="text"
      placeholder={fieldSchema.placeholder}
      value={field.state.value as string}
      onChange={(e) => field.handleChange(e.target.value)}
      onBlur={field.handleBlur}
      error={errorMessage}
    />
  ),
  email: ({ fieldSchema, field, errorMessage }) => (
    <Input
      id={fieldSchema.name}
      type="email"
      placeholder={fieldSchema.placeholder}
      value={field.state.value as string}
      onChange={(e) => field.handleChange(e.target.value)}
      onBlur={field.handleBlur}
      error={errorMessage}
    />
  ),
  password: ({ fieldSchema, field, errorMessage }) => (
    <Input
      id={fieldSchema.name}
      type="password"
      placeholder={fieldSchema.placeholder}
      value={field.state.value as string}
      onChange={(e) => field.handleChange(e.target.value)}
      onBlur={field.handleBlur}
      error={errorMessage}
    />
  ),
  number: ({ fieldSchema, field, errorMessage }) => (
    <Input
      id={fieldSchema.name}
      type="number"
      placeholder={fieldSchema.placeholder}
      value={Number.isNaN(field.state.value) ? '' : (field.state.value as number)}
      onChange={(e) => field.handleChange(e.target.valueAsNumber)}
      onBlur={field.handleBlur}
      error={errorMessage}
    />
  ),
  textarea: ({ fieldSchema, field, errorMessage }) => (
    <Textarea
      id={fieldSchema.name}
      placeholder={fieldSchema.placeholder}
      value={field.state.value as string}
      onChange={(e) => field.handleChange(e.target.value)}
      onBlur={field.handleBlur}
      error={errorMessage}
    />
  ),
  select: ({ fieldSchema, field, errorMessage }) => (
    <Select
      id={fieldSchema.name}
      options={fieldSchema.options ?? []}
      placeholder={fieldSchema.placeholder}
      value={field.state.value as string}
      onChange={(e) => field.handleChange(e.target.value)}
      onBlur={field.handleBlur}
      error={errorMessage}
    />
  ),
  // The error is rendered here rather than passed to Checkbox, so a required
  // checkbox can show its message whatever props Checkbox accepts.
  checkbox: ({ fieldSchema, field, errorMessage }) => (
    <>
      <Checkbox
        id={fieldSchema.name}
        checked={field.state.value as boolean}
        onChange={(e) => field.handleChange(e.target.checked)}
        onBlur={field.handleBlur}
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={errorMessage ? `${fieldSchema.name}-error` : undefined}
      />
      {errorMessage && (
        <p id={`${fieldSchema.name}-error`} className="text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}
    </>
  ),
}
