/**
 * Dashboard Real Data Hook
 * Aggregates data from all modules using React Query hooks
 * Replaces mock data with real API calls
 * Optimized for fast loading with reduced retry and aggressive caching
 * Uses optimistic UI with cached data for instant feedback
 */

import { useLeadsStats } from '@/features/leads/hooks/useLeads';
import { useProjectsStats } from '@/features/projects/hooks/useProjects';
import { useCustomersStats } from '@/features/customers/hooks/useCustomers';
import { useInventoryStats } from '@/features/inventory/hooks/useInventory';
import { useFinanceStats } from '@/features/finance/hooks/useFinance';
import { useQuotationStats } from '@/features/documents/hooks/useQuotation';
import { useQueryClient } from '@tanstack/react-query';

// Fallback data for optimistic UI when cache is empty
const FALLBACK_DATA = {
  leads: { total: 0, monthly: 0, yearly: 0, change: 0 },
  projects: { total: 0, active: 0, completed: 0, monthly: 0, yearly: 0, change: 0 },
  customers: { total: 0, monthly: 0, yearly: 0, change: 0 },
  inventory: { totalValue: 0, monthly: 0, yearly: 0, change: 0 },
  finance: { revenue: 0, monthly: 0, yearly: 0, change: 0 },
  quotations: { total: 0, monthly: 0, yearly: 0, change: 0 },
};

export interface DashboardRealData {
  leads: {
    total: number;
    monthly: number;
    yearly: number;
    change: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    monthly: number;
    yearly: number;
    change: number;
  };
  customers: {
    total: number;
    monthly: number;
    yearly: number;
    change: number;
  };
  inventory: {
    totalValue: number;
    monthly: number;
    yearly: number;
    change: number;
  };
  finance: {
    revenue: number;
    monthly: number;
    yearly: number;
    change: number;
  };
  quotations: {
    total: number;
    monthly: number;
    yearly: number;
    change: number;
  };
}

/**
 * Hook to fetch real dashboard data from all modules
 * Optimized for fast loading with parallel queries
 * Uses optimistic UI with cached data for instant feedback
 */
export function useDashboardRealData(enabled: boolean = true) {
  const queryClient = useQueryClient();

  // Fetch stats from all modules with optimized retry
  const leadsStats = useLeadsStats(enabled);
  const projectsStats = useProjectsStats(enabled);
  const customersStats = useCustomersStats(enabled);
  const inventoryStats = useInventoryStats(enabled);
  const financeStats = useFinanceStats(enabled);
  const quotationStats = useQuotationStats(enabled);

  // Calculate loading state (quotationStats uses 'loading' not 'isLoading')
  const isLoading = 
    leadsStats.isLoading || 
    projectsStats.isLoading || 
    customersStats.isLoading || 
    inventoryStats.isLoading || 
    financeStats.isLoading || 
    quotationStats.loading;

  // Calculate error state
  const error = 
    leadsStats.error || 
    projectsStats.error || 
    customersStats.error || 
    inventoryStats.error || 
    financeStats.error || 
    quotationStats.error;

  // Optimistic UI: Use cached data if available while loading fresh data
  const getCachedData = () => {
    const cachedLeads = queryClient.getQueryData(['leads', 'stats']);
    const cachedProjects = queryClient.getQueryData(['projects', 'stats']);
    const cachedCustomers = queryClient.getQueryData(['customers', 'stats']);
    const cachedInventory = queryClient.getQueryData(['inventory', 'stats']);
    const cachedFinance = queryClient.getQueryData(['finance', 'stats']);
    const cachedQuotations = queryClient.getQueryData(['quotations', 'stats']);

    // If we have cached data, use it immediately
    if (cachedLeads || cachedProjects || cachedCustomers || cachedInventory || cachedFinance || cachedQuotations) {
      return {
        leads: {
          total: (cachedLeads as any)?.total || 0,
          monthly: (cachedLeads as any)?.new || 0,
          yearly: (cachedLeads as any)?.total || 0,
          change: (cachedLeads as any)?.changePercent || 0,
        },
        projects: {
          total: (cachedProjects as any)?.totalProjects || 0,
          active: (cachedProjects as any)?.activeProjects || 0,
          completed: (cachedProjects as any)?.completedProjects || 0,
          monthly: (cachedProjects as any)?.activeProjects || 0,
          yearly: (cachedProjects as any)?.totalProjects || 0,
          change: (cachedProjects as any)?.changePercent || 0,
        },
        customers: {
          total: (cachedCustomers as any)?.totalCustomers || 0,
          monthly: (cachedCustomers as any)?.newThisMonth || 0,
          yearly: (cachedCustomers as any)?.totalCustomers || 0,
          change: (cachedCustomers as any)?.changePercent || 0,
        },
        inventory: {
          totalValue: (cachedInventory as any)?.totalValue || 0,
          monthly: (cachedInventory as any)?.monthly || 0,
          yearly: (cachedInventory as any)?.yearly || 0,
          change: (cachedInventory as any)?.changePercent || 0,
        },
        finance: {
          revenue: (cachedFinance as any)?.totalRevenue || 0,
          monthly: (cachedFinance as any)?.monthlyRevenue || 0,
          yearly: (cachedFinance as any)?.totalRevenue || 0,
          change: (cachedFinance as any)?.changePercent || 0,
        },
        quotations: {
          total: (cachedQuotations as any)?.total || 0,
          monthly: (cachedQuotations as any)?.monthly || 0,
          yearly: (cachedQuotations as any)?.yearly || 0,
          change: (cachedQuotations as any)?.changePercent || 0,
        },
      };
    }

    return FALLBACK_DATA;
  };

  // Aggregate data with flexible property access and fallback values
  // Use optimistic UI: show cached data immediately while loading fresh data
  const data: DashboardRealData = isLoading ? getCachedData() : {
    leads: {
      total: (leadsStats.data as any)?.total || 0,
      monthly: (leadsStats.data as any)?.new || 0,
      yearly: (leadsStats.data as any)?.total || 0,
      change: (leadsStats.data as any)?.changePercent || 0,
    },
    projects: {
      total: (projectsStats.data as any)?.totalProjects || 0,
      active: (projectsStats.data as any)?.activeProjects || 0,
      completed: (projectsStats.data as any)?.completedProjects || 0,
      monthly: (projectsStats.data as any)?.activeProjects || 0,
      yearly: (projectsStats.data as any)?.totalProjects || 0,
      change: (projectsStats.data as any)?.changePercent || 0,
    },
    customers: {
      total: (customersStats.data as any)?.totalCustomers || 0,
      monthly: (customersStats.data as any)?.newThisMonth || 0,
      yearly: (customersStats.data as any)?.totalCustomers || 0,
      change: (customersStats.data as any)?.changePercent || 0,
    },
    inventory: {
      totalValue: (inventoryStats.data as any)?.totalValue || 0,
      monthly: (inventoryStats.data as any)?.monthly || 0,
      yearly: (inventoryStats.data as any)?.yearly || 0,
      change: (inventoryStats.data as any)?.changePercent || 0,
    },
    finance: {
      revenue: (financeStats.data as any)?.totalRevenue || 0,
      monthly: (financeStats.data as any)?.monthlyRevenue || 0,
      yearly: (financeStats.data as any)?.totalRevenue || 0,
      change: (financeStats.data as any)?.changePercent || 0,
    },
    quotations: {
      total: (quotationStats.data as any)?.total || 0,
      monthly: (quotationStats.data as any)?.monthly || 0,
      yearly: (quotationStats.data as any)?.yearly || 0,
      change: (quotationStats.data as any)?.changePercent || 0,
    },
  };

  return {
    data,
    isLoading,
    error,
  };
}
