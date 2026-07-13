'use client';

import { memo } from 'react';
import { EntityCustomFields, getCustomFieldValue } from '@/components/custom-fields';
import { ItemCustomFieldDefinition } from '@/features/item-master/types';

interface ItemCustomFieldsProps {
  fields: ItemCustomFieldDefinition[];
  values?: Record<string, string | number | boolean | undefined>;
  onChange?: (key: string, value: string | number | boolean) => void;
  mode: 'form' | 'view';
}

export const ItemCustomFields = memo(function ItemCustomFields(props: ItemCustomFieldsProps) {
  return <EntityCustomFields {...props} />;
});

export function getItemCustomFieldValue(
  item: { customFields?: Record<string, string | number | boolean | undefined> },
  key: string
) {
  return getCustomFieldValue(item, key);
}
