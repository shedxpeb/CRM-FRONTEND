/**
 * useDashboardGantt Hook
 * Project gantt timeline data (project rows + phases + tasks).
 */
import { useQuery } from '@tanstack/react-query';
import { dashboardApi, DashboardGantt } from '../services/dashboardApi';

export function useDashboardGantt(enabled: boolean = true, projectId?: string) {
  return useQuery({
    queryKey: ['dashboard', 'gantt', projectId],
    queryFn: () => dashboardApi.getGantt(projectId ? { projectId } : {}),
    enabled,
    staleTime: 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export type { DashboardGantt };
