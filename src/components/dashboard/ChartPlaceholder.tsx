'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartPlaceholderProps {
  title: string;
  type?: 'bar' | 'line' | 'pie' | 'donut';
  height?: number;
}

export function ChartPlaceholder({ title, type = 'bar', height = 300 }: ChartPlaceholderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="w-full bg-gray-100 rounded-lg flex items-center justify-center"
          style={{ height: `${height}px` }}
        >
          <div className="text-center text-gray-400">
            <p className="text-sm font-medium">{type.charAt(0).toUpperCase() + type.slice(1)} Chart</p>
            <p className="text-xs mt-1">Chart will be rendered here</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
