'use client';

import { EntityCustomFields, getCustomFieldValue } from '@/components/custom-fields';
import { LeadCustomFieldDefinition } from '@/types/leads';

interface LeadCustomFieldsProps {
  fields: LeadCustomFieldDefinition[];
  values?: Record<string, string | number | boolean | undefined>;
  onChange?: (key: string, value: string | number | boolean) => void;
  mode: 'form' | 'view';
}

export function LeadCustomFields(props: LeadCustomFieldsProps) {
  return <EntityCustomFields {...props} />;
}

export function getLeadCustomFieldValue(
  lead: { customFields?: Record<string, string | number | boolean | undefined> },
  key: string
) {
  return getCustomFieldValue(lead, key);
}
