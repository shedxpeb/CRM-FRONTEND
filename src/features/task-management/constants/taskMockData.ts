/**
 * Frontend-only mock data for the shared task foundation.
 *
 * These are lightweight, static reference lists used as sensible defaults by the
 * reusable components (followers, saved views, templates). They intentionally do
 * NOT introduce a second mock service — `taskManagementApi` remains the source of
 * truth for task records. All values are clearly mock and carry no persistence.
 */
import type { SavedView, TaskTemplate, TaskUser } from '../types';

// Mock employees aligned with the names already present in taskManagementApi.
export const MOCK_TASK_EMPLOYEES: TaskUser[] = [
  { id: 'user-1', name: 'Rajesh Kumar', role: 'Site Engineer' },
  { id: 'user-2', name: 'Amit Singh', role: 'Fabricator' },
  { id: 'user-3', name: 'Suresh Patel', role: 'Erector' },
  { id: 'user-4', name: 'Priya Sharma', role: 'QA Inspector' },
  { id: 'admin-1', name: 'Admin User', role: 'Manager' },
];

export const DEFAULT_SAVED_VIEWS: SavedView[] = [
  { id: 'default', name: 'All Tasks', scope: 'default', isPinned: true },
  { id: 'my-open', name: 'My Open Tasks', scope: 'personal' },
  { id: 'overdue', name: 'Overdue', scope: 'personal' },
  { id: 'team-review', name: 'Pending Review', scope: 'team' },
  { id: 'critical', name: 'Critical Priority', scope: 'public' },
];

// Construction-specific task templates only.
export const CONSTRUCTION_TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: 'tpl-installation',
    name: 'Installation',
    description: 'PEB structure installation at site',
    category: 'Installation',
    defaultPriority: 'High',
    checklist: [
      'Verify site readiness',
      'Stage materials',
      'Install primary frame',
      'Install secondary members',
      'Safety check',
    ],
  },
  {
    id: 'tpl-inspection',
    name: 'Inspection',
    description: 'Quality inspection of completed work',
    category: 'Inspection',
    defaultPriority: 'Medium',
    checklist: ['Review specifications', 'Inspect welds/joints', 'Capture photos', 'Record findings'],
  },
  {
    id: 'tpl-fabrication',
    name: 'Fabrication',
    description: 'Steel fabrication work order',
    category: 'Field Work',
    defaultPriority: 'Medium',
    checklist: ['Cut members', 'Weld assembly', 'Surface prep', 'Apply primer'],
  },
  {
    id: 'tpl-painting',
    name: 'Painting',
    description: 'Surface painting and finishing',
    category: 'Field Work',
    defaultPriority: 'Low',
    checklist: ['Surface cleaning', 'Primer coat', 'Final coat', 'Cure & inspect'],
  },
  {
    id: 'tpl-quality-check',
    name: 'Quality Check',
    description: 'Quality assurance checkpoint',
    category: 'Inspection',
    defaultPriority: 'High',
    checklist: ['Dimensional check', 'Material verification', 'Documentation'],
  },
  {
    id: 'tpl-dispatch',
    name: 'Dispatch',
    description: 'Material dispatch to site',
    category: 'Field Work',
    defaultPriority: 'Medium',
    checklist: ['Verify load list', 'Load vehicle', 'Generate challan', 'Confirm delivery'],
  },
  {
    id: 'tpl-site-visit',
    name: 'Site Visit',
    description: 'Site survey or coordination visit',
    category: 'Field Work',
    defaultPriority: 'Medium',
    checklist: ['Site measurement', 'Photograph site', 'Coordinate with client'],
  },
  {
    id: 'tpl-maintenance',
    name: 'Maintenance',
    description: 'Preventive or breakdown maintenance',
    category: 'Maintenance',
    defaultPriority: 'High',
    checklist: ['Inspect equipment', 'Replace parts', 'Test operation'],
  },
];
