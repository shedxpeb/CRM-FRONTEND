/**
 * Customers API Service
 * All API calls for customers module — uses centralized api client (see leadsApi pattern).
 */
import { api } from '@/core/api';
import { Customer, CustomerActivity, CustomerFilters, ConvertLeadToCustomerDto } from '@/features/customers/types';
import { PaginationParams } from '@/shared/types/pagination';

export interface BackendResponse<T> {
  message: string;
  data: T;
}

export interface CustomersData {
  rows: Customer[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export const customersApi = {
  getAll: (params?: PaginationParams & CustomerFilters) =>
    api.get<BackendResponse<CustomersData>>('/customer', { params }),

  /** Lightweight dropdown rows (capped server-side ≤100) */
  getCombobox: (params?: { page?: number; pageSize?: number; search?: string }) =>
    api.get<BackendResponse<{ rows: Array<Pick<Customer, 'id' | 'customerName' | 'companyName' | 'mobile'>>; pagination: CustomersData['pagination'] }>>(
      '/customer/combobox',
      { params },
    ),

  getById: (id: string) =>
    api.get<BackendResponse<Customer>>(`/customer/${id}`),

  create: (data: unknown) =>
    api.post<BackendResponse<Customer>>('/customer', data),

  update: (id: string, data: unknown) =>
    api.patch<BackendResponse<Customer>>(`/customer/${id}`, data),

  delete: (id: string) =>
    api.delete<BackendResponse<{ count: number }>>(`/customer/${id}`),

  bulkUpdate: (ids: string[], data: { status?: string }) =>
    api.patch<BackendResponse<{ count: number }>>('/customer/bulk/status', {
      ids,
      status: data.status,
    }),

  bulkDelete: (ids: string[]) =>
    api.delete<BackendResponse<{ count: number }>>('/customer/bulk', { data: { ids } }),

  export: (params?: CustomerFilters) =>
    api.get<BackendResponse<CustomersData>>('/customer/export', { params }),

  getStats: () =>
    api.get<BackendResponse<Record<string, number>>>('/customer/stats'),

  getActivities: (id: string) =>
    api.get<BackendResponse<CustomerActivity[]>>(`/customer/${id}/activities`),

  checkDuplicate: (mobile: string, email?: string) =>
    api.get<BackendResponse<{ exists: boolean; isDuplicate?: boolean; customer?: Customer; existingCustomer?: Customer }>>('/customer/check-duplicate', {
      params: { mobile, email },
    }),

  restore: (id: string) =>
    api.post<BackendResponse<Customer>>(`/customer/${id}/restore`, {}),

  convertLeadToCustomer: (data: ConvertLeadToCustomerDto) =>
    api.post<BackendResponse<{ customer: Customer; lead: unknown; summary?: unknown }>>('/customer/convert-lead', data),
};
