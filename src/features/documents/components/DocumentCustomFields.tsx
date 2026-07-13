'use client';

import { memo } from 'react';
import { EntityCustomFields, getCustomFieldValue } from '@/components/custom-fields';
import { DocumentCustomFieldDefinition } from '@/features/documents/hooks/useDocuments';

interface DocumentCustomFieldsProps {
  fields: DocumentCustomFieldDefinition[];
  values?: Record<string, string | number | boolean | undefined>;
  onChange?: (key: string, value: string | number | boolean) => void;
  mode: 'form' | 'view';
}

export const DocumentCustomFields = memo(function DocumentCustomFields(props: DocumentCustomFieldsProps) {
  return <EntityCustomFields {...props} />;
});

export function getDocumentCustomFieldValue(
  item: { customFields?: Record<string, string | number | boolean | undefined> },
  key: string
) {
  return getCustomFieldValue(item, key);
}
