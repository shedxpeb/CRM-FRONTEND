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
  ReceiveItemDto,
  RejectPoDto,
} from '../types/purchase-order.types';

interface BackendResponse<T> {
  message?: string;
  data: T;
}

interface BackendPaginatedResponse {
  message?: string;
  data: {
    rows: PurchaseOrder[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  };
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

function mapBackendError(error: any): never {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    'An unexpected error occurred';
  throw new Error(Array.isArray(message) ? message.join(', ') : message);
}

export const purchaseOrderApi = {
  async getAll(query?: PurchaseOrderQuery): Promise<PaginatedPurchaseOrderData> {
    try {
      const params = buildParams(query);
      const res = await api.get<BackendPaginatedResponse>('/purchase-order', { params });
      const { rows, pagination } = res.data;
      return {
        data: rows,
        meta: {
          total: pagination.total,
          page: pagination.page,
          limit: pagination.pageSize,
          totalPages: pagination.totalPages,
        },
      };
    } catch (error: any) {
      mapBackendError(error);
    }
  },

  async getById(id: string): Promise<PurchaseOrder> {
    try {
      const res = await api.get<BackendResponse<PurchaseOrder>>(`/purchase-order/${id}`);
      return res.data;
    } catch (error: any) {
      mapBackendError(error);
    }
  },

  async create(data: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    try {
      const res = await api.post<BackendResponse<PurchaseOrder>>('/purchase-order', data);
      return res.data;
    } catch (error: any) {
      mapBackendError(error);
    }
  },

  async update(id: string, data: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    try {
      const res = await api.patch<BackendResponse<PurchaseOrder>>(`/purchase-order/${id}`, data);
      return res.data;
    } catch (error: any) {
      mapBackendError(error);
    }
  },

  async approve(id: string): Promise<PurchaseOrder> {
    try {
      const res = await api.patch<BackendResponse<PurchaseOrder>>(`/purchase-order/${id}/approve`);
      return res.data;
    } catch (error: any) {
      mapBackendError(error);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/purchase-order/${id}`);
    } catch (error: any) {
      mapBackendError(error);
    }
  },

  async getStats(): Promise<PurchaseOrderStats> {
    try {
      const res = await api.get<BackendResponse<PurchaseOrderStats>>('/purchase-order/stats');
      return res.data;
    } catch (error: any) {
      mapBackendError(error);
    }
  },

  async bulkStatusUpdate(ids: string[], status: string): Promise<{ count: number }> {
    try {
      const res = await api.patch<BackendResponse<{ count: number }>>('/purchase-order/bulk/status', { ids, status });
      return res.data;
    } catch (error: any) {
      mapBackendError(error);
    }
  },

  async bulkDelete(ids: string[]): Promise<{ count: number }> {
    try {
      const res = await api.delete<BackendResponse<{ count: number }>>('/purchase-order/bulk', { data: { ids } });
      return res.data;
    } catch (error: any) {
      mapBackendError(error);
    }
  },

  async reject(id: string, data: RejectPoDto): Promise<PurchaseOrder> {
    try {
      const res = await api.patch<BackendResponse<PurchaseOrder>>(`/purchase-order/${id}/reject`, data);
      return res.data;
    } catch (error: any) {
      mapBackendError(error);
    }
  },

  async markSent(id: string): Promise<PurchaseOrder> {
    try {
      const res = await api.patch<BackendResponse<PurchaseOrder>>(`/purchase-order/${id}/send`);
      return res.data;
    } catch (error: any) {
      mapBackendError(error);
    }
  },

  async receiveItems(id: string, items: ReceiveItemDto[]): Promise<PurchaseOrder> {
    try {
      const res = await api.patch<BackendResponse<PurchaseOrder>>(`/purchase-order/${id}/receive`, { items });
      return res.data;
    } catch (error: any) {
      mapBackendError(error);
    }
  },

  async restore(id: string): Promise<PurchaseOrder> {
    try {
      const res = await api.patch<BackendResponse<PurchaseOrder>>(`/purchase-order/${id}/restore`);
      return res.data;
    } catch (error: any) {
      mapBackendError(error);
    }
  },

  async getCombobox(search?: string): Promise<{ id: string; poNumber: string; vendorName: string; status: string; grandTotal: number; createdAt: string }[]> {
    try {
      const params = search ? { search } : {};
      const res = await api.get<BackendResponse<{ id: string; poNumber: string; vendorName: string; status: string; grandTotal: number; createdAt: string }[]>>('/purchase-order/combobox', { params });
      return res.data;
    } catch (error: any) {
      mapBackendError(error);
    }
  },

  getPdfUrl(id: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    return `${baseUrl}/purchase-order/${id}/pdf`;
  },
};
