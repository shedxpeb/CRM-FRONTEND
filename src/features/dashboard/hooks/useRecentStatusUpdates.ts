/**
 * Recent Status Updates Hook
 * Fetches recent project status changes from the projects module
 * Uses real API with mock fallback - works without backend
 */

import { useQuery } from '@tanstack/react-query';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { projectsApi } from '@/features/projects/services/projectsApi';
import { ProjectActivity } from '@/features/projects/types';

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

// Map activity types to status descriptions
const ACTIVITY_STATUS_MAP: Record<string, string> = {
  'project_created': 'Lead',
  'design_started': 'Design',
  'design_completed': 'Design',
  'design_uploaded': 'Design',
  'boq_created': 'BOQ',
  'boq_updated': 'BOQ',
  'procurement_started': 'Procurement',
  'material_reserved': 'Procurement',
  'purchase_request_created': 'Procurement',
  'fabrication_started': 'Fabrication',
  'fabrication_completed': 'Fabrication',
  'dispatch_started': 'Dispatch',
  'dispatch_completed': 'Dispatch',
  'installation_started': 'Installation',
  'installation_completed': 'Installation',
  'milestone_completed': 'Completed',
  'team_assigned': 'Updated',
  'task_assigned': 'Updated',
  'status_changed': 'Status Changed',
  'stage_changed': 'Stage Changed',
  'document_uploaded': 'Updated',
  'note_added': 'Updated',
  'payment_received': 'Updated',
  'project_completed': 'Completion',
  'handover_completed': 'Handover',
};

/**
 * Hook to fetch recent status updates across all projects
 * Returns the most recent status changes from project activities
 */
export function useRecentStatusUpdates(limit: number = 10, enabled: boolean = true) {
  // Fetch all projects to get project names
  const { data: projectsData, isLoading: projectsLoading } = useProjects(
    enabled ? { page: 1, pageSize: 100 } : undefined,
  );
  
  // Fetch activities for each project - PARALLEL with projects fetch
  const activitiesQuery = useQuery({
    queryKey: ['recent-status-updates', limit, projectsData?.data?.rows],
    queryFn: async (): Promise<StatusUpdate[]> => {
      if (!projectsData?.data?.rows || projectsData.data.rows.length === 0) return [];
      
      const projects = projectsData.data.rows;
      const allActivities: (ProjectActivity & { projectCode: string; projectName: string })[] = [];
      
      // Fetch activities for all projects in parallel
      const activityPromises = projects.map(async (project) => {
        try {
          const response = await projectsApi.getActivities(project.id);
          const activities = response?.data ?? [];
          return activities.map(activity => ({
            ...activity,
            projectCode: project.projectCode,
            projectName: project.projectName,
          }));
        } catch (error) {
          return [];
        }
      });
      
      const results = await Promise.all(activityPromises);
      results.forEach(activities => allActivities.push(...activities));
      
      // Sort by date (most recent first)
      allActivities.sort((a, b) => 
        new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
      );
      
      // Map to StatusUpdate format
      const statusUpdates: StatusUpdate[] = allActivities.slice(0, limit).map((activity) => ({
        id: activity.id,
        projectId: activity.projectId,
        projectCode: activity.projectCode || '',
        projectName: activity.projectName || '',
        currentStatus: ACTIVITY_STATUS_MAP[activity.type] || activity.type,
        previousStatus: undefined, // Not available in current data structure
        performedBy: activity.performedBy,
        performedAt: new Date(activity.performedAt),
      }));
      
      return statusUpdates;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled,
  });
  
  const isLoading = projectsLoading || activitiesQuery.isLoading;
  
  return {
    data: activitiesQuery.data || [],
    isLoading,
    error: activitiesQuery.error,
  };
}
