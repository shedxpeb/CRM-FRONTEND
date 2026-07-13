'use client';

import { memo } from 'react';
import { EntityCustomFields, getCustomFieldValue } from '@/components/custom-fields';
import { ProjectCustomFieldDefinition } from '@/features/projects/types';

interface ProjectCustomFieldsProps {
  fields: ProjectCustomFieldDefinition[];
  values?: Record<string, string | number | boolean | undefined>;
  onChange?: (key: string, value: string | number | boolean) => void;
  mode: 'form' | 'view';
}

export const ProjectCustomFields = memo(function ProjectCustomFields(props: ProjectCustomFieldsProps) {
  return <EntityCustomFields {...props} />;
});

export function getProjectCustomFieldValue(
  project: { customFields?: Record<string, string | number | boolean | undefined> },
  key: string
) {
  return getCustomFieldValue(project, key);
}
