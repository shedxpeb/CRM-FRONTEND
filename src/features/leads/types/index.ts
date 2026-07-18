/**
 * Leads Module Types
 * Re-exports from the single source of truth at @/types/leads
 * Do NOT define duplicate types here — always import from @/types/leads
 */

export type {
  LeadStatus,
  LeadPriority,
  LeadSource,
  Industry,
  BusinessType,
  ProjectType,
  StructureType,
  RoofType,
  WallType,
  MaterialPreference,
  Lead,
  LeadCustomFieldType,
  LeadCustomFieldDefinition,
  LeadActivity,
  LeadFilter,
  LeadSearchParams,
  CreateLeadDto,
  UpdateLeadDto,
} from '@/types/leads';
