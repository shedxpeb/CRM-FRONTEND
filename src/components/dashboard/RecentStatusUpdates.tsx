/**
 * Recent Status Updates Component
 * Displays recent project status changes in a table format
 * Shows Project ID, Name, Current Status, Previous Status, Person, Timestamp
 */

'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';
import { StatusUpdate } from '@/features/dashboard/hooks/useRecentStatusUpdates';

interface RecentStatusUpdatesProps {
  statusUpdates: StatusUpdate[];
  loading?: boolean;
  error?: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  'Design': 'bg-blue-100 text-blue-700',
  'BOQ': 'bg-purple-100 text-purple-700',
  'Procurement': 'bg-orange-100 text-orange-700',
  'Fabrication': 'bg-amber-100 text-amber-700',
  'Dispatch': 'bg-cyan-100 text-cyan-700',
  'Installation': 'bg-green-100 text-green-700',
  'Completion': 'bg-emerald-100 text-emerald-700',
  'On Hold': 'bg-gray-100 text-gray-700',
  'Cancelled': 'bg-red-100 text-red-700',
  'Lead': 'bg-sky-100 text-sky-700',
  'Estimate': 'bg-indigo-100 text-indigo-700',
  'Proposal': 'bg-violet-100 text-violet-700',
  'Quotation': 'bg-fuchsia-100 text-fuchsia-700',
  'Approved': 'bg-teal-100 text-teal-700',
};

const getStatusColor = (status: string): string => {
  return STATUS_COLORS[status] || 'bg-gray-100 text-gray-700';
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const RecentStatusUpdates = memo(function RecentStatusUpdates({
  statusUpdates,
  loading = false,
  error = null,
}: RecentStatusUpdatesProps) {
  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent status updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent status updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-red-600 text-sm">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!statusUpdates || statusUpdates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent status updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
            <p>No recent status updates</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Recent status updates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Project ID</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Project Name</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Current Status</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Previous Status</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Person</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {statusUpdates.map((update) => (
                <tr key={update.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-2 px-3 text-xs font-medium">{update.projectCode}</td>
                  <td className="py-2 px-3 text-xs">{update.projectName}</td>
                  <td className="py-2 px-3">
                    <Badge className={getStatusColor(update.currentStatus)} variant="secondary">
                      {update.currentStatus}
                    </Badge>
                  </td>
                  <td className="py-2 px-3">
                    {update.previousStatus ? (
                      <Badge variant="outline" className="text-xs">
                        {update.previousStatus}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">{update.performedBy}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground" title={formatDate(update.performedAt)}>
                        {formatTimeAgo(update.performedAt)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
});
