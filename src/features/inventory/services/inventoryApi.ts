/**
 * Inventory API Service
 * All API calls for inventory module - never use axios directly
 *
 * Mock fallback: When backend is unavailable, returns mock data.
 * Remove mock fallbacks once backend is connected.
 */
import { api } from '@/core/api';
import { guardModuleApi } from '@/core/api/capabilities';
import {
  InventoryItem, Warehouse, Supplier, Category, StockMovement,
  InventoryActivity, InventoryAlert, InventoryStats, InventoryFilters,
  CreateInventoryItemDto, CreateStockMovementDto,
} from '@/features/inventory/types';
import { PaginatedData, PaginationParams } from '@/shared/types/pagination';
import {
  MOCK_WAREHOUSES,
  MOCK_SUPPLIERS,
  MOCK_CATEGORIES,
  MOCK_ITEMS,
  MOCK_MOVEMENTS,
  MOCK_ACTIVITIES,
  MOCK_ALERTS,
} from '../data/mockInventoryData';

/** Check if error is a connection failure — mocks are NEVER used in production */
function isConnectionError(error: unknown): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  if (process.env.NEXT_PUBLIC_ALLOW_MOCK_FALLBACK !== 'true') return false;
  if (error && typeof error === 'object') {
    const err = error as any;
    if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED' || err.code === 'ERR_CONNECTION_REFUSED') return true;
    if (!err.response && err.message && err.message.toLowerCase().includes('network')) return true;
  }
  return false;
}

// ─── API Service ──────────────────────────────────────────────────────────────

export const inventoryApi = guardModuleApi('inventory', {
  // ─── Items ───────────────────────────────────────────────────────────────

  getAll: async (params?: PaginationParams & InventoryFilters): Promise<PaginatedData<InventoryItem>> => {
    try {
      return await api.get<PaginatedData<InventoryItem>>('/inventory', { params });
    } catch (error) {
      if (isConnectionError(error)) {
        const page = params?.page ?? 1;
        const pageSize = params?.pageSize ?? 20;
        return {
          data: MOCK_ITEMS.slice((page - 1) * pageSize, page * pageSize),
          meta: { page, pageSize, total: MOCK_ITEMS.length, totalPages: Math.ceil(MOCK_ITEMS.length / pageSize), hasNext: false, hasPrevious: false },
        };
      }
      throw error;
    }
  },

  getById: async (id: string): Promise<InventoryItem> => {
    try {
      return await api.get<InventoryItem>(`/inventory/${id}`);
    } catch (error) {
      if (isConnectionError(error)) {
        const item = MOCK_ITEMS.find((i) => i.id === id);
        if (item) return item;
        throw new Error(`Inventory item not found: ${id}`);
      }
      throw error;
    }
  },

  create: async (data: CreateInventoryItemDto): Promise<InventoryItem> => {
    try {
      return await api.post<InventoryItem>('/inventory', data);
    } catch (error) {
      if (isConnectionError(error)) {
        const wh = MOCK_WAREHOUSES.find((w) => w.id === data.warehouseId);
        const currentStock = data.currentStock ?? 0;
        const reservedStock = data.reservedStock ?? 0;
        const issuedStock = data.issuedStock ?? 0;
        const newItem: InventoryItem = {
          id: String(MOCK_ITEMS.length + 1),
          itemCode: data.itemCode,
          itemMasterId: data.itemMasterId,
          itemName: data.itemName,
          unit: data.unit,
          currentStock,
          reservedStock,
          issuedStock,
          availableStock: currentStock - reservedStock - issuedStock,
          totalValue: currentStock * (data.purchaseRate ?? 0),
          minimumStock: data.minimumStock ?? 0,
          reorderLevel: data.reorderLevel ?? 0,
          reorderQuantity: data.reorderQuantity,
          safetyStock: data.safetyStock ?? 0,
          warehouseId: data.warehouseId,
          warehouseName: wh?.name ?? '',
          binLocation: data.binLocation,
          incomingStock: data.incomingStock,
          outgoingStock: data.outgoingStock,
          purchaseRate: data.purchaseRate,
          status: data.status ?? 'In Stock',
          customFields: data.customFields,
          lastUpdated: new Date(),
          createdAt: new Date(),
        };
        MOCK_ITEMS.push(newItem);
        return newItem;
      }
      throw error;
    }
  },

  update: async (id: string, data: Partial<CreateInventoryItemDto>): Promise<InventoryItem> => {
    try {
      return await api.patch<InventoryItem>(`/inventory/${id}`, data);
    } catch (error) {
      if (isConnectionError(error)) {
        const index = MOCK_ITEMS.findIndex((i) => i.id === id);
        if (index === -1) throw new Error(`Inventory item not found: ${id}`);
        const wh = data.warehouseId
          ? MOCK_WAREHOUSES.find((w) => w.id === data.warehouseId)
          : undefined;
        const current = { ...MOCK_ITEMS[index], ...data };
        if (wh) current.warehouseName = wh.name;
        if (data.currentStock !== undefined || data.reservedStock !== undefined || data.issuedStock !== undefined) {
          current.availableStock = current.currentStock - current.reservedStock - current.issuedStock;
        }
        if (data.currentStock !== undefined || data.purchaseRate !== undefined) {
          current.totalValue = current.currentStock * (current.purchaseRate ?? 0);
        }
        current.lastUpdated = new Date();
        current.updatedAt = new Date();
        MOCK_ITEMS[index] = current;
        return current;
      }
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/inventory/${id}`);
    } catch (error) {
      if (isConnectionError(error)) {
        const index = MOCK_ITEMS.findIndex((i) => i.id === id);
        if (index === -1) throw new Error(`Inventory item not found: ${id}`);
        MOCK_ITEMS.splice(index, 1);
        return;
      }
      throw error;
    }
  },

  getStats: async (): Promise<InventoryStats> => {
    try {
      return await api.get<InventoryStats>('/inventory/stats');
    } catch (error) {
      if (isConnectionError(error)) {
        return {
          totalItems: MOCK_ITEMS.length,
          totalValue: MOCK_ITEMS.reduce((s, i) => s + i.totalValue, 0),
          lowStockItems: MOCK_ITEMS.filter((i) => i.status === 'Low Stock').length,
          outOfStockItems: MOCK_ITEMS.filter((i) => i.status === 'Out of Stock').length,
          incomingStock: 3,
          outgoingStock: 5,
          reservedStock: MOCK_ITEMS.reduce((s, i) => s + i.reservedStock, 0),
          activeSuppliers: MOCK_SUPPLIERS.filter((s) => s.status === 'Active').length,
          pendingPurchaseRequests: 4,
          materialShortages: MOCK_ALERTS.filter((a) => a.severity === 'critical').length,
        };
      }
      throw error;
    }
  },

  getActivities: async (id: string): Promise<InventoryActivity[]> => {
    try {
      return await api.get<InventoryActivity[]>(`/inventory/${id}/activities`);
    } catch (error) {
      if (isConnectionError(error)) return MOCK_ACTIVITIES.filter((a) => a.itemId === id);
      throw error;
    }
  },

  // ─── Warehouses ──────────────────────────────────────────────────────────

  getWarehouses: async (): Promise<Warehouse[]> => {
    try {
      return await api.get<Warehouse[]>('/inventory/warehouses');
    } catch (error) {
      if (isConnectionError(error)) return MOCK_WAREHOUSES;
      throw error;
    }
  },

  createWarehouse: (data: Omit<Warehouse, 'id'>) => api.post<Warehouse>('/inventory/warehouses', data),
  updateWarehouse: (id: string, data: Partial<Warehouse>) => api.patch<Warehouse>(`/inventory/warehouses/${id}`, data),

  // ─── Suppliers ───────────────────────────────────────────────────────────

  getSuppliers: async (): Promise<Supplier[]> => {
    try {
      return await api.get<Supplier[]>('/inventory/suppliers');
    } catch (error) {
      if (isConnectionError(error)) return MOCK_SUPPLIERS;
      throw error;
    }
  },

  createSupplier: (data: any) => api.post<Supplier>('/inventory/suppliers', data),
  updateSupplier: (id: string, data: any) => api.patch<Supplier>(`/inventory/suppliers/${id}`, data),

  // ─── Categories ──────────────────────────────────────────────────────────

  getCategories: async (): Promise<Category[]> => {
    try {
      return await api.get<Category[]>('/inventory/categories');
    } catch (error) {
      if (isConnectionError(error)) return MOCK_CATEGORIES;
      throw error;
    }
  },

  createCategory: (data: any) => api.post<Category>('/inventory/categories', data),

  // ─── Stock Movements ─────────────────────────────────────────────────────

  getMovements: async (params?: PaginationParams): Promise<PaginatedData<StockMovement>> => {
    try {
      return await api.get<PaginatedData<StockMovement>>('/inventory/movements', { params });
    } catch (error) {
      if (isConnectionError(error)) {
        const page = params?.page ?? 1;
        const pageSize = params?.pageSize ?? 20;
        return {
          data: MOCK_MOVEMENTS.slice((page - 1) * pageSize, page * pageSize),
          meta: { page, pageSize, total: MOCK_MOVEMENTS.length, totalPages: Math.ceil(MOCK_MOVEMENTS.length / pageSize), hasNext: false, hasPrevious: false },
        };
      }
      throw error;
    }
  },

  createMovement: (data: Omit<StockMovement, 'id'>) => api.post<StockMovement>('/inventory/movements', data),

  getMovementHistory: async (itemId: string): Promise<StockMovement[]> => {
    try {
      return await api.get<StockMovement[]>(`/inventory/${itemId}/movements`);
    } catch (error) {
      if (isConnectionError(error)) return MOCK_MOVEMENTS.filter((m) => m.itemId === itemId);
      throw error;
    }
  },

  // ─── Alerts ──────────────────────────────────────────────────────────────

  getAlerts: async (): Promise<InventoryAlert[]> => {
    try {
      return await api.get<InventoryAlert[]>('/inventory/alerts');
    } catch (error) {
      if (isConnectionError(error)) return MOCK_ALERTS;
      throw error;
    }
  },
});
