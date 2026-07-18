/**
 * Vendor API — real backend calls via NestJS
 */
import { api } from '@/core/api';
import {
  Vendor,
  CreateVendorDto,
  UpdateVendorDto,
  VendorQuery,
  VendorStats,
  PaginatedVendorData,
} from '../types/vendor.types';

interface BackendResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

function buildParams(query?: VendorQuery): Record<string, any> {
  const params: Record<string, any> = {};
  if (query?.page) params.page = query.page;
  if (query?.pageSize) params.limit = query.pageSize;
  if (query?.sortBy) params.sortBy = query.sortBy;
  if (query?.sortOrder) params.sortOrder = query.sortOrder;
  if (query?.filter?.search) params.search = query.filter.search;
  if (query?.filter?.status) params.status = query.filter.status;
  return params;
}

export const vendorApi = {
  async getAll(query?: VendorQuery): Promise<PaginatedVendorData> {
    try {
      const params = buildParams(query);
      const res = await api.get<BackendResponse<PaginatedVendorData>>('/vendor', { params });
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch vendors');
    }
  },

  async getById(id: string): Promise<Vendor> {
    try {
      const res = await api.get<BackendResponse<Vendor>>(`/vendor/${id}`);
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch vendor');
    }
  },

  async create(data: CreateVendorDto): Promise<Vendor> {
    try {
      const res = await api.post<BackendResponse<Vendor>>('/vendor', data);
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create vendor');
    }
  },

  async update(id: string, data: UpdateVendorDto): Promise<Vendor> {
    try {
      const res = await api.patch<BackendResponse<Vendor>>(`/vendor/${id}`, data);
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update vendor');
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/vendor/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete vendor');
    }
  },

  async getStats(): Promise<VendorStats> {
    try {
      const res = await api.get<BackendResponse<VendorStats>>('/vendor/stats');
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch vendor stats');
    }
  },

  async getCombobox(search?: string): Promise<Vendor[]> {
    try {
      const params = search ? { search } : {};
      const res = await api.get<BackendResponse<Vendor[]>>('/vendor/combobox', { params });
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch vendors');
    }
  },

  async bulkStatusUpdate(ids: string[], status: string): Promise<{ count: number }> {
    try {
      const res = await api.patch<BackendResponse<{ count: number }>>('/vendor/bulk/status', { ids, status });
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update vendor status');
    }
  },

  async bulkDelete(ids: string[]): Promise<{ count: number }> {
    try {
      const res = await api.delete<BackendResponse<{ count: number }>>('/vendor/bulk', { data: { ids } });
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete vendors');
    }
  },
};
