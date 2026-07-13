'use client';

import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/form/FormField';
import { UseFormRegisterReturn } from 'react-hook-form';

export interface FormTextareaProps {
  label: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  registration: UseFormRegisterReturn;
}

export function FormTextarea({
  label,
  error,
  required,
  placeholder,
  disabled,
  registration,
}: FormTextareaProps) {
  return (
    <FormField label={label} required={required} error={error}>
      <Textarea
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        {...registration}
      />
    </FormField>
  );
}
