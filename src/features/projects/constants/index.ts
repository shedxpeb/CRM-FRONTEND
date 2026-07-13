/**
 * Project Module Constants
 * All constant values and helper functions for projects
 */

export const PROJECT_STATUSES = [
  'Lead',
  'Estimate',
  'Proposal',
  'Quotation',
  'Approved',
  'Design',
  'BOQ',
  'Procurement',
  'Fabrication',
  'Dispatch',
  'Installation',
  'Completion',
  'After Sales',
  'On Hold',
  'Cancelled',
] as const;

export const PROJECT_STAGES = [
  'Design',
  'BOQ',
  'Procurement',
  'Fabrication',
  'Dispatch',
  'Installation',
  'Handover',
] as const;

export const PROJECT_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const;

export const PROJECT_TYPES = [
  'Industrial Shed',
  'Warehouse',
  'Factory',
  'Commercial Building',
  'Showroom',
  'School',
  'Hospital',
  'Sports Complex',
  'Airport Terminal',
  'Other',
] as const;

export const STRUCTURE_TYPES = [
  'PEB Building',
  'Conventional Steel',
  'Hybrid',
  'Pre-Engineered',
  'Cold Storage',
] as const;

export const ROOF_TYPES = [
  'Standing Seam',
  'Ribbed',
  'Corrugated',
  'Insulated Panel',
  'Skylight',
] as const;

export const CRANE_SYSTEMS = [
  'Single Girder',
  'Double Girder',
  'Underhung',
  'Top Running',
  'None',
] as const;

export const WALL_TYPES = [
  'Sandwich Panel',
  'Single Skin',
  'Brick Wall',
  'Curtain Wall',
  'Other',
] as const;

export const HEALTH_STATUSES = ['Healthy', 'At Risk', 'Critical'] as const;

export const PROJECT_ROLES = [
  'Project Manager',
  'Design Engineer',
  'Structural Engineer',
  'Site Manager',
  'Procurement Manager',
  'Fabrication Lead',
  'Installation Lead',
  'Quality Engineer',
  'Safety Officer',
] as const;

export const MILESTONE_TEMPLATES = [
  { name: 'Design Complete', defaultDelay: 0 },
  { name: 'BOQ Complete', defaultDelay: 0 },
  { name: 'Procurement Complete', defaultDelay: 0 },
  { name: 'Fabrication Complete', defaultDelay: 0 },
  { name: 'Dispatch Complete', defaultDelay: 0 },
  { name: 'Installation Complete', defaultDelay: 0 },
  { name: 'Handover Complete', defaultDelay: 0 },
] as const;

/**
 * Get status badge variant
 */
export function getProjectStatusVariant(status: string): 'default' | 'success' | 'warning' | 'destructive' {
  const activeStatuses = ['Approved', 'Design', 'BOQ', 'Procurement', 'Fabrication', 'Dispatch', 'Installation'];
  const warningStatuses = ['Lead', 'Estimate', 'Proposal', 'Quotation', 'On Hold'];
  const destructiveStatuses = ['Cancelled'];
  const successStatuses = ['Completion', 'After Sales'];

  if (successStatuses.includes(status as any)) return 'success';
  if (activeStatuses.includes(status as any)) return 'default';
  if (warningStatuses.includes(status as any)) return 'warning';
  if (destructiveStatuses.includes(status as any)) return 'destructive';
  return 'default';
}

/**
 * Get priority badge variant
 */
export function getPriorityVariant(priority: string): 'default' | 'success' | 'warning' | 'destructive' {
  switch (priority) {
    case 'Urgent':
      return 'destructive';
    case 'High':
      return 'warning';
    case 'Medium':
      return 'default';
    case 'Low':
      return 'success';
    default:
      return 'default';
  }
}

/**
 * Get health status badge variant
 */
export function getHealthStatusVariant(health: string): 'default' | 'success' | 'warning' | 'destructive' {
  switch (health) {
    case 'Healthy':
      return 'success';
    case 'At Risk':
      return 'warning';
    case 'Critical':
      return 'destructive';
    default:
      return 'default';
  }
}

/**
 * Get health status color
 */
export function getHealthStatusColor(health: string): string {
  switch (health) {
    case 'Healthy':
      return 'text-green-600 bg-green-100';
    case 'At Risk':
      return 'text-amber-600 bg-amber-100';
    case 'Critical':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

/**
 * Calculate overall health based on individual health metrics
 */
export function calculateOverallHealth(
  timelineHealth: string,
  budgetHealth: string,
  materialHealth: string,
  resourceHealth: string
): 'Healthy' | 'At Risk' | 'Critical' {
  const metrics = [timelineHealth, budgetHealth, materialHealth, resourceHealth];
  const criticalCount = metrics.filter((m) => m === 'Critical').length;
  const atRiskCount = metrics.filter((m) => m === 'At Risk').length;

  if (criticalCount > 0) return 'Critical';
  if (atRiskCount >= 2) return 'Critical';
  if (atRiskCount >= 1) return 'At Risk';
  return 'Healthy';
}

/**
 * Get stage progress percentage
 */
export function getStageProgress(stage: string, project: Record<string, unknown>): number {
  switch (stage) {
    case 'Design':
      return (project.designProgress as number) || 0;
    case 'BOQ':
      return (project.designProgress as number) || 0;
    case 'Procurement':
      return (project.procurementProgress as number) || 0;
    case 'Fabrication':
      return (project.fabricationProgress as number) || 0;
    case 'Installation':
      return (project.installationProgress as number) || 0;
    default:
      return 0;
  }
}
