import { ROUTES } from '@/core/routes';
import { Document, DocumentType } from '@/features/documents/types';
import { Estimate, Proposal, Quotation } from '@/features/documents/types/peb-commercial';

export type CommercialDocumentKind = 'estimate' | 'proposal' | 'quotation' | 'invoice';

export type AnyCommercialDocument = Estimate | Proposal | Quotation | Document;

export interface UnifiedDocument {
  id: string;
  kind: CommercialDocumentKind;
  documentType: DocumentType;
  documentNumber: string;
  customerId: string;
  customerName: string;
  projectId?: string;
  projectName?: string;
  leadId?: string;
  status: string;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  source: AnyCommercialDocument;
}

export function isEstimate(doc: AnyCommercialDocument): doc is Estimate {
  return 'estimateNumber' in doc && Boolean((doc as Estimate).estimateNumber);
}

export function isProposal(doc: AnyCommercialDocument): doc is Proposal {
  return 'proposalNumber' in doc && Boolean((doc as Proposal).proposalNumber);
}

export function isQuotation(doc: AnyCommercialDocument): doc is Quotation {
  return 'quotationNumber' in doc && Boolean((doc as Quotation).quotationNumber);
}

export function isApiDocument(doc: AnyCommercialDocument): doc is Document {
  return 'documentType' in doc && 'documentNumber' in doc && !isEstimate(doc) && !isProposal(doc) && !isQuotation(doc);
}

export function getDocumentType(doc: AnyCommercialDocument): DocumentType {
  if (isEstimate(doc)) return 'Estimate';
  if (isProposal(doc)) return 'Proposal';
  if (isQuotation(doc)) return 'Quotation';
  if (isApiDocument(doc)) return doc.documentType;
  return 'Estimate';
}

export function getDocumentNumber(doc: AnyCommercialDocument): string {
  if (isEstimate(doc)) return doc.estimateNumber;
  if (isProposal(doc)) return doc.proposalNumber;
  if (isQuotation(doc)) return doc.quotationNumber;
  if (isApiDocument(doc)) return doc.documentNumber;
  return '-';
}

export function getDocumentTotal(doc: AnyCommercialDocument): number {
  if (isQuotation(doc)) return doc.grandTotal ?? 0;
  if (isApiDocument(doc)) return doc.totalAmount ?? 0;
  if (isProposal(doc)) return doc.commercialSummary?.indicativeTotal ?? doc.commercialSummary?.subtotal ?? 0;
  if (isEstimate(doc)) return doc.totalAmount ?? 0;
  return 0;
}

export function getDocumentSubtotal(doc: AnyCommercialDocument): number | undefined {
  if (isQuotation(doc)) return doc.subtotal;
  if (isApiDocument(doc)) return doc.subtotal;
  if (isProposal(doc)) return doc.commercialSummary?.subtotal;
  if (isEstimate(doc)) return doc.subtotal;
  return undefined;
}

export function getDocumentTax(doc: AnyCommercialDocument): number | undefined {
  if (isQuotation(doc)) return doc.taxAmount;
  if (isApiDocument(doc)) return doc.taxAmount;
  return undefined;
}

export function getDocumentDiscount(doc: AnyCommercialDocument): number | undefined {
  if (isQuotation(doc)) return doc.discountAmount;
  if (isApiDocument(doc)) return doc.discountAmount;
  return undefined;
}

export function getLineItems(doc: AnyCommercialDocument) {
  if (isApiDocument(doc)) return doc.lineItems ?? [];
  if ('materialSelections' in doc && doc.materialSelections?.length) {
    return doc.materialSelections.map((m) => ({
      id: m.id,
      description: m.itemName,
      quantity: m.quantity ?? 0,
      unit: m.unit ?? '-',
      rate: m.rate ?? 0,
      amount: (m.quantity ?? 0) * (m.rate ?? 0),
      itemCode: m.itemCode,
    }));
  }
  return [];
}

export function normalizeEstimate(estimate: Estimate): UnifiedDocument {
  return {
    id: estimate.id,
    kind: 'estimate',
    documentType: 'Estimate',
    documentNumber: estimate.estimateNumber,
    customerId: estimate.customerId,
    customerName: estimate.customerName,
    projectId: estimate.projectId,
    projectName: estimate.projectName,
    leadId: estimate.leadId,
    status: estimate.status,
    subtotal: estimate.subtotal,
    totalAmount: estimate.totalAmount ?? 0,
    createdAt: estimate.createdAt,
    updatedAt: estimate.updatedAt,
    createdBy: estimate.salesExecutive ?? (estimate as Estimate & { createdBy?: string }).createdBy,
    source: estimate,
  };
}

export function normalizeProposal(proposal: Proposal): UnifiedDocument {
  return {
    id: proposal.id,
    kind: 'proposal',
    documentType: 'Proposal',
    documentNumber: proposal.proposalNumber,
    customerId: proposal.customerId,
    customerName: proposal.customerName,
    projectId: proposal.projectId,
    projectName: proposal.projectName,
    leadId: proposal.leadId,
    status: proposal.status,
    subtotal: proposal.commercialSummary?.subtotal,
    totalAmount: proposal.commercialSummary?.indicativeTotal ?? proposal.commercialSummary?.subtotal ?? 0,
    createdAt: proposal.createdAt,
    updatedAt: proposal.updatedAt,
    createdBy: proposal.createdBy,
    source: proposal,
  };
}

export function normalizeQuotation(quotation: Quotation): UnifiedDocument {
  return {
    id: quotation.id,
    kind: 'quotation',
    documentType: 'Quotation',
    documentNumber: quotation.quotationNumber,
    customerId: quotation.customerId,
    customerName: quotation.customerName,
    projectId: quotation.projectId,
    projectName: quotation.projectName,
    status: quotation.status,
    subtotal: quotation.subtotal,
    taxAmount: quotation.taxAmount,
    discountAmount: quotation.discountAmount,
    totalAmount: quotation.grandTotal ?? 0,
    createdAt: quotation.createdAt,
    updatedAt: quotation.updatedAt,
    createdBy: quotation.createdBy,
    source: quotation,
  };
}

export function normalizeApiDocument(document: Document): UnifiedDocument {
  const kind: CommercialDocumentKind =
    document.documentType === 'Invoice' ? 'invoice' :
    document.documentType === 'Quotation' ? 'quotation' :
    document.documentType === 'Proposal' ? 'proposal' : 'estimate';

  return {
    id: document.id,
    kind,
    documentType: document.documentType,
    documentNumber: document.documentNumber,
    customerId: document.customerId,
    customerName: document.customerName,
    projectId: document.projectId,
    projectName: document.projectName,
    leadId: document.leadId,
    status: document.status,
    subtotal: document.subtotal,
    taxAmount: document.taxAmount,
    discountAmount: document.discountAmount,
    totalAmount: document.totalAmount,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    createdBy: document.createdBy,
    source: document,
  };
}

export function getEditRoute(doc: UnifiedDocument): string {
  if (doc.kind === 'estimate') return `/dashboard/documents/estimates?id=${doc.id}`;
  if (doc.kind === 'proposal') return `/dashboard/documents/proposals?id=${doc.id}`;
  if (doc.kind === 'quotation') return `/dashboard/documents/quotations?id=${doc.id}`;
  return ROUTES.documentsDetail(doc.id);
}

export function getDetailRoute(doc: UnifiedDocument): string {
  return ROUTES.documentsDetail(doc.id);
}
