import { api } from '@/core/api';
import { BackendPendingError } from '@/core/api/capabilities';
import type {
  Company,
  Branch,
  User,
  Role,
  Module,
  SystemPreferences,
  ModuleConfiguration,
  SettingsStats,
  SecuritySettings,
  ProjectConfiguration,
} from '../types';
import { MODULES } from '../constants/settingsConstants';
import {
  LEAD_MODULE_DEFAULTS,
  CUSTOMER_MODULE_DEFAULTS,
  PROJECT_MODULE_DEFAULTS,
  ITEM_MODULE_DEFAULTS,
  INVENTORY_MODULE_DEFAULTS,
  DOCUMENT_MODULE_DEFAULTS,
  FINANCE_MODULE_DEFAULTS,
  ACCOUNTING_MODULE_DEFAULTS,
} from '../utils/moduleConfigurationDefaults';

const DEFAULT_SYSTEM_PREFERENCES: SystemPreferences = {
  timezone: 'Asia/Kolkata',
  language: 'en',
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12-hour',
  fileUploadLimit: 10,
  allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png'],
  defaultTheme: 'light',
};

let moduleStore: Module[] = MODULES.map((module) => ({
  ...module,
  name: module.name as Module['name'],
  requiredPermissions: [...module.requiredPermissions],
}));

/**
 * Frontend module name → CRM canonical (singular) OrganizationModule key.
 * Modules not listed here (finance, accounting, boq) have no per-org
 * enablement row and stay enabled.
 */
const MODULE_TO_CRM_KEY: Record<string, string> = {
  leads: 'lead',
  customers: 'customer',
  projects: 'project',
  items: 'item-master',
  inventory: 'inventory',
  documents: 'document',
  vendors: 'vendor',
  purchases: 'purchase-order',
  task: 'task',
  warehouse: 'warehouse',
  tracking: 'tracking',
  reports: 'report',
  user: 'user',
  role: 'role',
};

/**
 * Merges the static module catalog with the real per-organization
 * enablement state returned by GET /organization/modules.
 * - Legacy orgs with no module rows: everything stays enabled.
 * - Modules with no CRM row (finance/accounting/boq): stay enabled.
 * - Otherwise isEnabled reflects the OrganizationModule row.
 */
async function loadModulesFromBackend(): Promise<Module[]> {
  const catalog: Module[] = MODULES.map((module) => ({
    ...module,
    name: module.name as Module['name'],
    requiredPermissions: [...module.requiredPermissions],
  }));

  const response = await api.get<{ data: Array<{ moduleKey: string; enabled: boolean }> | null }>(
    '/organization/modules',
  );
  const rows = response.data;
  if (!rows || rows.length === 0) return catalog;

  const enabledKeys = new Set(rows.filter((row) => row.enabled).map((row) => row.moduleKey));
  return catalog.map((module) => {
    const crmKey = MODULE_TO_CRM_KEY[module.name];
    if (!crmKey) return module;
    return { ...module, isEnabled: enabledKeys.has(crmKey) };
  });
}

const MODULE_DEFAULTS: Record<string, { name: string; settings: Record<string, unknown> }> = {
  leads: { name: 'Leads', settings: LEAD_MODULE_DEFAULTS },
  customers: { name: 'Customers', settings: CUSTOMER_MODULE_DEFAULTS },
  projects: { name: 'Projects', settings: PROJECT_MODULE_DEFAULTS },
  items: { name: 'Items', settings: ITEM_MODULE_DEFAULTS },
  inventory: { name: 'Inventory', settings: INVENTORY_MODULE_DEFAULTS },
  documents: { name: 'Documents', settings: DOCUMENT_MODULE_DEFAULTS },
  finance: { name: 'Finance', settings: FINANCE_MODULE_DEFAULTS },
  accounting: { name: 'Accounting', settings: ACCOUNTING_MODULE_DEFAULTS },
};

function pending(resource: string): never {
  throw new BackendPendingError(resource);
}

export const settingsApi = {
  async getCompany(): Promise<Company> {
    return pending('settings-company');
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateCompany(_data: Partial<Company>): Promise<Company> {
    return pending('settings-company');
  },

  async getBranches(): Promise<Branch[]> {
    return pending('settings-branches');
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createBranch(_data: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>): Promise<Branch> {
    return pending('settings-branches');
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateBranch(_id: string, _data: Partial<Branch>): Promise<Branch> {
    return pending('settings-branches');
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteBranch(_id: string): Promise<void> {
    return pending('settings-branches');
  },

  async getUsers(): Promise<User[]> {
    const response = await api.get<{ data: { rows?: User[] } | User[] }>('/users');
    const payload = response.data;
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray((payload as { rows?: User[] }).rows)) {
      return (payload as { rows: User[] }).rows;
    }
    return [];
  },

  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'loginHistory'>): Promise<User> {
    const response = await api.post<{ data: User }>('/users', data);
    return response.data;
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await api.patch<{ data: User }>(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async getRoles(): Promise<Role[]> {
    const response = await api.get<{ data: Role[] }>('/roles');
    return response.data ?? [];
  },

  async createRole(data: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    const response = await api.post<{ data: Role }>('/roles', data);
    return response.data;
  },

  async updateRole(id: string, data: Partial<Role>): Promise<Role> {
    const response = await api.patch<{ data: Role }>(`/roles/${id}`, data);
    return response.data;
  },

  async deleteRole(id: string): Promise<void> {
    await api.delete(`/roles/${id}`);
  },

  async getModules(): Promise<Module[]> {
    try {
      moduleStore = await loadModulesFromBackend();
    } catch {
      // Network/auth failure — fall back to the last known state.
    }
    return moduleStore;
  },

  async updateModule(id: string, data: Partial<Module>): Promise<Module> {
    // Module enablement is owned by the platform (SUPER-ADMIN tenant modules).
    // Reflect the change locally for the current session; the authoritative
    // state comes from GET /organization/modules on next fetch.
    moduleStore = moduleStore.map((module) =>
      module.id === id ? { ...module, ...data, id, updatedAt: new Date() } : module,
    );
    const updated = moduleStore.find((module) => module.id === id);
    if (!updated) {
      throw new Error(`Module not found: ${id}`);
    }
    return updated;
  },

  async getSystemPreferences(): Promise<SystemPreferences> {
    return { ...DEFAULT_SYSTEM_PREFERENCES };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateSystemPreferences(_data: Partial<SystemPreferences>): Promise<SystemPreferences> {
    return pending('settings-preferences');
  },

  /**
   * Local defaults for module schemas used by Lead/Customer/Project forms.
   * Persisted settings backend is not available yet.
   */
  async getModuleConfiguration(moduleId: string): Promise<ModuleConfiguration> {
    const defaults = MODULE_DEFAULTS[moduleId];
    if (defaults) {
      return { id: moduleId, name: defaults.name, settings: defaults.settings };
    }
    return { id: moduleId, name: '', settings: {} };
  },

  async getSettingsStats(): Promise<SettingsStats> {
    return pending('settings-stats');
  },

  async getDocumentSettings(): Promise<Record<string, unknown>> {
    return pending('settings-documents');
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateDocumentSettings(_data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return pending('settings-documents');
  },

  async getFinanceConfiguration(): Promise<Record<string, unknown>> {
    return pending('settings-finance');
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateFinanceConfiguration(_data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return pending('settings-finance');
  },

  async getProjectConfiguration(): Promise<ProjectConfiguration> {
    const defaults = PROJECT_MODULE_DEFAULTS as Partial<ProjectConfiguration> & {
      projectTypes?: string[];
      statuses?: string[];
      stages?: string[];
    };
    return {
      projectTypes: defaults.projectTypes ?? ['Industrial Shed', 'Warehouse', 'Factory'],
      stages: defaults.stages ?? ['Planning', 'Execution', 'Handover'],
      statuses: defaults.statuses ?? ['Active', 'On Hold', 'Completed'],
      completionRules: defaults.completionRules ?? [],
      afterSalesRules: defaults.afterSalesRules ?? [],
    };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateProjectConfiguration(_data: Partial<ProjectConfiguration>): Promise<ProjectConfiguration> {
    return pending('settings-projects');
  },

  async getSecuritySettings(): Promise<SecuritySettings> {
    return pending('settings-security');
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateSecuritySettings(_data: Partial<SecuritySettings>): Promise<SecuritySettings> {
    return pending('settings-security');
  },

  async getOrganization(id?: string): Promise<any> {
    const url = id ? `/organization/${id}` : '/organization/modules';
    const response = await api.get(url) as any;
    return response.data;
  },

  async getQuotationTemplateDefaults(organizationId: string): Promise<any> {
    const response = await api.get<{ data: any }>(`/organization/${organizationId}/quotation-template`);
    return response.data;
  },

  async updateQuotationTemplateDefaults(organizationId: string, defaults: any): Promise<any> {
    const response = await api.patch<{ data: any }>(`/organization/${organizationId}/quotation-template`, defaults);
    return response.data;
  },
};
