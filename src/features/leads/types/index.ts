/**
 * Leads Module Types
 * All types related to leads
 */

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

export type LeadPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type LeadSource = 
  | 'Website'
  | 'Referral'
  | 'ColdCall'
  | 'Email'
  | 'SocialMedia'
  | 'TradeShow'
  | 'Advertisement'
  | 'Other';

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
  leadNumber?: number;
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
  addressLine1?: string;
  addressLine2?: string;
  area?: string;
  city: string;
  state: string;
  country?: string;
  pincode?: string;
  companySize?: string;
  annualRevenue?: number;
  employeeCount?: number;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  profileImage?: string;
  companyLogo?: string;
  tags?: string[];
  projectTitle?: string;
  projectType: string;
  structureType: string;
  width?: number;
  length?: number;
  height?: number;
  craneRequired?: boolean;
  craneCapacity?: number;
  mezzanine?: boolean;
  mezzanineArea?: number;
  mezzanineLoad?: number;
  wallType?: string;
  insulationRequired?: boolean;
  insulationType?: string;
  insulationThickness?: number;
  materialPreference?: string;
  source: LeadSource;
  priority: LeadPriority;
  assignedTo?: string;
  assignedToId?: string;
  createdById?: string;
  status: LeadStatus;
  score?: number;
  remarks?: string;
  isConverted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  lastFollowUp?: Date;
  nextFollowUpDate?: Date;
  convertedDate?: Date;
  customerId?: string;
  convertedProjectId?: string;
  estimateId?: string;
  proposalId?: string;
  quotationId?: string;
}

/**
 * Create Lead DTO (Data Transfer Object)
 */
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
  companySize?: string;
  annualRevenue?: number;
  employeeCount?: number;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  profileImage?: string;
  companyLogo?: string;
  tags?: string[];
  projectTitle?: string;
  projectType: string;
  structureType: string;
  width?: number;
  length?: number;
  height?: number;
  source: LeadSource;
  priority: LeadPriority;
  assignedEmployeeId?: string;
  status?: LeadStatus;
  score?: number;
  remarks?: string;
  nextFollowUpDate?: Date;
}

/**
 * Update Lead DTO
 */
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
  companySize?: string;
  annualRevenue?: number;
  employeeCount?: number;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  profileImage?: string;
  companyLogo?: string;
  tags?: string[];
  projectTitle?: string;
  projectType?: string;
  structureType?: string;
  width?: number;
  length?: number;
  height?: number;
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
