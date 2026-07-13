'use client';

import { DocumentActivity } from '../types';
import { ACTIVITY_TYPE_ICONS, ACTIVITY_TYPE_COLORS } from '../constants';
import { Badge } from '@/components/ui/badge';
import { 
  FilePlus, FileEdit, FileText, Send, Eye, CheckCircle, XCircle, Clock, RefreshCw, X, 
  UserCheck, Check, GitBranch, LayoutTemplate, Settings, MessageSquare, Paperclip,
  LucideIcon,
} from 'lucide-react';

interface DocumentActivityTimelineProps {
  activities: DocumentActivity[];
}

const iconMap: Record<string, LucideIcon> = {
  FilePlus,
  FileEdit,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  X,
  UserCheck,
  Check,
  GitBranch,
  LayoutTemplate,
  Settings,
  MessageSquare,
  Paperclip,
};

export function DocumentActivityTimeline({ activities }: DocumentActivityTimelineProps) {
  const getIcon = (type: string) => {
    const iconName = ACTIVITY_TYPE_ICONS[type] || 'FileText';
    const Icon = iconMap[iconName] || FileText;
    return Icon;
  };

  const getColorClass = (type: string) => {
    const color = ACTIVITY_TYPE_COLORS[type] || 'gray';
    const colorMap: Record<string, string> = {
      blue: 'text-blue-500 bg-blue-100',
      green: 'text-green-500 bg-green-100',
      red: 'text-red-500 bg-red-100',
      yellow: 'text-yellow-500 bg-yellow-100',
      orange: 'text-orange-500 bg-orange-100',
      purple: 'text-purple-500 bg-purple-100',
      cyan: 'text-cyan-500 bg-cyan-100',
      indigo: 'text-indigo-500 bg-indigo-100',
      gray: 'text-gray-500 bg-gray-100',
    };
    return colorMap[color] || colorMap.gray;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getBadgeVariant = (type: string): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' => {
    if (type.includes('approved') || type.includes('accepted')) return 'success';
    if (type.includes('rejected')) return 'destructive';
    if (type.includes('expired') || type.includes('cancelled')) return 'warning';
    if (type.includes('created') || type.includes('sent')) return 'info';
    return 'secondary';
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
        <p>No activity recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = getIcon(activity.type);
        const colorClass = getColorClass(activity.type);
        const badgeVariant = getBadgeVariant(activity.type);

        return (
          <div key={activity.id} className="flex gap-3">
            {/* Icon */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
              <Icon className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{activity.performedBy}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{formatTime(activity.performedAt)}</span>
                  </div>
                </div>
                <Badge variant={badgeVariant} className="flex-shrink-0">
                  {activity.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>

              {/* Metadata */}
              {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                  {Object.entries(activity.metadata).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500 capitalize">{key}:</span>
                      <span className="text-gray-700 font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Connector Line */}
            {index < activities.length - 1 && (
              <div className="absolute left-5 top-10 bottom-0 w-px bg-gray-200" style={{ marginLeft: '20px' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
