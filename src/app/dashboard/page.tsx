'use client';

import { useState, useMemo, lazy, Suspense, useCallback, useEffect } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { ModernKPICard, type KpiPeriodData } from '@/components/dashboard/ModernKPICard';
import { DashboardFilter, DateRange } from '@/features/dashboard';
import { useDashboardOverview } from '@/features/dashboard/hooks/useDashboardOverview';
import { useDashboardGantt } from '@/features/dashboard/hooks/useDashboardGantt';
import { ExportButton } from '@/features/dashboard/components/ExportButton';
import { DashboardExportData, ExportStatus, ExportType } from '@/features/dashboard/types/pdf';
import { CardSkeleton } from '@/components/loading/CardSkeleton';
import { ChartSkeleton } from '@/components/loading/ChartSkeleton';
import type { GanttProject } from '@/features/dashboard/services/dashboardApi';
import type { StatusUpdate } from '@/features/dashboard/hooks/useRecentStatusUpdates';
import {
  DollarSign,
  TrendingUp,
  FolderKanban,
  Users,
  FileText,
  Building2,
  Package,
  ShoppingCart,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { componentTextSizes } from '@/lib/design-system';
import { useModuleEnabled } from '@/features/settings/hooks/useSettings';
import { RouteGuard } from '@/features/auth/RouteGuard';
import { useAuth } from '@/features/auth/AuthContext';

// Lazy load widgets for faster initial paint
const ProjectStatusGrid = lazy(() => import('@/components/dashboard/ProjectStatusGrid').then(m => ({ default: m.ProjectStatusGrid })));
const ProjectTimeline = lazy(() => import('@/components/dashboard/ProjectTimeline').then(m => ({ default: m.ProjectTimeline })));
const DetailedGanttChart = lazy(() => import('@/components/dashboard/DetailedGanttChart').then(m => ({ default: m.DetailedGanttChart })));
const RecentStatusUpdates = lazy(() => import('@/components/dashboard/RecentStatusUpdates').then(m => ({ default: m.RecentStatusUpdates })));
const ChartCard = lazy(() => import('@/components/dashboard/ChartCard').then(mod => ({ default: mod.ChartCard })));
const DynamicChart = lazy(() => import('@/components/dashboard/DynamicChart').then(mod => ({ default: mod.DynamicChart })));

import { type ProjectStatus } from '@/features/dashboard/data/projectTypes';

const CLOSED_PROJECT_STATUSES = ['Completion', 'After Sales'];

function toProjectStatus(p: GanttProject): ProjectStatus {
  if (p.status === 'Cancelled') return 'Cancelled';
  if (CLOSED_PROJECT_STATUSES.includes(p.status) || p.progress >= 100) return 'Completed';
  if (p.endDate && p.endDate.getTime() < Date.now() && p.status !== 'Cancelled') return 'Overdue';
  if (p.healthStatus === 'At Risk' || p.healthStatus === 'Critical') return 'At Risk';
  return 'On Track';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { enabled: purchasesEnabled } = useModuleEnabled('purchases');
  const { enabled: inventoryEnabled } = useModuleEnabled('inventory');
  const { enabled: leadsEnabled } = useModuleEnabled('leads');
  const { enabled: projectsEnabled } = useModuleEnabled('projects');
  const { enabled: financeEnabled } = useModuleEnabled('finance');
  const [dateRange, setDateRange] = useState<DateRange>('this_month');
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');
  const [exportState, setExportState] = useState({
    isGenerating: false,
    status: 'idle' as ExportStatus,
    progress: 0,
    message: '',
  });
  const [projectStatusFilter, setProjectStatusFilter] = useState<"All" | ProjectStatus>("All");
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();

  const { data: dashboardData, isLoading } = useDashboardOverview({
    dateRange,
    customFrom: dateRange === 'custom' ? customFrom : undefined,
    customTo: dateRange === 'custom' ? customTo : undefined,
  });
  const { data: ganttData } = useDashboardGantt(true);

  const overview = dashboardData;
  const summary = overview?.summary;
  const charts = overview?.charts;
  const ganttProjects = ganttData?.projects ?? [];

  // Auto-open the Gantt chart with the first project so it isn't stuck on the placeholder
  useEffect(() => {
    if (!selectedProjectId && ganttProjects.length > 0) {
      setSelectedProjectId(ganttProjects[0].id);
    }
  }, [ganttProjects, selectedProjectId]);

  // Paint KPIs as soon as CRM stats are ready
  const isDashboardReady = !isLoading;

  // Format currency values - memoized to prevent unnecessary re-renders
  const formatCurrency = useCallback((value: number): string => {
    if (isNaN(value) || value === 0) return '₹0';
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    }
    return `₹${value.toLocaleString('en-IN')}`;
  }, []);

  // Format percentage change - memoized to prevent unnecessary re-renders
  const formatChange = useCallback((value: number): string => {
    if (isNaN(value) || value === 0) return '0%';
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  }, []);

  // Determine trend direction - memoized to prevent unnecessary re-renders
  const getTrend = useCallback((value: number): 'up' | 'down' => {
    return value >= 0 ? 'up' : 'down';
  }, []);

  interface KPICardConfig {
    label: string;
    icon: any;
    accent: 'blue' | 'emerald' | 'amber' | 'violet' | 'rose' | 'sky' | 'cyan' | 'indigo' | 'purple' | 'green';
    periods: { monthly: KpiPeriodData; yearly: KpiPeriodData };
    navigateTo?: string;
    queryParams?: Record<string, string>;
  }

  const kpiCards = useMemo<KPICardConfig[]>(() => {
    if (!summary) return [];
    const cards: KPICardConfig[] = [];
    if (purchasesEnabled) {
      cards.push({
        label: 'Total Purchases',
        icon: ShoppingCart,
        accent: 'violet' as const,
        periods: {
          monthly: {
            value: summary.purchaseOrders.total.toString(),
            delta: formatChange(summary.purchaseOrders.change),
            trend: getTrend(summary.purchaseOrders.change),
            hint: 'Total purchase orders',
          },
          yearly: {
            value: summary.purchaseOrders.total.toString(),
            delta: formatChange(summary.purchaseOrders.change),
            trend: getTrend(summary.purchaseOrders.change),
            hint: 'Total purchase orders YTD',
          },
        },
        navigateTo: '/purchase/orders',
      });
    }
    if (financeEnabled) {
      cards.push({
        label: 'Total Sales',
        icon: DollarSign,
        accent: 'emerald' as const,
        periods: {
          monthly: {
            value: formatCurrency(summary.revenue.value),
            delta: formatChange(summary.revenue.change),
            trend: getTrend(summary.revenue.change),
            hint: 'Revenue in selected period',
          },
          yearly: {
            value: formatCurrency(summary.revenue.value),
            delta: formatChange(summary.revenue.change),
            trend: getTrend(summary.revenue.change),
            hint: 'Total revenue in selected period',
          },
        },
        navigateTo: '/dashboard/finance',
      });
    }
    if (projectsEnabled) {
      cards.push({
        label: 'Active Projects',
        icon: FolderKanban,
        accent: 'blue' as const,
        periods: {
          monthly: {
            value: summary.projects.active.toString(),
            delta: formatChange(summary.projects.change),
            trend: getTrend(summary.projects.change),
            hint: 'Active projects in selected period',
          },
          yearly: {
            value: summary.projects.total.toString(),
            delta: formatChange(summary.projects.change),
            trend: getTrend(summary.projects.change),
            hint: 'Total projects',
          },
        },
        navigateTo: '/dashboard/projects',
        queryParams: { status: 'Active' },
      });
    }
    if (leadsEnabled) {
      cards.push({
        label: 'Total Leads',
        icon: Users,
        accent: 'sky' as const,
        periods: {
          monthly: {
            value: summary.leads.total.toString(),
            delta: formatChange(summary.leads.change),
            trend: getTrend(summary.leads.change),
            hint: 'Total leads',
          },
          yearly: {
            value: summary.leads.total.toString(),
            delta: formatChange(summary.leads.change),
            trend: getTrend(summary.leads.change),
            hint: 'Total leads',
          },
        },
        navigateTo: '/dashboard/leads',
      });
    }
    return cards;
  }, [summary, formatCurrency, formatChange, getTrend, purchasesEnabled, financeEnabled, projectsEnabled, leadsEnabled]);

  // Real chart data from the aggregated /dashboard endpoint
  const purchasesTrendData = charts?.purchaseTrend ?? [];
  const salesTrendData = (charts?.revenueVsExpense ?? []).map((p) => ({
    name: p.name,
    pipeline: p.revenue,
    won: p.expense,
  }));
  const leadsSourceData = charts?.leadSource ?? [];
  const revenueData = charts?.revenueTrend ?? [];
  const projectsTrendData = charts?.projectsByStatus ?? [];
  const inventoryValueData = charts?.inventoryValueTrend ?? [];

  // Project status grid counts + shares
  const statusGridData = useMemo(() => {
    const total = overview?.projects.total || 0;
    const buckets: Record<ProjectStatus, number> = {
      'On Track': overview?.projects.onTrack || 0,
      'At Risk': overview?.projects.atRisk || 0,
      Overdue: overview?.projects.overdue || 0,
      Completed: overview?.projects.completed || 0,
      Cancelled: overview?.projects.cancelled || 0,
    };
    const out = {} as Record<ProjectStatus, { count: number; prev: number; share: number }>;
    (Object.keys(buckets) as ProjectStatus[]).forEach((key) => {
      out[key] = {
        count: buckets[key],
        prev: 0,
        share: total > 0 ? Math.round((buckets[key] / total) * 100) : 0,
      };
    });
    return out;
  }, [overview?.projects]);

  // Timeline rows derived from gantt project rows (real schedules)
  const timelineRows = useMemo(() => {
    return ganttProjects
      .filter((p) => p.startDate && p.endDate)
      .map((p) => ({
        id: p.id,
        customer: p.projectName,
        type: p.projectType || 'Project',
        start: (p.startDate as Date).toISOString(),
        end: (p.endDate as Date).toISOString(),
        progress: p.progress,
        status: toProjectStatus(p),
      }));
  }, [ganttProjects]);

  // Recent project status updates derived from the activity feed
  const statusUpdates = useMemo<StatusUpdate[]>(() => {
    const activities = overview?.activities ?? [];
    return activities
      .filter((a) => a.entityType === 'project')
      .slice(0, 10)
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
  }, [overview?.activities]);

  const handleExport = async (type: ExportType) => {
    // Currently only PDF is supported
    if (type !== 'pdf') {
      return;
    }

    setExportState({ isGenerating: true, status: 'preparing', progress: 0, message: 'Preparing Data...' });

    try {
      // Wait for charts to render before export
      setExportState({ isGenerating: true, status: 'preparing', progress: 5, message: 'Waiting for charts to render...' });

      const charts = await waitForChartsToRender();

      const { PDFExportService } = await import('@/features/dashboard/services/pdf/PDFExportService');
      const service = new PDFExportService((status, message, progress) => {
        setExportState({ isGenerating: true, status, message, progress });
      });

      // Prepare dashboard data for export
      const dashboardExportData: DashboardExportData = {
        kpis: {
          revenue: formatCurrency(summary?.revenue.value || 0),
          expectedRevenue: formatCurrency(summary?.revenue.value || 0),
          wonValue: formatCurrency(summary?.revenue.value || 0),
          activeProjects: summary?.projects.active || 0,
          leads: summary?.leads.newInPeriod || 0,
          quotations: summary?.leads.converted || 0,
          customers: summary?.customers.active || 0,
          inventory: formatCurrency(summary?.inventory.totalValue || 0),
          revenueGrowth: formatChange(summary?.revenue.change || 0),
          conversionRate:
            summary?.leads && summary.leads.newInPeriod > 0
              ? `${summary.leads.conversionRate.toFixed(1)}%`
              : '0%',
          topPerformingStage: (summary?.projects.active ?? 0) > 0 ? 'Fabrication' : 'N/A',
          revenueChange: formatChange(summary?.revenue.change || 0),
          leadsChange: formatChange(summary?.leads.change || 0),
          projectsChange: formatChange(summary?.projects.change || 0),
          quotationsChange: '0%',
          customersChange: formatChange(summary?.customers.change || 0),
          inventoryChange: formatChange(summary?.inventory.change || 0),
        },
        comparisonData: {
          previousRevenue: formatCurrency(summary?.revenue.previous || 0),
          previousLeads: summary?.leads.previous || 0,
          previousProjects: summary?.projects.previous || 0,
          previousCustomers: summary?.customers.previous || 0,
          previousQuotations: 0,
          previousInventory: formatCurrency(summary?.inventory.previous || 0),
          revenueChangePercent: formatChange(summary?.revenue.change || 0),
          leadsChangePercent: formatChange(summary?.leads.change || 0),
          projectsChangePercent: formatChange(summary?.projects.change || 0),
          customersChangePercent: formatChange(summary?.customers.change || 0),
          quotationsChangePercent: '0%',
          inventoryChangePercent: formatChange(summary?.inventory.change || 0),
        },
        recordCounts: {
          leads: summary?.leads.newInPeriod || 0,
          projects: summary?.projects.active || 0,
          customers: summary?.customers.active || 0,
          quotations: summary?.leads.converted || 0,
          inventory: summary?.inventory.items || 0,
          activities: overview?.activities.length || 0,
        },
        charts: charts.map((chartElement, index) => ({
          element: chartElement,
          title: getChartTitle(chartElement.dataset.chartId as string),
          type: getChartType(chartElement.dataset.chartId as string),
        })),
        tables: [],
        filter: dateRange,
        generatedBy: user?.name || user?.email || 'Unknown',
        generatedOn: new Date().toLocaleString(),
        exportVersion: '1.0',
        system: 'PEB CRM',
      };

      const pdfBlob = await service.export(dashboardExportData, dateRange);

      // Download PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      link.download = `PEBCRM_Dashboard_${dateRange}_${dateStr}_${timeStr}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      setExportState({ isGenerating: false, status: 'ready', progress: 100, message: 'Download Ready' });
    } catch (error) {
      setExportState({ isGenerating: false, status: 'error', progress: 0, message: 'Export Failed' });
    }
  };

  // Wait for charts to render with timeout and retry logic
  async function waitForChartsToRender(timeout: number = 10000, retryInterval: number = 500): Promise<HTMLElement[]> {
    const startTime = Date.now();
    let attempts = 0;

    while (Date.now() - startTime < timeout) {
      attempts++;
      const chartElements = document.querySelectorAll('[data-export-chart="true"]');

      if (chartElements.length > 0) {
        // Verify all charts are rendered
        const allRendered = Array.from(chartElements).every(chart => {
          const svg = chart.querySelector('svg');
          if (!svg) return false;

          // Check for data elements
          const dataElements = svg.querySelectorAll('path, rect, circle, line, polygon');
          const textElements = svg.querySelectorAll('text');

          return dataElements.length >= 5 && textElements.length >= 3;
        });

        if (allRendered) {
          return Array.from(chartElements) as HTMLElement[];
        }
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }

    // Timeout reached - return whatever charts we found
    const chartElements = document.querySelectorAll('[data-export-chart="true"]');
    return Array.from(chartElements) as HTMLElement[];
  }

  function getChartTitle(chartId: string): string {
    const titles: Record<string, string> = {
      'purchases-trend': 'Total Purchases Trend',
      'sales-trend': 'Revenue vs Expenses',
      'projects-trend': 'Projects by Status',
      'leads-source': 'Total Leads by Source',
      'revenue': 'Total Revenue',
      'turnover': 'Total Turnover',
    };
    return titles[chartId] || 'Unknown Chart';
  }

  function getChartType(chartId: string): 'sales-pipeline' | 'revenue-trend' | 'quotation-status' | 'inventory-analytics' | 'project-pipeline' {
    const types: Record<string, 'sales-pipeline' | 'revenue-trend' | 'quotation-status' | 'inventory-analytics' | 'project-pipeline'> = {
      'purchases-trend': 'revenue-trend',
      'sales-trend': 'revenue-trend',
      'projects-trend': 'project-pipeline',
      'leads-source': 'sales-pipeline',
      'revenue': 'revenue-trend',
      'turnover': 'revenue-trend',
    };
    return types[chartId] || 'revenue-trend';
  }

  return (
    <RouteGuard requiredPermission="dashboard:view">
    <MainLayout
      title="Executive Dashboard"
      subtitle="Business Operations Overview"
      currentPath="/dashboard"
    >
      {/* Unified Loading State - Show skeleton until all data is ready */}
      {!isDashboardReady ? (
      <div className="space-y-2 sm:space-y-3 lg:space-y-4 w-full">

            {/* Filter Bar Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="h-10 w-48 bg-card-hover rounded-md animate-pulse" />
              <div className="h-9 w-24 bg-card-hover rounded-md animate-pulse" />
            </div>

            {/* KPI Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3 lg:gap-4">
              <CardSkeleton count={8} />
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>

            {/* Project Timeline Skeleton */}
            <div className="space-y-3 sm:space-y-4">
              <div className="h-12 w-full bg-card-hover rounded-md animate-pulse" />
              <div className="h-64 w-full bg-card-hover rounded-md animate-pulse" />
              <div className="h-48 w-full bg-card-hover rounded-md animate-pulse" />
            </div>

            {/* Recent Status Updates Skeleton */}
            <div className="h-48 w-full bg-card-hover rounded-md animate-pulse" />
          </div>
        ) : (
          <div className="animate-in fade-in duration-500 space-y-3 sm:space-y-4 lg:space-y-5 w-full">
            {/* Dashboard Filters + Export Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <DashboardFilter
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            customFrom={customFrom}
            customTo={customTo}
            onCustomRangeChange={(from, to) => {
              setCustomFrom(from);
              setCustomTo(to);
            }}
          />
          <ExportButton
            onExport={handleExport}
            isGenerating={exportState.isGenerating}
            status={exportState.status}
            progress={exportState.progress}
          />
        </div>

            {/* ROW 1 - Modern KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3 lg:gap-4">
              {kpiCards.length > 0 ? (
            kpiCards.map((kpi, index) => (
              <ModernKPICard
                key={`${kpi.label}-${index}`}
                label={kpi.label}
                icon={kpi.icon}
                accent={kpi.accent}
                periods={kpi.periods}
                navigateTo={kpi.navigateTo}
                queryParams={kpi.queryParams}
              />
            ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className={cn(componentTextSizes.table.cell, 'text-muted-foreground')}>No KPI data available</p>
                </div>
              )}
            </div>

            {/* ROW 2 - Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
            <Suspense fallback={<><ChartSkeleton /><ChartSkeleton /></>}>
              <>
                {/* Total Purchases Trend */}
                {purchasesEnabled && (
                  <ChartCard
                    title="Total purchases trend"
                    description="Monthly procurement spend"
                    types={['bar', 'line', 'area']}
                    initial="bar"
                    showPeriod={true}
                  >
                    {(type, period) => (
                      <Suspense fallback={<div className="h-48 w-full animate-pulse bg-card-hover rounded-md" />}>
                        <DynamicChart
                          type={type}
                          data={purchasesTrendData}
                          dataKey="value"
                          nameKey="name"
                        />
                      </Suspense>
                    )}
                  </ChartCard>
                )}

                {/* Revenue vs Expenses */}
                {financeEnabled && (
                  <ChartCard
                    title="Revenue vs expenses"
                    description="Monthly revenue vs procurement spend"
                    types={['bar', 'line', 'area', 'composed']}
                    initial="composed"
                    showPeriod={true}
                  >
                    {(type, period) => (
                      <Suspense fallback={<div className="h-48 w-full animate-pulse bg-card-hover rounded-md" />}>
                        <DynamicChart
                          type={type}
                          data={salesTrendData}
                          dataKey="pipeline"
                          secondKey="won"
                          nameKey="name"
                        />
                      </Suspense>
                    )}
                  </ChartCard>
                )}
              </>
            </Suspense>
            </div>

            {/* ROW 3 - Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
            <Suspense fallback={<><ChartSkeleton /><ChartSkeleton /></>}>
              <>
                {/* Total Leads by Source */}
                {leadsEnabled && (
                  <ChartCard
                    title="Total leads by source"
                    description="Where new leads are coming from"
                    types={['bar', 'donut', 'pie', 'radar']}
                    initial="bar"
                    showPeriod={true}
                  >
                    {(type, period) => (
                      <Suspense fallback={<div className="h-48 w-full animate-pulse bg-card-hover rounded-md" />}>
                        <DynamicChart
                          type={type}
                          data={leadsSourceData}
                          dataKey="value"
                          nameKey="name"
                        />
                      </Suspense>
                    )}
                  </ChartCard>
                )}

                {/* Total Revenue */}
                {financeEnabled && (
                  <ChartCard
                    title="Total revenue"
                    description="Monthly project revenue"
                    types={['bar', 'line', 'area']}
                    initial="bar"
                    showPeriod={true}
                  >
                    {(type, period) => (
                      <Suspense fallback={<div className="h-48 w-full animate-pulse bg-card-hover rounded-md" />}>
                        <DynamicChart
                          type={type}
                          data={revenueData}
                          dataKey="value"
                          nameKey="name"
                        />
                      </Suspense>
                    )}
                  </ChartCard>
                )}
              </>
            </Suspense>
            </div>

            {/* ROW 4 - Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
            <Suspense fallback={<><ChartSkeleton /><ChartSkeleton /></>}>
              <>
                {/* Projects by Status */}
                {projectsEnabled && (
                  <ChartCard
                    title="Projects by status"
                    description="Distribution across project statuses"
                    types={['bar', 'line', 'area', 'composed']}
                    initial="bar"
                    showPeriod={true}
                  >
                    {(type, period) => (
                      <Suspense fallback={<div className="h-48 w-full animate-pulse bg-card-hover rounded-md" />}>
                        <DynamicChart
                          type={type}
                          data={projectsTrendData}
                          dataKey="value"
                          nameKey="name"
                        />
                      </Suspense>
                    )}
                  </ChartCard>
                )}

                {/* Inventory Value Trend */}
                {inventoryEnabled && (
                  <ChartCard
                    title="Inventory value trend"
                    description="Total inventory value over time"
                    types={['bar', 'line', 'area']}
                    initial="bar"
                    showPeriod={true}
                  >
                    {(type, period) => (
                      <Suspense fallback={<div className="h-48 w-full animate-pulse bg-card-hover rounded-md" />}>
                        <DynamicChart
                          type={type}
                          data={inventoryValueData}
                          dataKey="value"
                          nameKey="name"
                        />
                      </Suspense>
                    )}
                  </ChartCard>
                )}
              </>
            </Suspense>
            </div>

            {/* ROW 5 - Project Timeline Section */}
            {projectsEnabled && (
              <div className="space-y-3 sm:space-y-4">
                <Suspense fallback={<div className="h-32 w-full bg-card-hover rounded-md animate-pulse" />}>
                  <ProjectStatusGrid data={statusGridData} onSelect={(status) => setProjectStatusFilter(status)} />
                </Suspense>
                <Suspense fallback={<div className="h-64 w-full bg-card-hover rounded-md animate-pulse" />}>
                  <ProjectTimeline
                    projects={timelineRows}
                    statusFilter={projectStatusFilter}
                    selectedId={selectedProjectId}
                    onSelectId={setSelectedProjectId}
                    onStatusFilterChange={setProjectStatusFilter}
                  />
                </Suspense>
                <Suspense fallback={<div className="h-96 w-full bg-card-hover rounded-md animate-pulse" />}>
                  <DetailedGanttChart selectedProjectId={selectedProjectId} />
                </Suspense>
              </div>
            )}

            {/* ROW 6 - Recent Status Updates */}
            <div className="space-y-3 sm:space-y-4">
              <Suspense fallback={<div className="h-48 w-full bg-card-hover rounded-md animate-pulse" />}>
                <RecentStatusUpdates
                  statusUpdates={statusUpdates}
                  loading={isLoading}
                  error={null}
                />
              </Suspense>
            </div>
          </div>
        )}
    </MainLayout>
    </RouteGuard>
  );
}
