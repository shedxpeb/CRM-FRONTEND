'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CustomerActivity, CustomerActivityType } from '@/features/customers/types';
import { 
  Plus, 
  Edit, 
  Phone, 
  FileText, 
  UserCheck, 
  CheckCircle, 
  Clock,
  Mail,
  Building2,
  DollarSign,
  Calendar,
  Package
} from 'lucide-react';

interface CustomerActivityTimelineProps {
  activities: CustomerActivity[];
  onFilterChange?: (filter: string) => void;
  currentFilter?: string;
}

export const CustomerActivityTimeline = memo(function CustomerActivityTimeline({ 
  activities, 
  onFilterChange,
  currentFilter = 'all'
}: CustomerActivityTimelineProps) {
  const getActivityIcon = (type: CustomerActivityType) => {
    switch (type) {
      case 'lead_created':
        return <Plus className="h-4 w-4" />;
      case 'customer_created':
        return <UserCheck className="h-4 w-4" />;
      case 'estimate_sent':
        return <FileText className="h-4 w-4" />;
      case 'proposal_sent':
        return <FileText className="h-4 w-4" />;
      case 'quotation_sent':
        return <FileText className="h-4 w-4" />;
      case 'project_started':
        return <Building2 className="h-4 w-4" />;
      case 'project_completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'payment_received':
        return <DollarSign className="h-4 w-4" />;
      case 'meeting_scheduled':
        return <Calendar className="h-4 w-4" />;
      case 'note_added':
        return <Edit className="h-4 w-4" />;
      case 'status_changed':
        return <Clock className="h-4 w-4" />;
      case 'document_created':
        return <FileText className="h-4 w-4" />;
      case 'assigned':
        return <UserCheck className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: CustomerActivityType) => {
    switch (type) {
      case 'lead_created':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/25';
      case 'customer_created':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25';
      case 'estimate_sent':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/25';
      case 'proposal_sent':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/25';
      case 'quotation_sent':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/25';
      case 'project_started':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25';
      case 'project_completed':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25';
      case 'payment_received':
        return 'bg-green-500/15 text-green-400 border-green-500/25';
      case 'meeting_scheduled':
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25';
      case 'note_added':
        return 'bg-gray-500/15 text-gray-400 border-gray-500/25';
      case 'status_changed':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/25';
      case 'document_created':
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25';
      case 'assigned':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25';
      default:
        return 'bg-gray-500/15 text-gray-400 border-gray-500/25';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const filteredActivities = currentFilter === 'all' 
    ? activities 
    : activities.filter(a => a.type === currentFilter);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Activity Timeline</CardTitle>
          {onFilterChange && (
            <div className="flex gap-1">
              <Badge 
                variant={currentFilter === 'all' ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => onFilterChange('all')}
              >
                All
              </Badge>
              <Badge 
                variant={currentFilter === 'document_created' ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => onFilterChange('document_created')}
              >
                Documents
              </Badge>
              <Badge 
                variant={currentFilter === 'project_created' ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => onFilterChange('project_created')}
              >
                Projects
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No activity recorded yet
            </div>
          ) : (
            filteredActivities.map((activity, index) => (
              <div key={activity.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`p-2 rounded-lg border ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  {index !== filteredActivities.length - 1 && (
                    <div className="w-0.5 h-full bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        by {activity.performedBy}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTime(activity.performedAt)}
                    </span>
                  </div>
                  {activity.metadata && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {Object.entries(activity.metadata).map(([key, value], index) => (
                        <span key={`${key}-${index}`} className="mr-3">
                          <span className="font-medium">{key}:</span> {String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
});
