export const PO_STATUS_CONFIG = {
  Draft: { label: 'Draft', variant: 'secondary' as const, color: 'bg-gray-100 text-gray-700' },
  PendingApproval: { label: 'Pending Approval', variant: 'warning' as const, color: 'bg-amber-100 text-amber-700' },
  Approved: { label: 'Approved', variant: 'success' as const, color: 'bg-emerald-100 text-emerald-700' },
  Rejected: { label: 'Rejected', variant: 'destructive' as const, color: 'bg-red-100 text-red-700' },
  Sent: { label: 'Sent', variant: 'info' as const, color: 'bg-blue-100 text-blue-700' },
  PartiallyReceived: { label: 'Partially Received', variant: 'warning' as const, color: 'bg-orange-100 text-orange-700' },
  FullyReceived: { label: 'Fully Received', variant: 'success' as const, color: 'bg-emerald-100 text-emerald-700' },
  Cancelled: { label: 'Cancelled', variant: 'destructive' as const, color: 'bg-gray-100 text-gray-500' },
  Closed: { label: 'Closed', variant: 'secondary' as const, color: 'bg-gray-100 text-gray-500' },
} as const;

export type PoStatus = keyof typeof PO_STATUS_CONFIG;

export const PO_STATUSES = Object.keys(PO_STATUS_CONFIG) as PoStatus[];

export const PO_UNITS = ['PCS', 'NOS', 'KG', 'MTR', 'SQM', 'LTR', 'SET', 'BOX', 'BAG', 'ROLL'];

export const PO_STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Status' },
  ...PO_STATUSES.map(s => ({ value: s, label: PO_STATUS_CONFIG[s].label })),
];

export const PO_TIMELINE_ACTION_LABELS: Record<string, string> = {
  Created: 'Created',
  Updated: 'Updated',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Sent: 'Sent to Vendor',
  Received: 'Items Received',
  PartiallyReceived: 'Partially Received',
  Cancelled: 'Cancelled',
  Closed: 'Closed',
  PdfGenerated: 'PDF Generated',
  PdfDownloaded: 'PDF Downloaded',
  PdfPrinted: 'PDF Printed',
  EmailSent: 'Email Sent',
  WhatsAppSent: 'WhatsApp Sent',
  RevisionCreated: 'Revision Created',
  StatusChanged: 'Status Changed',
  Deleted: 'Deleted',
  Restored: 'Restored',
};

export const PO_VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  Draft: ['PendingApproval', 'Cancelled'],
  PendingApproval: ['Approved', 'Rejected', 'Cancelled'],
  Approved: ['Sent', 'Cancelled'],
  Sent: ['PartiallyReceived', 'FullyReceived', 'Cancelled'],
  PartiallyReceived: ['FullyReceived', 'Closed'],
  FullyReceived: ['Closed'],
  Rejected: [],
  Cancelled: ['Draft'],
  Closed: [],
};
