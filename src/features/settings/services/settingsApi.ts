import { api } from '@/core/api';
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

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockCompany: Company = {
  id: '1',
  companyName: 'PEB Solutions',
  legalCompanyName: 'PEB Solutions Pvt Ltd',
  address: '123 Business Park',
  city: 'Mumbai',
  state: 'Maharashtra',
  country: 'India',
  postalCode: '400001',
  gstNumber: '27AAPFU0939J1ZP',
  panNumber: 'AAPFU0939J',
  cinNumber: 'U72900MH2020PTC123456',
  msmeNumber: 'UDYAM-MH-20-0123456',
  website: 'https://pebsolutions.com',
  email: 'info@pebsolutions.com',
  mobile: '+91 9876543210',
  supportEmail: 'support@pebsolutions.com',
  supportPhone: '+91 9876543211',
  facebook: 'https://facebook.com/pebsolutions',
  instagram: 'https://instagram.com/pebsolutions',
  linkedin: 'https://linkedin.com/company/pebsolutions',
  primaryColor: '#3b82f6',
  secondaryColor: '#8b5cf6',
  accentColor: '#10b981',
  themeMode: 'light',
};

const mockBranches: Branch[] = [
  {
    id: '1',
    branchCode: 'HQ',
    branchName: 'Headquarters',
    address: '123 Business Park',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    postalCode: '400001',
    gstNumber: '27AAPFU0939J1ZP',
    contactPerson: 'John Doe',
    email: 'mumbai@pebsolutions.com',
    mobile: '+91 9876543210',
    isDefault: true,
    isActive: true,
  },
];

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Owner',
    email: 'owner@pebsolutions.com',
    mobile: '+91 9876543210',
    role: 'owner',
    isActive: true,
    isLocked: false,
    loginHistory: [],
  },
  {
    id: '2',
    name: 'Jane Admin',
    email: 'admin@pebsolutions.com',
    mobile: '+91 9876543211',
    role: 'admin',
    isActive: true,
    isLocked: false,
    loginHistory: [],
  },
];

let moduleStore: Module[] = MODULES.map((module) => ({
  ...module,
  name: module.name as Module['name'],
  requiredPermissions: [...module.requiredPermissions],
}));

const mockSettingsStats: SettingsStats = {
  totalUsers: 15,
  activeUsers: 12,
  enabledModules: 6,
  disabledModules: 2,
  pendingApprovals: 5,
  systemHealth: 'healthy',
};

const mockLeadModuleSettings = LEAD_MODULE_DEFAULTS;
const mockCustomerModuleSettings = CUSTOMER_MODULE_DEFAULTS;
const mockProjectModuleSettings = PROJECT_MODULE_DEFAULTS;
const mockItemModuleSettings = ITEM_MODULE_DEFAULTS;
const mockInventoryModuleSettings = INVENTORY_MODULE_DEFAULTS;
const mockDocumentModuleSettings = DOCUMENT_MODULE_DEFAULTS;
const mockFinanceModuleSettings = FINANCE_MODULE_DEFAULTS;
const mockAccountingModuleSettings = ACCOUNTING_MODULE_DEFAULTS;

// ─── API Functions with Fallback ───────────────────────────────────────────────

export const settingsApi = {
  // Company
  async getCompany(): Promise<Company> {
    try {
      // const response = await api.get('/settings/company');
      // return response.data;
      return mockCompany;
    } catch (error) {
      return mockCompany;
    }
  },

  async updateCompany(data: Partial<Company>): Promise<Company> {
    try {
      // const response = await api.put('/settings/company', data);
      // return response.data;
      return { ...mockCompany, ...data };
    } catch (error) {
      return { ...mockCompany, ...data };
    }
  },

  // Branches
  async getBranches(): Promise<Branch[]> {
    try {
      // const response = await api.get('/settings/branches');
      // return response.data;
      return mockBranches;
    } catch (error) {
      return mockBranches;
    }
  },

  async createBranch(data: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>): Promise<Branch> {
    try {
      // const response = await api.post('/settings/branches', data);
      // return response.data;
      return { ...data, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() };
    } catch (error) {
      return { ...data, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() };
    }
  },

  async updateBranch(id: string, data: Partial<Branch>): Promise<Branch> {
    try {
      // const response = await api.put(`/settings/branches/${id}`, data);
      // return response.data;
      return { ...mockBranches[0], ...data, id, updatedAt: new Date() };
    } catch (error) {
      return { ...mockBranches[0], ...data, id, updatedAt: new Date() };
    }
  },

  async deleteBranch(id: string): Promise<void> {
    try {
      // await api.delete(`/settings/branches/${id}`);
    } catch (error) {
      // Mock delete
    }
  },

  // Users (backend: /users)
  async getUsers(): Promise<User[]> {
    try {
      const response = await api.get<{ data: { rows?: User[] } | User[] }>('/users');
      const payload = response.data;
      if (Array.isArray(payload)) return payload;
      if (payload && Array.isArray((payload as { rows?: User[] }).rows)) {
        return (payload as { rows: User[] }).rows;
      }
      return mockUsers;
    } catch {
      return mockUsers;
    }
  },

  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'loginHistory'>): Promise<User> {
    try {
      const response = await api.post<{ data: User }>('/users', data);
      return response.data;
    } catch {
      return { ...data, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date(), loginHistory: [] };
    }
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    try {
      const response = await api.patch<{ data: User }>(`/users/${id}`, data);
      return response.data;
    } catch {
      return { ...mockUsers[0], ...data, id, updatedAt: new Date() };
    }
  },

  async deleteUser(id: string): Promise<void> {
    try {
      await api.delete(`/users/${id}`);
    } catch {
      // keep mock behavior on failure
    }
  },

  // Roles (backend: /roles)
  async getRoles(): Promise<Role[]> {
    try {
      const response = await api.get<{ data: Role[] }>('/roles');
      return response.data ?? [];
    } catch {
      return [];
    }
  },

  async createRole(data: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    try {
      const response = await api.post<{ data: Role }>('/roles', data);
      return response.data;
    } catch {
      return { ...data, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() };
    }
  },

  async updateRole(id: string, data: Partial<Role>): Promise<Role> {
    try {
      const response = await api.patch<{ data: Role }>(`/roles/${id}`, data);
      return response.data;
    } catch {
      return { id, ...data, updatedAt: new Date() } as Role;
    }
  },

  async deleteRole(id: string): Promise<void> {
    try {
      await api.delete(`/roles/${id}`);
    } catch {
      // keep mock behavior on failure
    }
  },

  // Modules
  async getModules(): Promise<Module[]> {
    try {
      // const response = await api.get('/settings/modules');
      // return response.data;
      return moduleStore;
    } catch (error) {
      return moduleStore;
    }
  },

  async updateModule(id: string, data: Partial<Module>): Promise<Module> {
    try {
      // const response = await api.put(`/settings/modules/${id}`, data);
      // return response.data;
      moduleStore = moduleStore.map((module) =>
        module.id === id ? { ...module, ...data, id, updatedAt: new Date() } : module
      );
      const updated = moduleStore.find((module) => module.id === id);
      if (!updated) {
        throw new Error(`Module not found: ${id}`);
      }
      return updated;
    } catch (error) {
      moduleStore = moduleStore.map((module) =>
        module.id === id ? { ...module, ...data, id, updatedAt: new Date() } : module
      );
      const updated = moduleStore.find((module) => module.id === id);
      return (updated ?? { id, ...data, updatedAt: new Date() }) as Module;
    }
  },

  // System Preferences
  async getSystemPreferences(): Promise<SystemPreferences> {
    try {
      // const response = await api.get('/settings/preferences');
      // return response.data;
      return {
        timezone: 'Asia/Kolkata',
        language: 'en',
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12-hour',
        fileUploadLimit: 10,
        allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png'],
        defaultTheme: 'light',
      };
    } catch (error) {
      return {
        timezone: 'Asia/Kolkata',
        language: 'en',
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12-hour',
        fileUploadLimit: 10,
        allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png'],
        defaultTheme: 'light',
      };
    }
  },

  async updateSystemPreferences(data: Partial<SystemPreferences>): Promise<SystemPreferences> {
    try {
      // const response = await api.put('/settings/preferences', data);
      // return response.data;
      return {
        timezone: 'Asia/Kolkata',
        language: 'en',
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12-hour',
        fileUploadLimit: 10,
        allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png'],
        defaultTheme: 'light',
        ...data,
      };
    } catch (error) {
      return {
        timezone: 'Asia/Kolkata',
        language: 'en',
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12-hour',
        fileUploadLimit: 10,
        allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png'],
        defaultTheme: 'light',
        ...data,
      };
    }
  },

  // Module Configuration
  async getModuleConfiguration(moduleId: string): Promise<ModuleConfiguration> {
    try {
      // const response = await api.get(`/settings/modules/${moduleId}/config`);
      // return response.data;
      if (moduleId === 'leads') {
        return { id: 'leads', name: 'Leads', settings: mockLeadModuleSettings };
      }
      if (moduleId === 'customers') {
        return { id: 'customers', name: 'Customers', settings: mockCustomerModuleSettings };
      }
      if (moduleId === 'projects') {
        return { id: 'projects', name: 'Projects', settings: mockProjectModuleSettings };
      }
      if (moduleId === 'items') {
        return { id: 'items', name: 'Items', settings: mockItemModuleSettings };
      }
      if (moduleId === 'inventory') {
        return { id: 'inventory', name: 'Inventory', settings: mockInventoryModuleSettings };
      }
      if (moduleId === 'documents') {
        return { id: 'documents', name: 'Documents', settings: mockDocumentModuleSettings };
      }
      if (moduleId === 'finance') {
        return { id: 'finance', name: 'Finance', settings: mockFinanceModuleSettings };
      }
      if (moduleId === 'accounting') {
        return { id: 'accounting', name: 'Accounting', settings: mockAccountingModuleSettings };
      }
      return { id: moduleId, name: '', settings: {} };
    } catch (error) {
      if (moduleId === 'leads') {
        return { id: 'leads', name: 'Leads', settings: mockLeadModuleSettings };
      }
      if (moduleId === 'customers') {
        return { id: 'customers', name: 'Customers', settings: mockCustomerModuleSettings };
      }
      if (moduleId === 'projects') {
        return { id: 'projects', name: 'Projects', settings: mockProjectModuleSettings };
      }
      if (moduleId === 'items') {
        return { id: 'items', name: 'Items', settings: mockItemModuleSettings };
      }
      if (moduleId === 'inventory') {
        return { id: 'inventory', name: 'Inventory', settings: mockInventoryModuleSettings };
      }
      if (moduleId === 'documents') {
        return { id: 'documents', name: 'Documents', settings: mockDocumentModuleSettings };
      }
      if (moduleId === 'finance') {
        return { id: 'finance', name: 'Finance', settings: mockFinanceModuleSettings };
      }
      if (moduleId === 'accounting') {
        return { id: 'accounting', name: 'Accounting', settings: mockAccountingModuleSettings };
      }
      return { id: moduleId, name: '', settings: {} };
    }
  },

  // Stats
  async getSettingsStats(): Promise<SettingsStats> {
    try {
      // const response = await api.get('/settings/stats');
      // return response.data;
      return mockSettingsStats;
    } catch (error) {
      return mockSettingsStats;
    }
  },

  // Document Settings
  async getDocumentSettings(): Promise<any> {
    try {
      // const response = await api.get('/settings/document-settings');
      // return response.data;
      return {
        estimateNumbering: {
          prefix: 'EST',
          suffix: '',
          startNumber: 1,
          financialYear: '2026-2027',
          format: '{PREFIX}-{FY}-{NUMBER}',
        },
        proposalNumbering: {
          prefix: 'PRO',
          suffix: '',
          startNumber: 1,
          financialYear: '2026-2027',
          format: '{PREFIX}-{FY}-{NUMBER}',
        },
        quotationNumbering: {
          prefix: 'QUO',
          suffix: '',
          startNumber: 1,
          financialYear: '2026-2027',
          format: '{PREFIX}-{FY}-{NUMBER}',
        },
        defaultTerms: 'Payment terms: 50% advance, 50% before delivery.',
        defaultConditions: 'Valid for 30 days from date of quotation.',
        bankDetails: {
          bankName: 'State Bank of India',
          accountNumber: '1234567890',
          accountType: 'Current Account',
          ifscCode: 'SBIN0001234',
          branchName: 'Mumbai Main Branch',
        },
        gstDetails: {
          gstin: '27AAPFU0939J1ZP',
          gstType: 'CGST',
          cgstRate: 9,
          sgstRate: 9,
          igstRate: 18,
          cessRate: 0,
        },
      };
    } catch (error) {
      return {
        estimateNumbering: {
          prefix: 'EST',
          suffix: '',
          startNumber: 1,
          financialYear: '2026-2027',
          format: '{PREFIX}-{FY}-{NUMBER}',
        },
        proposalNumbering: {
          prefix: 'PRO',
          suffix: '',
          startNumber: 1,
          financialYear: '2026-2027',
          format: '{PREFIX}-{FY}-{NUMBER}',
        },
        quotationNumbering: {
          prefix: 'QUO',
          suffix: '',
          startNumber: 1,
          financialYear: '2026-2027',
          format: '{PREFIX}-{FY}-{NUMBER}',
        },
        defaultTerms: 'Payment terms: 50% advance, 50% before delivery.',
        defaultConditions: 'Valid for 30 days from date of quotation.',
        bankDetails: {
          bankName: 'State Bank of India',
          accountNumber: '1234567890',
          accountType: 'Current Account',
          ifscCode: 'SBIN0001234',
          branchName: 'Mumbai Main Branch',
        },
        gstDetails: {
          gstin: '27AAPFU0939J1ZP',
          gstType: 'CGST',
          cgstRate: 9,
          sgstRate: 9,
          igstRate: 18,
          cessRate: 0,
        },
      };
    }
  },

  async updateDocumentSettings(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      // const response = await api.put('/settings/document-settings', data);
      // return response.data;
      return data;
    } catch (error) {
      return data;
    }
  },

  // Finance Configuration
  async getFinanceConfiguration(): Promise<any> {
    try {
      // const response = await api.get('/settings/finance-config');
      // return response.data;
      return {
        currency: 'INR',
        taxRate: 18,
        paymentTerms: 'Net 30',
        invoicePrefix: 'INV',
        receiptPrefix: 'REC',
        expensePrefix: 'EXP',
        ...mockFinanceModuleSettings,
      };
    } catch (error) {
      return {
        currency: 'INR',
        taxRate: 18,
        paymentTerms: 'Net 30',
        invoicePrefix: 'INV',
        receiptPrefix: 'REC',
        expensePrefix: 'EXP',
        ...mockFinanceModuleSettings,
      };
    }
  },

  async updateFinanceConfiguration(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      // const response = await api.put('/settings/finance-config', data);
      // return response.data;
      return data;
    } catch (error) {
      return data;
    }
  },

  // Project Configuration
  async getProjectConfiguration(): Promise<any> {
    try {
      // const response = await api.get('/settings/project-config');
      // return response.data;
      return {
        defaultProjectType: 'Industrial Shed',
        defaultPriority: 'Medium',
        autoAssignProjectManager: true,
        autoGenerateMilestones: true,
        milestoneTemplate: 'Standard',
      };
    } catch (error) {
      return {
        defaultProjectType: 'Industrial Shed',
        defaultPriority: 'Medium',
        autoAssignProjectManager: true,
        autoGenerateMilestones: true,
        milestoneTemplate: 'Standard',
      };
    }
  },

  async updateProjectConfiguration(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      // const response = await api.put('/settings/project-config', data);
      // return response.data;
      return data;
    } catch (error) {
      return data;
    }
  },

  // Security Settings
  async getSecuritySettings(): Promise<SecuritySettings> {
    try {
      // const response = await api.get('/settings/security-config');
      // return response.data;
      return {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          expiryDays: 90,
        },
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        lockoutDuration: 30,
        ipRestrictions: [],
        twoFactorEnabled: false,
      };
    } catch (error) {
      return {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          expiryDays: 90,
        },
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        lockoutDuration: 30,
        ipRestrictions: [],
        twoFactorEnabled: false,
      };
    }
  },

  async updateSecuritySettings(data: Partial<SecuritySettings>): Promise<SecuritySettings> {
    try {
      // const response = await api.put('/settings/security-config', data);
      // return response.data;
      return {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          expiryDays: 90,
        },
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        lockoutDuration: 30,
        ipRestrictions: [],
        twoFactorEnabled: false,
        ...data,
      };
    } catch (error) {
      return {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          expiryDays: 90,
        },
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        lockoutDuration: 30,
        ipRestrictions: [],
        twoFactorEnabled: false,
        ...data,
      };
    }
  },
};
