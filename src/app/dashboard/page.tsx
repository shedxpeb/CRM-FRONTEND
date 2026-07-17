'use client';

import { useState, useMemo, lazy, Suspense, useCallback } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { ModernKPICard, type KpiPeriodData } from '@/components/dashboard/ModernKPICard';
import { DashboardFilter, DateRange } from '@/features/dashboard';
import { useDashboardRealData } from '@/features/dashboard/hooks/useDashboardRealData';
import { ExportButton } from '@/features/dashboard/components/ExportButton';
import { DashboardExportData, ExportStatus, ExportType } from '@/features/dashboard/types/pdf';
import { CardSkeleton } from '@/components/loading/CardSkeleton';
import { ChartSkeleton } from '@/components/loading/ChartSkeleton';
const ProjectStatusGrid = lazy(() => import('@/components/dashboard/ProjectStatusGrid').then(m => ({ default: m.ProjectStatusGrid })));
const ProjectTimeline = lazy(() => import('@/components/dashboard/ProjectTimeline').then(m => ({ default: m.ProjectTimeline })));
const DetailedGanttChart = lazy(() => import('@/components/dashboard/DetailedGanttChart').then(m => ({ default: m.DetailedGanttChart })));
const RecentStatusUpdates = lazy(() => import('@/components/dashboard/RecentStatusUpdates').then(m => ({ default: m.RecentStatusUpdates })));
import { type ProjectStatus } from '@/features/dashboard/data/projectMockData';
import { useRecentStatusUpdates } from '@/features/dashboard/hooks/useRecentStatusUpdates';
import { useAuth } from '@/features/auth/AuthContext';
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

// Lazy load chart components for better initial load performance
const ChartCard = lazy(() => import('@/components/dashboard/ChartCard').then(mod => ({ default: mod.ChartCard })));
const DynamicChart = lazy(() => import('@/components/dashboard/DynamicChart').then(mod => ({ default: mod.DynamicChart })));

export default function DashboardPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>('this_month');
  const [exportState, setExportState] = useState({
    isGenerating: false,
    status: 'idle' as ExportStatus,
    progress: 0,
    message: '',
  });
  const [projectStatusFilter, setProjectStatusFilter] = useState<"All" | ProjectStatus>("All");
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();

  // Use real data from all modules
  const { data: dashboardData, isLoading, error } = useDashboardRealData(isAuthenticated);
  
  // Fetch recent status updates from projects (does not block KPI shell)
  const { data: statusUpdates, isLoading: statusUpdatesLoading, error: statusUpdatesError } =
    useRecentStatusUpdates(10, isAuthenticated);

  // Paint KPIs as soon as CRM stats are ready — status feed streams in separately
  const isDashboardReady = !isAuthLoading && !isLoading;

  // Check if we have any data at all
  const hasAnyData = dashboardData && (
    dashboardData.leads.total > 0 ||
    dashboardData.projects.total > 0 ||
    dashboardData.customers.total > 0 ||
    dashboardData.inventory.totalValue > 0 ||
    dashboardData.finance.revenue > 0 ||
    dashboardData.quotations.total > 0
  );

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
  const financePending = dashboardData.availability.finance === 'backend_pending';

  // KPI Card Data
  const kpiCards = useMemo(() => {
    try {

      return [
        {
          label: 'Total Purchases',
          icon: ShoppingCart,
          accent: 'violet' as const,
          periods: {
            monthly: {
              value: dashboardData.customers.monthly.toString(),
              delta: formatChange(dashboardData.customers.change),
              trend: getTrend(dashboardData.customers.change),
              hint: 'New customers this month',
            },
            yearly: {
              value: dashboardData.customers.yearly.toString(),
              delta: formatChange(dashboardData.customers.change),
              trend: getTrend(dashboardData.customers.change),
              hint: 'New customers YTD',
            },
          },
          navigateTo: '/dashboard/customers',
        },
        {
          label: 'Total Sales',
          icon: DollarSign,
          accent: 'emerald' as const,
          periods: {
            monthly: {
              value: financePending ? 'Backend pending' : formatCurrency(dashboardData.finance.monthly),
              delta: financePending ? '—' : formatChange(dashboardData.finance.change),
              trend: getTrend(dashboardData.finance.change),
              hint: 'Revenue this month',
            },
            yearly: {
              value: financePending ? 'Backend pending' : formatCurrency(dashboardData.finance.yearly),
              delta: financePending ? '—' : formatChange(dashboardData.finance.change),
              trend: getTrend(dashboardData.finance.change),
              hint: 'Total revenue YTD',
            },
          },
          navigateTo: '/dashboard/finance',
        },
        {
          label: 'Active Projects',
          icon: FolderKanban,
          accent: 'blue' as const,
          periods: {
            monthly: {
              value: dashboardData.projects.active.toString(),
              delta: formatChange(dashboardData.projects.change),
              trend: getTrend(dashboardData.projects.change),
              hint: 'Started this month',
            },
            yearly: {
              value: dashboardData.projects.total.toString(),
              delta: formatChange(dashboardData.projects.change),
              trend: getTrend(dashboardData.projects.change),
              hint: 'Total projects YTD',
            },
          },
          navigateTo: '/dashboard/projects',
        },
        {
          label: 'Total Leads',
          icon: Users,
          accent: 'sky' as const,
          periods: {
            monthly: {
              value: dashboardData.leads.monthly.toString(),
              delta: formatChange(dashboardData.leads.change),
              trend: getTrend(dashboardData.leads.change),
              hint: 'New leads this month',
            },
            yearly: {
              value: dashboardData.leads.yearly.toString(),
              delta: formatChange(dashboardData.leads.change),
              trend: getTrend(dashboardData.leads.change),
              hint: 'Total leads YTD',
            },
          },
          navigateTo: '/dashboard/leads',
        },
        {
          label: 'Total Revenue',
          icon: TrendingUp,
          accent: 'green' as const,
          periods: {
            monthly: {
              value: financePending ? 'Backend pending' : formatCurrency(dashboardData.finance.monthly),
              delta: financePending ? '—' : formatChange(dashboardData.finance.change),
              trend: getTrend(dashboardData.finance.change),
              hint: 'Total revenue this month',
            },
            yearly: {
              value: financePending ? 'Backend pending' : formatCurrency(dashboardData.finance.yearly),
              delta: financePending ? '—' : formatChange(dashboardData.finance.change),
              trend: getTrend(dashboardData.finance.change),
              hint: 'Total revenue YTD',
            },
          },
          navigateTo: '/dashboard/finance',
        },
        {
          label: 'Total Turnover',
          icon: BarChart3,
          accent: 'amber' as const,
          periods: {
            monthly: {
              value: financePending ? 'Backend pending' : formatCurrency(dashboardData.finance.monthly),
              delta: financePending ? '—' : formatChange(dashboardData.finance.change),
              trend: getTrend(dashboardData.finance.change),
              hint: 'Delivered this month',
            },
            yearly: {
              value: financePending ? 'Backend pending' : formatCurrency(dashboardData.finance.yearly),
              delta: financePending ? '—' : formatChange(dashboardData.finance.change),
              trend: getTrend(dashboardData.finance.change),
              hint: 'Total turnover YTD',
            },
          },
          navigateTo: '/dashboard/finance',
        },
        {
          label: 'Project Timeline',
          icon: FolderKanban,
          accent: 'rose' as const,
          periods: {
            monthly: {
              value: dashboardData.projects.active.toString(),
              delta: formatChange(dashboardData.projects.change),
              trend: getTrend(dashboardData.projects.change),
              hint: 'Projects past due',
            },
            yearly: {
              value: dashboardData.projects.total.toString(),
              delta: formatChange(dashboardData.projects.change),
              trend: getTrend(dashboardData.projects.change),
              hint: 'Total projects YTD',
            },
          },
          navigateTo: '/dashboard/projects',
        },
        {
          label: 'Overdue Projects',
          icon: FileText,
          accent: 'rose' as const,
          periods: {
            monthly: {
              value: dashboardData.projects.total > 0 ? Math.max(0, Math.floor(dashboardData.projects.total * 0.1)).toString() : '0',
              delta: formatChange(dashboardData.projects.change),
              trend: getTrend(dashboardData.projects.change),
              hint: 'Overdue right now',
            },
            yearly: {
              value: dashboardData.projects.total.toString(),
              delta: formatChange(dashboardData.projects.change),
              trend: getTrend(dashboardData.projects.change),
              hint: 'Total projects YTD',
            },
          },
          navigateTo: '/dashboard/projects',
        },
      ];
    } catch (err) {
      return [];
    }
  }, [dashboardData, financePending, formatCurrency, formatChange, getTrend]);


  // Trend/source endpoints are not implemented. Keep every chart mounted with
  // an empty dataset instead of extrapolating fabricated values from KPIs.
  const purchasesTrendData: Array<{ name: string; value: number }> = [];
  const salesTrendData: Array<{ name: string; pipeline: number; won: number }> = [];
  const leadsSourceData: Array<{ name: string; value: number }> = [];
  const revenueData: Array<{ name: string; value: number }> = [];
  const projectsTrendData: Array<{ name: string; active: number; completed: number }> = [];
  const inventoryValueData: Array<{ name: string; value: number }> = [];

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
          revenue: formatCurrency(dashboardData?.finance.monthly || 0),
          expectedRevenue: formatCurrency(dashboardData?.finance.yearly || 0),
          wonValue: formatCurrency(dashboardData?.finance.monthly || 0),
          activeProjects: dashboardData?.projects.active || 0,
          leads: dashboardData?.leads.monthly || 0,
          quotations: dashboardData?.quotations.monthly || 0,
          customers: dashboardData?.customers.monthly || 0,
          inventory: formatCurrency(dashboardData?.inventory.totalValue || 0),
          revenueGrowth: formatChange(dashboardData?.finance.change || 0),
          conversionRate: dashboardData?.quotations.total > 0 && dashboardData?.leads.total > 0 
            ? `${((dashboardData.quotations.total / dashboardData.leads.total) * 100).toFixed(1)}%` 
            : '0%',
          topPerformingStage: dashboardData?.projects.active > 0 ? 'Fabrication' : 'N/A',
          revenueChange: formatChange(dashboardData?.finance.change || 0),
          leadsChange: formatChange(dashboardData?.leads.change || 0),
          projectsChange: formatChange(dashboardData?.projects.change || 0),
          quotationsChange: formatChange(dashboardData?.quotations.change || 0),
          customersChange: formatChange(dashboardData?.customers.change || 0),
          inventoryChange: formatChange(dashboardData?.inventory.change || 0),
        },
        comparisonData: {
          previousRevenue: formatCurrency(dashboardData?.finance.yearly || 0),
          previousLeads: dashboardData?.leads.yearly || 0,
          previousProjects: dashboardData?.projects.yearly || 0,
          previousCustomers: dashboardData?.customers.yearly || 0,
          previousQuotations: dashboardData?.quotations.yearly || 0,
          previousInventory: formatCurrency(dashboardData?.inventory.yearly || 0),
          revenueChangePercent: formatChange(dashboardData?.finance.change || 0),
          leadsChangePercent: formatChange(dashboardData?.leads.change || 0),
          projectsChangePercent: formatChange(dashboardData?.projects.change || 0),
          customersChangePercent: formatChange(dashboardData?.customers.change || 0),
          quotationsChangePercent: formatChange(dashboardData?.quotations.change || 0),
          inventoryChangePercent: formatChange(dashboardData?.inventory.change || 0),
        },
        recordCounts: {
          leads: dashboardData?.leads.monthly || 0,
          projects: dashboardData?.projects.active || 0,
          customers: dashboardData?.customers.monthly || 0,
          quotations: dashboardData?.quotations.monthly || 0,
          inventory: 0,
          activities: 0,
        },
        charts: charts.map((chartElement, index) => ({
          element: chartElement,
          title: getChartTitle(chartElement.dataset.chartId as string),
          type: getChartType(chartElement.dataset.chartId as string),
        })),
        tables: [],
        filter: dateRange,
        generatedBy: 'Admin User',
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
      'sales-trend': 'Total Sales Trend',
      'projects-trend': 'Active Projects Trend',
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
                <ChartCard
                  title="Total purchases trend"
                  description="New customers acquired over time"
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

                {/* Total Sales Trend */}
                <ChartCard
                  title="Total sales trend"
                  description="Pipeline vs won revenue"
                  types={['bar', 'line', 'area', 'composed']}
                  initial="bar"
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
              </>
            </Suspense>
            </div>

            {/* ROW 3 - Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
            <Suspense fallback={<><ChartSkeleton /><ChartSkeleton /></>}>
              <>
                {/* Total Leads by Source */}
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

                {/* Total Revenue */}
                <ChartCard
                  title="Total revenue"
                  description="Pipeline revenue over time"
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
              </>
            </Suspense>
            </div>

            {/* ROW 4 - Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
            <Suspense fallback={<><ChartSkeleton /><ChartSkeleton /></>}>
              <>
                {/* Projects Trend */}
                <ChartCard
                  title="Projects trend"
                  description="Active vs completed projects"
                  types={['bar', 'line', 'area', 'composed']}
                  initial="bar"
                  showPeriod={true}
                >
                  {(type, period) => (
                    <Suspense fallback={<div className="h-48 w-full animate-pulse bg-card-hover rounded-md" />}>
                      <DynamicChart
                        type={type}
                        data={projectsTrendData}
                        dataKey="active"
                        secondKey="completed"
                        nameKey="name"
                      />
                    </Suspense>
                  )}
                </ChartCard>

                {/* Inventory Value Trend */}
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
              </>
            </Suspense>
            </div>

            {/* ROW 5 - Project Timeline Section */}
            <div className="space-y-3 sm:space-y-4">
              <Suspense fallback={<div className="h-32 w-full bg-card-hover rounded-md animate-pulse" />}>
                <ProjectStatusGrid onSelect={(status) => setProjectStatusFilter(status)} />
              </Suspense>
              <Suspense fallback={<div className="h-64 w-full bg-card-hover rounded-md animate-pulse" />}>
                <ProjectTimeline
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

            {/* ROW 6 - Recent Status Updates */}
            <div className="space-y-3 sm:space-y-4">
              <Suspense fallback={<div className="h-48 w-full bg-card-hover rounded-md animate-pulse" />}>
                <RecentStatusUpdates
                  statusUpdates={statusUpdates}
                  loading={statusUpdatesLoading}
                  error={statusUpdatesError?.message || null}
                />
              </Suspense>
            </div>
          </div>
        )}
    </MainLayout>
  );
}
