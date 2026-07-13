'use client';

import { EntityCustomFields, getCustomFieldValue } from '@/components/custom-fields';
import { CustomerCustomFieldDefinition } from '@/features/customers/types';

interface CustomerCustomFieldsProps {
  fields: CustomerCustomFieldDefinition[];
  values?: Record<string, string | number | boolean | undefined>;
  onChange?: (key: string, value: string | number | boolean) => void;
  mode: 'form' | 'view';
}

export function CustomerCustomFields(props: CustomerCustomFieldsProps) {
  return <EntityCustomFields {...props} />;
}

export function getCustomerCustomFieldValue(
  customer: { customFields?: Record<string, string | number | boolean | undefined> },
  key: string
) {
  return getCustomFieldValue(customer, key);
}
