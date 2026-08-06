/**
 * Recent Status Updates Hook
 * Derived from the aggregated dashboard activities feed (project status changes).
 */
import { useMemo } from 'react';
import { useDashboardOverview } from './useDashboardOverview';

export interface StatusUpdate {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  currentStatus: string;
  previousStatus?: string;
  performedBy: string;
  performedAt: Date;
}

/**
 * Recent project status updates for the dashboard widget.
 * Project-specific rows only; other entity activity is ignored.
 */
export function useRecentStatusUpdates(limit: number = 10, enabled: boolean = true) {
  const { data, isLoading, error } = useDashboardOverview({
    enabled,
    dateRange: 'all_time',
  });

  const items = useMemo<StatusUpdate[]>(() => {
    const activities = data?.activities ?? [];
    return activities
      .filter((a) => a.entityType === 'project')
      .slice(0, limit)
      .map((a) => ({
        id: a.id,
        projectId: a.entityId,
        projectCode: a.projectCode || '',
        projectName: a.projectName || a.entityName,
        currentStatus: a.currentStatus || '',
        previousStatus: a.previousStatus || undefined,
        performedBy: a.user || 'System',
        performedAt: a.timestamp,
      }));
  }, [data?.activities, limit]);

  return {
    data: items,
    isLoading,
    error,
  };
}
