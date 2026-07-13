/**
 * Sales Funnel Chart Component
 * Production-ready with loading, empty, error states
 * Structured for future API integration
 */

'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { SalesFunnelData } from '../types';

interface SalesFunnelChartProps {
  data: SalesFunnelData[];
  loading?: boolean;
  error?: string | null;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const SalesFunnelChart = memo(function SalesFunnelChart({
  data,
  loading = false,
  error = null,
}: SalesFunnelChartProps) {
  // Loading state
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Sales Pipeline</CardTitle>
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
          <CardTitle className="text-sm font-semibold">Sales Pipeline</CardTitle>
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
          <CardTitle className="text-sm font-semibold">Sales Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span>No pipeline data available</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Sales Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart 
            data={data} 
            layout="horizontal" 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }} 
            role="img" 
            aria-label="Sales pipeline funnel chart"
            data-export-chart="true"
            data-chart-id="sales-funnel"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              type="number" 
              fontSize={11} 
              stroke="#6b7280"
              tick={{ fontSize: 10 }}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={80} 
              fontSize={11} 
              stroke="#6b7280"
              tick={{ fontSize: 10 }}
            />
            <Tooltip 
              formatter={(value: any) => [value?.toLocaleString() || 0, 'Deals']}
              contentStyle={{ 
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Bar 
              dataKey="value" 
              radius={[0, 4, 4, 0]}
            >
              <LabelList 
                dataKey="value" 
                position="right" 
                style={{ 
                  fill: '#374151',
                  fontSize: '11px',
                  fontWeight: '500'
                }}
                formatter={(value: any) => value?.toLocaleString() || 0}
              />
              {data.map((entry, index) => (
                <rect key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});
