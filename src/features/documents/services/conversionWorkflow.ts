/**
 * PEB Commercial Document Conversion Workflow
 * 
 * Handles automatic data flow between document stages:
 * Lead → Estimate → Proposal → Quotation → Project
 * 
 * Key Principles:
 * - Data flows forward - never duplicate
 * - Never force users to re-enter information
 * - Carry all selected data, documents, configurations, attachments
 * - No manual recreation
 */

import {
  Estimate,
  Proposal,
  Quotation,
  CreateEstimateDto,
  CreateProposalDto,
  CreateQuotationDto,
  ConvertToProposalDto,
  ConvertToQuotationDto,
  ConvertToProjectDto,
  ConversionRequest,
  ConversionResult,
} from '../types/peb-commercial';

// ─── Lead → Estimate Conversion ───────────────────────────────────────────────

/**
 * Convert Lead to Estimate
 * 
 * Automatically inherits:
 * - Customer information
 * - Contact information
 * - Project requirements
 * - Initial scope information
 * 
 * User can configure:
 * - Material selections
 * - Scope configuration
 * - Technical specifications
 * - Inclusions/Exclusions
 */
export function convertLeadToEstimate(
  lead: any,
  options?: Partial<CreateEstimateDto>
): CreateEstimateDto {
  const estimateDto: CreateEstimateDto = {
    customerId: lead.customerId,
    leadId: lead.id,
    projectId: lead.projectId,
    includePricing: false,
    
    // Initialize with empty selections - user will configure
    materialSelections: [],
    scopeConfiguration: {
      labour: { state: 'Included', requirement: 'Required', chargeability: 'Chargeable', visibility: 'Visible' },
      installation: { state: 'Included', requirement: 'Required', chargeability: 'Chargeable', visibility: 'Visible' },
      transportation: { state: 'Included', requirement: 'Required', chargeability: 'Chargeable', visibility: 'Visible' },
      crane: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      civilWork: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      accommodation: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      erection: { state: 'Included', requirement: 'Required', chargeability: 'Chargeable', visibility: 'Visible' },
      freight: { state: 'Included', requirement: 'Required', chargeability: 'Chargeable', visibility: 'Visible' },
      additionalServices: [],
    },
    technicalSpecifications: {},
    inclusions: [],
    exclusions: [],
    notes: '',
    internalNotes: '',
    
    // Override with options if provided
    ...options,
  };
  
  return estimateDto;
}

// ─── Estimate → Proposal Conversion ─────────────────────────────────────────────

/**
 * Convert Estimate to Proposal
 * 
 * Automatically inherits:
 * - Selected Materials
 * - Selected Brands
 * - Selected Specifications
 * - Selected Accessories
 * - Scope Configuration
 * - Technical Specifications
 * - Inclusions/Exclusions
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
 * - Presentation options
 * - Timeline
 * - Cover page
 * - Document content
 */
export function convertEstimateToProposal(
  estimate: Estimate,
  options?: ConvertToProposalDto
): CreateProposalDto {
  const proposalDto: CreateProposalDto = {
    estimateId: estimate.id,
    
    // Inherit proposal configuration or use defaults
    proposalConfiguration: options?.proposalConfiguration || {
      labourIncluded: estimate.scopeConfiguration.labour.state === 'Included',
      installationIncluded: estimate.scopeConfiguration.installation.state === 'Included',
      transportationIncluded: estimate.scopeConfiguration.transportation.state === 'Included',
      craneIncluded: estimate.scopeConfiguration.crane.state === 'Included',
      civilWorkIncluded: estimate.scopeConfiguration.civilWork.state === 'Included',
      accommodationIncluded: estimate.scopeConfiguration.accommodation.state === 'Included',
      erectionIncluded: estimate.scopeConfiguration.erection.state === 'Included',
      freightIncluded: estimate.scopeConfiguration.freight.state === 'Included',
      includeTechnicalDrawings: false,
      include3DRenderings: false,
      includeMaterialSamples: false,
      includePastProjects: false,
    },
    
    // Commercial summary (optional)
    includeCommercialSummary: options?.includeCommercialSummary || false,
    commercialSummary: options?.commercialSummary,
    
    // Timeline (optional)
    timeline: options?.timeline,
    
    // Cover page (optional)
    coverPage: options?.coverPage || {
      title: 'PROPOSAL',
      subtitle: 'Pre-Engineered Building Solution',
      date: new Date(),
      referenceNumber: estimate.estimateNumber,
      preparedFor: estimate.customerName,
      preparedBy: 'Your Company Name',
    },
    
    // Document content (optional)
    companyProfile: options?.companyProfile,
    projectOverview: options?.projectOverview,
    scopeOfWork: options?.scopeOfWork,
    termsAndConditions: options?.termsAndConditions,
    
    // Notes
    notes: options?.notes,
    internalNotes: options?.internalNotes,
    
    // Template
    templateId: options?.templateId,
  };
  
  return proposalDto;
}

// ─── Proposal → Quotation Conversion ─────────────────────────────────────────────

/**
 * Convert Proposal to Quotation
 * 
 * Automatically inherits:
 * - All data from Proposal (which includes all Estimate data)
 * - Selected Materials
 * - Selected Services
 * - Scope Configuration
 * - Commercial Options
 * - Technical Specifications
 * - Timeline
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
 */
export function convertProposalToQuotation(
  proposal: Proposal,
  options: ConvertToQuotationDto
): CreateQuotationDto {
  // Initialize material rates from proposal material selections
  const materialRates = proposal.materialSelections.map(m => ({
    materialSelectionId: m.id,
    rate: m.rate || 0,
    quantity: m.quantity || 0,
    amount: (m.rate || 0) * (m.quantity || 0),
  }));
  
  // Initialize service costs based on proposal configuration
  const labourCost = proposal.proposalConfiguration.labourIncluded ? 0 : 0; // User will set actual cost
  const installationCost = proposal.proposalConfiguration.installationIncluded ? 0 : 0;
  const transportationCost = proposal.proposalConfiguration.transportationIncluded ? 0 : 0;
  const craneCost = proposal.proposalConfiguration.craneIncluded ? 0 : 0;
  const civilCost = proposal.proposalConfiguration.civilWorkIncluded ? 0 : 0;
  const accommodationCost = proposal.proposalConfiguration.accommodationIncluded ? 0 : 0;
  const erectionCost = proposal.proposalConfiguration.erectionIncluded ? 0 : 0;
  const freightCost = proposal.proposalConfiguration.freightIncluded ? 0 : 0;
  
  const quotationDto: CreateQuotationDto = {
    proposalId: proposal.id,
    
    // Validity and terms
    validUntil: options.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    paymentTerms: options.paymentTerms,
    deliveryTerms: options.deliveryTerms,
    
    // Pricing configuration (user must provide)
    pricingConfiguration: {
      ...options.pricingConfiguration,
      materialRates: options.pricingConfiguration.materialRates || materialRates,
      labourCost: options.pricingConfiguration.labourCost ?? labourCost,
      installationCost: options.pricingConfiguration.installationCost ?? installationCost,
      transportationCost: options.pricingConfiguration.transportationCost ?? transportationCost,
      craneCost: options.pricingConfiguration.craneCost ?? craneCost,
      civilCost: options.pricingConfiguration.civilCost ?? civilCost,
      accommodationCost: options.pricingConfiguration.accommodationCost ?? accommodationCost,
      erectionCost: options.pricingConfiguration.erectionCost ?? erectionCost,
      freightCost: options.pricingConfiguration.freightCost ?? freightCost,
      additionalServiceCosts: options.pricingConfiguration.additionalServiceCosts || [],
      discountType: options.pricingConfiguration.discountType || 'percentage',
      discountValue: options.pricingConfiguration.discountValue || 0,
      gstRate: options.pricingConfiguration.gstRate || 18,
      gstType: options.pricingConfiguration.gstType || 'CGST',
      cessRate: options.pricingConfiguration.cessRate || 0,
      markupPercentage: options.pricingConfiguration.markupPercentage || 0,
      roundingMethod: options.pricingConfiguration.roundingMethod || 'nearest',
    },
    
    // Terms and notes
    termsAndConditions: options.termsAndConditions,
    notes: options.notes,
    internalNotes: options.internalNotes,
    
    // Template
    templateId: options.templateId,
  };
  
  return quotationDto;
}

// ─── Quotation → Project Conversion ──────────────────────────────────────────────

/**
 * Convert Quotation to Project
 * 
 * Automatically inherits:
 * - All data from Quotation (which includes all Proposal and Estimate data)
 * - Selected Materials
 * - Selected Services
 * - Scope Configuration
 * - Technical Specifications
 * - Timeline
 * - Pricing Information
 * - Customer Information
 * 
 * Project will be created with:
 * - All material requirements
 * - All service requirements
 * - Technical specifications
 * - Budget/quotation reference
 * - Timeline milestones
 */
export function convertQuotationToProject(
  quotation: Quotation,
  options?: ConvertToProjectDto
): any {
  // This would integrate with the Projects module
  // For now, returning the data structure that would be sent to the Projects API
  
  const projectData = {
    // Customer information
    customerId: quotation.customerId,
    customerName: quotation.customerName,
    customerEmail: quotation.customerEmail,
    customerPhone: quotation.customerPhone,
    customerAddress: quotation.customerAddress,
    customerGST: quotation.customerGST,
    
    // Reference information
    quotationId: quotation.id,
    quotationNumber: quotation.quotationNumber,
    proposalId: quotation.proposalId,
    proposalNumber: quotation.proposalNumber,
    estimateId: quotation.sourceEstimateId,
    estimateNumber: quotation.sourceEstimateNumber,
    
    // Lead reference
    leadId: quotation.leadId,
    leadNumber: quotation.leadNumber,
    
    // Budget
    budgetAmount: quotation.grandTotal,
    quotationAmount: quotation.grandTotal,
    
    // Technical specifications
    technicalSpecifications: quotation.technicalSpecifications,
    
    // Material requirements
    materialRequirements: quotation.materialSelections.map(m => ({
      inventoryItemId: m.itemMasterId,
      itemCode: m.itemCode,
      itemName: m.itemName,
      category: m.category,
      subCategory: m.subCategory,
      brand: m.brand,
      grade: m.grade,
      specification: m.specification,
      variant: m.variant,
      quantity: m.quantity,
      unit: m.unit,
      rate: m.rate,
      amount: m.amount,
    })),
    
    // Service requirements
    serviceRequirements: {
      labour: quotation.proposalConfiguration.labourIncluded,
      installation: quotation.proposalConfiguration.installationIncluded,
      transportation: quotation.proposalConfiguration.transportationIncluded,
      crane: quotation.proposalConfiguration.craneIncluded,
      civilWork: quotation.proposalConfiguration.civilWorkIncluded,
      accommodation: quotation.proposalConfiguration.accommodationIncluded,
      erection: quotation.proposalConfiguration.erectionIncluded,
      freight: quotation.proposalConfiguration.freightIncluded,
    },
    
    // Timeline
    timeline: quotation.timeline,
    
    // Scope
    scopeConfiguration: quotation.scopeConfiguration,
    
    // Inclusions/Exclusions
    inclusions: quotation.inclusions,
    exclusions: quotation.exclusions,
    
    // Terms
    paymentTerms: quotation.paymentTerms,
    deliveryTerms: quotation.deliveryTerms,
    termsAndConditions: quotation.termsAndConditions,
    
    // Notes
    notes: options?.notes || quotation.notes,
    
    // Additional project data
    ...options?.projectData,
  };
  
  return projectData;
}

// ─── Generic Conversion Handler ───────────────────────────────────────────────────

/**
 * Generic conversion handler
 * Routes to appropriate conversion function based on source and target types
 * Note: Lead → Estimate conversion is handled separately in the Leads module
 */
export function handleConversion(
  request: ConversionRequest,
  sourceDocument: Estimate | Proposal | Quotation
): ConversionResult {
  try {
    let targetDocumentId: string | undefined;
    let targetDocumentNumber: string | undefined;
    
    switch (request.sourceDocumentType) {
      case 'Estimate':
        if (request.targetDocumentType === 'Proposal') {
          const proposalDto = convertEstimateToProposal(
            sourceDocument as Estimate,
            request as unknown as ConvertToProposalDto
          );
          // TODO: Call API to create proposal
          // targetDocumentId = result.id;
          // targetDocumentNumber = result.proposalNumber;
          targetDocumentNumber = `PROP-${Date.now()}`;
        } else {
          return {
            success: false,
            errors: ['Cannot convert Estimate directly to Quotation. Must convert to Proposal first.'],
          };
        }
        break;
        
      case 'Proposal':
        if (request.targetDocumentType === 'Quotation') {
          const quotationDto = convertProposalToQuotation(
            sourceDocument as Proposal,
            request as unknown as ConvertToQuotationDto
          );
          // TODO: Call API to create quotation
          // targetDocumentId = result.id;
          // targetDocumentNumber = result.quotationNumber;
          targetDocumentNumber = `QUOT-${Date.now()}`;
        } else {
          return {
            success: false,
            errors: ['Cannot convert Proposal directly to Estimate. Conversion is one-way only.'],
          };
        }
        break;
        
      case 'Quotation':
        if ((request.targetDocumentType as string) === 'Project') {
          const projectData = convertQuotationToProject(
            sourceDocument as Quotation,
            request as unknown as ConvertToProjectDto
          );
          // TODO: Call Projects API to create project
          // targetDocumentId = result.id;
          // targetDocumentNumber = result.projectNumber;
          targetDocumentNumber = `PROJ-${Date.now()}`;
        } else {
          return {
            success: false,
            errors: ['Cannot convert Quotation to other document types. Only to Project.'],
          };
        }
        break;
        
      default:
        return {
          success: false,
          errors: ['Invalid source document type'],
        };
    }
    
    return {
      success: true,
      targetDocumentId,
      targetDocumentNumber,
    };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
    };
  }
}

// ─── Validation Functions ────────────────────────────────────────────────────────

/**
 * Validate if Estimate can be converted to Proposal
 */
export function canConvertEstimateToProposal(estimate: Estimate): {
  canConvert: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  
  if (!estimate.id) {
    reasons.push('Estimate must be saved before conversion');
  }
  
  if (estimate.materialSelections.length === 0) {
    reasons.push('Estimate must have at least one material selected');
  }
  
  if (estimate.status !== 'Draft' && estimate.status !== 'Sent') {
    reasons.push('Estimate must be in Draft or Sent status');
  }
  
  if (estimate.convertedToProposalId) {
    reasons.push('Estimate has already been converted to a Proposal');
  }
  
  return {
    canConvert: reasons.length === 0,
    reasons,
  };
}

/**
 * Validate if Proposal can be converted to Quotation
 */
export function canConvertProposalToQuotation(proposal: Proposal): {
  canConvert: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  
  if (!proposal.id) {
    reasons.push('Proposal must be saved before conversion');
  }
  
  if (proposal.materialSelections.length === 0) {
    reasons.push('Proposal must have at least one material selected');
  }
  
  if (proposal.status !== 'Draft' && proposal.status !== 'Sent') {
    reasons.push('Proposal must be in Draft or Sent status');
  }
  
  if (proposal.convertedToQuotationId) {
    reasons.push('Proposal has already been converted to a Quotation');
  }
  
  return {
    canConvert: reasons.length === 0,
    reasons,
  };
}

/**
 * Validate if Quotation can be converted to Project
 */
export function canConvertQuotationToProject(quotation: Quotation): {
  canConvert: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  
  if (!quotation.id) {
    reasons.push('Quotation must be saved before conversion');
  }
  
  if (quotation.status !== 'Accepted') {
    reasons.push('Quotation must be Accepted before conversion to Project');
  }
  
  if (quotation.convertedToProjectId) {
    reasons.push('Quotation has already been converted to a Project');
  }
  
  return {
    canConvert: reasons.length === 0,
    reasons,
  };
}

// ─── Data Integrity Functions ───────────────────────────────────────────────────

/**
 * Verify data integrity during conversion
 * Ensures all required data is carried forward
 */
export function verifyConversionDataIntegrity(
  sourceDocument: Estimate | Proposal | Quotation,
  targetType: 'Proposal' | 'Quotation' | 'Project'
): {
  isValid: boolean;
  missingFields: string[];
} {
  const missingFields: string[] = [];
  
  // Common required fields
  if (!sourceDocument.customerId) missingFields.push('customerId');
  if (!sourceDocument.customerName) missingFields.push('customerName');
  
  // Document-specific requirements
  if (targetType === 'Proposal' || targetType === 'Quotation' || targetType === 'Project') {
    if (!sourceDocument.materialSelections || sourceDocument.materialSelections.length === 0) {
      missingFields.push('materialSelections');
    }
  }
  
  if (targetType === 'Quotation' || targetType === 'Project') {
    if (!sourceDocument.scopeConfiguration) missingFields.push('scopeConfiguration');
  }
  
  if (targetType === 'Project') {
    if (!sourceDocument.technicalSpecifications) missingFields.push('technicalSpecifications');
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

// ─── Conversion Summary ─────────────────────────────────────────────────────────

/**
 * Generate conversion summary for user review
 */
export function generateConversionSummary(
  sourceDocument: Estimate | Proposal | Quotation,
  targetType: 'Proposal' | 'Quotation' | 'Project'
): {
  sourceType: string;
  targetType: string;
  dataPoints: number;
  attachments: number;
  configurations: number;
  warnings: string[];
} {
  const warnings: string[] = [];
  
  let dataPoints = 0;
  let configurations = 0;
  
  // Count data points
  dataPoints += sourceDocument.materialSelections?.length || 0;
  dataPoints += sourceDocument.inclusions?.length || 0;
  dataPoints += sourceDocument.exclusions?.length || 0;
  
  // Count configurations
  if (sourceDocument.scopeConfiguration) {
    configurations += Object.keys(sourceDocument.scopeConfiguration).length;
  }
  
  // Generate warnings
  if (sourceDocument.status === 'Draft') {
    warnings.push('Source document is in Draft status');
  }
  
  if (targetType === 'Quotation' && 'proposalConfiguration' in sourceDocument && !sourceDocument.proposalConfiguration) {
    warnings.push('No proposal configuration found - will use defaults');
  }
  
  // Determine source document type
  let sourceType = 'Unknown';
  if ('estimateNumber' in sourceDocument) {
    sourceType = 'Estimate';
  } else if ('proposalNumber' in sourceDocument) {
    sourceType = 'Proposal';
  } else if ('quotationNumber' in sourceDocument) {
    sourceType = 'Quotation';
  }
  
  return {
    sourceType,
    targetType,
    dataPoints,
    attachments: 0, // TODO: Count actual attachments
    configurations,
    warnings,
  };
}
