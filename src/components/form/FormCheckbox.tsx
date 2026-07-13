'use client';

import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { FormField } from '@/components/form/FormField';

export interface FormCheckboxProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  control: Control<T>;
  error?: string;
  disabled?: boolean;
}

export function FormCheckbox<T extends FieldValues>({
  label,
  name,
  control,
  error,
  disabled,
}: FormCheckboxProps<T>) {
  return (
    <FormField label={label} error={error}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            type="checkbox"
            checked={field.value}
            onChange={field.onChange}
            disabled={disabled}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        )}
      />
    </FormField>
  );
}
