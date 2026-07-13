'use client';

import { memo } from 'react';
import { EntityCustomFields, getCustomFieldValue } from '@/components/custom-fields';
import { InventoryCustomFieldDefinition } from '@/features/inventory/types';

interface InventoryCustomFieldsProps {
  fields: InventoryCustomFieldDefinition[];
  values?: Record<string, string | number | boolean | undefined>;
  onChange?: (key: string, value: string | number | boolean) => void;
  mode: 'form' | 'view';
}

export const InventoryCustomFields = memo(function InventoryCustomFields(props: InventoryCustomFieldsProps) {
  return <EntityCustomFields {...props} />;
});

export function getInventoryCustomFieldValue(
  item: { customFields?: Record<string, string | number | boolean | undefined> },
  key: string
) {
  return getCustomFieldValue(item, key);
}
