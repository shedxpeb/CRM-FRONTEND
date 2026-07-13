'use client';

import { Input } from '@/components/ui/input';
import { FormField } from '@/components/form/FormField';
import { UseFormRegisterReturn } from 'react-hook-form';

export interface FormInputProps {
  label: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  autoComplete?: string;
  maxLength?: number;
  registration: UseFormRegisterReturn;
}

export function FormInput({
  label,
  error,
  required,
  placeholder,
  type = 'text',
  disabled,
  autoComplete,
  maxLength,
  registration,
}: FormInputProps) {
  return (
    <FormField label={label} required={required} error={error}>
      <Input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        {...registration}
      />
    </FormField>
  );
}
