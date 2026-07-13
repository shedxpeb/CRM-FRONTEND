/**
 * Settings Module Constants
 */

export const MODULES = [
  {
    id: 'leads',
    name: 'leads',
    displayName: 'Leads',
    description: 'Manage leads and opportunities',
    icon: 'Users',
    isEnabled: true,
    isVisible: true,
    isLocked: false,
    requiredPermissions: ['view', 'create', 'edit', 'delete'],
  },
  {
    id: 'customers',
    name: 'customers',
    displayName: 'Customers',
    description: 'Manage customer relationships',
    icon: 'Building',
    isEnabled: true,
    isVisible: true,
    isLocked: false,
    requiredPermissions: ['view', 'create', 'edit', 'delete'],
  },
  {
    id: 'projects',
    name: 'projects',
    displayName: 'Projects',
    description: 'Manage projects and tasks',
    icon: 'FolderKanban',
    isEnabled: true,
    isVisible: true,
    isLocked: false,
    requiredPermissions: ['view', 'create', 'edit', 'delete'],
  },
  {
    id: 'items',
    name: 'items',
    displayName: 'Items',
    description: 'Manage item master and catalog',
    icon: 'Package',
    isEnabled: true,
    isVisible: true,
    isLocked: false,
    requiredPermissions: ['view', 'create', 'edit', 'delete'],
  },
  {
    id: 'inventory',
    name: 'inventory',
    displayName: 'Inventory',
    description: 'Manage inventory and stock',
    icon: 'Package',
    isEnabled: true,
    isVisible: true,
    isLocked: false,
    requiredPermissions: ['view', 'create', 'edit', 'delete'],
  },
  {
    id: 'finance',
    name: 'finance',
    displayName: 'Finance',
    description: 'Manage finances and accounting',
    icon: 'DollarSign',
    isEnabled: true,
    isVisible: true,
    isLocked: false,
    requiredPermissions: ['view', 'create', 'edit', 'delete'],
  },
  {
    id: 'accounting',
    name: 'accounting',
    displayName: 'Accounting',
    description: 'Manage chart of accounts and journals',
    icon: 'Calculator',
    isEnabled: true,
    isVisible: true,
    isLocked: false,
    requiredPermissions: ['view', 'create', 'edit', 'delete'],
  },
  {
    id: 'documents',
    name: 'documents',
    displayName: 'Documents',
    description: 'Manage documents and templates',
    icon: 'FileText',
    isEnabled: true,
    isVisible: true,
    isLocked: false,
    requiredPermissions: ['view', 'create', 'edit', 'delete'],
  },
  {
    id: 'boq',
    name: 'boq',
    displayName: 'BOQ',
    description: 'Bill of Quantities management',
    icon: 'FileSpreadsheet',
    isEnabled: true,
    isVisible: false,
    isLocked: false,
    requiredPermissions: ['view', 'create', 'edit', 'delete'],
  },
] as const;

export const PERMISSIONS = [
  { id: '1', module: 'leads', action: 'view', description: 'View leads' },
  { id: '2', module: 'leads', action: 'create', description: 'Create leads' },
  { id: '3', module: 'leads', action: 'edit', description: 'Edit leads' },
  { id: '4', module: 'leads', action: 'delete', description: 'Delete leads' },
  { id: '5', module: 'leads', action: 'approve', description: 'Approve leads' },
  { id: '6', module: 'leads', action: 'export', description: 'Export leads' },
  { id: '7', module: 'customers', action: 'view', description: 'View customers' },
  { id: '8', module: 'customers', action: 'create', description: 'Create customers' },
  { id: '9', module: 'customers', action: 'edit', description: 'Edit customers' },
  { id: '10', module: 'customers', action: 'delete', description: 'Delete customers' },
  { id: '11', module: 'projects', action: 'view', description: 'View projects' },
  { id: '12', module: 'projects', action: 'create', description: 'Create projects' },
  { id: '13', module: 'projects', action: 'edit', description: 'Edit projects' },
  { id: '14', module: 'projects', action: 'delete', description: 'Delete projects' },
  { id: '15', module: 'inventory', action: 'view', description: 'View inventory' },
  { id: '16', module: 'inventory', action: 'create', description: 'Create inventory items' },
  { id: '17', module: 'inventory', action: 'edit', description: 'Edit inventory items' },
  { id: '18', module: 'inventory', action: 'delete', description: 'Delete inventory items' },
  { id: '19', module: 'finance', action: 'view', description: 'View finance' },
  { id: '20', module: 'finance', action: 'create', description: 'Create finance records' },
  { id: '21', module: 'finance', action: 'edit', description: 'Edit finance records' },
  { id: '22', module: 'finance', action: 'delete', description: 'Delete finance records' },
  { id: '23', module: 'finance', action: 'approve', description: 'Approve finance records' },
  { id: '24', module: 'documents', action: 'view', description: 'View documents' },
  { id: '25', module: 'documents', action: 'create', description: 'Create documents' },
  { id: '26', module: 'documents', action: 'edit', description: 'Edit documents' },
  { id: '27', module: 'documents', action: 'delete', description: 'Delete documents' },
  { id: '28', module: 'documents', action: 'send', description: 'Send documents' },
  { id: '29', module: 'documents', action: 'print', description: 'Print documents' },
] as const;

export const DEFAULT_ROLES = [
  {
    id: '1',
    name: 'Owner',
    description: 'Full access to all modules and settings',
    permissions: PERMISSIONS.map(p => p.id),
    isSystem: true,
  },
  {
    id: '2',
    name: 'Admin',
    description: 'Administrative access to most modules',
    permissions: PERMISSIONS.filter(p => p.action !== 'delete').map(p => p.id),
    isSystem: true,
  },
  {
    id: '3',
    name: 'Manager',
    description: 'Manager access with approval rights',
    permissions: PERMISSIONS.filter(p => ['view', 'create', 'edit', 'approve'].includes(p.action)).map(p => p.id),
    isSystem: true,
  },
  {
    id: '4',
    name: 'Employee',
    description: 'Basic access to view and create',
    permissions: PERMISSIONS.filter(p => ['view', 'create'].includes(p.action)).map(p => p.id),
    isSystem: true,
  },
] as const;

export const TIMEZONES = [
  'UTC',
  'Asia/Kolkata',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
] as const;

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
] as const;

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
] as const;

export const DATE_FORMATS = [
  'DD/MM/YYYY',
  'MM/DD/YYYY',
  'YYYY-MM-DD',
  'DD-MM-YYYY',
] as const;

export const TIME_FORMATS = [
  '12-hour',
  '24-hour',
] as const;

export const NOTIFICATION_EVENTS = [
  'lead_assigned',
  'lead_created',
  'lead_converted',
  'project_created',
  'project_updated',
  'project_completed',
  'inventory_low',
  'quotation_approved',
  'payment_received',
  'invoice_overdue',
  'user_created',
  'document_sent',
] as const;

export const INTEGRATION_TYPES = [
  'meta',
  'facebook',
  'instagram',
  'whatsapp',
  'email',
  'google_maps',
  'custom',
] as const;
