/**
 * useCustomers Hook
 * React Query hooks for customers - never use useState/useEffect for server data
 */
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useMemo } from 'react';
import { customersApi } from '@/features/customers/services/customersApi';
import { CustomerFilters, CreateCustomerDto, UpdateCustomerDto, ConvertLeadToCustomerDto, CustomerCustomFieldDefinition } from '@/features/customers/types';
import { PaginationParams } from '@/shared/types/pagination';
import { useModuleConfiguration } from '@/features/settings/hooks/useSettings';
import { CUSTOMER_MODULE_DEFAULTS } from '@/features/settings/utils/moduleConfigurationDefaults';
import { pickModuleSettings } from '@/features/settings/utils/resolveModuleSettings';

export interface CustomerModuleConfiguration {
  statuses: string[];
  customerTypes: string[];
  territories: string[];
  sources: string[];
  industries: string[];
  customFields: CustomerCustomFieldDefinition[];
}

export const DEFAULT_CUSTOMER_CONFIGURATION: CustomerModuleConfiguration = CUSTOMER_MODULE_DEFAULTS;

export function useCustomerConfiguration(): CustomerModuleConfiguration & { isLoading: boolean } {
  const { data, isLoading } = useModuleConfiguration('customers');

  return useMemo(() => {
    const settings = pickModuleSettings(data?.settings, DEFAULT_CUSTOMER_CONFIGURATION);
    return {
      ...settings,
      isLoading,
    };
  }, [data, isLoading]);
}

/**
 * Fetch all customers with pagination and filters
 */
export function useCustomers(params?: PaginationParams & CustomerFilters & { search?: string }) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => {
      const safeParams = params
        ? { ...params, page: Math.max(1, Number(params.page) || 1) }
        : params;
      return customersApi.getAll(safeParams);
    },
    enabled: params !== undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    placeholderData: keepPreviousData,
  });
}

/**
 * Fetch single customer by ID
 */
export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.getById(id),
    enabled: !!id,
    refetchOnMount: false,
  });
}

/**
 * Create new customer
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerDto) => customersApi.create(data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', 'stats'] });
      // Only linked lead lists need refresh when create carries a lead reference
      if (variables.leadId) {
        queryClient.invalidateQueries({ queryKey: ['leads'] });
        queryClient.invalidateQueries({ queryKey: ['leads-kanban'] });
        queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
      }
    },
  });
}

/**
 * Update existing customer
 */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerDto }) =>
      customersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      queryClient.invalidateQueries({ queryKey: ['customers', 'stats'] });
    },
  });
}

/**
 * Delete customer
 */
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', 'stats'] });
    },
  });
}

/**
 * Bulk update customers
 */
export function useBulkUpdateCustomers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, data }: { ids: string[]; data: Partial<UpdateCustomerDto> }) =>
      customersApi.bulkUpdate(ids, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

/**
 * Bulk delete customers
 */
export function useBulkDeleteCustomers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => customersApi.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', 'stats'] });
    },
  });
}

/**
 * Get customer statistics
 * Optimized for dashboard with faster retry
 */
export function useCustomersStats(enabled: boolean = true) {
  return useQuery({
    queryKey: ['customers', 'stats'],
    queryFn: () => customersApi.getStats(),
    staleTime: 2 * 60 * 1000,
    enabled,
    refetchOnMount: false,
    retry: 0, // No retry for dashboard - fail fast
  });
}

/**
 * Get customer activities (timeline)
 */
export function useCustomerActivities(id: string) {
  return useQuery({
    queryKey: ['customer', id, 'activities'],
    queryFn: () => customersApi.getActivities(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Convert lead to customer
 * Creates a new customer from lead data and updates the lead with customer reference
 */
export function useConvertLeadToCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConvertLeadToCustomerDto) => customersApi.convertLeadToCustomer(data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads-kanban'] });
      if (variables.leadId) {
        queryClient.invalidateQueries({ queryKey: ['lead', variables.leadId] });
      }
    },
  });
}
