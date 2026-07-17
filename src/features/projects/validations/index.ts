/**
 * Project Module Validations
 * Zod validation schemas for all project-related forms
 */
import { z } from 'zod';
import {
  ProjectType,
  ProjectPriority,
  StructureType,
  RoofType,
  CraneSystem,
  WallType,
  ProjectRole,
} from '@/features/projects/types';

/**
 * Create Project Schema
 */
export const createProjectSchema = z.object({
  projectName: z.string().min(3, 'Project name must be at least 3 characters'),
  customerId: z.string().min(1, 'Customer is required'),
  leadId: z.string().optional(),
  projectType: z.enum(['Industrial Shed', 'Warehouse', 'Factory', 'Commercial Building', 'Showroom', 'School', 'Hospital', 'Sports Complex', 'Airport Terminal', 'Other'] as const),
  value: z.number().min(0, 'Value must be positive'),
  budget: z.number().min(0, 'Budget must be positive'),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent'] as const),
  projectManagerId: z.string().min(1, 'Project manager is required'),
  structureType: z.enum(['PEB Building', 'Conventional Steel', 'Hybrid', 'Pre-Engineered', 'Cold Storage'] as const),
  width: z.number().positive().optional(),
  length: z.number().positive().optional(),
  height: z.number().positive().optional(),
  baySpacing: z.number().positive().optional(),
  roofType: z.enum(['Standing Seam', 'Ribbed', 'Corrugated', 'Insulated Panel', 'Skylight'] as const),
  craneSystem: z.enum(['Single Girder', 'Double Girder', 'Underhung', 'Top Running', 'None'] as const),
  mezzanine: z.boolean().optional(),
  wallType: z.enum(['Sandwich Panel', 'Single Skin', 'Brick Wall', 'Curtain Wall', 'Other'] as const),
  insulation: z.boolean().optional(),
  coveredArea: z.number().positive().optional(),
  totalWeight: z.number().positive().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  { path: ['endDate'], message: 'End date must be after start date' }
);

/**
 * Update Project Schema (all fields optional)
 */
export const updateProjectSchema = z.object({
  projectName: z.string().min(3).optional(),
  value: z.number().min(0).optional(),
  budget: z.number().min(0).optional(),
  location: z.string().min(3).optional(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  pincode: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent'] as const).optional(),
  projectManagerId: z.string().min(1).optional(),
  structureType: z.enum(['PEB Building', 'Conventional Steel', 'Hybrid', 'Pre-Engineered', 'Cold Storage'] as const).optional(),
  width: z.number().positive().optional(),
  length: z.number().positive().optional(),
  height: z.number().positive().optional(),
  baySpacing: z.number().positive().optional(),
  roofType: z.enum(['Standing Seam', 'Ribbed', 'Corrugated', 'Insulated Panel', 'Skylight'] as const).optional(),
  craneSystem: z.enum(['Single Girder', 'Double Girder', 'Underhung', 'Top Running', 'None'] as const).optional(),
  mezzanine: z.boolean().optional(),
  wallType: z.enum(['Sandwich Panel', 'Single Skin', 'Brick Wall', 'Curtain Wall', 'Other'] as const).optional(),
  insulation: z.boolean().optional(),
  coveredArea: z.number().positive().optional(),
  totalWeight: z.number().positive().optional(),
  status: z.enum(['Lead', 'Estimate', 'Proposal', 'Quotation', 'Approved', 'Design', 'BOQ', 'Procurement', 'Fabrication', 'Dispatch', 'Installation', 'Completion', 'After Sales', 'On Hold', 'Cancelled'] as const).optional(),
  stage: z.enum(['Design', 'BOQ', 'Procurement', 'Fabrication', 'Dispatch', 'Installation', 'Handover'] as const).optional(),
  progress: z.number().min(0).max(100).optional(),
  designProgress: z.number().min(0).max(100).optional(),
  procurementProgress: z.number().min(0).max(100).optional(),
  fabricationProgress: z.number().min(0).max(100).optional(),
  installationProgress: z.number().min(0).max(100).optional(),
  materialCost: z.number().min(0).optional(),
  procurementCost: z.number().min(0).optional(),
  fabricationCost: z.number().min(0).optional(),
  installationCost: z.number().min(0).optional(),
  profitMargin: z.number().min(0).max(100).optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.endDate > data.startDate;
    }
    return true;
  },
  { path: ['endDate'], message: 'End date must be after start date' }
);

/**
 * Create Task Schema
 */
export const createTaskSchema = z.object({
  title: z.string().min(3, 'Task title must be at least 3 characters'),
  description: z.string().optional(),
  assignedTo: z.string().min(1, 'Assignee is required'),
  dueDate: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent'] as const),
  dependencies: z.array(z.string()).optional(),
});

/**
 * Update Task Schema
 */
export const updateTaskSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  assignedTo: z.string().min(1).optional(),
  dueDate: z.date().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent'] as const).optional(),
  status: z.enum(['Pending', 'In Progress', 'Completed', 'Overdue'] as const).optional(),
});

/**
 * Milestone Schema
 */
export const milestoneSchema = z.object({
  name: z.string().min(3, 'Milestone name must be at least 3 characters'),
  plannedDate: z.string().optional(),
  actualDate: z.string().optional(),
});

/**
 * Team Member Schema
 */
export const teamMemberSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  role: z.enum(['Project Manager', 'Design Engineer', 'Structural Engineer', 'Site Manager', 'Procurement Manager', 'Fabrication Lead', 'Installation Lead', 'Quality Engineer', 'Safety Officer'] as const),
  workload: z.number().min(0).max(100).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MilestoneInput = z.infer<typeof milestoneSchema>;
export type TeamMemberInput = z.infer<typeof teamMemberSchema>;
