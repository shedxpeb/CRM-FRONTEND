/**
 * Leads API Service
 * All API calls for leads module
 */
import { api, apiClient } from '@/core/api';
import { Lead } from '@/types/leads';

export interface LeadsFilters {
  search?: string;
  status?: string;
  statusMode?: string;
  priority?: string;
  source?: string;
  projectType?: string;
  structureType?: string;
  city?: string;
  assignedEmployeeId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BackendResponse<T> {
  success: boolean;
  requestId: string;
  timestamp: string;
  message: string;
  data: T;
}

export interface LeadsData {
  rows: Lead[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  summary: {
    total: number;
    new: number;
    contacted: number;
    converted: number;
    inProgress?: number;
  };
  filters: Record<string, any>;
}

export const leadsApi = {
  getAll: async (params?: PaginationParams & LeadsFilters) => {
    return api.get<BackendResponse<LeadsData>>('/lead', { params });
  },

  getById: (id: string) =>
    api.get<BackendResponse<Lead>>(`/lead/${id}`),

  create: (data: Partial<Lead>) =>
    api.post<BackendResponse<Lead>>('/lead', data),

  update: (id: string, data: Partial<Lead>) =>
    api.patch<BackendResponse<Lead>>(`/lead/${id}`, data),

  delete: (id: string) => {
    return api.delete<BackendResponse<void>>(`/lead/${id}`);
  },

  getKanban: async (params?: Partial<LeadsFilters>) => {
    return api.get<BackendResponse<{ columns: Array<{ status: string; count: number; cards: Lead[] }> }>>('/lead/kanban', { params });
  },

  getCalendar: async (params?: Partial<LeadsFilters>) => {
    return api.get<BackendResponse<{ events: Lead[] }>>('/lead/calendar', { params });
  },

  bulkStatusUpdate: (ids: string[], status: string) =>
    api.patch<BackendResponse<{ count: number }>>('/lead/bulk/status', { ids, status }),

  bulkDelete: (ids: string[]) =>
    api.delete<BackendResponse<{ count: number }>>('/lead/bulk', { data: { ids } }),

  getLogs: (id: string) =>
    api.get<BackendResponse<Array<{ id: string; action: string; description: string; timestamp: Date; userId: string | null }>>>(`/lead/${id}/logs`),

  updateWorkflow: (id: string, stage: string, notes?: string) =>
    api.post<BackendResponse<Lead>>(`/lead/${id}/workflow`, { stage, notes }),

  importLeads: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<BackendResponse<ImportResult>>('/lead/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    }).then(res => res.data);
  },
};

export interface ImportRowError {
  rowNumber: number;
  status: 'imported' | 'skipped' | 'duplicate' | 'invalid';
  errors: string[];
  data?: Record<string, any>;
}

export interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  duplicates: number;
  invalid: number;
  rows: ImportRowError[];
}
