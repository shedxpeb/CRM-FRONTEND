/**
 * Documents Module Types
 * Single Source of Truth for all document data across the ERP platform
 * Documents module manages Estimates, Proposals, Quotations, Templates, Approvals
 * Supports full commercial lifecycle from Lead to Invoice
 */

export type DocumentType = 'Estimate' | 'Proposal' | 'Quotation' | 'Invoice';

export type DocumentStatus =
  | 'Draft'
  | 'Sent'
  | 'Viewed'
  | 'Accepted'
  | 'Rejected'
  | 'Expired'
  | 'Converted'
  | 'Cancelled';

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export type TemplateType = 'Estimate' | 'Proposal' | 'Quotation' | 'Invoice';

export type NumberingPattern = 'Sequential' | 'CustomerBased' | 'ProjectBased' | 'DateBased';

/**
 * Document - Base document interface
 */
export interface Document {
  id: string;
  documentNumber: string;
  version: number;
  
  // Type
  documentType: DocumentType;
  
  // Customer
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerGST?: string;
  
  // Lead/Project
  leadId?: string;
  leadNumber?: string;
  projectId?: string;
  projectName?: string;
  
  // Amount
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  discountAmount?: number;
  discountPercentage?: number;
  
  // GST
  gstType: 'CGST' | 'SGST' | 'IGST' | 'CESS';
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  cessAmount?: number;
  
  // Terms
  validUntil?: Date;
  paymentTerms: string;
  deliveryTerms?: string;
  notes?: string;
  termsAndConditions?: string;
  
  // Status
  status: DocumentStatus;
  
  // Approval
  approvalStatus?: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  
  // Line Items
  lineItems: DocumentLineItem[];
  
  // Template
  templateId?: string;
  templateName?: string;
  
  // Conversion
  convertedTo?: DocumentType;
  convertedFrom?: DocumentType;
  convertedDocumentId?: string;
  
  // Timestamps
  sentAt?: Date;
  viewedAt?: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;

  customFields?: Record<string, string | number | boolean | undefined>;
}

export interface DocumentLineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  taxRate?: number;
  taxAmount?: number;
  discountAmount?: number;
  itemId?: string; // Link to inventory item
  itemCode?: string;
}

/**
 * Document Template
 */
export interface DocumentTemplate {
  id: string;
  templateCode: string;
  
  // Type
  templateType: TemplateType;
  
  // Basic Info
  name: string;
  description?: string;
  
  // Content
  header?: string;
  footer?: string;
  termsAndConditions?: string;
  
  // Layout
  layout: 'Standard' | 'Detailed' | 'Compact' | 'Custom';
  
  // Numbering
  numberingPattern: NumberingPattern;
  numberingPrefix?: string;
  numberingStart?: number;
  
  // Default Values
  defaultPaymentTerms?: string;
  defaultDeliveryTerms?: string;
  defaultValidDays?: number;
  
  // Status
  isDefault: boolean;
  isActive: boolean;
  
  // Usage
  usageCount: number;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Document Approval
 */
export interface DocumentApproval {
  id: string;
  approvalNumber: string;
  
  // Document
  documentId: string;
  documentNumber: string;
  documentType: DocumentType;
  
  // Amount
  amount: number;
  
  // Workflow
  workflowId?: string;
  workflowName?: string;
  currentStep: number;
  totalSteps: number;
  
  // Approval Chain
  approvalChain: ApprovalStep[];
  
  // Status
  status: ApprovalStatus;
  
  // Current Approver
  currentApproverId?: string;
  currentApproverName?: string;
  
  // Decision
  decision?: 'Approved' | 'Rejected';
  decisionBy?: string;
  decisionAt?: Date;
  decisionNotes?: string;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApprovalStep {
  step: number;
  approverId: string;
  approverName: string;
  approverRole: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Skipped';
  decisionAt?: Date;
  notes?: string;
}

/**
 * Document Version
 */
export interface DocumentVersion {
  id: string;
  version: number;
  
  // Document
  documentId: string;
  documentNumber: string;
  documentType: DocumentType;
  
  // Changes
  changeDescription: string;
  changedBy: string;
  changedAt: Date;
  
  // Snapshot
  documentData: Document;
  
  // Comparison
  changes: VersionChange[];
}

export interface VersionChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'modified' | 'deleted';
}

/**
 * Document Activity
 */
export type DocumentActivityType =
  | 'document_created'
  | 'document_updated'
  | 'document_sent'
  | 'document_viewed'
  | 'document_accepted'
  | 'document_rejected'
  | 'document_expired'
  | 'document_converted'
  | 'document_cancelled'
  | 'approval_requested'
  | 'approval_approved'
  | 'approval_rejected'
  | 'version_created'
  | 'template_created'
  | 'template_updated'
  | 'comment_added'
  | 'attachment_added';

export interface DocumentActivity {
  id: string;
  type: DocumentActivityType;
  description: string;
  performedBy: string;
  performedAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Document Stats
 */
export interface DocumentStats {
  totalEstimates: number;
  totalProposals: number;
  totalQuotations: number;
  totalInvoices: number;
  totalDocuments: number;
  draftDocuments: number;
  approvedDocuments: number;
  sentDocuments: number;
  viewedDocuments: number;
  acceptedDocuments: number;
  rejectedDocuments: number;
  expiredDocuments: number;
  convertedDocuments: number;
  pendingApprovals: number;
  totalRevenuePipeline: number;
  conversionRate: number;
  averageDealSize: number;
  monthlyDocuments: number;
  monthlyRevenue: number;
}

/**
 * Document Filters
 */
export interface DocumentFilters {
  documentType?: DocumentType;
  status?: DocumentStatus;
  customerId?: string;
  customerName?: string;
  projectId?: string;
  projectName?: string;
  createdBy?: string;
  leadId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  amountFrom?: number;
  amountTo?: number;
  search?: string;
}

/**
 * Template Filters
 */
export interface TemplateFilters {
  templateType?: TemplateType;
  isActive?: boolean;
  search?: string;
}

// ─── DTOs ──────────────────────────────────────────────────────────────────────

export interface CreateDocumentDto {
  documentType: DocumentType;
  customerId: string;
  leadId?: string;
  projectId?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  discountAmount?: number;
  discountPercentage?: number;
  gstType: 'CGST' | 'SGST' | 'IGST' | 'CESS';
  validUntil?: Date;
  paymentTerms: string;
  deliveryTerms?: string;
  notes?: string;
  termsAndConditions?: string;
  lineItems: Omit<DocumentLineItem, 'id'>[];
  templateId?: string;
}

export interface UpdateDocumentDto {
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  discountAmount?: number;
  discountPercentage?: number;
  validUntil?: Date;
  paymentTerms?: string;
  deliveryTerms?: string;
  notes?: string;
  termsAndConditions?: string;
  lineItems?: DocumentLineItem[];
  templateId?: string;
}

export interface CreateTemplateDto {
  templateType: TemplateType;
  name: string;
  description?: string;
  header?: string;
  footer?: string;
  termsAndConditions?: string;
  layout: 'Standard' | 'Detailed' | 'Compact' | 'Custom';
  numberingPattern: NumberingPattern;
  numberingPrefix?: string;
  numberingStart?: number;
  defaultPaymentTerms?: string;
  defaultDeliveryTerms?: string;
  defaultValidDays?: number;
  isDefault?: boolean;
}

export interface UpdateTemplateDto {
  name?: string;
  description?: string;
  header?: string;
  footer?: string;
  termsAndConditions?: string;
  layout?: 'Standard' | 'Detailed' | 'Compact' | 'Custom';
  numberingPattern?: NumberingPattern;
  numberingPrefix?: string;
  numberingStart?: number;
  defaultPaymentTerms?: string;
  defaultDeliveryTerms?: string;
  defaultValidDays?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface SendDocumentDto {
  documentId: string;
  recipientEmails: string[];
  recipientPhones?: string[];
  subject?: string;
  message?: string;
  includePdf?: boolean;
}

export interface ConvertDocumentDto {
  sourceDocumentId: string;
  targetType: DocumentType;
  updateLineItems?: boolean;
  updatePricing?: boolean;
}

export interface RequestApprovalDto {
  documentId: string;
  workflowId?: string;
  notes?: string;
}

export interface ApprovalDecisionDto {
  approvalId: string;
  decision: 'Approved' | 'Rejected';
  notes?: string;
}

export interface CreateVersionDto {
  documentId: string;
  changeDescription: string;
}
