/**
 * Dashboard Types
 * Structured for future API integration
 */

// ============================================================================
// KPI Types
// ============================================================================

export interface KPICardData {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  navigateTo: string;
  color: string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  loading?: boolean;
  error?: string | null;
}

export interface DashboardKPIs {
  revenue: number;
  expectedRevenue: number;
  wonValue: number;
  activeProjects: number;
  leads: number;
  quotations: number;
  customers: number;
  inventoryValue: number;
}

// ============================================================================
// Chart Types
// ============================================================================

export interface SalesFunnelData {
  name: string;
  value: number;
  color?: string;
  comparisonValue?: number;
}

export interface RevenueTrendData {
  name: string;
  revenue: number;
  previous?: number;
}

export interface QuotationStatusData {
  name: string;
  value: number;
  color?: string;
}

export interface ProjectPipelineData {
  stage: string;
  count: number;
  value: number;
  percentage: string;
  color?: string;
}

export interface InventoryAnalyticsData {
  name: string;
  value: number;
  color?: string;
}

// ============================================================================
// Activity Types
// ============================================================================

export type ActivityType = 'lead' | 'project' | 'quotation' | 'task';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  user: string;
  status?: string;
}

// ============================================================================
// Table Types
// ============================================================================

export interface RecentQuotation {
  id: string;
  quotationNumber: string;
  customerName: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected';
  createdAt: Date;
}

export interface RecentLead {
  id: string;
  companyName: string;
  projectTitle: string;
  source: string;
  assignedTo: string;
  status: string;
  createdAt: Date;
}

// ============================================================================
// Filter Types
// ============================================================================

export type DateRange = 'today' | 'this_week' | 'this_month' | 'last_month' | 'this_quarter' | 'last_quarter' | 'this_year' | 'last_year' | 'all_time';

export type ComparisonMode = 'none' | 'previous_period' | 'previous_year';

export type ComparisonGranularity = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface DashboardFilters {
  dateRange: DateRange;
  comparisonMode: ComparisonMode;
  comparisonGranularity: ComparisonGranularity;
}

// ============================================================================
// API Response Types (for future integration)
// ============================================================================

export interface DashboardStatsResponse {
  executiveKPIs: DashboardKPIs;
  salesFunnel: SalesFunnelData[];
  revenueTrend12Months: RevenueTrendData[];
  quotationStatus: QuotationStatusData[];
  projectPipeline: ProjectPipelineData[];
  inventoryAnalytics: InventoryAnalyticsData[];
  inventoryTotalValue: number;
  recentActivities: Activity[];
  recentQuotations: RecentQuotation[];
  recentLeads: RecentLead[];
}

export interface DashboardStatsParams {
  dateRange: DateRange;
  comparisonMode?: ComparisonMode;
  comparisonGranularity?: ComparisonGranularity;
}

// ============================================================================
// Component State Types
// ============================================================================

export type ComponentState = 'loading' | 'success' | 'error' | 'empty';

export interface ComponentProps {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
}
