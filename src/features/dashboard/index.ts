/**
 * Dashboard Feature Export
 */

// Types
export * from './types';

// Mock Data
export * from './mock-data';

// Components
export { DashboardFilter } from './components';

// Widgets
export { KPICard, RecentActivitiesFeed } from './widgets';

// Charts
export {
  SalesFunnelChart,
  RevenueTrendChart,
  QuotationStatusChart,
  ProjectPipelineChart,
  InventoryAnalyticsChart,
  LazySalesFunnelChart,
  LazyRevenueTrendChart,
  LazyQuotationStatusChart,
  LazyProjectPipelineChart,
  LazyInventoryAnalyticsChart,
} from './charts';

// Tables
export { RecentQuotationsTable, RecentLeadsTable } from './tables';
