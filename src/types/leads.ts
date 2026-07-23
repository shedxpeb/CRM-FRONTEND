export type LeadStatus = 
  | 'New'
  | 'Contacted'
  | 'DesignPending'
  | 'BOQPending'
  | 'EstimateSent'
  | 'ProposalSent'
  | 'Negotiation'
  | 'Approved'
  | 'Rejected'
  | 'Converted';

export type ProjectType = 
  | 'Factory'
  | 'Warehouse'
  | 'IndustrialShed'
  | 'Commercial'
  | 'Residential'
  | 'ColdStorage'
  | 'Other';

export type StructureType = 
  | 'PEB'
  | 'SteelStructure'
  | 'Hybrid'
  | 'Other';

export type RoofType = 
  | 'MetalSheet'
  | 'DeckSheet'
  | 'SandwichPanel'
  | 'Other';

export type WallType = 
  | 'MetalSheet'
  | 'BrickWall'
  | 'SandwichPanel'
  | 'Other';

export type MaterialPreference = 
  | 'Standard'
  | 'Premium'
  | 'Economy';

export type LeadSource = 
  | 'Website'
  | 'Referral'
  | 'ColdCall'
  | 'Email'
  | 'SocialMedia'
  | 'TradeShow'
  | 'Advertisement'
  | 'Other';

export type LeadPriority = 
  | 'Low'
  | 'Medium'
  | 'High'
  | 'Urgent';

export type Industry =
  | 'Construction'
  | 'Manufacturing'
  | 'Technology'
  | 'Healthcare'
  | 'Hospitality'
  | 'Retail'
  | 'Education'
  | 'Finance'
  | 'RealEstate'
  | 'Infrastructure'
  | 'Energy'
  | 'Mining'
  | 'Agriculture'
  | 'Transportation'
  | 'Other';

export type BusinessType =
  | 'SoleProprietorship'
  | 'Partnership'
  | 'PrivateLimited'
  | 'PublicLimited'
  | 'LLP'
  | 'Government'
  | 'NonProfit'
  | 'Other';

export interface Lead {
  id: string;
  leadNumber: number;
  
  // Customer Details
  customerName: string;
  companyName: string;
  designation?: string;
  website?: string;
  mobile: string;
  alternateMobile?: string;
  email: string;
  gstNumber?: string;
  panNumber?: string;
  industry?: Industry;
  businessType?: BusinessType;
  
  // Address
  addressLine1?: string;
  addressLine2?: string;
  area?: string;
  city: string;
  state: string;
  country?: string;
  pincode?: string;
  
  // Social Links
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  
  // Media
  profileImage?: string;
  companyLogo?: string;
  
  // Tags
  tags?: string[];
  
  // Project Details
  projectTitle: string;
  projectType: ProjectType;
  
  // Structure Details
  structureType: StructureType;
  width?: number;
  length?: number;
  height?: number;
  baySpacing?: number;
  roofType?: RoofType;
  craneRequired?: boolean;
  craneCapacity?: number;
  mezzanine?: boolean;
  mezzanineArea?: number;
  mezzanineLoad?: number;
  wallType?: WallType;
  insulationRequired?: boolean;
  insulationType?: string;
  insulationThickness?: number;
  materialPreference?: MaterialPreference;
  
  // Site Details
  siteLocation?: string;
  siteAddress?: string;
  mapCoordinates?: string;
  soilNotes?: string;
  
  // Requirement Details
  customerNotes?: string;
  attachments?: string[];
  specialRequirement?: string;
  
  // Business Details
  source: LeadSource;
  priority: LeadPriority;
  assignedTo?: string;
  assignedToId?: string;

  // Status & Tracking
  status: LeadStatus;
  score?: number;
  createdAt: Date;
  lastFollowUp?: Date;
  nextFollowUpDate?: Date;
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: Date;

  // Cross-module relationships
  customerId?: string;
  convertedDate?: Date;

  // Additional fields
  remarks?: string;

  /** Settings-defined custom field values */
  customFields?: Record<string, string | number | boolean>;
}

export type LeadCustomFieldType = 'text' | 'number' | 'select' | 'textarea' | 'boolean';

export interface LeadCustomFieldDefinition {
  key: string;
  label: string;
  type: LeadCustomFieldType;
  options?: string[];
  required?: boolean;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  type: 'created' | 'updated' | 'followup' | 'document_sent' | 'assigned' | 'converted' | 'status_changed';
  description: string;
  performedBy: string;
  performedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface LeadFilter {
  status?: LeadStatus;
  projectType?: ProjectType;
  structureType?: StructureType;
  industry?: Industry;
  businessType?: BusinessType;
  city?: string;
  assignedEmployee?: string;
  source?: LeadSource;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface LeadSearchParams {
  query?: string;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: LeadFilter;
}

export interface CreateLeadDto {
  customerName: string;
  companyName: string;
  designation?: string;
  website?: string;
  mobile: string;
  email: string;
  alternateMobile?: string;
  gstNumber?: string;
  panNumber?: string;
  industry?: Industry;
  businessType?: BusinessType;
  addressLine1?: string;
  addressLine2?: string;
  area?: string;
  city: string;
  state: string;
  country?: string;
  pincode?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  profileImage?: string;
  companyLogo?: string;
  tags?: string[];
  projectTitle: string;
  projectType: ProjectType;
  structureType: StructureType;
  width?: number;
  length?: number;
  height?: number;
  baySpacing?: number;
  roofType?: RoofType;
  craneRequired?: boolean;
  craneCapacity?: number;
  mezzanine?: boolean;
  mezzanineArea?: number;
  mezzanineLoad?: number;
  wallType?: WallType;
  insulationRequired?: boolean;
  insulationType?: string;
  insulationThickness?: number;
  materialPreference?: MaterialPreference;
  siteLocation?: string;
  siteAddress?: string;
  mapCoordinates?: string;
  soilNotes?: string;
  customerNotes?: string;
  specialRequirement?: string;
  source: LeadSource;
  priority: LeadPriority;
  assignedEmployeeId?: string;
  status?: LeadStatus;
  score?: number;
  remarks?: string;
  nextFollowUpDate?: Date;
}

export interface UpdateLeadDto {
  customerName?: string;
  companyName?: string;
  designation?: string;
  website?: string;
  mobile?: string;
  email?: string;
  alternateMobile?: string;
  gstNumber?: string;
  panNumber?: string;
  industry?: Industry;
  businessType?: BusinessType;
  addressLine1?: string;
  addressLine2?: string;
  area?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  profileImage?: string;
  companyLogo?: string;
  tags?: string[];
  projectTitle?: string;
  projectType?: ProjectType;
  structureType?: StructureType;
  width?: number;
  length?: number;
  height?: number;
  baySpacing?: number;
  roofType?: RoofType;
  craneRequired?: boolean;
  craneCapacity?: number;
  mezzanine?: boolean;
  mezzanineArea?: number;
  mezzanineLoad?: number;
  wallType?: WallType;
  insulationRequired?: boolean;
  insulationType?: string;
  insulationThickness?: number;
  materialPreference?: MaterialPreference;
  siteLocation?: string;
  siteAddress?: string;
  mapCoordinates?: string;
  soilNotes?: string;
  customerNotes?: string;
  specialRequirement?: string;
  source?: LeadSource;
  priority?: LeadPriority;
  assignedEmployeeId?: string;
  status?: LeadStatus;
  score?: number;
  remarks?: string;
  nextFollowUpDate?: Date;
  customerId?: string;
  convertedDate?: Date;
}
