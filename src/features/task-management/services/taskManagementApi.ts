/**
 * Task Management API Service
 * API calls for Task Management, Employee Performance, and Salary Adjustments
 *
 * Real backend only — errors propagate (no mock fallbacks).
 */

import { api } from '@/core/api';
import { guardModuleApi } from '@/core/api/capabilities';
import {
  Task,
  EmployeePerformanceStats,
  SalaryAdjustment,
  EmployeeSalaryLedger,
  CreateTaskDto,
  UpdateTaskDto,
  CompleteTaskDto,
  VerifyTaskDto,
  CreateSalaryAdjustmentDto,
  UpdateSalaryAdjustmentDto,
  TaskQuery,
  TaskStats,
  DashboardTaskKPIs,
  SalaryAdjustmentQuery,
} from '../types';

export const taskManagementApi = guardModuleApi('task', {
  // Task CRUD
  async getAll(query?: TaskQuery): Promise<Task[]> {
    try {
      return await api.get<Task[]>('/tasks', { params: query });
    } catch (error) {
            throw error;
    }
  },

  async getById(id: string): Promise<Task> {
    try {
      return await api.get<Task>(`/tasks/${id}`);
    } catch (error) {
            throw error;
    }
  },

  async create(data: CreateTaskDto): Promise<Task> {
    try {
      return await api.post<Task>('/tasks', data);
    } catch (error) {
            throw error;
    }
  },

  async update(id: string, data: UpdateTaskDto): Promise<Task> {
    try {
      return await api.patch<Task>(`/tasks/${id}`, data);
    } catch (error) {
            throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      return await api.delete<void>(`/tasks/${id}`);
    } catch (error) {
            throw error;
    }
  },

  // Task Completion with Photo Proof
  async complete(id: string, data: CompleteTaskDto): Promise<Task> {
    try {
      return await api.post<Task>(`/tasks/${id}/complete`, data);
    } catch (error) {
            throw error;
    }
  },

  // Task Verification
  async verify(id: string, data: VerifyTaskDto, verifiedBy: string, verifiedByName: string): Promise<Task> {
    try {
      return await api.post<Task>(`/tasks/${id}/verify`, { ...data, verifiedBy, verifiedByName });
    } catch (error) {
            throw error;
    }
  },

  // Stats
  async getStats(): Promise<TaskStats> {
    try {
      return await api.get<TaskStats>('/tasks/stats');
    } catch (error) {
            throw error;
    }
  },

  async getDashboardKPIs(): Promise<DashboardTaskKPIs> {
    try {
      return await api.get<DashboardTaskKPIs>('/tasks/dashboard-kpis');
    } catch (error) {
            throw error;
    }
  },

  // Employee Performance
  async getEmployeePerformance(employeeId?: string): Promise<EmployeePerformanceStats[]> {
    try {
      const params = employeeId ? { employeeId } : undefined;
      return await api.get<EmployeePerformanceStats[]>('/tasks/employee-performance', { params });
    } catch (error) {
            throw error;
    }
  },

  async getEmployeeSalaryLedger(employeeId: string, periodStart: Date, periodEnd: Date): Promise<EmployeeSalaryLedger> {
    try {
      return await api.get<EmployeeSalaryLedger>(`/tasks/employee-salary-ledger/${employeeId}`, {
        params: { periodStart: periodStart.toISOString(), periodEnd: periodEnd.toISOString() }
      });
    } catch (error) {
            throw error;
    }
  },

  // Salary Adjustments CRUD
  async getSalaryAdjustments(query?: SalaryAdjustmentQuery): Promise<SalaryAdjustment[]> {
    try {
      return await api.get<SalaryAdjustment[]>('/tasks/salary-adjustments', { params: query });
    } catch (error) {
            throw error;
    }
  },

  async getSalaryAdjustmentById(id: string): Promise<SalaryAdjustment> {
    try {
      return await api.get<SalaryAdjustment>(`/tasks/salary-adjustments/${id}`);
    } catch (error) {
            throw error;
    }
  },

  async createSalaryAdjustment(data: CreateSalaryAdjustmentDto): Promise<SalaryAdjustment> {
    try {
      return await api.post<SalaryAdjustment>('/tasks/salary-adjustments', data);
    } catch (error) {
            throw error;
    }
  },

  async updateSalaryAdjustment(id: string, data: UpdateSalaryAdjustmentDto): Promise<SalaryAdjustment> {
    try {
      return await api.patch<SalaryAdjustment>(`/tasks/salary-adjustments/${id}`, data);
    } catch (error) {
            throw error;
    }
  },

  async deleteSalaryAdjustment(id: string): Promise<void> {
    try {
      return await api.delete<void>(`/tasks/salary-adjustments/${id}`);
    } catch (error) {
            throw error;
    }
  },

  async approveSalaryAdjustment(id: string, approvedBy: string, approvedByName: string): Promise<SalaryAdjustment> {
    try {
      return await api.post<SalaryAdjustment>(`/tasks/salary-adjustments/${id}/approve`, { approvedBy, approvedByName });
    } catch (error) {
            throw error;
    }
  },

  async processSalaryAdjustment(id: string, processedBy: string): Promise<SalaryAdjustment> {
    try {
      return await api.post<SalaryAdjustment>(`/tasks/salary-adjustments/${id}/process`, { processedBy });
    } catch (error) {
            throw error;
    }
  },
});
