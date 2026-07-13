'use client';

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/types/leads';
import { MapPin, Calendar, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { componentTextSizes } from '@/lib/design-system';

interface KanbanCardProps {
  lead: Lead;
  onDragStart: (e: React.DragEvent, lead: Lead) => void;
  onDragEnd: () => void;
}

export const KanbanCard = memo(function KanbanCard({ lead, onDragStart, onDragEnd }: KanbanCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-500';
      case 'Contacted': return 'bg-yellow-500';
      case 'Design Pending':
      case 'BOQ Pending':
      case 'Estimate Sent':
      case 'Proposal Sent':
      case 'Negotiation': return 'bg-purple-500';
      case 'Approved':
      case 'Converted': return 'bg-green-500';
      case 'Rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'text-red-600';
      case 'High': return 'text-orange-600';
      case 'Medium': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(e, lead);
      }}
      onDragEnd={onDragEnd}
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-all border-l-4"
      style={{ borderLeftColor: getStatusColor(lead.status) + '40' }}
    >
      <CardContent className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className={cn(componentTextSizes.table.monospace, 'text-muted-foreground')}>
              LEAD-{lead.leadNumber}
            </p>
            <h3 className={cn('font-semibold mt-0.5 line-clamp-2', componentTextSizes.table.cell)}>
              {lead.customerName}
            </h3>
            <p className={cn(componentTextSizes.table.monospace, 'text-muted-foreground mt-0.5')}>
              {lead.companyName}
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn(componentTextSizes.badge, 'font-semibold px-1.5 py-0', getPriorityColor(lead.priority))}
          >
            {lead.priority}
          </Badge>
        </div>

        {/* Project Info */}
        <div className="space-y-1">
          <div className={cn('flex items-center justify-between', componentTextSizes.table.monospace)}>
            <span className="text-muted-foreground">Project Type:</span>
            <span className="font-medium">{lead.projectType}</span>
          </div>
          <div className={cn('flex items-center justify-between', componentTextSizes.table.monospace)}>
            <span className="text-muted-foreground">Structure:</span>
            <span className="font-medium">{lead.structureType}</span>
          </div>
          {lead.width && lead.length && (
            <div className={cn('flex items-center justify-between', componentTextSizes.table.monospace)}>
              <span className="text-muted-foreground">Area:</span>
              <span className="font-medium">{(lead.width * lead.length).toLocaleString()} sqm</span>
            </div>
          )}
        </div>

        {/* Location */}
        <div className={cn('flex items-center gap-1.5 text-muted-foreground', componentTextSizes.table.monospace)}>
          <MapPin className="h-2.5 w-2.5" />
          <span>{lead.city}{lead.state ? `, ${lead.state}` : ''}</span>
        </div>

        {/* Score & Value */}
        <div className="space-y-1.5 pt-1.5 border-t">
          <div className="flex items-center justify-between">
            <div className={cn('flex items-center gap-1.5', componentTextSizes.table.monospace)}>
              <TrendingUp className="h-2.5 w-2.5 text-muted-foreground" />
              <span className="text-muted-foreground">Score:</span>
            </div>
            <span className={cn('font-semibold text-orange-600', componentTextSizes.table.monospace)}>
              {(lead as Lead & { score?: number }).score || 0} pts
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-gradient-to-r from-orange-500 to-orange-600 h-1 rounded-full transition-all"
              style={{ width: `${(lead as Lead & { score?: number }).score || 0}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1.5 border-t">
          <div className={cn('flex items-center gap-1.5 text-muted-foreground', componentTextSizes.table.monospace)}>
            <Calendar className="h-2.5 w-2.5" />
            <span>
              {lead.nextFollowUpDate
                ? new Date(lead.nextFollowUpDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                  })
                : 'No date'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
            <span className={cn('text-muted-foreground', componentTextSizes.table.monospace)}>
              {lead.assignedTo || 'Unassigned'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
