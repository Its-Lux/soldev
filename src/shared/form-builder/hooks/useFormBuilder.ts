import { useMemo, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { buildDefaultValues } from '../libs/buildDefaultValues'
import type { FormSchema, FormValues } from '../types'

/**
 * Form state for a FormBuilder. Field validation is attached per field in the
 * component, so an error only appears on a field the person has changed, or on
 * every invalid field once they submit.
 *
 * If onSubmit throws, its message is kept in submitError for the form to show,
 * instead of becoming an unhandled rejection.
 */
export function useFormBuilder(
  schema: FormSchema,
  onSubmit: (values: FormValues) => void | Promise<void>,
) {
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const defaultValues = useMemo(() => buildDefaultValues(schema), [schema])

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      setSubmitError(undefined)
      try {
        await onSubmit(value)
      } catch (error) {
        setSubmitError(
          error instanceof Error && error.message !== ''
            ? error.message
            : 'Something went wrong. Please try again.',
        )
      }
    },
  })

  return { form, submitError }
}
