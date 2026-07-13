'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectActivity } from '@/features/projects/types';
import {
  Plus,
  Edit,
  FileText,
  Package,
  ShoppingCart,
  Wrench,
  Truck,
  Hammer,
  CheckCircle,
  Users,
  Calendar,
  Upload,
  DollarSign,
  Flag,
} from 'lucide-react';

interface ProjectTimelineProps {
  activities: ProjectActivity[];
}

// Move helper functions outside component to prevent recreation
const getActivityIcon = (type: string) => {
  const icons: Record<string, React.ReactNode> = {
    project_created: <Plus className="h-4 w-4" />,
    project_updated: <Edit className="h-4 w-4" />,
    design_started: <FileText className="h-4 w-4" />,
    design_completed: <CheckCircle className="h-4 w-4" />,
    design_uploaded: <Upload className="h-4 w-4" />,
    boq_created: <FileText className="h-4 w-4" />,
    boq_updated: <Edit className="h-4 w-4" />,
    procurement_started: <ShoppingCart className="h-4 w-4" />,
    material_reserved: <Package className="h-4 w-4" />,
    purchase_request_created: <ShoppingCart className="h-4 w-4" />,
    fabrication_started: <Wrench className="h-4 w-4" />,
    fabrication_completed: <CheckCircle className="h-4 w-4" />,
    dispatch_started: <Truck className="h-4 w-4" />,
    dispatch_completed: <CheckCircle className="h-4 w-4" />,
    installation_started: <Hammer className="h-4 w-4" />,
    installation_completed: <CheckCircle className="h-4 w-4" />,
    milestone_completed: <Flag className="h-4 w-4" />,
    team_assigned: <Users className="h-4 w-4" />,
    task_assigned: <Calendar className="h-4 w-4" />,
    status_changed: <Edit className="h-4 w-4" />,
    stage_changed: <Edit className="h-4 w-4" />,
    document_uploaded: <Upload className="h-4 w-4" />,
    note_added: <Edit className="h-4 w-4" />,
    payment_received: <DollarSign className="h-4 w-4" />,
    project_completed: <CheckCircle className="h-4 w-4" />,
    handover_completed: <CheckCircle className="h-4 w-4" />,
  };
  return icons[type] || <Edit className="h-4 w-4" />;
};

const getActivityColor = (type: string) => {
  const colors: Record<string, string> = {
    project_created: 'bg-blue-100 text-blue-600',
    project_updated: 'bg-gray-100 text-gray-600',
    design_started: 'bg-purple-100 text-purple-600',
    design_completed: 'bg-green-100 text-green-600',
    design_uploaded: 'bg-blue-100 text-blue-600',
    boq_created: 'bg-purple-100 text-purple-600',
    boq_updated: 'bg-gray-100 text-gray-600',
    procurement_started: 'bg-orange-100 text-orange-600',
    material_reserved: 'bg-amber-100 text-amber-600',
    purchase_request_created: 'bg-orange-100 text-orange-600',
    fabrication_started: 'bg-indigo-100 text-indigo-600',
    fabrication_completed: 'bg-green-100 text-green-600',
    dispatch_started: 'bg-cyan-100 text-cyan-600',
    dispatch_completed: 'bg-green-100 text-green-600',
    installation_started: 'bg-pink-100 text-pink-600',
    installation_completed: 'bg-green-100 text-green-600',
    milestone_completed: 'bg-green-100 text-green-600',
    team_assigned: 'bg-blue-100 text-blue-600',
    task_assigned: 'bg-purple-100 text-purple-600',
    status_changed: 'bg-gray-100 text-gray-600',
    stage_changed: 'bg-gray-100 text-gray-600',
    document_uploaded: 'bg-blue-100 text-blue-600',
    note_added: 'bg-gray-100 text-gray-600',
    payment_received: 'bg-green-100 text-green-600',
    project_completed: 'bg-green-100 text-green-600',
    handover_completed: 'bg-green-100 text-green-600',
  };
  return colors[type] || 'bg-gray-100 text-gray-600';
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(date);
};

export const ProjectTimeline = React.memo(function ProjectTimeline({ activities }: ProjectTimelineProps) {

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No activities recorded yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] overflow-y-auto">
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={activity.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  {index < activities.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        by {activity.performedBy}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {formatRelativeTime(activity.performedAt)}
                    </Badge>
                  </div>
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      {Object.entries(activity.metadata).map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <span className="font-medium text-muted-foreground">{key}:</span>
                          <span className="text-muted-foreground">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
