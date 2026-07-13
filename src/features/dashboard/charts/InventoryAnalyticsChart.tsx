/**
 * Inventory Analytics Donut Chart Component
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
import { InventoryAnalyticsData } from '../types';

interface InventoryAnalyticsChartProps {
  data: InventoryAnalyticsData[];
  totalValue: number;
  loading?: boolean;
  error?: string | null;
}

const STATUS_COLORS = {
  Available: '#10b981',
  Reserved: '#3b82f6',
  'Low Stock': '#ef4444',
};

export const InventoryAnalyticsChart = memo(function InventoryAnalyticsChart({
  data,
  totalValue,
  loading = false,
  error = null,
}: InventoryAnalyticsChartProps) {
  // Loading state
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Inventory Analytics</CardTitle>
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
          <CardTitle className="text-sm font-semibold">Inventory Analytics</CardTitle>
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
          <CardTitle className="text-sm font-semibold">Inventory Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span>No inventory data available</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalItems = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Inventory Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart 
            role="img" 
            aria-label="Inventory analytics donut chart"
            data-export-chart="true"
            data-chart-id="inventory-analytics"
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
              formatter={(value: any) => [value?.toLocaleString() || 0, 'Items']}
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t">
          {data.map((item, index) => (
            <div key={`${item.name}-${index}`} className="text-center">
              <div 
                className="w-3 h-3 rounded-full mx-auto mb-1"
                style={{ backgroundColor: item.color || STATUS_COLORS[item.name as keyof typeof STATUS_COLORS] }}
              />
              <p className="text-[10px] font-medium text-gray-600">{item.name}</p>
              <p className="text-xs font-bold text-gray-900">{item.value}</p>
              <p className="text-[9px] text-gray-500">
                {totalItems > 0 ? ((item.value / totalItems) * 100).toFixed(0) : 0}%
              </p>
            </div>
          ))}
        </div>
        
        {/* Total Value */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Total Inventory Value</span>
            <span className="text-sm font-bold text-gray-900">
              ${totalValue.toLocaleString('en-US')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
