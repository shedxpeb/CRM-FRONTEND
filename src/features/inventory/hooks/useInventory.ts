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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'stats'] });
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInventoryItemDto }) =>
      inventoryApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', id] });
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', 'stats'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
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
