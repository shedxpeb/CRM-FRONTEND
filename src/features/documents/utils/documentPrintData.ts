import {
  AnyCommercialDocument,
  getDocumentDiscount,
  getDocumentNumber,
  getDocumentSubtotal,
  getDocumentTax,
  getDocumentTotal,
  getDocumentType,
  getLineItems,
  isApiDocument,
  isEstimate,
  isProposal,
  isQuotation,
} from './documentHelpers';
import { Document, DocumentType } from '../types';
import { Estimate, Proposal, Quotation } from '../types/peb-commercial';
import { DEFAULT_TERMS_AND_CONDITIONS } from '../constants';

export interface PrintLineItem {
  id?: string;
  itemCode?: string;
  description: string;
  quantity: number | string;
  unit: string;
  rate?: number | string;
  amount?: number | string;
  extra?: string;
}

export interface PrintCompanyInfo {
  name: string;
  legalName?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  gst?: string;
  website?: string;
}

export interface DocumentPrintModel {
  documentType: DocumentType;
  documentNumber: string;
  documentDate?: Date;
  validUntil?: Date;
  status: string;
  version?: number;
  createdBy?: string;

  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerGst?: string;

  projectName?: string;
  leadNumber?: string;
  sourceDocumentNumber?: string;
  sourceDocumentLabel?: string;

  lineItems: PrintLineItem[];
  showRates: boolean;

  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  discountPercentage?: number;
  grandTotal: number;
  gstType?: string;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  paymentTerms?: string;
  deliveryTerms?: string;
  amountInWords?: string;

  termsAndConditions?: string;
  notes?: string;

  estimateSections?: {
    includePricing: boolean;
    technicalSpecs: Array<{ label: string; value: string }>;
    inclusions: string[];
    exclusions: string[];
    scopeItems: Array<{ name: string; state: string }>;
  };

  proposalSections?: {
    estimateNumber?: string;
    proposalNumber?: string;
    scopeItems: Array<{ name: string; state: string }>;
    timeline?: string;
    companyProfile?: string;
    projectOverview?: string;
    scopeOfWork?: string;
    indicativeTotal?: number;
    inclusions: string[];
    exclusions: string[];
  };

  quotationSections?: {
    proposalNumber?: string;
    sourceEstimateNumber?: string;
    validityLabel?: string;
    costBreakdown: Array<{ label: string; amount: number }>;
  };

  invoiceSections?: {
    convertedFrom?: string;
    convertedDocumentId?: string;
    dueDate?: Date;
    taxLines: Array<{ label: string; amount: number }>;
  };
}

function getCustomerFields(doc: AnyCommercialDocument) {
  if (isApiDocument(doc)) {
    return {
      customerName: doc.customerName,
      customerEmail: doc.customerEmail,
      customerPhone: doc.customerPhone,
      customerAddress: doc.customerAddress,
      customerGst: doc.customerGST,
      projectName: doc.projectName,
      leadNumber: doc.leadNumber,
    };
  }
  const peb = doc as Estimate | Proposal | Quotation;
  return {
    customerName: peb.customerName,
    customerEmail: peb.customerEmail,
    customerPhone: peb.customerPhone,
    customerAddress: peb.customerAddress,
    customerGst: peb.customerGST,
    projectName: peb.projectName,
    leadNumber: peb.leadNumber,
  };
}

function buildScopeItems(scope?: Estimate['scopeConfiguration']) {
  if (!scope) return [];
  const entries: Array<{ name: string; state: string }> = [
    { name: 'Labour', state: scope.labour?.state ?? '-' },
    { name: 'Installation', state: scope.installation?.state ?? '-' },
    { name: 'Transportation', state: scope.transportation?.state ?? '-' },
    { name: 'Crane', state: scope.crane?.state ?? '-' },
    { name: 'Civil Work', state: scope.civilWork?.state ?? '-' },
    { name: 'Accommodation', state: scope.accommodation?.state ?? '-' },
    { name: 'Erection', state: scope.erection?.state ?? '-' },
    { name: 'Freight', state: scope.freight?.state ?? '-' },
  ];
  return entries;
}

function buildTechnicalSpecs(specs?: Estimate['technicalSpecifications']) {
  if (!specs) return [];
  const rows: Array<{ label: string; value: string }> = [];
  if (specs.buildingLength) rows.push({ label: 'Building Length', value: `${specs.buildingLength} m` });
  if (specs.buildingWidth) rows.push({ label: 'Building Width', value: `${specs.buildingWidth} m` });
  if (specs.buildingHeight) rows.push({ label: 'Building Height', value: `${specs.buildingHeight} m` });
  if (specs.baySpacing) rows.push({ label: 'Bay Spacing', value: `${specs.baySpacing} m` });
  if (specs.roofSlope) rows.push({ label: 'Roof Slope', value: `${specs.roofSlope}°` });
  return rows;
}

export function buildDocumentPrintModel(document: AnyCommercialDocument): DocumentPrintModel {
  const docType = getDocumentType(document);
  const customer = getCustomerFields(document);
  const baseItems = getLineItems(document);

  const base: DocumentPrintModel = {
    documentType: docType,
    documentNumber: getDocumentNumber(document),
    documentDate: (document as { createdAt?: Date }).createdAt,
    status: document.status,
    version: 'version' in document ? document.version : undefined,
    createdBy: (document as { createdBy?: string; salesExecutive?: string }).createdBy
      ?? (document as Estimate).salesExecutive,
    ...customer,
    lineItems: baseItems.map((item) => ({
      id: item.id,
      itemCode: item.itemCode,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      rate: item.rate,
      amount: item.amount,
    })),
    showRates: docType === 'Quotation' || docType === 'Invoice',
    subtotal: getDocumentSubtotal(document),
    taxAmount: getDocumentTax(document),
    discountAmount: getDocumentDiscount(document),
    grandTotal: getDocumentTotal(document),
    notes: 'notes' in document ? document.notes : undefined,
    termsAndConditions:
      ('termsAndConditions' in document && document.termsAndConditions) ||
      ('terms' in document && (document as Estimate).terms) ||
      DEFAULT_TERMS_AND_CONDITIONS,
  };

  if (isEstimate(document)) {
    return {
      ...base,
      validUntil: document.validTill ? new Date(document.validTill) : undefined,
      showRates: document.includePricing,
      lineItems: document.materialSelections.map((m) => ({
        id: m.id,
        itemCode: m.itemCode,
        description: m.itemName,
        quantity: m.quantity ?? '-',
        unit: m.unit ?? '-',
        rate: document.includePricing ? m.rate : undefined,
        amount: document.includePricing ? m.amount : undefined,
        extra: m.specification,
      })),
      paymentTerms: document.includePricing ? 'Indicative pricing — final terms in quotation' : undefined,
      estimateSections: {
        includePricing: document.includePricing,
        technicalSpecs: buildTechnicalSpecs(document.technicalSpecifications),
        inclusions: document.inclusions ?? [],
        exclusions: document.exclusions ?? [],
        scopeItems: buildScopeItems(document.scopeConfiguration),
      },
    };
  }

  if (isProposal(document)) {
    return {
      ...base,
      sourceDocumentNumber: document.estimateNumber,
      sourceDocumentLabel: 'Source Estimate',
      showRates: false,
      lineItems: document.materialSelections.map((m) => ({
        id: m.id,
        itemCode: m.itemCode,
        description: m.itemName,
        quantity: m.quantity ?? '-',
        unit: m.unit ?? '-',
        extra: m.config?.state ? `State: ${m.config.state}` : undefined,
      })),
      subtotal: document.commercialSummary?.subtotal,
      grandTotal: document.commercialSummary?.indicativeTotal ?? document.commercialSummary?.subtotal ?? 0,
      taxAmount: undefined,
      discountAmount: undefined,
      paymentTerms: 'Commercial terms to be confirmed in formal quotation',
      proposalSections: {
        estimateNumber: document.estimateNumber,
        proposalNumber: document.proposalNumber,
        scopeItems: buildScopeItems(document.scopeConfiguration),
        timeline: document.timeline?.milestones?.length
          ? `${document.timeline.estimatedDuration ?? ''} ${document.timeline.unit ?? ''} — ${document.timeline.milestones.map((m) => m.milestone).join(', ')}`
          : undefined,
        companyProfile: document.companyProfile,
        projectOverview: document.projectOverview,
        scopeOfWork: document.scopeOfWork,
        indicativeTotal: document.commercialSummary?.indicativeTotal,
        inclusions: document.inclusions ?? [],
        exclusions: document.exclusions ?? [],
      },
    };
  }

  if (isQuotation(document)) {
    const costBreakdown = [
      { label: 'Material Cost', amount: document.materialCost ?? 0 },
      { label: 'Labour', amount: document.labourCost ?? 0 },
      { label: 'Installation', amount: document.installationCost ?? 0 },
      { label: 'Transportation', amount: document.transportationCost ?? 0 },
      { label: 'Crane', amount: document.craneCost ?? 0 },
      { label: 'Civil', amount: document.civilCost ?? 0 },
      { label: 'Erection', amount: document.erectionCost ?? 0 },
      { label: 'Freight', amount: document.freightCost ?? 0 },
    ].filter((row) => row.amount > 0);

    return {
      ...base,
      validUntil: document.validUntil,
      paymentTerms: document.paymentTerms,
      deliveryTerms: document.deliveryTerms,
      discountPercentage: document.discountPercentage,
      gstType: document.gstType,
      cgstAmount: document.cgstAmount,
      sgstAmount: document.sgstAmount,
      igstAmount: document.igstAmount,
      amountInWords: document.amountInWords,
      lineItems: document.materialSelections.map((m) => ({
        id: m.id,
        itemCode: m.itemCode,
        description: m.itemName,
        quantity: m.quantity ?? '-',
        unit: m.unit ?? '-',
        rate: m.rate,
        amount: m.amount,
        extra: m.config?.chargeability,
      })),
      quotationSections: {
        proposalNumber: document.proposalNumber,
        sourceEstimateNumber: document.sourceEstimateNumber,
        validityLabel: document.validUntil
          ? new Date(document.validUntil).toLocaleDateString('en-IN')
          : undefined,
        costBreakdown,
      },
    };
  }

  if (isApiDocument(document) && document.documentType === 'Invoice') {
    const taxLines: Array<{ label: string; amount: number }> = [];
    if (document.cgstAmount) taxLines.push({ label: 'CGST', amount: document.cgstAmount });
    if (document.sgstAmount) taxLines.push({ label: 'SGST', amount: document.sgstAmount });
    if (document.igstAmount) taxLines.push({ label: 'IGST', amount: document.igstAmount });
    if (!taxLines.length && document.taxAmount) taxLines.push({ label: 'Tax', amount: document.taxAmount });

    return {
      ...base,
      paymentTerms: document.paymentTerms,
      deliveryTerms: document.deliveryTerms,
      discountPercentage: document.discountPercentage,
      gstType: document.gstType,
      cgstAmount: document.cgstAmount,
      sgstAmount: document.sgstAmount,
      igstAmount: document.igstAmount,
      validUntil: document.validUntil,
      invoiceSections: {
        convertedFrom: document.convertedFrom,
        convertedDocumentId: document.convertedDocumentId,
        dueDate: document.validUntil,
        taxLines,
      },
    };
  }

  return base;
}

export function getDefaultSignatureTerms(documentType: DocumentType): string[] {
  switch (documentType) {
    case 'Estimate':
      return [
        'This estimate is valid for the period stated above.',
        'Prices are indicative and subject to final quotation.',
        'This estimate does not constitute a binding contract.',
      ];
    case 'Proposal':
      return [
        'This proposal presents scope and technical approach for client review.',
        'Commercial pricing will be provided in the formal quotation.',
        'This proposal does not constitute a binding contract.',
      ];
    case 'Quotation':
      return [
        'This quotation is valid until the date specified above.',
        'Prices are firm for the validity period unless scope changes.',
        'Acceptance of this quotation constitutes agreement to stated terms.',
      ];
    case 'Invoice':
      return [
        'Payment is due as per the payment terms stated above.',
        'Please quote invoice number on all remittances.',
        'Interest may apply on overdue amounts as per company policy.',
      ];
    default:
      return [];
  }
}
