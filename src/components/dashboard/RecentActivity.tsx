'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'lead' | 'project' | 'quotation' | 'task' | 'alert';
  title: string;
  description: string;
  timestamp: Date;
  user: string;
  status?: 'completed' | 'pending' | 'warning';
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'lead':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'project':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'quotation':
        return <FileText className="h-4 w-4 text-purple-500" />;
      case 'task':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status?: ActivityItem['status']) => {
    if (!status) return null;
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'warning':
        return <Badge variant="destructive">Alert</Badge>;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="p-2 rounded-lg bg-gray-100">
                  {getIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                  <p className="text-xs text-gray-500 truncate">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{activity.user}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{formatTime(activity.timestamp)}</span>
                  </div>
                </div>
                {getStatusBadge(activity.status)}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
