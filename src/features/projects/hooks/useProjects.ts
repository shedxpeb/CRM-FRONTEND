/**
 * useProjects Hook
 * React Query hooks for projects - never use useState/useEffect for server data
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { projectsApi } from '@/features/projects/services/projectsApi';
import { ProjectFilters, CreateProjectDto, UpdateProjectDto, ProjectTask, ProjectCustomFieldDefinition } from '@/features/projects/types';
import { PaginationParams } from '@/shared/types/pagination';
import { useModuleConfiguration } from '@/features/settings/hooks/useSettings';
import { PROJECT_MODULE_DEFAULTS } from '@/features/settings/utils/moduleConfigurationDefaults';
import { pickModuleSettings } from '@/features/settings/utils/resolveModuleSettings';

export interface ProjectModuleConfiguration {
  statuses: string[];
  stages: string[];
  priorities: string[];
  healthIndicators: string[];
  projectTypes: string[];
  structureTypes: string[];
  roofTypes: string[];
  wallTypes: string[];
  craneSystems: string[];
  customFields: ProjectCustomFieldDefinition[];
}

export const DEFAULT_PROJECT_CONFIGURATION: ProjectModuleConfiguration = PROJECT_MODULE_DEFAULTS;

export function useProjectConfiguration(): ProjectModuleConfiguration & { isLoading: boolean } {
  const { data, isLoading } = useModuleConfiguration('projects');

  return useMemo(() => {
    const settings = pickModuleSettings(data?.settings, DEFAULT_PROJECT_CONFIGURATION);
    return {
      ...settings,
      isLoading,
    };
  }, [data, isLoading]);
}

// ─── Projects ────────────────────────────────────────────────────────────────

export function useProjects(params?: PaginationParams & ProjectFilters) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => projectsApi.getAll(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getById(id),
    enabled: !!id,
    refetchOnMount: false,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectDto) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'stats'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectDto }) =>
      projectsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'stats'] });
    },
  });
}

export function useBulkUpdateProjects() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, data }: { ids: string[]; data: Partial<UpdateProjectDto> }) =>
      projectsApi.bulkUpdate(ids, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useBulkDeleteProjects() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => projectsApi.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'stats'] });
    },
  });
}

export function useProjectsStats(enabled: boolean = true) {
  return useQuery({
    queryKey: ['projects', 'stats'],
    queryFn: () => projectsApi.getStats(),
    staleTime: 2 * 60 * 1000,
    enabled,
    refetchOnMount: false,
    retry: 0, // No retry for dashboard - fail fast
  });
}

export function useProjectActivities(id: string) {
  return useQuery({
    queryKey: ['project', id, 'activities'],
    queryFn: () => projectsApi.getActivities(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
    refetchOnMount: false,
  });
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export function useProjectTasks(id: string) {
  return useQuery({
    queryKey: ['project', id, 'tasks'],
    queryFn: () => projectsApi.getTasks(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
    refetchOnMount: false,
  });
}

export function useCreateProjectTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ProjectTask>) => projectsApi.createTask(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'tasks'] });
    },
  });
}

export function useUpdateProjectTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: Partial<ProjectTask> }) =>
      projectsApi.updateTask(projectId, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'tasks'] });
    },
  });
}

export function useDeleteProjectTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => projectsApi.deleteTask(projectId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'tasks'] });
    },
  });
}
