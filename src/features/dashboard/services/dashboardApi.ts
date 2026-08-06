/**
 * Dashboard API Service
 * Single backend aggregation endpoint for the executive dashboard.
 */
import { api } from '@/core/api';

export interface DashboardOverviewParams {
  dateRange?: string;
  customFrom?: string;
  customTo?: string;
  projectId?: string;
}

export interface CardValue {
  value: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'flat';
  lastUpdated: string;
}

export interface SeriesPoint {
  name: string;
  value: number;
}

export interface ActivityItem {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  projectCode?: string;
  projectName?: string;
  previousStatus?: string | null;
  currentStatus?: string;
  user?: string;
  userId?: string;
  avatar?: string | null;
  reason?: string | null;
  timestamp: Date;
  clickable?: boolean;
}

export interface DashboardOverview {
  generatedAt: string;
  dateRange: {
    key: string;
    label: string;
    from: Date | null;
    to: Date | null;
  };
  performance: { executionMs: number };
  summary: {
    leads: CardValue & { total: number; newInPeriod: number; converted: number; conversionRate: number };
    customers: CardValue & { total: number; active: number };
    projects: CardValue & { total: number; active: number; completed: number; delayed: number };
    purchaseOrders: CardValue & { total: number; open: number; completed: number; cancelled: number };
    inventory: CardValue & { totalValue: number; items: number; lowStock: number };
    revenue: CardValue;
    expenses: CardValue;
    tasks: CardValue & { today: number; overdue: number; completed: number };
    notifications: CardValue & { total: number; unread: number };
    profit: CardValue;
  };
  charts: {
    salesTrend: SeriesPoint[];
    purchaseTrend: SeriesPoint[];
    revenueTrend: SeriesPoint[];
    expenseTrend: SeriesPoint[];
    revenueVsExpense: Array<{ name: string; revenue: number; expense: number }>;
    monthlyLeads: SeriesPoint[];
    monthlyCustomers: SeriesPoint[];
    projectsByStatus: SeriesPoint[];
    projectCompletion: SeriesPoint[];
    inventoryByCategory: Array<{ name: string; value: number; count: number }>;
    inventoryValueTrend: SeriesPoint[];
    purchaseStatus: SeriesPoint[];
    taskStatus: SeriesPoint[];
    leadSource: SeriesPoint[];
    leadStatus: SeriesPoint[];
    cashFlow: Array<{ name: string; inflow: number; outflow: number }>;
    profitTrend: SeriesPoint[];
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    pending: number;
    onTrack: number;
    atRisk: number;
    overdue: number;
    blocked: number;
    delayed: number;
    completedPercent: number;
    overduePercent: number;
    byStatus: SeriesPoint[];
    byHealth: SeriesPoint[];
    totalValue: number;
    pendingSalesValue: number;
  };
  timeline: {
    today: Array<Record<string, unknown>>;
    thisWeek: Array<Record<string, unknown>>;
    thisMonth: Array<Record<string, unknown>>;
    late: Array<Record<string, unknown>>;
    completed: Array<Record<string, unknown>>;
  };
  notifications: {
    total: number;
    unread: number;
    mentions: number;
    recent: Array<Record<string, unknown>>;
  };
  activities: ActivityItem[];
  inventory: {
    totalValue: number;
    items: number;
    lowStock: number;
    outOfStock: number;
    incomingStock: number;
    outgoingStock: number;
    statusCounts: Record<string, number>;
    byCategory: Array<{ name: string; value: number; count: number }>;
    warehouses: Array<{ id: string; name: string; value: number; occupancy: number; capacity: number }>;
    recentMovements: Array<Record<string, unknown>>;
  };
  purchase: {
    total: number;
    open: number;
    completed: number;
    cancelled: number;
    totalPurchase: number;
    vendorSpend: SeriesPoint[];
    topVendors: SeriesPoint[];
    averageOrderValue: number;
  };
  leads: {
    converted: number;
    lost: number;
    won: number;
    averageConversionTimeDays: number;
    funnel: SeriesPoint[];
  };
  tasks: {
    today: number;
    overdue: number;
    completed: number;
    pending: number;
    inProgress: number;
    review: number;
    rejected: number;
    cancelled: number;
    averageCompletionDays: number;
    byStatus: SeriesPoint[];
  };
  revenue: {
    total: number;
    expenses: number;
    profit: number;
    pendingSales: number;
    monthlyGrowth: number;
  };
}

export interface GanttTask {
  id: string;
  taskId: number | null;
  name: string;
  description: string | null;
  projectId: string;
  project: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  progress: number;
  owner: string | null;
  priority: string;
  status: string;
  dependencies: string[];
  estimatedHours: number | null;
  workedHours: number | null;
  delay: number;
  slack: number;
  actualStart: Date | null;
  color: string;
}

export interface GanttPhase {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  tasks: GanttTask[];
}

export interface GanttProject {
  id: string;
  projectId: number;
  projectCode: string;
  projectName: string;
  customerName: string;
  projectType: string;
  status: string;
  stage: string | null;
  progress: number;
  startDate: Date | null;
  endDate: Date | null;
  healthStatus: string;
  manager: string | null;
  managerId: string | null;
  priority: string;
  createdAt: Date;
  color: string;
  milestones: Array<{
    id: string;
    name: string;
    plannedDate: Date | null;
    actualDate: Date | null;
    status: string;
  }>;
  phases: GanttPhase[];
  totalTasks: number;
  duration: number;
}

export interface DashboardGantt {
  projects: GanttProject[];
  totalProjects: number;
  totalTasks: number;
  startDate: Date | null;
  endDate: Date | null;
}

export const dashboardApi = {
  getOverview: (params: DashboardOverviewParams) =>
    api.get<{ message: string; data: DashboardOverview }>('/dashboard', { params }).then((res) => res.data),
  getGantt: (params: DashboardOverviewParams) =>
    api.get<{ message: string; data: DashboardGantt }>('/dashboard/gantt', { params }).then((res) => res.data),
};
