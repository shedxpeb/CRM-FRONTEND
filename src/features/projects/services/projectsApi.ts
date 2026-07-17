/**
 * Projects API Service
 * All API calls for projects module — uses centralized api client (see leadsApi pattern).
 */
import { api } from '@/core/api';
import {
  Project,
  ProjectActivity,
  ProjectFilters,
  ProjectStats,
  ProjectTask,
  CreateProjectDto,
  UpdateProjectDto,
} from '@/features/projects/types';
import { PaginationParams } from '@/shared/types/pagination';

export interface BackendResponse<T> {
  message: string;
  data: T;
}

export interface ProjectsData {
  rows: Project[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export const projectsApi = {
  getAll: (params?: PaginationParams & ProjectFilters) =>
    api.get<BackendResponse<ProjectsData>>('/project', { params }),

  getById: async (id: string) => {
    const res = await api.get<BackendResponse<Project & { teamMembers?: Project['team'] }>>(
      `/project/${id}`,
    );
    const data = res?.data ?? (res as unknown as BackendResponse<Project>).data;
    const project = (data as any)?.data ?? data;
    if (project && !project.team && Array.isArray(project.teamMembers)) {
      project.team = project.teamMembers;
    }
    if (project && !Array.isArray(project.milestones)) {
      project.milestones = [];
    }
    if (project && !Array.isArray(project.team)) {
      project.team = [];
    }
    return res;
  },

  create: (data: CreateProjectDto) =>
    api.post<BackendResponse<Project>>('/project', data),

  update: (id: string, data: UpdateProjectDto) =>
    api.patch<BackendResponse<Project>>(`/project/${id}`, data),

  delete: (id: string) =>
    api.delete<BackendResponse<{ count: number }>>(`/project/${id}`),

  bulkUpdate: (ids: string[], data: Partial<UpdateProjectDto>) =>
    api.patch<BackendResponse<{ count: number }>>('/project/bulk', { ids, data }),

  bulkDelete: (ids: string[]) =>
    api.delete<BackendResponse<{ count: number }>>('/project/bulk', { data: { ids } }),

  export: (params?: ProjectFilters) =>
    api.get<BackendResponse<ProjectsData>>('/project/export', { params }),

  getStats: () =>
    api.get<BackendResponse<ProjectStats>>('/project/stats'),

  getActivities: (id: string) =>
    api.get<BackendResponse<ProjectActivity[]>>(`/project/${id}/activities`),

  getTasks: (id: string) =>
    api.get<BackendResponse<ProjectTask[]>>(`/project/${id}/tasks`),

  createTask: (projectId: string, data: Partial<ProjectTask>) =>
    api.post<BackendResponse<ProjectTask>>(`/project/${projectId}/tasks`, data),

  updateTask: (projectId: string, taskId: string, data: Partial<ProjectTask>) =>
    api.patch<BackendResponse<ProjectTask>>(`/project/${projectId}/tasks/${taskId}`, data),

  deleteTask: (projectId: string, taskId: string) =>
    api.delete<BackendResponse<void>>(`/project/${projectId}/tasks/${taskId}`),
};
