/**
 * Dashboard Charts Export
 */

export { SalesFunnelChart } from './SalesFunnelChart';
export { RevenueTrendChart } from './RevenueTrendChart';
export { QuotationStatusChart } from './QuotationStatusChart';
export { ProjectPipelineChart } from './ProjectPipelineChart';
export { InventoryAnalyticsChart } from './InventoryAnalyticsChart';

// Lazy-loaded versions with Suspense boundaries
export {
  LazySalesFunnelChart,
  LazyRevenueTrendChart,
  LazyQuotationStatusChart,
  LazyProjectPipelineChart,
  LazyInventoryAnalyticsChart,
} from './LazyCharts';
