'use client';
import { PurchaseOrderTimeline as PurchaseOrderTimelineType } from '../types/purchase-order.types';
import { PO_TIMELINE_ACTION_LABELS } from '../constants';

interface Props {
  timeline: PurchaseOrderTimelineType[];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getActionLabel(action: string): string {
  return PO_TIMELINE_ACTION_LABELS[action] || action;
}

export function PurchaseOrderTimeline({ timeline }: Props) {
  if (!timeline || timeline.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No timeline entries yet.</p>;
  }

  return (
    <div className="relative ml-3 border-l-2 border-border pl-6 space-y-6">
      {timeline.map((entry) => (
        <div key={entry.id} className="relative">
          <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{getActionLabel(entry.action)}</span>
              {entry.performedBy && (
                <span className="text-xs text-muted-foreground">by {entry.performedBy}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</p>
            {entry.metadata && typeof entry.metadata === 'object' && Object.keys(entry.metadata).length > 0 && (
              <div className="mt-1 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                {Object.entries(entry.metadata).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium">{key}:</span> {String(value)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
