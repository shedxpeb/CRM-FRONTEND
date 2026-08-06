/**
 * useDashboardOverview Hook
 * Single aggregated dashboard query. Query key is namespaced under
 * `['dashboard', ...]` so module mutations already invalidate it.
 */
import { useQuery } from '@tanstack/react-query';
import { dashboardApi, DashboardOverview, DashboardOverviewParams } from '../services/dashboardApi';
import type { DateRange } from '../types';

export interface UseDashboardOverviewParams {
  enabled?: boolean;
  dateRange?: DateRange;
  customFrom?: string;
  customTo?: string;
}

export function useDashboardOverview({
  enabled = true,
  dateRange = 'this_month',
  customFrom,
  customTo,
}: UseDashboardOverviewParams = {}) {
  const params: DashboardOverviewParams = { dateRange };
  if (customFrom) params.customFrom = customFrom;
  if (customTo) params.customTo = customTo;

  return useQuery({
    queryKey: ['dashboard', dateRange, customFrom, customTo],
    queryFn: () => dashboardApi.getOverview(params),
    enabled,
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export type { DashboardOverview };
