/**
 * Project Module Types
 * Single Source of Truth for all project data across the ERP platform
 * Project is the central execution engine - connects Customer, Design, BOQ, Inventory, Procurement, Fabrication, Installation
 */

export type ProjectStatus =
  | 'New'
  | 'DesignInProgress'
  | 'DesignApproved'
  | 'Fabrication'
  | 'DispatchReady'
  | 'Dispatched'
  | 'Installation'
  | 'Completed'
  | 'OnHold'
  | 'Cancelled';

export type ProjectStage =
  | 'Design'
  | 'BOQ'
  | 'Procurement'
  | 'Fabrication'
  | 'Dispatch'
  | 'Installation'
  | 'Handover';

export type ProjectPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type ProjectType =
  | 'Industrial Shed'
  | 'Warehouse'
  | 'Factory'
  | 'Commercial Building'
  | 'Showroom'
  | 'School'
  | 'Hospital'
  | 'Sports Complex'
  | 'Airport Terminal'
  | 'Other';

export type StructureType =
  | 'PEB Building'
  | 'Conventional Steel'
  | 'Hybrid'
  | 'Pre-Engineered'
  | 'Cold Storage';

export type RoofType =
  | 'Standing Seam'
  | 'Ribbed'
  | 'Corrugated'
  | 'Insulated Panel'
  | 'Skylight';

export type CraneSystem = 'Single Girder' | 'Double Girder' | 'Underhung' | 'Top Running' | 'None';

export type WallType = 'Sandwich Panel' | 'Single Skin' | 'Brick Wall' | 'Curtain Wall' | 'Other';

export type HealthStatus = 'Healthy' | 'At Risk' | 'Critical';

export type ProjectCustomFieldType = 'text' | 'number' | 'boolean' | 'select' | 'textarea';

export interface ProjectCustomFieldDefinition {
  key: string;
  label: string;
  type: ProjectCustomFieldType;
  required?: boolean;
  options?: string[];
}

export type ProjectCustomFieldValues = Record<string, string | number | boolean | undefined>;

/**
 * Project interface - the central project record
 * Referenced by: Design, BOQ, Inventory, Procurement, Fabrication, Dispatch, Installation, Finance
 */
export interface Project {
  id: string;
  projectId: number;

  // General Information
  projectCode: string;
  projectName: string;
  customerId: string;
  customerName: string;
  leadId?: string;
  projectType: ProjectType;
  value: number;
  budget: number;
  location: string;
  city: string;
  state: string;
  pincode?: string;
  startDate: Date;
  endDate: Date;
  priority: ProjectPriority;
  projectManager: string;
  projectManagerId: string;

  // PEB Specific Information
  structureType: StructureType;
  width?: number;
  length?: number;
  height?: number;
  baySpacing?: number;
  roofType: RoofType;
  craneSystem: CraneSystem;
  mezzanine?: boolean;
  wallType: WallType;
  insulation?: boolean;
  coveredArea?: number;
  totalWeight?: number;

  // Status & Progress
  status: ProjectStatus;
  stage: ProjectStage;
  progress: number;
  designProgress: number;
  procurementProgress: number;
  fabricationProgress: number;
  installationProgress: number;

  // Health
  healthStatus: HealthStatus;
  timelineHealth: HealthStatus;
  budgetHealth: HealthStatus;
  materialHealth: HealthStatus;
  resourceHealth: HealthStatus;

  // Budget Tracking
  materialCost?: number;
  procurementCost?: number;
  fabricationCost?: number;
  installationCost?: number;
  profitMargin?: number;

  // Milestones
  milestones: ProjectMilestone[];

  // Team
  team: ProjectTeamMember[];

  // Inventory & BOQ Links
  boqId?: string;
  designId?: string;
  reservedItems?: string[];
  consumedItems?: string[];

  // Cross-module relationships
  estimateId?: string; // Links to Estimate
  proposalId?: string; // Links to Proposal
  quotationId?: string; // Links to Quotation
  invoiceIds?: string[]; // List of invoice IDs for this project
  inventoryReservationIds?: string[]; // List of inventory reservation IDs

  // Settings-driven custom fields
  customFields?: ProjectCustomFieldValues;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Project Milestone
 */
export interface ProjectMilestone {
  id: string;
  name: string;
  plannedDate: Date;
  actualDate?: Date;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Delayed';
  delay?: number; // days
}

/**
 * Project Team Member
 */
export interface ProjectTeamMember {
  id: string;
  employeeId: string;
  name: string;
  role: ProjectRole;
  assignedDate: Date;
  workload?: number; // percentage
}

export type ProjectRole =
  | 'Project Manager'
  | 'Design Engineer'
  | 'Structural Engineer'
  | 'Site Manager'
  | 'Procurement Manager'
  | 'Fabrication Lead'
  | 'Installation Lead'
  | 'Quality Engineer'
  | 'Safety Officer';

/**
 * Project Activity - Timeline events for a project
 */
export type ProjectActivityType =
  | 'project_created'
  | 'project_updated'
  | 'design_started'
  | 'design_completed'
  | 'design_uploaded'
  | 'boq_created'
  | 'boq_updated'
  | 'procurement_started'
  | 'material_reserved'
  | 'purchase_request_created'
  | 'fabrication_started'
  | 'fabrication_completed'
  | 'dispatch_started'
  | 'dispatch_completed'
  | 'installation_started'
  | 'installation_completed'
  | 'milestone_completed'
  | 'team_assigned'
  | 'task_assigned'
  | 'status_changed'
  | 'stage_changed'
  | 'document_uploaded'
  | 'note_added'
  | 'payment_received'
  | 'project_completed'
  | 'handover_completed';

export interface ProjectActivity {
  id: string;
  projectId: string;
  type: ProjectActivityType;
  description: string;
  performedBy: string;
  performedAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Project Task
 */
export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  assignedTo: string;
  assignedToName: string;
  dueDate: Date;
  priority: ProjectPriority;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  dependencies?: string[]; // task IDs
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Project Filters
 */
export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus;
  stage?: ProjectStage;
  priority?: ProjectPriority;
  projectManager?: string;
  customer?: string;
  city?: string;
  healthStatus?: HealthStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Create Project DTO
 */
export interface CreateProjectDto {
  projectCode?: string;
  projectName: string;
  customerId: string;
  customerName?: string;
  leadId?: string;
  projectType: ProjectType;
  value?: number;
  budget?: number;
  location: string;
  city: string;
  state: string;
  pincode?: string;
  startDate?: Date;
  endDate?: Date;
  priority: ProjectPriority;
  projectManagerId: string;
  projectManager?: string;
  structureType: StructureType;
  width?: number;
  length?: number;
  height?: number;
  baySpacing?: number;
  roofType: RoofType;
  craneSystem: CraneSystem;
  mezzanine?: boolean;
  wallType: WallType;
  insulation?: boolean;
  coveredArea?: number;
  totalWeight?: number;
  status?: ProjectStatus;
  stage?: ProjectStage;
  progress?: number;
  customFields?: ProjectCustomFieldValues;
}

/**
 * Update Project DTO (all fields optional)
 */
export interface UpdateProjectDto {
  projectName?: string;
  value?: number | null;
  budget?: number | null;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  priority?: ProjectPriority;
  projectManagerId?: string;
  projectManager?: string | null;
  structureType?: StructureType;
  width?: number | null;
  length?: number | null;
  height?: number | null;
  baySpacing?: number | null;
  roofType?: RoofType;
  craneSystem?: CraneSystem;
  mezzanine?: boolean | null;
  wallType?: WallType;
  insulation?: boolean | null;
  coveredArea?: number | null;
  totalWeight?: number | null;
  status?: ProjectStatus;
  stage?: ProjectStage;
  progress?: number;
  designProgress?: number;
  procurementProgress?: number;
  fabricationProgress?: number;
  installationProgress?: number;
  materialCost?: number | null;
  procurementCost?: number | null;
  fabricationCost?: number | null;
  installationCost?: number | null;
  profitMargin?: number | null;
  customFields?: ProjectCustomFieldValues | null;
}

/**
 * Project Stats
 */
export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  delayedProjects: number;
  upcomingDeadlines: number;
  projectsInDesign: number;
  projectsInProcurement: number;
  projectsInFabrication: number;
  projectsInInstallation: number;
  pendingApprovals: number;
  projectRevenue: number;
  materialCost: number;
  healthyProjects: number;
  atRiskProjects: number;
  criticalProjects: number;
}
