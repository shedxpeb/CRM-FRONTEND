/**
 * Quotation Status Donut Chart Component
 * Production-ready with loading, empty, error states
 * Structured for future API integration
 */

'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from 'recharts';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { QuotationStatusData } from '../types';

interface QuotationStatusChartProps {
  data: QuotationStatusData[];
  loading?: boolean;
  error?: string | null;
}

const STATUS_COLORS = {
  Draft: '#6b7280',
  Sent: '#3b82f6',
  Approved: '#10b981',
  Rejected: '#ef4444',
};

export const QuotationStatusChart = memo(function QuotationStatusChart({
  data,
  loading = false,
  error = null,
}: QuotationStatusChartProps) {
  // Loading state
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Quotation Status</CardTitle>
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
          <CardTitle className="text-sm font-semibold">Quotation Status</CardTitle>
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
          <CardTitle className="text-sm font-semibold">Quotation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span>No quotation data available</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Quotation Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart 
            role="img" 
            aria-label="Quotation status donut chart"
            data-export-chart="true"
            data-chart-id="quotation-status"
          >
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || '#6b7280'}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => [value?.toLocaleString() || 0, 'Quotations']}
              contentStyle={{ 
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '11px' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t">
          {data.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color || STATUS_COLORS[item.name as keyof typeof STATUS_COLORS] }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-gray-600">{item.name}</p>
                <p className="text-xs font-bold text-gray-900">
                  {item.value} ({total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
