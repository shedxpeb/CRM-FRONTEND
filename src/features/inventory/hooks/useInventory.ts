/**
 * useInventory Hooks
 * React Query hooks for inventory - never use useState/useEffect for server data
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { inventoryApi } from '@/features/inventory/services/inventoryApi';
import {
  InventoryFilters,
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  CreateWarehouseDto,
  CreateSupplierDto,
  CreateCategoryDto,
  CreateStockMovementDto,
  InventoryCustomFieldDefinition,
} from '@/features/inventory/types';
import { PaginationParams } from '@/shared/types/pagination';
import { useModuleConfiguration } from '@/features/settings/hooks/useSettings';
import { INVENTORY_MODULE_DEFAULTS } from '@/features/settings/utils/moduleConfigurationDefaults';
import { pickModuleSettings } from '@/features/settings/utils/resolveModuleSettings';

export interface InventoryModuleConfiguration {
  warehouses: string[];
  stockStatuses: string[];
  movementTypes: string[];
  units: string[];
  customFields: InventoryCustomFieldDefinition[];
}

export const DEFAULT_INVENTORY_CONFIGURATION: InventoryModuleConfiguration = INVENTORY_MODULE_DEFAULTS;

export function useInventoryConfiguration(): InventoryModuleConfiguration & { isLoading: boolean } {
  const { data, isLoading } = useModuleConfiguration('inventory');

  return useMemo(() => {
    const settings = pickModuleSettings(data?.settings, DEFAULT_INVENTORY_CONFIGURATION);
    return {
      ...settings,
      isLoading,
    };
  }, [data, isLoading]);
}

// ─── Items ──────────────────────────────────────────────────────────────────

export function useInventoryItems(params?: PaginationParams & InventoryFilters) {
  return useQuery({
    queryKey: ['inventory', params],
    queryFn: () => inventoryApi.getAll(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: ['inventory', id],
    queryFn: () => inventoryApi.getById(id),
    enabled: !!id,
    refetchOnMount: false,
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInventoryItemDto) => inventoryApi.create(data),
    onSuccess: (newItem) => {
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Set the new item in cache for immediate detail view
      queryClient.setQueryData(['inventory', newItem.id], newItem);
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInventoryItemDto }) =>
      inventoryApi.update(id, data),
    onSuccess: (updatedItem, { id }) => {
      // Invalidate list and detail queries
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', id] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Update cache with new data for immediate UI update
      queryClient.setQueryData(['inventory', id], updatedItem);
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryApi.delete(id),
    onSuccess: (_, id) => {
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'alerts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Remove deleted item from cache
      queryClient.removeQueries({ queryKey: ['inventory', id] });
    },
  });
}

export function useInventoryStats(enabled: boolean = true) {
  return useQuery({
    queryKey: ['inventory', 'stats'],
    queryFn: () => inventoryApi.getStats(),
    staleTime: 2 * 60 * 1000,
    enabled,
    refetchOnMount: false,
    retry: 0, // No retry for dashboard - fail fast
  });
}

export function useInventoryActivities(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['inventory', id, 'activities'],
    queryFn: () => inventoryApi.getActivities(id),
    enabled: !!id && enabled,
    staleTime: 3 * 60 * 1000,
  });
}

// ─── Warehouses ─────────────────────────────────────────────────────────────

export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: () => inventoryApi.getWarehouses(),
    staleTime: 10 * 60 * 1000,
    refetchOnMount: false,
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWarehouseDto) => inventoryApi.createWarehouse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      // Invalidate inventory list since warehouse filter options may change
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

// ─── Suppliers ──────────────────────────────────────────────────────────────

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: () => inventoryApi.getSuppliers(),
    staleTime: 10 * 60 * 1000,
    refetchOnMount: false,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSupplierDto) => inventoryApi.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      // Invalidate inventory list since supplier filter options may change
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

// ─── Categories ─────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => inventoryApi.getCategories(),
    staleTime: 10 * 60 * 1000,
    refetchOnMount: false,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryDto) => inventoryApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      // Invalidate inventory list since category filter options may change
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

// ─── Stock Movements ────────────────────────────────────────────────────────

export function useStockMovements(params?: PaginationParams) {
  return useQuery({
    queryKey: ['stockMovements', params],
    queryFn: () => inventoryApi.getMovements(params),
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useCreateStockMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStockMovementDto) => inventoryApi.createMovement(data),
    onSuccess: (_, data) => {
      // Invalidate inventory list and stats since stock levels change
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'alerts'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Invalidate specific item detail and movement history
      if (data.itemId) {
        queryClient.invalidateQueries({ queryKey: ['inventory', data.itemId] });
        queryClient.invalidateQueries({ queryKey: ['inventory', data.itemId, 'movements'] });
      }
    },
  });
}

export function useStockMovementHistory(itemId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['inventory', itemId, 'movements'],
    queryFn: () => inventoryApi.getMovementHistory(itemId),
    enabled: !!itemId && enabled,
    staleTime: 3 * 60 * 1000,
  });
}

// ─── Alerts ─────────────────────────────────────────────────────────────────

export function useInventoryAlerts() {
  return useQuery({
    queryKey: ['inventory', 'alerts'],
    queryFn: () => inventoryApi.getAlerts(),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
