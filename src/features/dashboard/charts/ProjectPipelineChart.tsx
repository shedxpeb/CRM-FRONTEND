/**
 * Project Pipeline Analytics Component
 * Production-ready with loading, empty, error states
 * Structured for future API integration
 */

'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { ProjectPipelineData } from '../types';

interface ProjectPipelineChartProps {
  data: ProjectPipelineData[];
  totalProjects: number;
  totalValue: number;
  loading?: boolean;
  error?: string | null;
}

const STAGE_COLORS = {
  Planning: '#3b82f6',
  Design: '#10b981',
  Procurement: '#f59e0b',
  Fabrication: '#ef4444',
  Installation: '#8b5cf6',
  Completed: '#06b6d4',
};

export const ProjectPipelineChart = memo(function ProjectPipelineChart({
  data,
  totalProjects,
  totalValue,
  loading = false,
  error = null,
}: ProjectPipelineChartProps) {
  // Loading state
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Project Pipeline</CardTitle>
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
          <CardTitle className="text-sm font-semibold">Project Pipeline</CardTitle>
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
          <CardTitle className="text-sm font-semibold">Project Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span>No project data available</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span>Project Pipeline</span>
          <span className="text-[10px] text-muted-foreground">{totalProjects} Projects • ${totalValue.toLocaleString('en-US')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={`${item.stage}-${index}`} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-900">{item.stage}</span>
                  <span className="text-[10px] text-muted-foreground">{item.count} projects</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all" 
                    style={{ 
                      width: `${item.percentage}%`,
                      backgroundColor: item.color || STAGE_COLORS[item.stage as keyof typeof STAGE_COLORS] || '#6b7280'
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] font-medium text-gray-600">{item.percentage}%</span>
                  <span className="text-[10px] font-bold text-gray-900">${item.value.toLocaleString('en-US')}</span>
                </div>
              </div>
              {index < data.length - 1 && <ArrowRight className="h-3 w-3 text-gray-400 flex-shrink-0" />}
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-[10px] font-medium text-gray-600">Active Projects</p>
            <p className="text-sm font-bold text-blue-600">
              {data.filter(d => d.stage !== 'Completed').reduce((sum, d) => sum + d.count, 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-medium text-gray-600">Pipeline Value</p>
            <p className="text-sm font-bold text-green-600">
              ${data.filter(d => d.stage !== 'Completed').reduce((sum, d) => sum + d.value, 0).toLocaleString('en-US')}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-medium text-gray-600">Completed</p>
            <p className="text-sm font-bold text-cyan-600">
              {data.find(d => d.stage === 'Completed')?.count || 0}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
