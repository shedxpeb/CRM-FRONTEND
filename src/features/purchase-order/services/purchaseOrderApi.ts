/**
 * Purchase Order API — real backend calls via NestJS
 */
import { api } from '@/core/api';
import {
  PurchaseOrder,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  PurchaseOrderQuery,
  PurchaseOrderStats,
  PaginatedPurchaseOrderData,
} from '../types/purchase-order.types';

interface BackendResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

function buildParams(query?: PurchaseOrderQuery): Record<string, any> {
  const params: Record<string, any> = {};
  if (query?.page) params.page = query.page;
  if (query?.pageSize) params.limit = query.pageSize;
  if (query?.sortBy) params.sortBy = query.sortBy;
  if (query?.sortOrder) params.sortOrder = query.sortOrder;
  if (query?.filter?.search) params.search = query.filter.search;
  if (query?.filter?.status) params.status = query.filter.status;
  if (query?.filter?.vendorId) params.vendorId = query.filter.vendorId;
  if (query?.filter?.projectId) params.projectId = query.filter.projectId;
  if (query?.filter?.startDate) params.startDate = query.filter.startDate;
  if (query?.filter?.endDate) params.endDate = query.filter.endDate;
  return params;
}

export const purchaseOrderApi = {
  async getAll(query?: PurchaseOrderQuery): Promise<PaginatedPurchaseOrderData> {
    try {
      const params = buildParams(query);
      const res = await api.get<BackendResponse<PaginatedPurchaseOrderData>>('/purchase-order', { params });
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch purchase orders');
    }
  },

  async getById(id: string): Promise<PurchaseOrder> {
    try {
      const res = await api.get<BackendResponse<PurchaseOrder>>(`/purchase-order/${id}`);
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch purchase order');
    }
  },

  async create(data: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    try {
      const res = await api.post<BackendResponse<PurchaseOrder>>('/purchase-order', data);
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create purchase order');
    }
  },

  async update(id: string, data: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    try {
      const res = await api.patch<BackendResponse<PurchaseOrder>>(`/purchase-order/${id}`, data);
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update purchase order');
    }
  },

  async approve(id: string): Promise<PurchaseOrder> {
    try {
      const res = await api.patch<BackendResponse<PurchaseOrder>>(`/purchase-order/${id}/approve`);
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to approve purchase order');
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/purchase-order/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete purchase order');
    }
  },

  async getStats(): Promise<PurchaseOrderStats> {
    try {
      const res = await api.get<BackendResponse<PurchaseOrderStats>>('/purchase-order/stats');
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch purchase order stats');
    }
  },

  async bulkStatusUpdate(ids: string[], status: string): Promise<{ count: number }> {
    try {
      const res = await api.patch<BackendResponse<{ count: number }>>('/purchase-order/bulk/status', { ids, status });
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update purchase order status');
    }
  },

  async bulkDelete(ids: string[]): Promise<{ count: number }> {
    try {
      const res = await api.delete<BackendResponse<{ count: number }>>('/purchase-order/bulk', { data: { ids } });
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete purchase orders');
    }
  },
};
