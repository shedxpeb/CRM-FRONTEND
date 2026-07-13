/**
 * Finance Module Constants
 * Constants and helper functions for finance-related operations
 */

// Payment Methods
export const PAYMENT_METHODS = [
  'Bank Transfer',
  'UPI',
  'Cash',
  'Cheque',
  'RTGS',
  'NEFT',
  'IMPS',
  'Credit Card',
  'Debit Card',
] as const;

// Invoice Status
export const INVOICE_STATUSES = [
  'Draft',
  'Sent',
  'Viewed',
  'Partially Paid',
  'Paid',
  'Overdue',
  'Cancelled',
] as const;

// Payment Status
export const PAYMENT_STATUSES = [
  'Pending',
  'Processing',
  'Completed',
  'Failed',
  'Refunded',
  'Cancelled',
] as const;

// Expense Status
export const EXPENSE_STATUSES = [
  'Pending',
  'Approved',
  'Rejected',
  'Paid',
  'Cancelled',
] as const;

// Income Categories
export const INCOME_CATEGORIES = [
  'Project Revenue',
  'Advance Payment',
  'Stage Payment',
  'Partial Payment',
  'Final Payment',
  'Miscellaneous Income',
] as const;

// Expense Categories
export const EXPENSE_CATEGORIES = [
  'Material Purchase',
  'Labour Cost',
  'Transport',
  'Machinery',
  'Fabrication',
  'Installation',
  'Site Expenses',
  'Administrative Expenses',
  'Miscellaneous Expenses',
] as const;

// GST Types
export const GST_TYPES = ['CGST', 'SGST', 'IGST', 'CESS'] as const;

// Aging Buckets
export const AGING_BUCKETS = ['0-30 Days', '31-60 Days', '61-90 Days', '90+ Days'] as const;

// Financial Health
export const FINANCIAL_HEALTH = ['Healthy', 'At Risk', 'Critical'] as const;

// Helper Functions

export function getInvoiceStatusVariant(status: string): 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'secondary' {
  const variants: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'secondary'> = {
    Draft: 'secondary',
    Sent: 'default',
    Viewed: 'default',
    'Partially Paid': 'warning',
    Paid: 'success',
    Overdue: 'destructive',
    Cancelled: 'secondary',
  };
  return variants[status] || 'default';
}

export function getPaymentStatusVariant(status: string): 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'secondary' {
  const variants: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'secondary'> = {
    Pending: 'warning',
    Processing: 'default',
    Completed: 'success',
    Failed: 'destructive',
    Refunded: 'secondary',
    Cancelled: 'secondary',
  };
  return variants[status] || 'default';
}

export function getExpenseStatusVariant(status: string): 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'secondary' {
  const variants: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'secondary'> = {
    Pending: 'warning',
    Approved: 'success',
    Rejected: 'destructive',
    Paid: 'success',
    Cancelled: 'secondary',
  };
  return variants[status] || 'default';
}

export function getFinancialHealthVariant(health: string): 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'secondary' {
  const variants: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'secondary'> = {
    Healthy: 'success',
    'At Risk': 'warning',
    Critical: 'destructive',
  };
  return variants[health] || 'default';
}

export function getFinancialHealthColor(health: string): string {
  const colors: Record<string, string> = {
    Healthy: 'text-green-600',
    'At Risk': 'text-amber-600',
    Critical: 'text-red-600',
  };
  return colors[health] || 'text-gray-600';
}

export function getAgingBucketColor(bucket: string): string {
  const colors: Record<string, string> = {
    '0-30 Days': 'text-green-600',
    '31-60 Days': 'text-amber-600',
    '61-90 Days': 'text-orange-600',
    '90+ Days': 'text-red-600',
  };
  return colors[bucket] || 'text-gray-600';
}

export function getAgingBucketVariant(bucket: string): 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'secondary' {
  const variants: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'secondary'> = {
    '0-30 Days': 'success',
    '31-60 Days': 'warning',
    '61-90 Days': 'warning',
    '90+ Days': 'destructive',
  };
  return variants[bucket] || 'default';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function calculateOverdueDays(dueDate: Date): number {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = now.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

export function getAgingBucket(overdueDays: number): string {
  if (overdueDays <= 30) return '0-30 Days';
  if (overdueDays <= 60) return '31-60 Days';
  if (overdueDays <= 90) return '61-90 Days';
  return '90+ Days';
}

export function calculateGST(amount: number, gstRate: number, gstType: 'CGST' | 'SGST' | 'IGST'): number {
  if (gstType === 'IGST') {
    return (amount * gstRate) / 100;
  }
  // CGST and SGST are half of the total GST
  return (amount * gstRate) / 200;
}
