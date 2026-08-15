/**
 * Customer Module Constants
 * Centralized constants for statuses, industries, business types, and sources
 */

import type { CustomerStatus, Industry, BusinessType, CustomerSource } from '@/features/customers/types';

/**
 * Customer Status definitions with badge colors
 */
export const CUSTOMER_STATUSES: {
  value: CustomerStatus;
  label: string;
  variant: 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'secondary';
}[] = [
  { value: 'Active', label: 'Active', variant: 'success' },
  { value: 'Inactive', label: 'Inactive', variant: 'secondary' },
  { value: 'Prospect', label: 'Prospect', variant: 'info' },
  { value: 'Converted', label: 'Converted', variant: 'default' },
  { value: 'Churned', label: 'Churned', variant: 'destructive' },
  { value: 'Archived', label: 'Archived', variant: 'secondary' },
  { value: 'Rejected', label: 'Rejected', variant: 'destructive' },
];

/**
 * Industry options
 */
export const INDUSTRIES: { value: Industry; label: string }[] = [
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Construction', label: 'Construction' },
  { value: 'Infrastructure', label: 'Infrastructure' },
  { value: 'Logistics', label: 'Logistics' },
  { value: 'Agriculture', label: 'Agriculture' },
  { value: 'Commercial', label: 'Commercial' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Education', label: 'Education' },
  { value: 'Retail', label: 'Retail' },
  { value: 'Other', label: 'Other' },
];

/**
 * Business Type options — values match the backend BusinessType enum exactly.
 */
export const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: 'PrivateLimited', label: 'Private Limited' },
  { value: 'SoleProprietorship', label: 'Sole Proprietorship' },
  { value: 'Partnership', label: 'Partnership' },
  { value: 'LLP', label: 'LLP' },
  { value: 'PublicLimited', label: 'Public Limited' },
  { value: 'Government', label: 'Government' },
  { value: 'NonProfit', label: 'Non-Profit' },
  { value: 'Other', label: 'Other' },
];

/** Human-readable labels for backend enum values (fallback: the value itself). */
export const BUSINESS_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  BUSINESS_TYPES.map((bt) => [bt.value, bt.label]),
);

/**
 * Customer Source options (reuses LeadSource values)
 */
export const CUSTOMER_SOURCES: { value: CustomerSource; label: string }[] = [
  { value: 'Website', label: 'Website' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Cold Call', label: 'Cold Call' },
  { value: 'Email', label: 'Email' },
  { value: 'Social Media', label: 'Social Media' },
  { value: 'Trade Show', label: 'Trade Show' },
  { value: 'Advertisement', label: 'Advertisement' },
  { value: 'Other', label: 'Other' },
];

/**
 * Get status variant for badge rendering
 */
export function getStatusVariant(status: CustomerStatus) {
  return CUSTOMER_STATUSES.find((s) => s.value === status)?.variant ?? 'secondary';
}
