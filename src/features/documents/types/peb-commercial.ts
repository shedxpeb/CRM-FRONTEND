/**
 * PEB Commercial Document Engine Types
 * Single Source of Truth for PEB Commercial Workflow
 * 
 * Workflow: Lead → Customer → Estimate → Proposal → Quotation → Approval → Project → Material Reservation → Finance
 * 
 * Key Principles:
 * - Item Master is the single source of truth for all commercial products
 * - Inventory only manages stock quantities, not product definitions
 * - Estimate is a Material Selection Builder (NOT a pricing document)
 * - Proposal inherits from Estimate (Technical + Commercial Presentation)
 * - Quotation inherits from Proposal (Final Commercial Offer with Pricing)
 * - Data flows forward - never duplicate, never re-enter
 */

// ─── Commercial Configuration Engine ─────────────────────────────────────────────

/**
 * Item Configuration States
 * Every commercial item supports these flexible configurations
 */
export type ItemState = 'Included' | 'Excluded';
export type ItemRequirement = 'Required' | 'Optional';
export type ItemChargeability = 'Chargeable' | 'Non-Chargeable';
export type ItemVisibility = 'Visible' | 'Hidden';

/**
 * Commercial Item Configuration
 * Applied to every item in Estimate, Proposal, Quotation
 */
export interface CommercialItemConfig {
  // State
  state: ItemState;
  requirement: ItemRequirement;
  chargeability: ItemChargeability;
  visibility: ItemVisibility;
  
  // Configuration
  notes?: string;
  customLabel?: string;
}

/**
 * Default configurations for common PEB items
 */
export const DEFAULT_COMMERICAL_CONFIGS: Record<string, CommercialItemConfig> = {
  labour: {
    state: 'Included',
    requirement: 'Optional',
    chargeability: 'Chargeable',
    visibility: 'Visible',
  },
  transportation: {
    state: 'Included',
    requirement: 'Optional',
    chargeability: 'Chargeable',
    visibility: 'Visible',
  },
  installation: {
    state: 'Included',
    requirement: 'Optional',
    chargeability: 'Chargeable',
    visibility: 'Visible',
  },
  crane: {
    state: 'Included',
    requirement: 'Optional',
    chargeability: 'Chargeable',
    visibility: 'Visible',
  },
  civil_work: {
    state: 'Included',
    requirement: 'Optional',
    chargeability: 'Chargeable',
    visibility: 'Visible',
  },
  accommodation: {
    state: 'Included',
    requirement: 'Optional',
    chargeability: 'Chargeable',
    visibility: 'Visible',
  },
  erection: {
    state: 'Included',
    requirement: 'Optional',
    chargeability: 'Chargeable',
    visibility: 'Visible',
  },
  freight: {
    state: 'Included',
    requirement: 'Optional',
    chargeability: 'Chargeable',
    visibility: 'Visible',
  },
  fasteners: {
    state: 'Included',
    requirement: 'Required',
    chargeability: 'Non-Chargeable',
    visibility: 'Hidden',
  },
};

// ─── Document Types ───────────────────────────────────────────────────────────────

export type DocumentType = 'Estimate' | 'Proposal' | 'Quotation';

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

// ─── Enhanced Status Engine ───────────────────────────────────────────────────────

/**
 * Comprehensive Status Types for Each Document Type
 * Provides granular status tracking throughout the commercial lifecycle
 */

export type EstimateStatus =
  | 'Draft'           // Initial creation, not yet ready
  | 'Ready'           // Prepared and ready to send
  | 'Sent'            // Sent to customer
  | 'Viewed'          // Customer has opened it
  | 'Approved'        // Approved internally
  | 'Rejected'        // Rejected by customer or internally
  | 'Expired'         // Past valid date
  | 'Converted'       // Converted to Proposal
  | 'Cancelled';      // Cancelled by user

export type ProposalStatus =
  | 'Draft'           // Initial creation
  | 'Sent'            // Sent to customer
  | 'Viewed'          // Customer has opened it
  | 'Under Review'    // Customer is reviewing
  | 'Approved'        // Approved by customer
  | 'Rejected'        // Rejected by customer
  | 'Converted'       // Converted to Quotation
  | 'Expired';        // Past valid date

export type QuotationStatus =
  | 'Draft'           // Initial creation
  | 'Sent'            // Sent to customer
  | 'Viewed'          // Customer has opened it
  | 'Negotiation'     // Under negotiation
  | 'Accepted'        // Accepted by customer
  | 'Rejected'        // Rejected by customer
  | 'Expired'         // Past valid date
  | 'Converted';      // Converted to Project

// ─── Estimate Types ───────────────────────────────────────────────────────────────

/**
 * Estimate - Material Selection and Scope Builder
 * 
 * Purpose: Identify what will be supplied
 * NOT a pricing document - pricing is optional
 * 
 * Stores:
 * - What is included
 * - What is excluded
 * - Material configuration
 * - Technical configuration
 */
export interface Estimate {
  // Base Document Info
  id: string;
  estimateNumber: string;
  version: number;
  
  // Customer
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerGST?: string;
  
  // Lead/Project Reference
  leadId?: string;
  leadNumber?: string;
  projectId?: string;
  projectName?: string;
  
  // Status
  status: DocumentStatus;
  approvalStatus?: ApprovalStatus;
  
  // Estimate Configuration (Optional Pricing)
  includePricing: boolean;
  subtotal?: number;
  totalAmount?: number;
  
  // Material Selection (Core of Estimate)
  materialSelections: MaterialSelection[];
  
  // Scope Configuration
  scopeConfiguration: ScopeConfiguration;
  
  // Technical Specifications
  technicalSpecifications: TechnicalSpecifications;
  
  // Inclusions/Exclusions
  inclusions: string[];
  exclusions: string[];
  
  // Notes
  notes?: string;
  internalNotes?: string;
  terms?: string;
  
  // Header Fields (from Lovable EstimateHeaderForm)
  contactPersonName?: string;
  salesExecutive?: string;
  validTill?: string;
  
  // Conversion Tracking
  convertedToProposalId?: string;
  convertedAt?: Date;
  
  // Cross-module relationships
  proposalIds?: string[]; // Multiple proposals can be generated from one estimate
  linkedProjectId?: string; // Project created from this estimate (direct or via quotation)
  linkedProjectName?: string;
  
  // Template
  templateId?: string;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
  sentAt?: Date;
  viewedAt?: Date;
  createdBy?: string;
}

/**
 * Material Selection
 * Each material selected from Item Master (Product Catalog)
 * Changes to this do NOT modify the original Item Master
 */
export interface MaterialSelection {
  id: string;
  
  // Item Master Reference (MUST link to Item Master)
  itemMasterId: string;
  itemCode: string;
  itemName: string;
  category: string;
  subCategory?: string;
  
  // Material Configuration (copied from Item Master, can be edited in Estimate)
  brand?: string;
  grade?: string;
  specification?: string;
  variant?: string;
  thickness?: number;
  color?: string;
  coating?: string;
  
  // Standard properties (copied from Item Master)
  standardWeight?: number;
  standardDimensions?: {
    length?: number;
    width?: number;
    height?: number;
    thickness?: number;
    diameter?: number;
  };
  
  // Commercial Configuration
  config: CommercialItemConfig;
  
  // Quantity (if applicable)
  quantity?: number;
  unit?: string;
  
  // Optional Pricing (if includePricing is true)
  // Can override default rate from Item Master
  rate?: number;
  amount?: number;
  
  // Notes
  notes?: string;
  customDescription?: string; // Custom description for this Estimate only
}

/**
 * Scope Configuration
 * Configurable services and inclusions
 */
export interface ScopeConfiguration {
  // Services (all configurable)
  labour: CommercialItemConfig;
  installation: CommercialItemConfig;
  transportation: CommercialItemConfig;
  crane: CommercialItemConfig;
  civilWork: CommercialItemConfig;
  accommodation: CommercialItemConfig;
  erection: CommercialItemConfig;
  freight: CommercialItemConfig;
  
  // Additional Services
  additionalServices: AdditionalService[];
}

/**
 * Additional Service
 * Custom services beyond standard scope
 */
export interface AdditionalService {
  id: string;
  serviceName: string;
  description?: string;
  config: CommercialItemConfig;
  quantity?: number;
  unit?: string;
  rate?: number;
  amount?: number;
}

/**
 * Technical Specifications
 * Building technical details
 */
export interface TechnicalSpecifications {
  // Building Dimensions
  buildingLength?: number;
  buildingWidth?: number;
  buildingHeight?: number;
  buildingArea?: number;
  
  // Structural Details
  baySpacing?: number;
  roofSlope?: number;
  windLoad?: number;
  seismicZone?: string;
  
  // Cladding Details
  roofCladding?: string;
  wallCladding?: string;
  insulationType?: string;
  insulationThickness?: number;
  
  // Doors & Windows
  overheadDoors?: number;
  walkDoors?: number;
  windows?: number;
  
  // Accessories
  gutters?: boolean;
  downspouts?: boolean;
  skylights?: number;
  ridgeVentilators?: number;
  
  // Foundation
  foundationType?: string;
  
  // Notes
  notes?: string;
}

// ─── Proposal Types ──────────────────────────────────────────────────────────────

/**
 * Proposal - Technical + Commercial Presentation
 * 
 * Generated from Estimate
 * Inherits all selected materials, brands, specifications, accessories, scope
 * 
 * User can configure:
 * - Labour Included
 * - Installation Included
 * - Transportation Included
 * - Crane Included
 * - Civil Work Included
 * - Accommodation Included
 * - Erection Included
 * - Freight Included
 * 
 * Contains:
 * - Cover Page
 * - Company Profile
 * - Project Overview
 * - Scope Of Work
 * - Technical Specifications
 * - Material Specifications
 * - Inclusion List
 * - Exclusion List
 * - Timeline
 * - Commercial Summary
 * - Terms & Conditions
 */
export interface Proposal {
  // Base Document Info
  id: string;
  proposalNumber: string;
  version: number;
  
  // Source Estimate
  estimateId: string;
  estimateNumber: string;
  
  // Customer (inherited from Estimate)
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerGST?: string;
  
  // Lead/Project Reference
  leadId?: string;
  leadNumber?: string;
  projectId?: string;
  projectName?: string;
  
  // Status
  status: DocumentStatus;
  approvalStatus?: ApprovalStatus;
  
  // Inherited Data (from Estimate)
  materialSelections: MaterialSelection[];
  scopeConfiguration: ScopeConfiguration;
  technicalSpecifications: TechnicalSpecifications;
  inclusions: string[];
  exclusions: string[];
  
  // Proposal-Specific Configuration
  proposalConfiguration: ProposalConfiguration;
  
  // Commercial Summary (Optional - may include indicative pricing)
  includeCommercialSummary: boolean;
  commercialSummary?: CommercialSummary;
  
  // Timeline
  timeline?: ProposalTimeline;
  
  // Document Content
  coverPage?: CoverPage;
  companyProfile?: string;
  projectOverview?: string;
  scopeOfWork?: string;
  termsAndConditions?: string;
  
  // Notes
  notes?: string;
  internalNotes?: string;
  
  // Conversion Tracking
  convertedToQuotationId?: string;
  convertedAt?: Date;
  
  // Cross-module relationships
  quotationIds?: string[]; // Multiple quotations can be generated from one proposal
  linkedProjectId?: string; // Project created from this proposal (direct or via quotation)
  linkedProjectName?: string;
  
  // Template
  templateId?: string;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
  sentAt?: Date;
  viewedAt?: Date;
  createdBy?: string;
}

/**
 * Proposal Configuration
 * Configurable commercial options for presentation
 */
export interface ProposalConfiguration {
  labourIncluded: boolean;
  installationIncluded: boolean;
  transportationIncluded: boolean;
  craneIncluded: boolean;
  civilWorkIncluded: boolean;
  accommodationIncluded: boolean;
  erectionIncluded: boolean;
  freightIncluded: boolean;
  
  // Presentation Options
  includeTechnicalDrawings: boolean;
  include3DRenderings: boolean;
  includeMaterialSamples: boolean;
  includePastProjects: boolean;
}

/**
 * Commercial Summary (Indicative)
 * Optional pricing summary for Proposal
 */
export interface CommercialSummary {
  subtotal?: number;
  indicativeTotal?: number;
  notes?: string;
  disclaimer?: string;
}

/**
 * Proposal Timeline
 */
export interface ProposalTimeline {
  estimatedDuration?: number;
  unit?: 'days' | 'weeks' | 'months';
  milestones?: TimelineMilestone[];
}

/**
 * Timeline Milestone
 */
export interface TimelineMilestone {
  id: string;
  milestone: string;
  estimatedDate?: Date;
  description?: string;
}

/**
 * Cover Page
 */
export interface CoverPage {
  title?: string;
  subtitle?: string;
  date?: Date;
  referenceNumber?: string;
  preparedFor?: string;
  preparedBy?: string;
}

// ─── Quotation Types ──────────────────────────────────────────────────────────────

/**
 * Quotation - Final Commercial Offer
 * 
 * Generated from Proposal
 * Inherits all selected materials, services, scope, commercial options
 * 
 * User can configure:
 * - Material Rates
 * - Labour Cost
 * - Installation Cost
 * - Transportation Cost
 * - Crane Cost
 * - Civil Cost
 * - Accommodation Cost
 * - Discounts
 * - Taxes
 * - Markups
 * 
 * System automatically calculates:
 * - Subtotal
 * - Discounts
 * - GST
 * - Grand Total
 * 
 * No manual calculations
 */
export interface Quotation {
  // Base Document Info
  id: string;
  quotationNumber: string;
  version: number;
  
  // Source Proposal
  proposalId: string;
  proposalNumber: string;
  sourceEstimateId: string;
  sourceEstimateNumber: string;
  
  // Customer (inherited from Proposal)
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerGST?: string;
  
  // Lead/Project Reference
  leadId?: string;
  leadNumber?: string;
  projectId?: string;
  projectName?: string;
  
  // Status
  status: DocumentStatus;
  approvalStatus?: ApprovalStatus;
  
  // Validity
  validUntil?: Date;
  paymentTerms: string;
  deliveryTerms?: string;
  
  // Inherited Data (from Proposal)
  materialSelections: MaterialSelection[];
  scopeConfiguration: ScopeConfiguration;
  technicalSpecifications: TechnicalSpecifications;
  inclusions: string[];
  exclusions: string[];
  proposalConfiguration: ProposalConfiguration;
  timeline?: ProposalTimeline;
  
  // Quotation Pricing Configuration
  pricingConfiguration: PricingConfiguration;
  
  // Calculated Amounts (System Calculated)
  materialCost: number;
  labourCost: number;
  installationCost: number;
  transportationCost: number;
  craneCost: number;
  civilCost: number;
  accommodationCost: number;
  erectionCost: number;
  freightCost: number;
  otherCosts: number;
  
  // Totals
  subtotal: number;
  discountAmount: number;
  discountPercentage?: number;
  taxAmount: number;
  gstType: 'CGST' | 'SGST' | 'IGST' | 'CESS';
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  cessAmount?: number;
  grandTotal: number;
  
  // Amount in Words
  amountInWords?: string;
  
  // Terms
  termsAndConditions?: string;
  notes?: string;
  internalNotes?: string;
  
  // Conversion Tracking
  convertedToProjectId?: string;
  convertedAt?: Date;

  // Stock Reservation (Inventory Integration)
  // Stock reservation happens at project creation, not quotation
  // No stock reservation fields here - handled in Project module

  // Finance Tracking
  // Finance module is independent - no direct invoice generation from quotation
  // Revenue pipeline tracking only - no invoice/payment fields here

  // Template
  templateId?: string;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
  sentAt?: Date;
  viewedAt?: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  createdBy?: string;
}

/**
 * Pricing Configuration
 * Configurable pricing components
 */
export interface PricingConfiguration {
  // Material Pricing
  materialRates: MaterialRate[];
  
  // Service Costs
  labourCost: number;
  installationCost: number;
  transportationCost: number;
  craneCost: number;
  civilCost: number;
  accommodationCost: number;
  erectionCost: number;
  freightCost: number;
  
  // Additional Service Costs
  additionalServiceCosts: AdditionalServiceCost[];
  
  // Discounts
  discountType: 'percentage' | 'fixed' | 'none';
  discountValue?: number;
  
  // Taxes
  gstRate: number;
  gstType: 'CGST' | 'SGST' | 'IGST' | 'CESS';
  cessRate?: number;
  
  // Markups
  markupPercentage?: number;
  
  // Rounding
  roundingMethod: 'none' | 'nearest' | 'up' | 'down';
}

/**
 * Material Rate
 * Per-material rate configuration
 */
export interface MaterialRate {
  materialSelectionId: string;
  rate: number;
  quantity: number;
  amount: number;
  notes?: string;
}

/**
 * Additional Service Cost
 */
export interface AdditionalServiceCost {
  serviceId: string;
  cost: number;
  notes?: string;
}

// ─── Conversion Types ─────────────────────────────────────────────────────────────

/**
 * Conversion Request
 * Used to convert one document type to another
 */
export interface ConversionRequest {
  sourceDocumentId: string;
  sourceDocumentType: DocumentType;
  targetDocumentType: DocumentType;
  
  // Conversion Options
  updatePricing?: boolean;
  updateTimeline?: boolean;
  addNotes?: string;
  
  // Configuration Updates (for Proposal → Quotation)
  pricingConfiguration?: PricingConfiguration;
  proposalConfiguration?: ProposalConfiguration;
}

/**
 * Conversion Result
 */
export interface ConversionResult {
  success: boolean;
  targetDocumentId?: string;
  targetDocumentNumber?: string;
  errors?: string[];
  warnings?: string[];
}

// ─── DTOs ───────────────────────────────────────────────────────────────────────

// Estimate DTOs
export interface CreateEstimateDto {
  customerId: string;
  leadId?: string;
  projectId?: string;
  includePricing: boolean;
  materialSelections: Omit<MaterialSelection, 'id'>[];
  scopeConfiguration: ScopeConfiguration;
  technicalSpecifications?: TechnicalSpecifications;
  inclusions?: string[];
  exclusions?: string[];
  notes?: string;
  internalNotes?: string;
  terms?: string;
  contactPersonName?: string;
  salesExecutive?: string;
  validTill?: string;
  templateId?: string;
}

export interface UpdateEstimateDto {
  includePricing?: boolean;
  materialSelections?: MaterialSelection[];
  scopeConfiguration?: ScopeConfiguration;
  technicalSpecifications?: TechnicalSpecifications;
  inclusions?: string[];
  exclusions?: string[];
  notes?: string;
  internalNotes?: string;
  terms?: string;
  contactPersonName?: string;
  salesExecutive?: string;
  validTill?: string;
  templateId?: string;
}

// Proposal DTOs
export interface CreateProposalDto {
  estimateId: string;
  proposalConfiguration?: ProposalConfiguration;
  includeCommercialSummary?: boolean;
  commercialSummary?: CommercialSummary;
  timeline?: ProposalTimeline;
  coverPage?: CoverPage;
  companyProfile?: string;
  projectOverview?: string;
  scopeOfWork?: string;
  termsAndConditions?: string;
  notes?: string;
  internalNotes?: string;
  templateId?: string;
}

export interface UpdateProposalDto {
  proposalConfiguration?: ProposalConfiguration;
  includeCommercialSummary?: boolean;
  commercialSummary?: CommercialSummary;
  timeline?: ProposalTimeline;
  coverPage?: CoverPage;
  companyProfile?: string;
  projectOverview?: string;
  scopeOfWork?: string;
  termsAndConditions?: string;
  notes?: string;
  internalNotes?: string;
  templateId?: string;
}

// Quotation DTOs
export interface CreateQuotationDto {
  proposalId: string;
  validUntil?: Date;
  paymentTerms: string;
  deliveryTerms?: string;
  pricingConfiguration: PricingConfiguration;
  termsAndConditions?: string;
  notes?: string;
  internalNotes?: string;
  templateId?: string;
}

export interface UpdateQuotationDto {
  validUntil?: Date;
  paymentTerms?: string;
  deliveryTerms?: string;
  pricingConfiguration?: PricingConfiguration;
  termsAndConditions?: string;
  notes?: string;
  internalNotes?: string;
  templateId?: string;
}

// Conversion DTOs
export interface ConvertToProposalDto {
  estimateId: string;
  proposalConfiguration?: ProposalConfiguration;
  includeCommercialSummary?: boolean;
  commercialSummary?: CommercialSummary;
  timeline?: ProposalTimeline;
  coverPage?: CoverPage;
  companyProfile?: string;
  projectOverview?: string;
  scopeOfWork?: string;
  termsAndConditions?: string;
  notes?: string;
  internalNotes?: string;
  templateId?: string;
}

export interface ConvertToQuotationDto {
  proposalId: string;
  validUntil?: Date;
  paymentTerms: string;
  deliveryTerms?: string;
  pricingConfiguration: PricingConfiguration;
  termsAndConditions?: string;
  notes?: string;
  internalNotes?: string;
  templateId?: string;
}

export interface ConvertToProjectDto {
  quotationId: string;
  projectData?: any;
  notes?: string;
}

// ─── Stats Types ─────────────────────────────────────────────────────────────────

export interface CommercialDocumentStats {
  totalEstimates: number;
  totalProposals: number;
  totalQuotations: number;
  
  draftEstimates: number;
  draftProposals: number;
  draftQuotations: number;
  
  sentEstimates: number;
  sentProposals: number;
  sentQuotations: number;
  
  convertedEstimates: number;
  convertedProposals: number;
  convertedQuotations: number;
  
  pendingApprovals: number;
  
  totalPipelineValue: number;
  averageQuotationValue: number;
  
  conversionRate: number;
  averageConversionTime: number;
  
  monthlyEstimates: number;
  monthlyProposals: number;
  monthlyQuotations: number;
}
