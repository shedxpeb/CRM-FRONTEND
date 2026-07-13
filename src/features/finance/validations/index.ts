/**
 * Finance Validation Schemas
 * Using Zod for type-safe form validation
 */
import { z } from 'zod';

/**
 * Create Income Schema
 */
export const createIncomeSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  projectId: z.string().optional().or(z.literal('')),
  invoiceId: z.string().optional().or(z.literal('')),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  taxAmount: z.coerce.number().min(0, 'Tax must be 0 or more').optional(),
  paymentDate: z.coerce.date(),
  paymentMethod: z.enum(['Bank Transfer', 'UPI', 'Cash', 'Cheque', 'RTGS', 'NEFT', 'IMPS', 'Credit Card', 'Debit Card']),
  referenceNumber: z.string().optional().or(z.literal('')),
  transactionId: z.string().optional().or(z.literal('')),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  category: z.enum(['Project Revenue', 'Advance Payment', 'Stage Payment', 'Partial Payment', 'Final Payment', 'Miscellaneous Income']),
});

export const updateIncomeSchema = createIncomeSchema.partial();

/**
 * Create Expense Schema
 */
export const createExpenseSchema = z.object({
  vendorId: z.string().min(1, 'Vendor is required'),
  category: z.enum(['Material Purchase', 'Labour Cost', 'Transport', 'Machinery', 'Fabrication', 'Installation', 'Site Expenses', 'Administrative Expenses', 'Miscellaneous Expenses']),
  subCategory: z.string().optional().or(z.literal('')),
  projectId: z.string().optional().or(z.literal('')),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  taxAmount: z.coerce.number().min(0, 'Tax must be 0 or more').optional(),
  date: z.coerce.date(),
  description: z.string().min(2, 'Description must be at least 2 characters').max(500, 'Description must be less than 500 characters'),
  receiptNumber: z.string().optional().or(z.literal('')),
  invoiceNumber: z.string().optional().or(z.literal('')),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  attachments: z.array(z.string()).optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

/**
 * Create Invoice Schema
 */
export const createInvoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  projectId: z.string().optional().or(z.literal('')),
  sourceType: z.enum(['Estimate', 'Proposal', 'Quotation', 'Project', 'Manual']),
  sourceId: z.string().optional().or(z.literal('')),
  subtotal: z.coerce.number().min(0, 'Subtotal must be 0 or more'),
  taxAmount: z.coerce.number().min(0, 'Tax must be 0 or more'),
  totalAmount: z.coerce.number().min(0.01, 'Total amount must be greater than 0'),
  gstType: z.enum(['CGST', 'SGST', 'IGST', 'CESS']),
  dueDate: z.coerce.date(),
  paymentTerms: z.string().min(2, 'Payment terms are required').max(200, 'Payment terms must be less than 200 characters'),
  lineItems: z.array(z.object({
    description: z.string().min(2, 'Description is required'),
    quantity: z.coerce.number().min(0.01, 'Quantity must be greater than 0'),
    unit: z.string().min(1, 'Unit is required'),
    rate: z.coerce.number().min(0, 'Rate must be 0 or more'),
    amount: z.coerce.number().min(0, 'Amount must be 0 or more'),
    taxRate: z.coerce.number().min(0, 'Tax rate must be 0 or more').max(100, 'Tax rate cannot exceed 100%').optional(),
    taxAmount: z.coerce.number().min(0, 'Tax amount must be 0 or more').optional(),
  })).min(1, 'At least one line item is required'),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

/**
 * Create Payment Schema
 */
export const createPaymentSchema = z.object({
  type: z.enum(['Advance', 'Stage', 'Partial', 'Full', 'Refund']),
  invoiceId: z.string().optional().or(z.literal('')),
  customerId: z.string().min(1, 'Customer is required'),
  projectId: z.string().optional().or(z.literal('')),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  taxAmount: z.coerce.number().min(0, 'Tax must be 0 or more').optional(),
  paymentDate: z.coerce.date(),
  paymentMethod: z.enum(['Bank Transfer', 'UPI', 'Cash', 'Cheque', 'RTGS', 'NEFT', 'IMPS', 'Credit Card', 'Debit Card']),
  referenceNumber: z.string().optional().or(z.literal('')),
  transactionId: z.string().optional().or(z.literal('')),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  attachments: z.array(z.string()).optional(),
});

export const updatePaymentSchema = createPaymentSchema.partial();

/**
 * Create Vendor Schema
 */
export const createVendorSchema = z.object({
  name: z.string()
    .min(2, 'Vendor name must be at least 2 characters')
    .max(100, 'Vendor name must be less than 100 characters'),
  gstNumber: z.string()
    .regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/, 'Invalid GST number format')
    .optional()
    .or(z.literal('')),
  panNumber: z.string()
    .regex(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, 'Invalid PAN number format')
    .optional()
    .or(z.literal('')),
  contactPerson: z.string().min(2, 'Contact person is required').max(100),
  mobile: z.string()
    .regex(/^\+91\s\d{5}\s\d{5}$/, 'Mobile must be in format: +91 XXXXX XXXXX'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().min(2, 'Address is required').max(500),
  city: z.string().min(2, 'City is required').max(50),
  state: z.string().min(2, 'State is required').max(50),
  pincode: z.string()
    .regex(/^\d{6}$/, 'Invalid pincode format')
    .optional()
    .or(z.literal('')),
  creditLimit: z.coerce.number().min(0, 'Credit limit must be 0 or more').optional(),
  creditPeriod: z.coerce.number().min(0, 'Credit period must be 0 or more').optional(),
  paymentTerms: z.string().max(200, 'Payment terms must be less than 200 characters').optional(),
});

export const updateVendorSchema = createVendorSchema.partial();

/**
 * Create Bank Account Schema
 */
export const createBankAccountSchema = z.object({
  accountName: z.string()
    .min(2, 'Account name must be at least 2 characters')
    .max(100, 'Account name must be less than 100 characters'),
  bankName: z.string()
    .min(2, 'Bank name must be at least 2 characters')
    .max(100, 'Bank name must be less than 100 characters'),
  accountNumber: z.string()
    .min(8, 'Account number must be at least 8 characters')
    .max(18, 'Account number must be less than 18 characters'),
  ifscCode: z.string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
  branch: z.string()
    .min(2, 'Branch is required')
    .max(100, 'Branch must be less than 100 characters'),
  accountType: z.enum(['Current', 'Savings']),
});

export const updateBankAccountSchema = createBankAccountSchema.partial();

/**
 * Create Budget Schema
 */
export const createBudgetSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  plannedBudget: z.coerce.number().min(0, 'Planned budget must be 0 or more'),
  warningThreshold: z.coerce.number().min(0, 'Warning threshold must be 0 or more').max(100, 'Warning threshold cannot exceed 100%'),
  criticalThreshold: z.coerce.number().min(0, 'Critical threshold must be 0 or more').max(100, 'Critical threshold cannot exceed 100%'),
  materialBudget: z.coerce.number().min(0, 'Material budget must be 0 or more').optional(),
  labourBudget: z.coerce.number().min(0, 'Labour budget must be 0 or more').optional(),
  overheadBudget: z.coerce.number().min(0, 'Overhead budget must be 0 or more').optional(),
});

export const updateBudgetSchema = createBudgetSchema.partial();

// Form data types
export type CreateIncomeFormData = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeFormData = z.infer<typeof updateIncomeSchema>;
export type CreateExpenseFormData = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseFormData = z.infer<typeof updateExpenseSchema>;
export type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceFormData = z.infer<typeof updateInvoiceSchema>;
export type CreatePaymentFormData = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentFormData = z.infer<typeof updatePaymentSchema>;
export type CreateVendorFormData = z.infer<typeof createVendorSchema>;
export type UpdateVendorFormData = z.infer<typeof updateVendorSchema>;
export type CreateBankAccountFormData = z.infer<typeof createBankAccountSchema>;
export type UpdateBankAccountFormData = z.infer<typeof updateBankAccountSchema>;
export type CreateBudgetFormData = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetFormData = z.infer<typeof updateBudgetSchema>;
