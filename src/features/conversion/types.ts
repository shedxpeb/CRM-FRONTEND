/**
 * Universal Conversion Engine — types
 * Source of truth for transferable packages across modules.
 */

export type ModuleName =
  | 'lead'
  | 'customer'
  | 'project'
  | 'quotation'
  | 'purchase'
  | 'inventory'
  | 'production'
  | 'dispatch'
  | 'site'
  | 'warranty'
  | 'estimate'
  | 'proposal';

export type ConversionPairId =
  | 'lead-to-customer'
  | 'lead-to-project'
  | 'customer-to-project'
  | 'project-to-quotation'
  | 'quotation-to-purchase'
  | 'purchase-to-inventory'
  | 'inventory-to-production'
  | 'production-to-dispatch'
  | 'dispatch-to-site'
  | 'site-to-warranty'
  | 'estimate-to-proposal'
  | 'proposal-to-quotation';

export type FieldGroupId =
  | 'standard'
  | 'contact'
  | 'company'
  | 'address'
  | 'project_requirements'
  | 'technical'
  | 'site'
  | 'notes'
  | 'comments'
  | 'activities'
  | 'timeline'
  | 'documents'
  | 'attachments'
  | 'followups'
  | 'tasks'
  | 'tags'
  | 'custom_fields';

export type CustomFieldMappingAction = 'auto' | 'create' | 'map' | 'ignore';

export interface CustomFieldDefLite {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'boolean' | string;
  options?: string[];
}

export interface CustomFieldMapping {
  sourceKey: string;
  sourceLabel: string;
  sourceType: string;
  sourceValue: string | number | boolean | null;
  action: CustomFieldMappingAction;
  /** When action=map */
  targetKey?: string;
  /** When action=create — use this key on destination (default = sourceKey) */
  createKey?: string;
  autoMapped: boolean;
}

export interface FieldGroupDefinition {
  id: FieldGroupId;
  label: string;
  description?: string;
  /** How many items are available to transfer (fields / docs / etc.) */
  count: number;
  /** Selected by default for this conversion */
  defaultSelected: boolean;
  /** Disabled when count is 0 */
  enabled: boolean;
}

export interface ConversionProfile {
  id: string;
  name: string;
  description?: string;
  pairId: ConversionPairId;
  selectedGroups: FieldGroupId[];
  /** Persist custom field actions by sourceKey */
  customFieldDefaults?: Record<string, CustomFieldMappingAction>;
  isSystem?: boolean;
}

export interface ConversionSelection {
  groups: FieldGroupId[];
  customFieldMappings: CustomFieldMapping[];
}

export interface ConversionPreview {
  pairId: ConversionPairId;
  sourceLabel: string;
  sourceCode?: string | null;
  destinationModule: ModuleName;
  groups: FieldGroupDefinition[];
  customFields: CustomFieldMapping[];
  profiles: ConversionProfile[];
}

export interface ConversionExecutePayload {
  pairId: ConversionPairId;
  sourceId: string;
  selection: ConversionSelection;
  /** Optional user-edited destination field overrides (e.g. customer form) */
  overrides?: Record<string, unknown>;
  profileId?: string;
}

export interface ConversionResultSummary {
  transferred: {
    standardFields: number;
    customFields: number;
    documents: number;
    attachments: number;
    activities: number;
    comments: number;
    notes: boolean;
    tags: number;
  };
  destinationId: string;
  destinationCode?: string | null;
  destinationName?: string;
  sourceId: string;
}
