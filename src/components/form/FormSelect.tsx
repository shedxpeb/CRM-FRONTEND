'use client';

import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from '@/components/form/FormField';

export interface FormSelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  control: Control<T>;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  options: FormSelectOption[];
}

export function FormSelect<T extends FieldValues>({
  label,
  name,
  control,
  error,
  required,
  disabled,
  placeholder = 'Select...',
  options,
}: FormSelectProps<T>) {
  return (
    <FormField label={label} required={required} error={error}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={disabled}
          >
            <SelectTrigger aria-invalid={Boolean(error)}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </FormField>
  );
}
