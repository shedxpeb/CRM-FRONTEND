/**
 * Task Management API Service
 * API calls for Task Management, Employee Performance, and Salary Adjustments
 *
 * Mock fallback: When backend is unavailable, returns mock data.
 * Remove mock fallbacks once backend is connected.
 */

import { api } from '@/core/api';
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
  TaskActivity,
  TaskActivityType,
} from '../types';

// Helper function to create activity entries
function createActivity(
  taskId: string,
  activityType: TaskActivityType,
  description: string,
  performedBy: string,
  performedByName: string,
  metadata?: Record<string, any>
): TaskActivity {
  return {
    id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    taskId,
    activityType,
    description,
    performedBy,
    performedByName,
    timestamp: new Date(),
    metadata,
  };
}

/** Check if error is a connection failure (no backend) */
function isConnectionError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const err = error as any;
    if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED' || err.code === 'ERR_CONNECTION_REFUSED') return true;
    if (!err.response && err.message && err.message.toLowerCase().includes('network')) return true;
  }
  return false;
}

// Mock data for development (replace with actual API calls)
const mockTasks: Task[] = [
  {
    id: '1',
    taskId: 'TSK-001',
    title: 'Install Roofing Sheets - Warehouse A',
    description: 'Install PPGL roofing sheets on Warehouse A building',
    assignedUserId: 'user-1',
    assignedUserName: 'Rajesh Kumar',
    createdBy: 'admin-1',
    createdByName: 'Admin User',
    dueDate: new Date('2024-01-20'),
    priority: 'High',
    status: 'Completed',
    progress: 100,
    linkedModule: 'Projects',
    linkedRecordId: 'proj-1',
    linkedRecordName: 'Warehouse Construction',
    incentiveValue: 2500,
    isPaymentEditable: false,
    completionProof: {
      beforeImages: [],
      afterImages: [],
      notes: 'Installation completed as per specifications',
      uploadedAt: new Date('2024-01-19'),
      uploadedBy: 'user-1',
    },
    completedAt: new Date('2024-01-19'),
    verifiedBy: 'admin-1',
    verifiedByName: 'Admin User',
    verifiedAt: new Date('2024-01-19'),
    verificationNotes: 'Verified - quality check passed',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-19'),
    activityHistory: [
      {
        id: 'activity-1',
        taskId: 'TSK-001',
        activityType: 'Created',
        description: 'Task created',
        performedBy: 'admin-1',
        performedByName: 'Admin User',
        timestamp: new Date('2024-01-15T09:00:00'),
      },
      {
        id: 'activity-2',
        taskId: 'TSK-001',
        activityType: 'Assigned',
        description: 'Assigned to Rajesh Kumar',
        performedBy: 'admin-1',
        performedByName: 'Admin User',
        timestamp: new Date('2024-01-15T09:05:00'),
      },
      {
        id: 'activity-3',
        taskId: 'TSK-001',
        activityType: 'Started',
        description: 'Task started',
        performedBy: 'user-1',
        performedByName: 'Rajesh Kumar',
        timestamp: new Date('2024-01-18T09:00:00'),
      },
      {
        id: 'activity-4',
        taskId: 'TSK-001',
        activityType: 'Photos Uploaded',
        description: 'Uploaded before and after photos',
        performedBy: 'user-1',
        performedByName: 'Rajesh Kumar',
        timestamp: new Date('2024-01-19T14:15:00'),
      },
      {
        id: 'activity-5',
        taskId: 'TSK-001',
        activityType: 'Completed',
        description: 'Task marked as complete',
        performedBy: 'user-1',
        performedByName: 'Rajesh Kumar',
        timestamp: new Date('2024-01-19T14:20:00'),
      },
      {
        id: 'activity-6',
        taskId: 'TSK-001',
        activityType: 'Verified',
        description: 'Task verified by Admin User',
        performedBy: 'admin-1',
        performedByName: 'Admin User',
        timestamp: new Date('2024-01-19T15:00:00'),
      },
    ],
  },
  {
    id: '2',
    taskId: 'TSK-002',
    title: 'Steel Frame Assembly - Section B',
    description: 'Assemble steel frame for Section B of the building',
    assignedUserId: 'user-2',
    assignedUserName: 'Amit Singh',
    createdBy: 'admin-1',
    createdByName: 'Admin User',
    dueDate: new Date('2024-01-25'),
    priority: 'Critical',
    status: 'In Progress',
    progress: 60,
    linkedModule: 'Projects',
    linkedRecordId: 'proj-1',
    linkedRecordName: 'Warehouse Construction',
    incentiveValue: 5000,
    isPaymentEditable: false,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '3',
    taskId: 'TSK-003',
    title: 'Electrical Wiring - Floor 1',
    description: 'Complete electrical wiring for first floor',
    assignedUserId: 'user-3',
    assignedUserName: 'Suresh Patel',
    createdBy: 'admin-1',
    createdByName: 'Admin User',
    dueDate: new Date('2024-01-22'),
    priority: 'High',
    status: 'Pending',
    progress: 0,
    linkedModule: 'Projects',
    linkedRecordId: 'proj-2',
    linkedRecordName: 'Office Building',
    incentiveValue: 3500,
    isPaymentEditable: false,
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
  },
  {
    id: '4',
    taskId: 'TSK-004',
    title: 'Inventory Count - Steel Plates',
    description: 'Perform physical count of steel plate inventory',
    assignedUserId: 'user-1',
    assignedUserName: 'Rajesh Kumar',
    createdBy: 'admin-1',
    createdByName: 'Admin User',
    dueDate: new Date('2024-01-18'),
    priority: 'Medium',
    status: 'Completed',
    progress: 100,
    linkedModule: 'Inventory',
    linkedRecordId: 'inv-1',
    linkedRecordName: 'Steel Plates Stock',
    incentiveValue: 800,
    isPaymentEditable: false,
    completionProof: {
      beforeImages: [],
      afterImages: [],
      notes: 'Count completed - 150 plates verified',
      uploadedAt: new Date('2024-01-17'),
      uploadedBy: 'user-1',
    },
    completedAt: new Date('2024-01-17'),
    verifiedBy: 'admin-1',
    verifiedByName: 'Admin User',
    verifiedAt: new Date('2024-01-18'),
    verificationNotes: 'Count verified against system records',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-18'),
    activityHistory: [
      {
        id: 'activity-7',
        taskId: 'TSK-004',
        activityType: 'Created',
        description: 'Task created',
        performedBy: 'admin-1',
        performedByName: 'Admin User',
        timestamp: new Date('2024-01-15T10:00:00'),
      },
      {
        id: 'activity-8',
        taskId: 'TSK-004',
        activityType: 'Assigned',
        description: 'Assigned to Rajesh Kumar',
        performedBy: 'admin-1',
        performedByName: 'Admin User',
        timestamp: new Date('2024-01-15T10:05:00'),
      },
      {
        id: 'activity-9',
        taskId: 'TSK-004',
        activityType: 'Photos Uploaded',
        description: 'Uploaded before and after photos',
        performedBy: 'user-1',
        performedByName: 'Rajesh Kumar',
        timestamp: new Date('2024-01-17T16:00:00'),
      },
      {
        id: 'activity-10',
        taskId: 'TSK-004',
        activityType: 'Completed',
        description: 'Task marked as complete',
        performedBy: 'user-1',
        performedByName: 'Rajesh Kumar',
        timestamp: new Date('2024-01-17T16:30:00'),
      },
      {
        id: 'activity-11',
        taskId: 'TSK-004',
        activityType: 'Verified',
        description: 'Task verified by Admin User',
        performedBy: 'admin-1',
        performedByName: 'Admin User',
        timestamp: new Date('2024-01-18T10:00:00'),
      },
    ],
  },
  {
    id: '5',
    taskId: 'TSK-005',
    title: 'Client Follow-up - Lead #45',
    description: 'Follow up with client regarding quotation for PEB structure',
    assignedUserId: 'user-4',
    assignedUserName: 'Priya Sharma',
    createdBy: 'admin-1',
    createdByName: 'Admin User',
    dueDate: new Date('2024-01-21'),
    priority: 'Medium',
    status: 'In Progress',
    progress: 40,
    linkedModule: 'Leads',
    linkedRecordId: 'lead-45',
    linkedRecordName: 'ABC Manufacturing - PEB Quotation',
    incentiveValue: 500,
    isPaymentEditable: false,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-19'),
  },
];

const mockSalaryAdjustments: SalaryAdjustment[] = [
  {
    id: 'adj-1',
    employeeId: 'user-1',
    employeeName: 'Rajesh Kumar',
    type: 'Bonus',
    amount: 2000,
    description: 'Performance bonus for completing 10 tasks on time',
    reason: 'Exceeds performance targets',
    referenceType: 'Bonus',
    status: 'Processed',
    approvedBy: 'admin-1',
    approvedByName: 'Admin User',
    approvedAt: new Date('2024-01-15'),
    processedAt: new Date('2024-01-16'),
    processedBy: 'admin-1',
    createdAt: new Date('2024-01-15'),
    createdBy: 'admin-1',
  },
  {
    id: 'adj-2',
    employeeId: 'user-2',
    employeeName: 'Amit Singh',
    type: 'Advance',
    amount: 5000,
    description: 'Salary advance for personal emergency',
    reason: 'Personal emergency',
    referenceType: 'Manual',
    status: 'Approved',
    approvedBy: 'admin-1',
    approvedByName: 'Admin User',
    approvedAt: new Date('2024-01-10'),
    createdAt: new Date('2024-01-10'),
    createdBy: 'admin-1',
  },
];

const mockTaskStats: TaskStats = {
  totalTasks: 5,
  openTasks: 2,
  inProgressTasks: 2,
  completedTasks: 2,
  verifiedTasks: 2,
  closedTasks: 0,
  cancelledTasks: 0,
  overdueTasks: 0,
  dueToday: 0,
  dueThisWeek: 2,
  tasksByPriority: {
    Low: 0,
    Medium: 2,
    High: 2,
    Critical: 1,
  },
  tasksByStatus: {
    Pending: 1,
    'In Progress': 2,
    Blocked: 0,
    Review: 0,
    Completed: 2,
    Cancelled: 0,
    Reopened: 0,
  },
  tasksByModule: {
    Leads: 1,
    Customers: 0,
    Projects: 3,
    Inventory: 1,
    Finance: 0,
    Documents: 0,
    General: 0,
    Estimates: 0,
    Proposals: 0,
    Quotations: 0,
    Invoices: 0,
    Purchases: 0,
  },
  pendingVerification: 1,
  completedToday: 0,
  totalPaymentValue: 12300,
  paymentPending: 8500,
  paymentProcessed: 3800,
};

const mockEmployeePerformance: EmployeePerformanceStats[] = [
  {
    employeeId: 'user-1',
    employeeName: 'Rajesh Kumar',
    tasksAssigned: 2,
    tasksCompleted: 2,
    tasksPending: 0,
    tasksOverdue: 0,
    tasksVerified: 2,
    tasksRejected: 0,
    completionRate: 100,
    onTimeCompletionRate: 100,
    averageCompletionTime: 2,
    baseSalary: 25000,
    verifiedTaskIncentives: 3300,
    bonuses: 2000,
    advances: 0,
    penalties: 0,
    finalPayable: 30300,
    totalPaymentPending: 0,
    totalPaymentReceived: 30300,
    totalPerformanceScore: 95,
    rank: 1,
    percentile: 95,
  },
  {
    employeeId: 'user-2',
    employeeName: 'Amit Singh',
    tasksAssigned: 1,
    tasksCompleted: 0,
    tasksPending: 1,
    tasksOverdue: 0,
    tasksVerified: 0,
    tasksRejected: 0,
    completionRate: 0,
    onTimeCompletionRate: 0,
    averageCompletionTime: 0,
    baseSalary: 22000,
    verifiedTaskIncentives: 0,
    bonuses: 0,
    advances: 5000,
    penalties: 0,
    finalPayable: 17000,
    totalPaymentPending: 17000,
    totalPaymentReceived: 0,
    totalPerformanceScore: 75,
    rank: 3,
    percentile: 75,
  },
  {
    employeeId: 'user-3',
    employeeName: 'Suresh Patel',
    tasksAssigned: 1,
    tasksCompleted: 0,
    tasksPending: 1,
    tasksOverdue: 0,
    tasksVerified: 0,
    tasksRejected: 0,
    completionRate: 0,
    onTimeCompletionRate: 0,
    averageCompletionTime: 0,
    baseSalary: 23000,
    verifiedTaskIncentives: 0,
    bonuses: 0,
    advances: 0,
    penalties: 0,
    finalPayable: 23000,
    totalPaymentPending: 23000,
    totalPaymentReceived: 0,
    totalPerformanceScore: 80,
    rank: 2,
    percentile: 80,
  },
];

const mockDashboardKPIs: DashboardTaskKPIs = {
  openTasks: 2,
  overdueTasks: 0,
  completedToday: 0,
  pendingVerification: 1,
  verifiedToday: 0,
  topPerformers: mockEmployeePerformance.slice(0, 3),
};

export const taskManagementApi = {
  // Task CRUD
  async getAll(query?: TaskQuery): Promise<Task[]> {
    try {
      return await api.get<Task[]>('/api/tasks', { params: query });
    } catch (error) {
      if (isConnectionError(error)) {
        // Mock fallback
        await new Promise(resolve => setTimeout(resolve, 300));
        
        let tasks = [...mockTasks];
        
        // Apply filters
        if (query?.filter) {
          const { status, priority, assignedUserId, linkedModule, search } = query.filter;
          
          if (status) {
            tasks = tasks.filter(task => task.status === status);
          }
          
          if (priority) {
            tasks = tasks.filter(task => task.priority === priority);
          }
          
          if (assignedUserId) {
            tasks = tasks.filter(task => task.assignedUserId === assignedUserId);
          }
          
          if (linkedModule) {
            tasks = tasks.filter(task => task.linkedModule === linkedModule);
          }
          
          if (search) {
            const searchLower = search.toLowerCase();
            tasks = tasks.filter(task =>
              task.title.toLowerCase().includes(searchLower) ||
              task.taskId.toLowerCase().includes(searchLower) ||
              task.description?.toLowerCase().includes(searchLower)
            );
          }
        }
        
        // Apply pagination
        if (query?.page && query?.pageSize) {
          const start = (query.page - 1) * query.pageSize;
          const end = start + query.pageSize;
          tasks = tasks.slice(start, end);
        }
        
        return tasks;
      }
      throw error;
    }
  },

  async getById(id: string): Promise<Task> {
    try {
      return await api.get<Task>(`/api/tasks/${id}`);
    } catch (error) {
      if (isConnectionError(error)) {
        // Mock fallback
        await new Promise(resolve => setTimeout(resolve, 200));
        const task = mockTasks.find(t => t.id === id);
        if (!task) throw new Error('Task not found');
        return task;
      }
      throw error;
    }
  },

  async create(data: CreateTaskDto): Promise<Task> {
    try {
      return await api.post<Task>('/api/tasks', data);
    } catch (error) {
      if (isConnectionError(error)) {
        // Mock fallback
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Note: File[] cannot be stored in mock data (browser-specific objects)
        // In production, these would be uploaded to S3 and stored as URLs
        // For frontend mock, we store empty arrays
        const newTask: Task = {
          id: (mockTasks.length + 1).toString(),
          taskId: `TSK-${String(mockTasks.length + 1).padStart(3, '0')}`,
          ...data,
          // Convert File[] to empty arrays for mock storage (File objects can't be serialized)
          completionProof: data.beforeImages ? {
            beforeImages: data.beforeImages,
            afterImages: [],
          } : undefined,
          // Convert checklist DTO to full ChecklistItem
          checklist: data.checklist?.map((item, index) => ({
            id: `checklist-${Date.now()}-${index}`,
            text: item.text,
            order: item.order,
            completed: false,
            completedAt: undefined,
            completedBy: undefined,
          })),
          assignedUserName: 'Unknown', // Should come from user service
          createdBy: 'system',
          createdByName: 'System',
          status: 'Pending',
          progress: 0,
          isPaymentEditable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          activityHistory: [
            createActivity(
              `TSK-${String(mockTasks.length + 1).padStart(3, '0')}`,
              'Created',
              'Task created',
              'system',
              'System'
            ),
            createActivity(
              `TSK-${String(mockTasks.length + 1).padStart(3, '0')}`,
              'Assigned',
              `Assigned to Unknown`,
              'system',
              'System'
            ),
          ],
        };
        mockTasks.push(newTask);
        return newTask;
      }
      throw error;
    }
  },

  async update(id: string, data: UpdateTaskDto): Promise<Task> {
    try {
      return await api.patch<Task>(`/api/tasks/${id}`, data);
    } catch (error) {
      if (isConnectionError(error)) {
        // Mock fallback
        await new Promise(resolve => setTimeout(resolve, 300));
        const index = mockTasks.findIndex(t => t.id === id);
        if (index === -1) throw new Error('Task not found');
        
        mockTasks[index] = {
          ...mockTasks[index],
          ...data,
          updatedAt: new Date(),
        };
        
        return mockTasks[index];
      }
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      return await api.delete<void>(`/api/tasks/${id}`);
    } catch (error) {
      if (isConnectionError(error)) {
        // Mock fallback
        await new Promise(resolve => setTimeout(resolve, 200));
        const index = mockTasks.findIndex(t => t.id === id);
        if (index === -1) throw new Error('Task not found');
        mockTasks.splice(index, 1);
      }
      throw error;
    }
  },

  // Task Completion with Photo Proof
  async complete(id: string, data: CompleteTaskDto): Promise<Task> {
    try {
      return await api.post<Task>(`/api/tasks/${id}/complete`, data);
    } catch (error) {
      if (isConnectionError(error)) {
        // Mock fallback
        await new Promise(resolve => setTimeout(resolve, 300));
        const index = mockTasks.findIndex(t => t.id === id);
        if (index === -1) throw new Error('Task not found');
        
        // Validate after photo proof is provided (mandatory)
        if (!data.completionProof.afterImages || data.completionProof.afterImages.length === 0) {
          throw new Error('After photo proof is mandatory for task completion');
        }
        
        const task = mockTasks[index];
        const newActivity = createActivity(
          task.taskId,
          'Photos Uploaded',
          `Uploaded ${data.completionProof.beforeImages.length} before and ${data.completionProof.afterImages.length} after photos`,
          task.assignedUserId,
          task.assignedUserName
        );
        
        const completeActivity = createActivity(
          task.taskId,
          'Completed',
          'Task marked as complete',
          task.assignedUserId,
          task.assignedUserName
        );
        
        mockTasks[index] = {
          ...mockTasks[index],
          status: 'Completed',
          progress: 100,
          completionProof: {
            ...data.completionProof,
            uploadedAt: new Date(),
          },
          completedAt: data.completedAt,
          updatedAt: new Date(),
          activityHistory: [
            ...(task.activityHistory || []),
            newActivity,
            completeActivity,
          ],
        };
        
        return mockTasks[index];
      }
      throw error;
    }
  },

  // Task Verification
  async verify(id: string, data: VerifyTaskDto, verifiedBy: string, verifiedByName: string): Promise<Task> {
    try {
      return await api.post<Task>(`/api/tasks/${id}/verify`, { ...data, verifiedBy, verifiedByName });
    } catch (error) {
      if (isConnectionError(error)) {
        // Mock fallback
        await new Promise(resolve => setTimeout(resolve, 300));
        const index = mockTasks.findIndex(t => t.id === id);
        if (index === -1) throw new Error('Task not found');
        
        // Payment and performance only count after verification
        // If rejected, status goes back to 'In Progress' for re-completion
        const newStatus = data.status === 'Verified' ? 'Completed' : 'In Progress';
        
        const task = mockTasks[index];
        const activityType = data.status === 'Verified' ? 'Verified' : 'Rejected';
        const description = data.status === 'Verified' 
          ? `Task verified by ${verifiedByName}`
          : `Task rejected by ${verifiedByName}: ${data.verificationNotes || 'No reason provided'}`;
        
        const newActivity = createActivity(
          task.taskId,
          activityType,
          description,
          verifiedBy,
          verifiedByName
        );
        
        mockTasks[index] = {
          ...mockTasks[index],
          status: newStatus,
          verifiedBy,
          verifiedByName,
          verificationNotes: data.verificationNotes,
          verifiedAt: data.verifiedAt,
          updatedAt: new Date(),
          activityHistory: [
            ...(task.activityHistory || []),
            newActivity,
          ],
        };
        
        return mockTasks[index];
      }
      throw error;
    }
  },

  // Stats
  async getStats(): Promise<TaskStats> {
    try {
      return await api.get<TaskStats>('/api/tasks/stats');
    } catch (error) {
      if (isConnectionError(error)) {
        // Mock fallback
        await new Promise(resolve => setTimeout(resolve, 200));
        return mockTaskStats;
      }
      throw error;
    }
  },

  async getDashboardKPIs(): Promise<DashboardTaskKPIs> {
    try {
      return await api.get<DashboardTaskKPIs>('/api/tasks/dashboard-kpis');
    } catch (error) {
      if (isConnectionError(error)) {
        // Mock fallback
        await new Promise(resolve => setTimeout(resolve, 200));
        return mockDashboardKPIs;
      }
      throw error;
    }
  },

  // Employee Performance
  async getEmployeePerformance(employeeId?: string): Promise<EmployeePerformanceStats[]> {
    try {
      const params = employeeId ? { employeeId } : undefined;
      return await api.get<EmployeePerformanceStats[]>('/api/tasks/employee-performance', { params });
    } catch (error) {
      if (isConnectionError(error)) {
        // Mock fallback
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Calculate performance stats dynamically from tasks
        // Payment only counts after verification
        const employeeIds = employeeId ? [employeeId] : [...new Set(mockTasks.map(t => t.assignedUserId))];
    
        const performanceStats: EmployeePerformanceStats[] = employeeIds.map(empId => {
          const employeeTasks = mockTasks.filter(t => t.assignedUserId === empId);
          const verifiedTasks = employeeTasks.filter(t => t.verifiedBy && t.verifiedAt); // Tasks that have been verified
          const rejectedTasks = employeeTasks.filter(t => t.status === 'In Progress' && t.verificationNotes); // Tasks that were rejected
          
          const tasksAssigned = employeeTasks.length;
          const tasksCompleted = employeeTasks.filter(t => t.status === 'Completed').length;
          const tasksPending = employeeTasks.filter(t => t.status === 'Pending' || t.status === 'In Progress' || t.status === 'Blocked' || t.status === 'Review').length;
          const tasksOverdue = employeeTasks.filter(t => 
            t.status !== 'Completed' && 
            t.dueDate < new Date()
          ).length;
          const tasksVerified = verifiedTasks.length;
          
          // Calculate earnings only from verified tasks
          const verifiedTaskIncentives = verifiedTasks.reduce((sum, t) => sum + t.incentiveValue, 0);
          
          // Get base salary from mock data (in production, this would come from employee record)
          const baseSalary = mockEmployeePerformance.find(e => e.employeeId === empId)?.baseSalary || 25000;
          
          // Get bonuses, advances, penalties from salary adjustments
          const employeeAdjustments = mockSalaryAdjustments.filter(adj => adj.employeeId === empId);
          const bonuses = employeeAdjustments
            .filter(adj => adj.type === 'Bonus' && adj.status === 'Processed')
            .reduce((sum, adj) => sum + adj.amount, 0);
          const advances = employeeAdjustments
            .filter(adj => adj.type === 'Advance' && adj.status === 'Processed')
            .reduce((sum, adj) => sum + adj.amount, 0);
          const penalties = employeeAdjustments
            .filter(adj => adj.type === 'Penalty' && adj.status === 'Processed')
            .reduce((sum, adj) => sum + adj.amount, 0);
          
          const finalPayable = baseSalary + verifiedTaskIncentives + bonuses - advances - penalties;
          
          const completionRate = tasksAssigned > 0 ? Math.round((tasksVerified / tasksAssigned) * 100) : 0;
          
          // Calculate average completion time (in days)
          const completedTasksWithTime = verifiedTasks.filter(t => t.completedAt && t.createdAt);
          const avgCompletionTime = completedTasksWithTime.length > 0
            ? completedTasksWithTime.reduce((sum, t) => {
                const days = Math.floor((t.completedAt!.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60 * 24));
                return sum + days;
              }, 0) / completedTasksWithTime.length
            : 0;
          
          // Calculate on-time completion rate
          const onTimeCompletions = verifiedTasks.filter(t => t.completedAt && t.completedAt <= t.dueDate).length;
          const onTimeCompletionRate = tasksVerified > 0 ? Math.round((onTimeCompletions / tasksVerified) * 100) : 0;
          
          // Calculate performance score (based on completion rate, timeliness, and quality)
          const performanceScore = Math.round(
            (completionRate * 0.4) + 
            (onTimeCompletionRate * 0.3) + 
            (tasksVerified > 0 ? 30 : 0) // Bonus for having verified tasks
          );
          
          return {
            employeeId: empId,
            employeeName: mockTasks.find(t => t.assignedUserId === empId)?.assignedUserName || 'Unknown',
            tasksAssigned,
            tasksCompleted,
            tasksPending,
            tasksOverdue,
            tasksVerified,
            tasksRejected: rejectedTasks.length,
            completionRate,
            onTimeCompletionRate,
            averageCompletionTime: Math.round(avgCompletionTime),
            baseSalary,
            verifiedTaskIncentives,
            bonuses,
            advances,
            penalties,
            finalPayable,
            totalPaymentPending: finalPayable,
            totalPaymentReceived: 0, // In production, this would track actual payments
            totalPerformanceScore: performanceScore,
          };
        });
        
        // Sort by performance score
        performanceStats.sort((a, b) => b.totalPerformanceScore - a.totalPerformanceScore);
        
        // Add rankings
        performanceStats.forEach((emp, index) => {
          emp.rank = index + 1;
          emp.percentile = Math.round(((performanceStats.length - index) / performanceStats.length) * 100);
        });
        
        if (employeeId) {
          return performanceStats.filter(emp => emp.employeeId === employeeId);
        }
        
        return performanceStats;
      }
      throw error;
    }
  },

  async getEmployeeSalaryLedger(employeeId: string, periodStart: Date, periodEnd: Date): Promise<EmployeeSalaryLedger> {
    try {
      return await api.get<EmployeeSalaryLedger>(`/api/tasks/employee-salary-ledger/${employeeId}`, {
        params: { periodStart: periodStart.toISOString(), periodEnd: periodEnd.toISOString() }
      });
    } catch (error) {
      if (isConnectionError(error)) {
        // Mock fallback
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const employee = mockEmployeePerformance.find(emp => emp.employeeId === employeeId);
        if (!employee) throw new Error('Employee not found');
        
        const employeeAdjustments = mockSalaryAdjustments.filter(
          adj => adj.employeeId === employeeId &&
          adj.createdAt >= periodStart &&
          adj.createdAt <= periodEnd
        );
        
        const bonuses = employeeAdjustments
          .filter(adj => adj.type === 'Bonus' && adj.status === 'Processed')
          .reduce((sum, adj) => sum + adj.amount, 0);
        
        const advances = employeeAdjustments
          .filter(adj => adj.type === 'Advance' && adj.status === 'Processed')
          .reduce((sum, adj) => sum + adj.amount, 0);
        
        const penalties = employeeAdjustments
          .filter(adj => adj.type === 'Penalty' && adj.status === 'Processed')
          .reduce((sum, adj) => sum + adj.amount, 0);
        
        return {
          employeeId,
          employeeName: employee.employeeName,
          openingBalance: 0,
          taskEarnings: employee.verifiedTaskIncentives,
          bonuses,
          otherCredits: 0,
          advances,
          penalties,
          otherDeductions: 0,
          currentPayable: employee.verifiedTaskIncentives + bonuses - advances - penalties,
          totalPaid: employee.totalPaymentReceived,
          lastPaymentDate: new Date(),
          adjustments: employeeAdjustments,
          periodStart,
          periodEnd,
        };
      }
      throw error;
    }
  },

  // Salary Adjustments CRUD
  async getSalaryAdjustments(query?: SalaryAdjustmentQuery): Promise<SalaryAdjustment[]> {
    try {
      return await api.get<SalaryAdjustment[]>('/api/tasks/salary-adjustments', { params: query });
    } catch (error) {
      if (isConnectionError(error)) {
        // Mock fallback
        await new Promise(resolve => setTimeout(resolve, 300));
        
        let adjustments = [...mockSalaryAdjustments];
        
        // Apply filters
        if (query?.filter) {
          const { employeeId, type, status } = query.filter;
          
          if (employeeId) {
            adjustments = adjustments.filter(adj => adj.employeeId === employeeId);
          }
          
          if (type) {
            adjustments = adjustments.filter(adj => adj.type === type);
          }
          
          if (status) {
            adjustments = adjustments.filter(adj => adj.status === status);
          }
        }
        
        // Apply pagination
        if (query?.page && query?.pageSize) {
          const start = (query.page - 1) * query.pageSize;
          const end = start + query.pageSize;
          adjustments = adjustments.slice(start, end);
        }
        
        return adjustments;
      }
      throw error;
    }
  },

  async getSalaryAdjustmentById(id: string): Promise<SalaryAdjustment> {
    try {
      return await api.get<SalaryAdjustment>(`/api/tasks/salary-adjustments/${id}`);
    } catch (error) {
      if (isConnectionError(error)) {
        // Mock fallback
        await new Promise(resolve => setTimeout(resolve, 200));
        const adjustment = mockSalaryAdjustments.find(a => a.id === id);
        if (!adjustment) throw new Error('Salary adjustment not found');
        return adjustment;
      }
      throw error;
    }
  },

  async createSalaryAdjustment(data: CreateSalaryAdjustmentDto): Promise<SalaryAdjustment> {
    try {
      return await api.post<SalaryAdjustment>('/api/tasks/salary-adjustments', data);
    } catch (error) {
      if (isConnectionError(error)) {
        // Mock fallback
        await new Promise(resolve => setTimeout(resolve, 300));
        const newAdjustment: SalaryAdjustment = {
          id: `adj-${mockSalaryAdjustments.length + 1}`,
          ...data,
          status: 'Pending',
          createdAt: new Date(),
          createdBy: 'admin-1', // Should come from auth context
        };
        mockSalaryAdjustments.push(newAdjustment);
        return newAdjustment;
      }
      throw error;
    }
  },

  async updateSalaryAdjustment(id: string, data: UpdateSalaryAdjustmentDto): Promise<SalaryAdjustment> {
    try {
      return await api.patch<SalaryAdjustment>(`/api/tasks/salary-adjustments/${id}`, data);
    } catch (error) {
      if (isConnectionError(error)) {
        // Mock fallback
        await new Promise(resolve => setTimeout(resolve, 300));
        const index = mockSalaryAdjustments.findIndex(a => a.id === id);
        if (index === -1) throw new Error('Salary adjustment not found');
        
        mockSalaryAdjustments[index] = {
          ...mockSalaryAdjustments[index],
          ...data,
        };
        
        return mockSalaryAdjustments[index];
      }
      throw error;
    }
  },

  async deleteSalaryAdjustment(id: string): Promise<void> {
    try {
      return await api.delete<void>(`/api/tasks/salary-adjustments/${id}`);
    } catch (error) {
      if (isConnectionError(error)) {
        // Mock fallback
        await new Promise(resolve => setTimeout(resolve, 200));
        const index = mockSalaryAdjustments.findIndex(a => a.id === id);
        if (index === -1) throw new Error('Salary adjustment not found');
        mockSalaryAdjustments.splice(index, 1);
      }
      throw error;
    }
  },

  async approveSalaryAdjustment(id: string, approvedBy: string, approvedByName: string): Promise<SalaryAdjustment> {
    try {
      return await api.post<SalaryAdjustment>(`/api/tasks/salary-adjustments/${id}/approve`, { approvedBy, approvedByName });
    } catch (error) {
      if (isConnectionError(error)) {
        // Mock fallback
        await new Promise(resolve => setTimeout(resolve, 300));
        const index = mockSalaryAdjustments.findIndex(a => a.id === id);
        if (index === -1) throw new Error('Salary adjustment not found');
        
        mockSalaryAdjustments[index] = {
          ...mockSalaryAdjustments[index],
          status: 'Approved',
          approvedBy,
          approvedByName,
          approvedAt: new Date(),
        };
        
        return mockSalaryAdjustments[index];
      }
      throw error;
    }
  },

  async processSalaryAdjustment(id: string, processedBy: string): Promise<SalaryAdjustment> {
    try {
      return await api.post<SalaryAdjustment>(`/api/tasks/salary-adjustments/${id}/process`, { processedBy });
    } catch (error) {
      if (isConnectionError(error)) {
        // Mock fallback
        await new Promise(resolve => setTimeout(resolve, 300));
        const index = mockSalaryAdjustments.findIndex(a => a.id === id);
        if (index === -1) throw new Error('Salary adjustment not found');
        
        mockSalaryAdjustments[index] = {
          ...mockSalaryAdjustments[index],
          status: 'Processed',
          processedBy,
          processedAt: new Date(),
        };
        
        return mockSalaryAdjustments[index];
      }
      throw error;
    }
  },
};
