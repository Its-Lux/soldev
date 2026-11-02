import { useFormBuilder } from '../hooks/useFormBuilder'
import { validateField } from '../libs/validateField'
import { FormField } from './FormField'
import { Button } from '../../ui/Button'
import type { FormSchema, FormValues } from '../types'

interface FormBuilderProps {
  schema: FormSchema
  onSubmit: (values: FormValues) => void | Promise<void>
}

/**
 * Renders a form from a description. A description that arrived at runtime
 * must be checked with parseFormSchema first. Loading and failing to load the
 * description belong to the feature that fetches it.
 */
export function FormBuilder({ schema, onSubmit }: FormBuilderProps) {
  const { form, submitError } = useFormBuilder(schema, onSubmit)

  if (schema.fields.length === 0) {
    return <p className="text-sm text-foreground/70">This form has no fields.</p>
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
      className="flex flex-col gap-4"
    >
      {schema.title && <h2 className="text-lg font-semibold text-foreground">{schema.title}</h2>}

      {schema.fields.map((fieldSchema) => (
        <form.Field
          key={fieldSchema.name}
          name={fieldSchema.name}
          validators={{ onChange: ({ value }) => validateField(fieldSchema, value) }}
        >
          {(field) => <FormField fieldSchema={fieldSchema} field={field} />}
        </form.Field>
      ))}

      {submitError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {submitError}
        </p>
      )}

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" disabled={!canSubmit} isLoading={isSubmitting}>
            {schema.submitLabel ?? 'Submit'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
