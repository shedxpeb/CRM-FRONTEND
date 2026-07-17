/**
 * useLeads Hook
 * React Query hooks for leads - never use useState/useEffect for server data
 *
 * Phase 2: Lead CRUD
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { leadsApi, LeadsFilters, PaginationParams } from '@/features/leads/services/leadsApi';
import { Lead } from '@/types/leads';
import { useModuleConfiguration } from '@/features/settings/hooks/useSettings';
import { LEAD_MODULE_DEFAULTS } from '@/features/settings/utils/moduleConfigurationDefaults';
import { pickModuleSettings } from '@/features/settings/utils/resolveModuleSettings';

import { LeadCustomFieldDefinition } from '@/types/leads';

export interface LeadModuleConfiguration {
  statuses: string[];
  priorities: string[];
  sources: string[];
  projectTypes: string[];
  structureTypes: string[];
  roofTypes: string[];
  wallTypes: string[];
  materialPreferences: string[];
  customFields: LeadCustomFieldDefinition[];
}

export const DEFAULT_LEAD_CONFIGURATION: LeadModuleConfiguration = LEAD_MODULE_DEFAULTS;

/**
 * Lead workflow configuration from Settings (read-only)
 */
export function useLeadConfiguration(): LeadModuleConfiguration & { isLoading: boolean } {
  const { data, isLoading } = useModuleConfiguration('leads');

  return useMemo(() => {
    const settings = pickModuleSettings(data?.settings, DEFAULT_LEAD_CONFIGURATION);
    return {
      ...settings,
      isLoading,
    };
  }, [data, isLoading]);
}

/**
 * Fetch all leads with pagination and filters
 * Only fetches when params are provided (view is active)
 */
export function useLeads(params?: PaginationParams & LeadsFilters) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => {
      const safeParams = params
        ? { ...params, page: Math.max(1, Number(params.page) || 1) }
        : params;
      return leadsApi.getAll(safeParams);
    },
    enabled: params !== undefined,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

/**
 * Fetch single lead by ID
 */
export function useLead(id: string) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadsApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Create new lead
 */
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Lead>) => leadsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-kanban'] });
      queryClient.invalidateQueries({ queryKey: ['leads-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['leads-stats'] });
    },
  });
}

/**
 * Update existing lead
 */
export function useUpdateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) => 
      leadsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-kanban'] });
      queryClient.invalidateQueries({ queryKey: ['leads-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['leads-stats'] });
    },
  });
}

/**
 * Delete lead (soft delete)
 */
export function useDeleteLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const result = await leadsApi.delete(id);
        return result;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      // Refetch only active lead list views
      queryClient.refetchQueries({ queryKey: ['leads'], type: 'active' });
      queryClient.refetchQueries({ queryKey: ['leads-kanban'], type: 'active' });
      queryClient.refetchQueries({ queryKey: ['leads-calendar'], type: 'active' });
      queryClient.invalidateQueries({ queryKey: ['leads-stats'] });
    },
  });
}

/**
 * Bulk update leads — prefer bulk status endpoint; avoid per-id N+1 for deletes (see useBulkDelete).
 */
export function useBulkUpdateLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, data }: { ids: string[]; data: Partial<Lead> }) => {
      if (data.status && Object.keys(data).length === 1) {
        return leadsApi.bulkStatusUpdate(ids, data.status);
      }
      await Promise.all(ids.map((id) => leadsApi.update(id, data)));
      return { message: 'Updated', data: { count: ids.length } };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-kanban'] });
      queryClient.invalidateQueries({ queryKey: ['leads-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['leads-stats'] });
    },
  });
}

/**
 * Bulk delete leads — always use the bulk delete endpoint (no per-id N+1)
 */
export function useBulkDeleteLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => leadsApi.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-kanban'] });
      queryClient.invalidateQueries({ queryKey: ['leads-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['leads-stats'] });
    },
  });
}

/**
 * Bulk status update using backend endpoint
 */
export function useBulkStatusUpdate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: string }) =>
      leadsApi.bulkStatusUpdate(ids, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-kanban'] });
      queryClient.invalidateQueries({ queryKey: ['leads-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['leads-stats'] });
    },
  });
}

/**
 * Bulk delete using backend endpoint
 */
export function useBulkDelete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ids: string[]) =>
      leadsApi.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-kanban'] });
      queryClient.invalidateQueries({ queryKey: ['leads-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['leads-stats'] });
    },
  });
}

/**
 * Get leads grouped by status for Kanban view
 * Only fetches when params are provided (view is active)
 */
export function useKanbanLeads(params?: Partial<LeadsFilters>) {
  return useQuery({
    queryKey: ['leads-kanban', params],
    queryFn: () => leadsApi.getKanban(params),
    enabled: params !== undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

/**
 * Get leads with follow-up dates for Calendar view
 * Only fetches when params are provided (view is active)
 */
export function useCalendarLeads(params?: Partial<LeadsFilters>) {
  return useQuery({
    queryKey: ['leads-calendar', params],
    queryFn: () => leadsApi.getCalendar(params),
    enabled: params !== undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

/**
 * Get lead statistics for dashboard.
 * Uses a dedicated stats query with long staleTime to avoid duplicating
 * the main leads query on every dashboard mount.
 */
export function useLeadsStats(enabled: boolean = true) {
  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['leads-stats'],
    queryFn: () => leadsApi.getAll({ page: 1, pageSize: 1 }),
    enabled,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    data: leadsData?.data?.summary,
    isLoading,
    error: null,
  };
}

