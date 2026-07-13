/**
 * Documents Module Validation Schemas
 * Zod schemas for document and template validation
 */

import { z } from 'zod';
import { DocumentType, TemplateType, NumberingPattern } from '../types';

// ─── Document Line Item Schema ──────────────────────────────────────────────────

const documentLineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0, 'Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  rate: z.number().min(0, 'Rate must be positive'),
  amount: z.number().min(0, 'Amount must be positive'),
  taxRate: z.number().min(0).max(100).optional(),
  taxAmount: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  itemId: z.string().optional(),
  itemCode: z.string().optional(),
});

// ─── Create Document Schema ───────────────────────────────────────────────────────

export const createDocumentSchema = z.object({
  documentType: z.enum(['Estimate', 'Proposal', 'Quotation']),
  customerId: z.string().min(1, 'Customer is required'),
  leadId: z.string().optional(),
  projectId: z.string().optional(),
  subtotal: z.number().min(0, 'Subtotal must be positive'),
  taxAmount: z.number().min(0, 'Tax amount must be positive'),
  totalAmount: z.number().min(0, 'Total amount must be positive'),
  discountAmount: z.number().min(0).optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  gstType: z.enum(['CGST', 'SGST', 'IGST', 'CESS']),
  validUntil: z.date().optional(),
  paymentTerms: z.string().min(1, 'Payment terms are required'),
  deliveryTerms: z.string().optional(),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  lineItems: z.array(documentLineItemSchema).min(1, 'At least one line item is required'),
  templateId: z.string().optional(),
}).refine(
  (data) => {
    if (data.discountPercentage && data.discountAmount) {
      return false;
    }
    return true;
  },
  {
    message: 'Provide either discount percentage or discount amount, not both',
    path: ['discountPercentage'],
  }
);

// ─── Update Document Schema ───────────────────────────────────────────────────────

export const updateDocumentSchema = z.object({
  subtotal: z.number().min(0).optional(),
  taxAmount: z.number().min(0).optional(),
  totalAmount: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  validUntil: z.date().optional(),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  lineItems: z.array(documentLineItemSchema).optional(),
  templateId: z.string().optional(),
}).refine(
  (data) => {
    if (data.discountPercentage && data.discountAmount) {
      return false;
    }
    return true;
  },
  {
    message: 'Provide either discount percentage or discount amount, not both',
    path: ['discountPercentage'],
  }
);

// ─── Create Template Schema ───────────────────────────────────────────────────────

export const createTemplateSchema = z.object({
  templateType: z.enum(['Estimate', 'Proposal', 'Quotation', 'Invoice']),
  name: z.string().min(1, 'Template name is required').max(100, 'Template name must be less than 100 characters'),
  description: z.string().optional(),
  header: z.string().optional(),
  footer: z.string().optional(),
  termsAndConditions: z.string().optional(),
  layout: z.enum(['Standard', 'Detailed', 'Compact', 'Custom']),
  numberingPattern: z.enum(['Sequential', 'CustomerBased', 'ProjectBased', 'DateBased']),
  numberingPrefix: z.string().max(10, 'Prefix must be less than 10 characters').optional(),
  numberingStart: z.number().int().min(1).optional(),
  defaultPaymentTerms: z.string().optional(),
  defaultDeliveryTerms: z.string().optional(),
  defaultValidDays: z.number().int().min(1).max(365).optional(),
  isDefault: z.boolean().optional(),
});

// ─── Update Template Schema ───────────────────────────────────────────────────────

export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  header: z.string().optional(),
  footer: z.string().optional(),
  termsAndConditions: z.string().optional(),
  layout: z.enum(['Standard', 'Detailed', 'Compact', 'Custom']).optional(),
  numberingPattern: z.enum(['Sequential', 'CustomerBased', 'ProjectBased', 'DateBased']).optional(),
  numberingPrefix: z.string().max(10).optional(),
  numberingStart: z.number().int().min(1).optional(),
  defaultPaymentTerms: z.string().optional(),
  defaultDeliveryTerms: z.string().optional(),
  defaultValidDays: z.number().int().min(1).max(365).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// ─── Send Document Schema ────────────────────────────────────────────────────────

export const sendDocumentSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required'),
  recipientEmails: z.array(z.string().email('Invalid email address')).min(1, 'At least one recipient email is required'),
  recipientPhones: z.array(z.string()).optional(),
  subject: z.string().optional(),
  message: z.string().optional(),
  includePdf: z.boolean().optional(),
});

// ─── Convert Document Schema ─────────────────────────────────────────────────────

export const convertDocumentSchema = z.object({
  sourceDocumentId: z.string().min(1, 'Source document ID is required'),
  targetType: z.enum(['Estimate', 'Proposal', 'Quotation']),
  updateLineItems: z.boolean().optional(),
  updatePricing: z.boolean().optional(),
});

// ─── Request Approval Schema ─────────────────────────────────────────────────────

export const requestApprovalSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required'),
  workflowId: z.string().optional(),
  notes: z.string().optional(),
});

// ─── Approval Decision Schema ────────────────────────────────────────────────────

export const approvalDecisionSchema = z.object({
  approvalId: z.string().min(1, 'Approval ID is required'),
  decision: z.enum(['Approved', 'Rejected']),
  notes: z.string().optional(),
});

// ─── Create Version Schema ───────────────────────────────────────────────────────

export const createVersionSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required'),
  changeDescription: z.string().min(1, 'Change description is required'),
});

// ─── Type Exports ────────────────────────────────────────────────────────────────

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type SendDocumentInput = z.infer<typeof sendDocumentSchema>;
export type ConvertDocumentInput = z.infer<typeof convertDocumentSchema>;
export type RequestApprovalInput = z.infer<typeof requestApprovalSchema>;
export type ApprovalDecisionInput = z.infer<typeof approvalDecisionSchema>;
export type CreateVersionInput = z.infer<typeof createVersionSchema>;
