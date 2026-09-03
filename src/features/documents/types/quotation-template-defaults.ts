/**
 * Quotation Template Defaults Interface
 * Defines the structure for fixed template content stored in Organization
 */

export interface QuotationTemplateDefaults {
  // Page 2 - Standard Content
  subject?: string;
  introduction?: string;
  
  // Page 3 - Applicable Codes
  applicableCodes?: string[];
  
  // Page 5 - Primary Structural Members
  primaryStructuralMembers?: string[];
  
  // Page 6 - Secondary Structural Members
  secondaryStructuralMembers?: string[];
  
  // Page 8 - Notes
  notes?: string;
  
  // Page 8 - Special Technical Assumptions
  specialTechnicalAssumptions?: string[];
  
  // Page 8 - Payment Terms
  paymentTerms?: string;
  
  // Page 8 - Bank Details
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    address?: string;
  };
  
  // Page 9 - Exclusion
  exclusions?: string[];
  
  // Page 9 - Delivery Schedule
  deliverySchedule?: string[];
  
  // Page 9 - Other Commercial Terms
  otherCommercialTerms?: string[];
  
  // Page 10 - Cancellations
  cancellations?: string;
  
  // Page 10 - Production Release
  productionRelease?: string;
  
  // Page 10 - Warranty
  warranty?: string;
  
  // Page 10 - Governing Law
  governingLaw?: string;
  
  // Page 10 - Taxes & Duties
  taxesAndDuties?: string;
  
  // Signature
  signature?: {
    name?: string;
    designation?: string;
  };
}
