'use client';

import { useMemo } from 'react';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HealthStatus } from '@/features/projects/types';
import { getHealthStatusVariant, getHealthStatusColor } from '@/features/projects/constants';
import { Heart, Clock, DollarSign, Package, Users } from 'lucide-react';

interface ProjectHealthCardProps {
  healthStatus: HealthStatus;
  timelineHealth: HealthStatus;
  budgetHealth: HealthStatus;
  materialHealth: HealthStatus;
  resourceHealth: HealthStatus;
}

export const ProjectHealthCard = React.memo(function ProjectHealthCard({
  healthStatus,
  timelineHealth,
  budgetHealth,
  materialHealth,
  resourceHealth,
}: ProjectHealthCardProps) {
  const healthMetrics = useMemo(() => [
    {
      label: 'Timeline',
      value: timelineHealth,
      icon: <Clock className="h-4 w-4" />,
    },
    {
      label: 'Budget',
      value: budgetHealth,
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      label: 'Material',
      value: materialHealth,
      icon: <Package className="h-4 w-4" />,
    },
    {
      label: 'Resource',
      value: resourceHealth,
      icon: <Users className="h-4 w-4" />,
    },
  ], [timelineHealth, budgetHealth, materialHealth, resourceHealth]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            <h3 className="font-semibold">Project Health</h3>
          </div>
          <Badge variant={getHealthStatusVariant(healthStatus)} className={getHealthStatusColor(healthStatus)}>
            {healthStatus}
          </Badge>
        </div>

        <div className="space-y-3">
          {healthMetrics.map((metric) => (
            <div key={metric.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded ${getHealthStatusColor(metric.value)}`}>
                  {metric.icon}
                </div>
                <span className="text-sm">{metric.label}</span>
              </div>
              <Badge variant={getHealthStatusVariant(metric.value)} className="text-xs">
                {metric.value}
              </Badge>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            {healthStatus === 'Healthy' && 'All project metrics are on track.'}
            {healthStatus === 'At Risk' && 'Some metrics need attention to avoid delays.'}
            {healthStatus === 'Critical' && 'Immediate action required to prevent project failure.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
});
