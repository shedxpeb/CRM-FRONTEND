/**
 * Documents Module Constants
 * Centralized configuration for document types, statuses, and options
 */

import { DocumentType, DocumentStatus, ApprovalStatus, TemplateType, NumberingPattern } from '../types';

// ─── Document Types ─────────────────────────────────────────────────────────────

export const DOCUMENT_TYPES: Array<{ value: DocumentType; label: string; icon: string }> = [
  { value: 'Estimate', label: 'Estimate', icon: 'FileText' },
  { value: 'Proposal', label: 'Proposal', icon: 'File' },
  { value: 'Quotation', label: 'Quotation', icon: 'FileSpreadsheet' },
];

// ─── Document Statuses ───────────────────────────────────────────────────────────

export const DOCUMENT_STATUSES: Array<{ value: DocumentStatus; label: string; color: string }> = [
  { value: 'Draft', label: 'Draft', color: 'gray' },
  { value: 'Sent', label: 'Sent', color: 'blue' },
  { value: 'Viewed', label: 'Viewed', color: 'cyan' },
  { value: 'Accepted', label: 'Accepted', color: 'green' },
  { value: 'Rejected', label: 'Rejected', color: 'red' },
  { value: 'Expired', label: 'Expired', color: 'orange' },
  { value: 'Converted', label: 'Converted', color: 'purple' },
  { value: 'Cancelled', label: 'Cancelled', color: 'gray' },
];

export const DOCUMENT_STATUS_BADGE_VARIANTS: Record<DocumentStatus, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'> = {
  Draft: 'secondary',
  Sent: 'info',
  Viewed: 'info',
  Accepted: 'success',
  Rejected: 'destructive',
  Expired: 'warning',
  Converted: 'success',
  Cancelled: 'secondary',
};

// ─── Approval Statuses ───────────────────────────────────────────────────────────

export const APPROVAL_STATUSES: Array<{ value: ApprovalStatus; label: string; color: string }> = [
  { value: 'Pending', label: 'Pending', color: 'yellow' },
  { value: 'Approved', label: 'Approved', color: 'green' },
  { value: 'Rejected', label: 'Rejected', color: 'red' },
  { value: 'Cancelled', label: 'Cancelled', color: 'gray' },
];

export const APPROVAL_STATUS_BADGE_VARIANTS: Record<ApprovalStatus, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'> = {
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'destructive',
  Cancelled: 'secondary',
};

// ─── Template Types ─────────────────────────────────────────────────────────────

export const TEMPLATE_TYPES: Array<{ value: TemplateType; label: string }> = [
  { value: 'Estimate', label: 'Estimate' },
  { value: 'Proposal', label: 'Proposal' },
  { value: 'Quotation', label: 'Quotation' },
  { value: 'Invoice', label: 'Invoice' },
];

// ─── Numbering Patterns ────────────────────────────────────────────────────────

export const NUMBERING_PATTERNS: Array<{ value: NumberingPattern; label: string; description: string }> = [
  { value: 'Sequential', label: 'Sequential', description: 'EST-001, EST-002, EST-003...' },
  { value: 'CustomerBased', label: 'Customer Based', description: 'CUST-001, CUST-002...' },
  { value: 'ProjectBased', label: 'Project Based', description: 'PROJ-001, PROJ-002...' },
  { value: 'DateBased', label: 'Date Based', description: '2024-001, 2024-002...' },
];

// ─── Template Layouts ────────────────────────────────────────────────────────────

export const TEMPLATE_LAYOUTS: Array<{ value: 'Standard' | 'Detailed' | 'Compact' | 'Custom'; label: string; description: string }> = [
  { value: 'Standard', label: 'Standard', description: 'Standard layout with header and footer' },
  { value: 'Detailed', label: 'Detailed', description: 'Detailed layout with extended information' },
  { value: 'Compact', label: 'Compact', description: 'Compact layout for quick reference' },
  { value: 'Custom', label: 'Custom', description: 'Custom layout with drag-and-drop builder' },
];

// ─── GST Types ───────────────────────────────────────────────────────────────────

export const GST_TYPES: Array<{ value: 'CGST' | 'SGST' | 'IGST' | 'CESS'; label: string; rate: number }> = [
  { value: 'CGST', label: 'CGST', rate: 9 },
  { value: 'SGST', label: 'SGST', rate: 9 },
  { value: 'IGST', label: 'IGST', rate: 18 },
  { value: 'CESS', label: 'CESS', rate: 0 },
];

// ─── Payment Terms ──────────────────────────────────────────────────────────────

export const PAYMENT_TERMS: Array<{ value: string; label: string }> = [
  { value: '100% Advance', label: '100% Advance' },
  { value: '50% Advance + 50% Before Delivery', label: '50% Advance + 50% Before Delivery' },
  { value: '30% Advance + 70% Before Delivery', label: '30% Advance + 70% Before Delivery' },
  { value: 'Against Delivery', label: 'Against Delivery' },
  { value: '30 Days Credit', label: '30 Days Credit' },
  { value: '45 Days Credit', label: '45 Days Credit' },
  { value: '60 Days Credit', label: '60 Days Credit' },
  { value: 'Custom', label: 'Custom' },
];

// ─── Delivery Terms ─────────────────────────────────────────────────────────────

export const DELIVERY_TERMS: Array<{ value: string; label: string }> = [
  { value: 'Ex-Works', label: 'Ex-Works (EXW)' },
  { value: 'Free Carrier', label: 'Free Carrier (FCA)' },
  { value: 'Free on Board', label: 'Free on Board (FOB)' },
  { value: 'Cost and Freight', label: 'Cost and Freight (CFR)' },
  { value: 'Cost Insurance Freight', label: 'Cost Insurance Freight (CIF)' },
  { value: 'Delivered at Place', label: 'Delivered at Place (DAP)' },
  { value: 'Delivered Duty Paid', label: 'Delivered Duty Paid (DDP)' },
  { value: 'Custom', label: 'Custom' },
];

// ─── Valid Days Options ─────────────────────────────────────────────────────────

export const VALID_DAYS_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 7, label: '7 Days' },
  { value: 15, label: '15 Days' },
  { value: 30, label: '30 Days' },
  { value: 45, label: '45 Days' },
  { value: 60, label: '60 Days' },
  { value: 90, label: '90 Days' },
  { value: 120, label: '120 Days' },
];

// ─── Default Terms and Conditions ────────────────────────────────────────────────

export const DEFAULT_TERMS_AND_CONDITIONS = `1. Prices are valid for the specified period.
2. Delivery timeline starts from receipt of advance payment.
3. Material specifications as per approved drawings.
4. Taxes as per government regulations.
5. Payment terms as specified in the document.
6. Subject to PEB-CRM standard terms and conditions.`;

// ─── Document Numbering Prefixes ─────────────────────────────────────────────────

export const DOCUMENT_NUMBERING_PREFIXES: Record<DocumentType, string> = {
  Estimate: 'EST',
  Proposal: 'PRO',
  Quotation: 'QUO',
  Invoice: 'INV',
};

// ─── Activity Type Icons ─────────────────────────────────────────────────────────

export const ACTIVITY_TYPE_ICONS: Record<string, string> = {
  document_created: 'FilePlus',
  document_updated: 'FileEdit',
  document_sent: 'Send',
  document_viewed: 'Eye',
  document_accepted: 'CheckCircle',
  document_rejected: 'XCircle',
  document_expired: 'Clock',
  document_converted: 'RefreshCw',
  document_cancelled: 'X',
  approval_requested: 'UserCheck',
  approval_approved: 'Check',
  approval_rejected: 'X',
  version_created: 'GitBranch',
  template_created: 'LayoutTemplate',
  template_updated: 'Settings',
  comment_added: 'MessageSquare',
  attachment_added: 'Paperclip',
};

// ─── Activity Type Colors ───────────────────────────────────────────────────────

export const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  document_created: 'blue',
  document_updated: 'yellow',
  document_sent: 'cyan',
  document_viewed: 'purple',
  document_accepted: 'green',
  document_rejected: 'red',
  document_expired: 'orange',
  document_converted: 'indigo',
  document_cancelled: 'gray',
  approval_requested: 'yellow',
  approval_approved: 'green',
  approval_rejected: 'red',
  version_created: 'purple',
  template_created: 'blue',
  template_updated: 'yellow',
  comment_added: 'cyan',
  attachment_added: 'gray',
};

// ─── Scope Labels ───────────────────────────────────────────────────────────────

export const SCOPE_LABELS: Record<string, string> = {
  labour: 'Labour',
  installation: 'Installation',
  transportation: 'Transportation',
  crane: 'Crane',
  civilWork: 'Civil Work',
  accommodation: 'Accommodation',
  erection: 'Erection',
  freight: 'Freight',
};

// ─── Document Status Badge Variants (Enhanced) ───────────────────────────────────

export const DOCUMENT_STATUS_BADGE_CLASSES: Record<DocumentStatus, string> = {
  Draft: 'bg-muted text-muted-foreground',
  Sent: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  Viewed: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
  Accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  Expired: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  Converted: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  Cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-300',
};
