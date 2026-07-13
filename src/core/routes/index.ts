/**
 * Centralized Route Registry
 * Never hardcode routes - always use these constants
 */
export const ROUTES = {
  // Auth
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  
  // Dashboard
  dashboard: '/dashboard',
  
  // Modules
  leads: '/dashboard/leads',
  leadsDetail: (id: string) => `/dashboard/leads/${id}`,
  
  customers: '/dashboard/customers',
  customersDetail: (id: string) => `/dashboard/customers/${id}`,
  
  items: '/dashboard/item',
  itemsDetail: (id: string) => `/dashboard/items/${id}`,

  projects: '/dashboard/projects',
  projectsDetail: (id: string) => `/dashboard/projects/${id}`,
  
  inventory: '/dashboard/inventory',
  inventoryDetail: (id: string) => `/dashboard/inventory/${id}`,
  
  finance: '/dashboard/finance',
  financeInvoice: (id: string) => `/dashboard/finance/invoices/${id}`,

  documents: '/dashboard/documents',
  documentsDetail: (id: string) => `/dashboard/documents/${id}`,
  documentsEstimates: '/dashboard/documents/estimates',
  documentsProposals: '/dashboard/documents/proposals',
  documentsQuotations: '/dashboard/documents/quotations',
  documentsTemplates: '/dashboard/documents/templates',
  documentsApprovals: '/dashboard/documents/approvals',

  // Admin / Settings - Master Control Center
  settings: '/settings',
  settingsDashboard: '/settings',
  settingsCompany: '/settings/company',
  settingsBranches: '/settings/branches',
  settingsBranding: '/settings/branding',
  settingsUsers: '/settings/users',
  settingsRoles: '/settings/roles',
  settingsPermissions: '/settings/permissions',
  settingsModules: '/settings/modules',
  settingsDocuments: '/settings/documents',
  settingsWorkflows: '/settings/workflows',
  settingsNotifications: '/settings/notifications',
  settingsCommunication: '/settings/communication',
  settingsIntegrations: '/settings/integrations',
  settingsAutomation: '/settings/automation',
  settingsLeadsConfig: '/settings/leads-config',
  settingsProjectsConfig: '/settings/projects-config',
  settingsInventoryConfig: '/settings/inventory-config',
  settingsFinanceConfig: '/settings/finance-config',
  settingsSecurity: '/settings/security',
  settingsBackup: '/settings/backup',
  settingsAuditLogs: '/settings/audit-logs',
  settingsPreferences: '/settings/preferences',
  
} as const;

/**
 * Route metadata for navigation
 */
export const ROUTE_METADATA = {
  leads: {
    title: 'Leads',
    icon: 'Users',
    permission: 'LEADS_VIEW',
  },
  customers: {
    title: 'Customers',
    icon: 'Building',
    permission: 'CUSTOMERS_VIEW',
  },
  projects: {
    title: 'Projects',
    icon: 'FolderKanban',
    permission: 'PROJECTS_VIEW',
  },
  inventory: {
    title: 'Inventory',
    icon: 'Package',
    permission: 'INVENTORY_VIEW',
  },
  finance: {
    title: 'Finance',
    icon: 'DollarSign',
    permission: 'FINANCE_VIEW',
  },
  documents: {
    title: 'Documents',
    icon: 'FileText',
    permission: 'DOCUMENTS_VIEW',
  },
} as const;

export type RouteKey = keyof typeof ROUTES;
