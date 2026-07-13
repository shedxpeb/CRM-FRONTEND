/**
 * Item Master Hooks
 * React Query hooks for fetching and managing Item Master data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { itemMasterApi } from '../services/itemMasterApi';
import { useModuleConfiguration } from '@/features/settings/hooks/useSettings';
import { ITEM_MODULE_DEFAULTS } from '@/features/settings/utils/moduleConfigurationDefaults';
import { pickModuleSettings } from '@/features/settings/utils/resolveModuleSettings';
import {
  ItemMaster,
  ItemVariant,
  ItemBundle,
  CreateItemMasterDto,
  UpdateItemMasterDto,
  CreateItemVariantDto,
  UpdateItemVariantDto,
  CreateItemBundleDto,
  UpdateItemBundleDto,
  ItemMasterQuery,
  ItemCustomFieldDefinition,
} from '../types';

export interface ItemModuleConfiguration {
  brands: string[];
  units: string[];
  itemTypes: string[];
  taxTypes: string[];
  customFields: ItemCustomFieldDefinition[];
}

export const DEFAULT_ITEM_CONFIGURATION: ItemModuleConfiguration = ITEM_MODULE_DEFAULTS;

export function useItemConfiguration(): ItemModuleConfiguration & { isLoading: boolean } {
  const { data, isLoading } = useModuleConfiguration('items');

  return useMemo(() => {
    const settings = pickModuleSettings(data?.settings, DEFAULT_ITEM_CONFIGURATION);
    return {
      ...settings,
      isLoading,
    };
  }, [data, isLoading]);
}

// ─── Item Master Hooks ───────────────────────────────────────────────────────

export function useItemMasters(query?: ItemMasterQuery) {
  return useQuery({
    queryKey: ['item-masters', query],
    queryFn: () => itemMasterApi.getAll(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useItemMaster(id: string) {
  return useQuery({
    queryKey: ['item-master', id],
    queryFn: () => itemMasterApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });
}

export function useItemMasterStats() {
  return useQuery({
    queryKey: ['item-master-stats'],
    queryFn: () => itemMasterApi.getStats(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
  });
}

export function useCreateItemMaster() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateItemMasterDto) => itemMasterApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-masters'] });
      queryClient.invalidateQueries({ queryKey: ['item-master-stats'] });
    },
  });
}

export function useUpdateItemMaster() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateItemMasterDto }) =>
      itemMasterApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['item-masters'] });
      queryClient.invalidateQueries({ queryKey: ['item-master', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['item-master-stats'] });
    },
  });
}

export function useDeleteItemMaster() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => itemMasterApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-masters'] });
      queryClient.invalidateQueries({ queryKey: ['item-master-stats'] });
    },
  });
}

// ─── Item Variant Hooks ─────────────────────────────────────────────────────

export function useItemVariants(itemMasterId: string) {
  return useQuery({
    queryKey: ['item-variants', itemMasterId],
    queryFn: () => itemMasterApi.getVariants(itemMasterId),
    enabled: !!itemMasterId,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });
}

export function useCreateItemVariant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateItemVariantDto) => itemMasterApi.createVariant(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['item-variants', variables.itemMasterId] });
    },
  });
}

export function useUpdateItemVariant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateItemVariantDto }) =>
      itemMasterApi.updateVariant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-variants'] });
    },
  });
}

export function useDeleteItemVariant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => itemMasterApi.deleteVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-variants'] });
    },
  });
}

// ─── Item Bundle Hooks ────────────────────────────────────────────────────────

export function useItemBundles(query?: ItemMasterQuery) {
  return useQuery({
    queryKey: ['item-bundles', query],
    queryFn: () => itemMasterApi.getBundles(query),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });
}

export function useItemBundle(id: string) {
  return useQuery({
    queryKey: ['item-bundle', id],
    queryFn: () => itemMasterApi.getBundleById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });
}

export function useCreateItemBundle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateItemBundleDto) => itemMasterApi.createBundle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-bundles'] });
    },
  });
}

export function useUpdateItemBundle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateItemBundleDto }) =>
      itemMasterApi.updateBundle(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['item-bundles'] });
      queryClient.invalidateQueries({ queryKey: ['item-bundle', variables.id] });
    },
  });
}

export function useDeleteItemBundle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => itemMasterApi.deleteBundle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-bundles'] });
    },
  });
}
