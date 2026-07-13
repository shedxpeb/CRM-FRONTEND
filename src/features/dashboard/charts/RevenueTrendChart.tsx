/**
 * Revenue Trend Chart Component
 * Production-ready with loading, empty, error states
 * Structured for future API integration
 */

'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { RevenueTrendData } from '../types';

interface RevenueTrendChartProps {
  data: RevenueTrendData[];
  loading?: boolean;
  error?: string | null;
}

export const RevenueTrendChart = memo(function RevenueTrendChart({
  data,
  loading = false,
  error = null,
}: RevenueTrendChartProps) {
  // Loading state
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-red-600 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span>No revenue data available</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasComparison = data.some(d => d.previous !== undefined);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Revenue Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart 
            data={data} 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }} 
            role="img" 
            aria-label="Revenue trend chart"
            data-export-chart="true"
            data-chart-id="revenue-trend"
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6b7280" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#6b7280" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              fontSize={11} 
              stroke="#6b7280"
              tick={{ fontSize: 10 }}
            />
            <YAxis 
              fontSize={11} 
              stroke="#6b7280"
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value: any) => [`$${value?.toLocaleString() || 0}`, 'Revenue']}
              contentStyle={{ 
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            {hasComparison ? (
              <>
                <Area 
                  type="monotone" 
                  dataKey="previous" 
                  stroke="#6b7280" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorPrevious)"
                  name="Previous Period"
                  strokeDasharray="5 5"
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)"
                  name="Current Period"
                />
              </>
            ) : (
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorRevenue)"
                name="Revenue"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});
