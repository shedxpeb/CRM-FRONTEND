/**
 * Recent Status Updates Hook
 * Uses a single paginated projects list — no per-project activity N+1.
 */
import { useMemo } from 'react';
import { useProjects } from '@/features/projects/hooks/useProjects';

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
 * Recent project status snapshot for the dashboard widget.
 * One list request only (pageSize = limit).
 */
export function useRecentStatusUpdates(limit: number = 10, enabled: boolean = true) {
  const {
    data: projectsData,
    isLoading,
    error,
  } = useProjects(
    enabled
      ? { page: 1, pageSize: limit, sortBy: 'createdAt', sortOrder: 'desc' }
      : undefined
  );

  const data = useMemo<StatusUpdate[]>(() => {
    const rows = projectsData?.data?.rows ?? [];
    return rows.map((project) => ({
      id: `${project.id}-status`,
      projectId: project.id,
      projectCode: project.projectCode,
      projectName: project.projectName,
      currentStatus: project.status,
      performedBy: project.projectManager || 'System',
      performedAt: new Date(project.updatedAt ?? project.createdAt ?? Date.now()),
    }));
  }, [projectsData?.data?.rows]);

  return {
    data,
    isLoading,
    error,
  };
}
