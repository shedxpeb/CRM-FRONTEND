/**
 * Finance Module Types
 * Single Source of Truth for all financial data across the ERP platform
 * Finance is the central financial control system - connects Customers, Projects, Inventory, Vendors, GST
 */

export type PaymentMethod =
  | 'Bank Transfer'
  | 'UPI'
  | 'Cash'
  | 'Cheque'
  | 'RTGS'
  | 'NEFT'
  | 'IMPS'
  | 'Credit Card'
  | 'Debit Card';

export type InvoiceStatus =
  | 'Draft'
  | 'Sent'
  | 'Viewed'
  | 'Partially Paid'
  | 'Paid'
  | 'Overdue'
  | 'Cancelled';

export type PaymentStatus =
  | 'Pending'
  | 'Processing'
  | 'Completed'
  | 'Failed'
  | 'Refunded'
  | 'Cancelled';

export type ExpenseStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Paid'
  | 'Cancelled';

export type IncomeCategory =
  | 'Project Revenue'
  | 'Advance Payment'
  | 'Stage Payment'
  | 'Partial Payment'
  | 'Final Payment'
  | 'Miscellaneous Income';

export type ExpenseCategory =
  | 'Material Purchase'
  | 'Labour Cost'
  | 'Transport'
  | 'Machinery'
  | 'Fabrication'
  | 'Installation'
  | 'Site Expenses'
  | 'Administrative Expenses'
  | 'Miscellaneous Expenses';

export type GSTType = 'CGST' | 'SGST' | 'IGST' | 'CESS';

export type AgingBucket = '0-30 Days' | '31-60 Days' | '61-90 Days' | '90+ Days';

export type FinancialHealth = 'Healthy' | 'At Risk' | 'Critical';

/**
 * Income - Money received from customers
 */
export interface Income {
  id: string;
  incomeNumber: string;
  
  // Source
  customerId: string;
  customerName: string;
  projectId?: string;
  projectName?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  
  // Amount
  amount: number;
  taxAmount?: number;
  totalAmount: number;
  
  // Payment Details
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  transactionId?: string;
  notes?: string;
  
  // Status
  status: PaymentStatus;
  category: IncomeCategory;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Expense - Money spent on operations
 */
export interface Expense {
  id: string;
  expenseNumber: string;
  
  // Vendor
  vendorId: string;
  vendorName: string;
  
  // Category
  category: ExpenseCategory;
  subCategory?: string;
  
  // Project
  projectId?: string;
  projectName?: string;
  
  // Amount
  amount: number;
  taxAmount?: number;
  totalAmount: number;
  
  // Details
  date: Date;
  description: string;
  receiptNumber?: string;
  invoiceNumber?: string;
  notes?: string;
  attachments?: string[];
  
  // Approval
  status: ExpenseStatus;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Invoice - Billing document for customers
 */
export interface Invoice {
  id: string;
  invoiceNumber: string;
  version: number;
  
  // Customer
  customerId: string;
  customerName: string;
  customerAddress: string;
  customerGST?: string;
  
  // Project
  projectId?: string;
  projectName?: string;
  
  // Source
  sourceType: 'Estimate' | 'Proposal' | 'Quotation' | 'Project' | 'Manual';
  sourceId?: string;
  
  // Amount
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  
  // GST
  gstType: GSTType;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  cessAmount?: number;
  
  // Terms
  dueDate: Date;
  paymentTerms: string;
  
  // Status
  status: InvoiceStatus;
  
  // Line Items
  lineItems: InvoiceLineItem[];
  
  // Timestamps
  sentAt?: Date;
  viewedAt?: Date;
  paidAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  taxRate?: number;
  taxAmount?: number;
}

/**
 * Payment - Payment record
 */
export interface Payment {
  id: string;
  paymentNumber: string;
  
  // Type
  type: 'Advance' | 'Stage' | 'Partial' | 'Full' | 'Refund';
  
  // Invoice
  invoiceId?: string;
  invoiceNumber?: string;
  
  // Customer
  customerId: string;
  customerName: string;
  
  // Project
  projectId?: string;
  projectName?: string;
  
  // Amount
  amount: number;
  taxAmount?: number;
  totalAmount: number;
  
  // Payment Details
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  transactionId?: string;
  notes?: string;
  attachments?: string[];
  
  // Status
  status: PaymentStatus;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Vendor - Supplier for expenses
 */
export interface Vendor {
  id: string;
  vendorCode: string;
  
  // Basic Info
  name: string;
  gstNumber?: string;
  panNumber?: string;
  
  // Contact
  contactPerson: string;
  mobile: string;
  email?: string;
  
  // Address
  address: string;
  city: string;
  state: string;
  pincode?: string;
  
  // Financial
  creditLimit?: number;
  creditPeriod?: number; // days
  paymentTerms?: string;
  
  // Performance
  totalPurchases: number;
  totalPayments: number;
  outstandingBalance: number;
  performanceRating?: number; // 1-5
  
  // Status
  status: 'Active' | 'Inactive' | 'Blocked';
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Bank Account - Company bank accounts
 */
export interface BankAccount {
  id: string;
  accountCode: string;
  
  // Account Details
  accountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  accountType: 'Current' | 'Savings';
  
  // Balance
  currentBalance: number;
  
  // Status
  status: 'Active' | 'Inactive' | 'Frozen';
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Transaction - Ledger entry
 */
export interface Transaction {
  id: string;
  transactionNumber: string;
  
  // Type
  type: 'Credit' | 'Debit';
  category: 'Income' | 'Expense' | 'Transfer' | 'Tax Payment' | 'Refund';
  
  // Amount
  amount: number;
  balance?: number;
  
  // Reference
  referenceType: 'Invoice' | 'Payment' | 'Expense' | 'Vendor Payment' | 'GST Payment' | 'Transfer';
  referenceId?: string;
  referenceNumber?: string;
  
  // Bank
  bankAccountId?: string;
  bankAccountName?: string;
  
  // Description
  description: string;
  notes?: string;
  
  // Date
  transactionDate: Date;
  
  // Timestamps
  createdAt?: Date;
}

/**
 * Ledger Entry - Central financial ledger
 */
export interface LedgerEntry {
  id: string;
  entryNumber: string;
  
  // Account
  accountId: string;
  accountName: string;
  accountType: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  
  // Amount
  debitAmount?: number;
  creditAmount?: number;
  
  // Reference
  referenceType: string;
  referenceId?: string;
  
  // Description
  description: string;
  
  // Date
  entryDate: Date;
  
  // Audit
  performedBy: string;
  performedAt: Date;
  
  // Timestamps
  createdAt?: Date;
}

/**
 * Receivable - Money owed by customers
 */
export interface Receivable {
  id: string;
  customerId: string;
  customerName: string;
  
  // Invoice
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  
  // Project
  projectId?: string;
  projectName?: string;
  
  // Amount
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  
  // Due Date
  dueDate: Date;
  overdueDays: number;
  agingBucket: AgingBucket;
  
  // Status
  status: 'Pending' | 'Partial' | 'Overdue';
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Payable - Money owed to vendors
 */
export interface Payable {
  id: string;
  vendorId: string;
  vendorName: string;
  
  // Bill
  billId: string;
  billNumber: string;
  billDate: Date;
  
  // Project
  projectId?: string;
  projectName?: string;
  
  // Amount
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  
  // Due Date
  dueDate: Date;
  overdueDays: number;
  agingBucket: AgingBucket;
  
  // Status
  status: 'Pending' | 'Partial' | 'Overdue';
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Project Finance - Financial summary for a project
 */
export interface ProjectFinance {
  id: string;
  projectId: string;
  projectName: string;
  
  // Budget
  estimatedCost: number;
  actualCost: number;
  budgetVariance: number;
  remainingBudget: number;
  
  // Revenue
  totalRevenue: number;
  receivedAmount: number;
  pendingReceivables: number;
  
  // Expenses
  totalExpenses: number;
  materialCost: number;
  labourCost: number;
  otherCost: number;
  
  // Profit
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  
  // Payables
  pendingPayables: number;
  
  // Health
  financialHealth: FinancialHealth;
  
  // Timestamps
  lastUpdated: Date;
}

/**
 * GST Record - GST tracking
 */
export interface GSTRecord {
  id: string;
  period: string; // YYYY-MM
  periodType: 'Monthly' | 'Quarterly';
  
  // GST
  gstType: GSTType;
  gstInput: number;
  gstOutput: number;
  gstPayable: number;
  gstRefundable: number;
  
  // Status
  status: 'Draft' | 'Filed' | 'Paid' | 'Refunded';
  
  // Filing
  filedAt?: Date;
  paidAt?: Date;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Budget - Project budget tracking
 */
export interface Budget {
  id: string;
  projectId: string;
  projectName: string;
  
  // Budget
  plannedBudget: number;
  actualSpend: number;
  variance: number;
  remainingBudget: number;
  
  // Thresholds
  warningThreshold: number; // percentage
  criticalThreshold: number; // percentage
  
  // Alert
  isOverBudget: boolean;
  variancePercentage: number;
  
  // Breakdown
  materialBudget?: number;
  labourBudget?: number;
  overheadBudget?: number;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Finance Activity - Timeline events for finance
 */
export type FinanceActivityType =
  | 'income_created'
  | 'income_updated'
  | 'expense_created'
  | 'expense_updated'
  | 'expense_approved'
  | 'expense_rejected'
  | 'invoice_created'
  | 'invoice_sent'
  | 'invoice_paid'
  | 'invoice_overdue'
  | 'payment_created'
  | 'payment_completed'
  | 'payment_failed'
  | 'vendor_created'
  | 'vendor_updated'
  | 'vendor_payment'
  | 'gst_recorded'
  | 'gst_filed'
  | 'ledger_entry'
  | 'budget_updated'
  | 'budget_overrun'
  | 'receivable_created'
  | 'payable_created'
  | 'bank_transaction';

export interface FinanceActivity {
  id: string;
  type: FinanceActivityType;
  description: string;
  performedBy: string;
  performedAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Finance Stats
 */
export interface FinanceStats {
  totalInvoiced: number;
  totalReceived: number;
  totalExpenses: number;
  pendingReceivables: number;
  pendingPayables: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  cashInflow: number;
  cashOutflow: number;
  outstandingInvoices: number;
  overduePayments: number;
  gstLiability: number;
  availableCashPosition: number;
  // Optional percentage changes (calculated by backend)
  totalInvoicedChange?: number;
  totalReceivedChange?: number;
  totalExpensesChange?: number;
  pendingReceivablesChange?: number;
  pendingPayablesChange?: number;
  cashInflowChange?: number;
  cashOutflowChange?: number;
  availableCashChange?: number;
  projectProfitability: number;
}

/**
 * Finance Filters
 */
export interface FinanceFilters {
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  customerId?: string;
  projectId?: string;
  vendorId?: string;
  status?: string;
  category?: string;
  paymentMethod?: string;
}

// ─── DTOs ──────────────────────────────────────────────────────────────────────

export interface CreateIncomeDto {
  customerId: string;
  projectId?: string;
  invoiceId?: string;
  amount: number;
  taxAmount?: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  transactionId?: string;
  notes?: string;
  category: IncomeCategory;
}

export interface CreateExpenseDto {
  vendorId: string;
  category: ExpenseCategory;
  subCategory?: string;
  projectId?: string;
  amount: number;
  taxAmount?: number;
  date: Date;
  description: string;
  receiptNumber?: string;
  invoiceNumber?: string;
  notes?: string;
  attachments?: string[];
}

export interface CreateInvoiceDto {
  customerId: string;
  projectId?: string;
  sourceType: 'Estimate' | 'Proposal' | 'Quotation' | 'Project' | 'Manual';
  sourceId?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  gstType: GSTType;
  dueDate: Date;
  paymentTerms: string;
  lineItems: InvoiceLineItem[];
}

export interface CreatePaymentDto {
  type: 'Advance' | 'Stage' | 'Partial' | 'Full' | 'Refund';
  invoiceId?: string;
  customerId: string;
  projectId?: string;
  amount: number;
  taxAmount?: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  transactionId?: string;
  notes?: string;
  attachments?: string[];
}

export interface CreateVendorDto {
  name: string;
  gstNumber?: string;
  panNumber?: string;
  contactPerson: string;
  mobile: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  creditLimit?: number;
  creditPeriod?: number;
  paymentTerms?: string;
}

export interface CreateBankAccountDto {
  accountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  accountType: 'Current' | 'Savings';
}

export interface CreateBudgetDto {
  projectId: string;
  plannedBudget: number;
  warningThreshold: number;
  criticalThreshold: number;
  materialBudget?: number;
  labourBudget?: number;
  overheadBudget?: number;
}

/**
 * Revenue Pipeline
 * Tracks potential revenue from quotations
 */
export interface RevenuePipeline {
  id: string;
  
  // Source
  quotationId: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  projectId?: string;
  projectName?: string;
  
  // Amount
  grandTotal: number;
  materialCost: number;
  labourCost: number;
  otherCosts: number;
  
  // Status
  status: 'Draft' | 'Sent' | 'Viewed' | 'Accepted' | 'Rejected' | 'Expired' | 'Converted' | 'Cancelled';
  
  // Probability
  probability: number; // 0-100
  expectedCloseDate?: Date;
  
  // Conversion
  convertedToProject?: boolean;
  convertedAt?: Date;
  
  // Invoice
  invoiceId?: string;
  invoiceNumber?: string;
  invoiceGeneratedAt?: Date;
  
  // Payment
  paymentReceived?: number;
  paymentPending?: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt?: Date;
}
