/**
 * Dashboard Feature Export
 */

// Types
export * from './types';

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
