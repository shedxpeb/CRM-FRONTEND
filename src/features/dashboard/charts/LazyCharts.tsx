/**
 * Lazy-loaded Chart Components
 * Production-ready with Suspense boundaries
 * Structured for future API integration
 */

'use client';

import { lazy, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';

// Lazy load chart components for better performance
const SalesFunnelChart = lazy(() => import('./SalesFunnelChart').then(m => ({ default: m.SalesFunnelChart })));
const RevenueTrendChart = lazy(() => import('./RevenueTrendChart').then(m => ({ default: m.RevenueTrendChart })));
const QuotationStatusChart = lazy(() => import('./QuotationStatusChart').then(m => ({ default: m.QuotationStatusChart })));
const ProjectPipelineChart = lazy(() => import('./ProjectPipelineChart').then(m => ({ default: m.ProjectPipelineChart })));
const InventoryAnalyticsChart = lazy(() => import('./InventoryAnalyticsChart').then(m => ({ default: m.InventoryAnalyticsChart })));

// Loading fallback component
function ChartSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </CardContent>
    </Card>
  );
}

// Wrapper components with Suspense boundaries
export const LazySalesFunnelChart = (props: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <SalesFunnelChart {...props} />
  </Suspense>
);

export const LazyRevenueTrendChart = (props: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <RevenueTrendChart {...props} />
  </Suspense>
);

export const LazyQuotationStatusChart = (props: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <QuotationStatusChart {...props} />
  </Suspense>
);

export const LazyProjectPipelineChart = (props: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <ProjectPipelineChart {...props} />
  </Suspense>
);

export const LazyInventoryAnalyticsChart = (props: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <InventoryAnalyticsChart {...props} />
  </Suspense>
);
