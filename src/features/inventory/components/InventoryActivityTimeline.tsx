'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InventoryActivity } from '@/features/inventory/types';
import {
  Plus,
  Edit,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightLeft,
  Lock,
  Unlock,
  ShoppingCart,
  AlertTriangle,
  Clock,
  Package,
  Building2,
} from 'lucide-react';

interface InventoryActivityTimelineProps {
  activities: InventoryActivity[];
}

const InventoryActivityTimeline = memo(function InventoryActivityTimeline({ activities }: InventoryActivityTimelineProps) {
  const getActivityIcon = (type: InventoryActivity['type']) => {
    switch (type) {
      case 'item_created':
        return <Plus className="h-4 w-4" />;
      case 'item_updated':
        return <Edit className="h-4 w-4" />;
      case 'stock_in':
        return <ArrowDownToLine className="h-4 w-4" />;
      case 'stock_out':
        return <ArrowUpFromLine className="h-4 w-4" />;
      case 'transfer':
        return <ArrowRightLeft className="h-4 w-4" />;
      case 'adjustment':
        return <Edit className="h-4 w-4" />;
      case 'reservation':
        return <Lock className="h-4 w-4" />;
      case 'release':
        return <Unlock className="h-4 w-4" />;
      case 'consumption':
        return <Package className="h-4 w-4" />;
      case 'reorder_triggered':
        return <ShoppingCart className="h-4 w-4" />;
      case 'status_changed':
        return <Clock className="h-4 w-4" />;
      case 'warehouse_changed':
        return <Building2 className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: InventoryActivity['type']) => {
    switch (type) {
      case 'item_created':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/25';
      case 'item_updated':
        return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25';
      case 'stock_in':
        return 'bg-green-500/15 text-green-400 border-green-500/25';
      case 'stock_out':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/25';
      case 'transfer':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25';
      case 'adjustment':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/25';
      case 'reservation':
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25';
      case 'release':
        return 'bg-teal-500/15 text-teal-400 border-teal-500/25';
      case 'consumption':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/25';
      case 'reorder_triggered':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/25';
      case 'status_changed':
        return 'bg-gray-500/15 text-gray-400 border-gray-500/25';
      case 'warehouse_changed':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/25';
      default:
        return 'bg-gray-500/15 text-gray-400 border-gray-500/25';
    }
  };

  const getActivityBadge = (type: InventoryActivity['type']) => {
    switch (type) {
      case 'item_created':
        return <Badge variant="default" className="text-xs">Created</Badge>;
      case 'item_updated':
        return <Badge variant="secondary" className="text-xs">Updated</Badge>;
      case 'stock_in':
        return <Badge variant="success" className="text-xs">Stock In</Badge>;
      case 'stock_out':
        return <Badge variant="warning" className="text-xs">Stock Out</Badge>;
      case 'transfer':
        return <Badge variant="info" className="text-xs">Transfer</Badge>;
      case 'adjustment':
        return <Badge variant="secondary" className="text-xs">Adjustment</Badge>;
      case 'reservation':
        return <Badge variant="default" className="text-xs">Reserved</Badge>;
      case 'release':
        return <Badge variant="success" className="text-xs">Released</Badge>;
      case 'consumption':
        return <Badge variant="warning" className="text-xs">Consumed</Badge>;
      case 'reorder_triggered':
        return <Badge variant="destructive" className="text-xs">Reorder</Badge>;
      case 'status_changed':
        return <Badge variant="secondary" className="text-xs">Status</Badge>;
      case 'warehouse_changed':
        return <Badge variant="info" className="text-xs">Warehouse</Badge>;
      default:
        return null;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No activity recorded yet
            </div>
          ) : (
            activities.map((activity, index) => (
              <div key={activity.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`p-2 rounded-lg border ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  {index !== activities.length - 1 && (
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
                    <div className="flex items-center gap-2">
                      {getActivityBadge(activity.type)}
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTime(activity.performedAt)}
                      </span>
                    </div>
                  </div>
                  {activity.metadata && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {Object.entries(activity.metadata).map(([key, value]) => (
                        <span key={key} className="mr-3">
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

export { InventoryActivityTimeline };
