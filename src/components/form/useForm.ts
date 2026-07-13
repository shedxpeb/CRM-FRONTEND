'use client';

import { useState, useCallback } from 'react';

export interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Record<string, string>;
  onSubmit: (values: T) => Promise<void> | void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UseFormReturn<T> {
  values: T;
  errors: Record<string, string>;
  isLoading: boolean;
  isSuccess: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleSubmit: (e?: React.FormEvent) => void;
  handleReset: () => void;
  setFieldValue: (field: keyof T, value: any) => void;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
  onSuccess,
  onError,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when value changes
    if (errors[field as string]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [errors]);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Validate if validate function is provided
    if (validate) {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    setIsLoading(true);
    setErrors({});
    setIsSuccess(false);

    try {
      await onSubmit(values);
      setIsSuccess(true);
      onSuccess?.();
      
      // Reset success state after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setErrors({ form: errorMessage });
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [values, validate, onSubmit, onSuccess, onError]);

  const handleReset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSuccess(false);
  }, [initialValues]);

  return {
    values,
    errors,
    isLoading,
    isSuccess,
    handleChange,
    handleSubmit,
    handleReset,
    setFieldValue,
  };
}
