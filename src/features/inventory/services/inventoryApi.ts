/**
 * Inventory API — real backend calls via NestJS
 */
import { api } from '@/core/api';
import {
  InventoryItem,
  Warehouse,
  Supplier,
  Category,
  StockMovement,
  InventoryActivity,
  InventoryAlert,
  InventoryStats,
  InventoryFilters,
  CreateInventoryItemDto,
  CreateStockMovementDto,
  CreateWarehouseDto,
  CreateSupplierDto,
  CreateCategoryDto,
} from '@/features/inventory/types';
import { PaginatedData, PaginationParams } from '@/shared/types/pagination';

interface BackendResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface BackendPaginatedData<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

function buildParams(params?: PaginationParams & InventoryFilters): Record<string, any> {
  const p: Record<string, any> = {};
  if (params?.page) p.page = params.page;
  if (params?.pageSize) p.pageSize = params.pageSize;
  if (params?.search) p.search = params.search;
  if (params?.sortBy) p.sortBy = params.sortBy;
  if (params?.sortOrder) p.sortOrder = params.sortOrder;
  if (params?.warehouse) p.warehouseId = params.warehouse;
  if (params?.stockStatus) p.status = params.stockStatus;
  if (params?.category) p.category = params.category;
  if (params?.brand) p.brand = params.brand;
  if (params?.itemTypeClass) p.itemTypeClass = params.itemTypeClass;
  if (params?.lowStock) p.lowStock = 'true';
  return p;
}

export const inventoryApi = {
  getAll: async (params?: PaginationParams & InventoryFilters): Promise<PaginatedData<InventoryItem>> => {
    const p = buildParams(params);
    const res = await api.get<BackendResponse<BackendPaginatedData<InventoryItem>>>('/inventory', { params: p });
    return {
      data: res.data.data,
      meta: res.data.meta,
    };
  },

  getById: async (id: string): Promise<InventoryItem> => {
    const res = await api.get<BackendResponse<InventoryItem>>(`/inventory/${id}`);
    return res.data;
  },

  create: async (data: CreateInventoryItemDto): Promise<InventoryItem> => {
    const res = await api.post<BackendResponse<InventoryItem>>('/inventory', data);
    return res.data;
  },

  update: async (id: string, data: Partial<CreateInventoryItemDto>): Promise<InventoryItem> => {
    const res = await api.patch<BackendResponse<InventoryItem>>(`/inventory/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/inventory/${id}`);
  },

  getStats: async (): Promise<InventoryStats> => {
    const res = await api.get<BackendResponse<InventoryStats>>('/inventory/stats');
    return res.data;
  },

  getActivities: async (_id: string): Promise<InventoryActivity[]> => {
    return [];
  },

  getWarehouses: async (): Promise<Warehouse[]> => {
    const res = await api.get<BackendResponse<Warehouse[]>>('/inventory/warehouses');
    return res.data;
  },

  createWarehouse: async (data: CreateWarehouseDto): Promise<Warehouse> => {
    const res = await api.post<BackendResponse<Warehouse>>('/inventory/warehouses', data);
    return res.data;
  },

  updateWarehouse: async (id: string, data: Partial<Warehouse>): Promise<Warehouse> => {
    const res = await api.patch<BackendResponse<Warehouse>>(`/inventory/warehouses/${id}`, data);
    return res.data;
  },

  getSuppliers: async (): Promise<Supplier[]> => {
    const res = await api.get<BackendResponse<Supplier[]>>('/inventory/suppliers');
    return res.data;
  },

  createSupplier: async (data: CreateSupplierDto): Promise<Supplier> => {
    const res = await api.post<BackendResponse<Supplier>>('/inventory/suppliers', data);
    return res.data;
  },

  updateSupplier: async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
    const res = await api.patch<BackendResponse<Supplier>>(`/inventory/suppliers/${id}`, data);
    return res.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const res = await api.get<BackendResponse<Category[]>>('/inventory/categories');
    return res.data;
  },

  createCategory: async (data: CreateCategoryDto): Promise<Category> => {
    const res = await api.post<BackendResponse<Category>>('/inventory/categories', data);
    return res.data;
  },

  getMovements: async (params?: PaginationParams): Promise<PaginatedData<StockMovement>> => {
    const p: Record<string, any> = {};
    if (params?.page) p.page = params.page;
    if (params?.pageSize) p.pageSize = params.pageSize;
    const res = await api.get<BackendResponse<BackendPaginatedData<StockMovement>>>('/inventory/movements', { params: p });
    return {
      data: res.data.data,
      meta: res.data.meta,
    };
  },

  createMovement: async (data: Omit<StockMovement, 'id'> | CreateStockMovementDto): Promise<StockMovement> => {
    const res = await api.post<BackendResponse<StockMovement>>('/inventory/movements', data);
    return res.data;
  },

  getMovementHistory: async (itemId: string): Promise<StockMovement[]> => {
    const res = await api.get<BackendResponse<StockMovement[]>>(`/inventory/${itemId}/movements`);
    return res.data;
  },

  getAlerts: async (): Promise<InventoryAlert[]> => {
    const res = await api.get<BackendResponse<InventoryAlert[]>>('/inventory/alerts');
    return res.data;
  },
};
