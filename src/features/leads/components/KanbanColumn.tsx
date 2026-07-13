'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/types/leads';
import { KanbanCard } from './KanbanCard';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  status: string;
  leads: Lead[];
  count: number;
  totalValue: number;
  onDragStart: (e: React.DragEvent, lead: Lead) => void;
  onDragOver: (e: React.DragEvent, status?: string, index?: number) => void;
  onDrop: (e: React.DragEvent, status: string, index?: number) => void;
  onDragEnd: () => void;
  onAddLead?: () => void;
  isDraggingOver?: boolean;
  dragOverIndex?: number | null;
}

export const KanbanColumn = memo(function KanbanColumn({
  status,
  leads,
  count,
  totalValue,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onAddLead,
  isDraggingOver = false,
  dragOverIndex = null,
}: KanbanColumnProps) {
  const handleCardDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    onDragOver(e, status, index);
  };

  const handleCardDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    onDrop(e, status, index);
  };
  const getColumnColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-500';
      case 'Contacted': return 'bg-yellow-500';
      case 'Design Pending':
      case 'BOQ Pending': return 'bg-indigo-500';
      case 'Estimate Sent':
      case 'Proposal Sent': return 'bg-purple-500';
      case 'Negotiation': return 'bg-orange-500';
      case 'Approved':
      case 'Converted': return 'bg-green-500';
      case 'Rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div
      className={`flex flex-col h-full min-w-[260px] w-[260px] sm:min-w-[320px] sm:w-[320px] transition-all ${
        isDraggingOver ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted/20'
      }`}
      onDragOver={onDragOver}
      onDrop={(e) => {
        onDrop(e, status);
      }}
    >
      {/* Column Header */}
      <Card className="mb-2">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${getColumnColor(status)}`} />
              <h3 className="font-semibold text-xs capitalize">{status}</h3>
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {count}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-orange-600">
                ₹{totalValue.toLocaleString()}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Cards Container */}
      <div 
        className="flex-1 space-y-0 overflow-y-auto max-h-[calc(100vh-240px)] pr-1 min-h-[100px]"
        onDragOver={(e) => onDragOver(e, status, leads.length)}
        onDrop={(e) => {
          e.stopPropagation();
          onDrop(e, status, leads.length);
        }}
      >
        {leads.map((lead, index) => (
          <div key={lead.id}>
            {/* Drop zone before each card - very small */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCardDragOver(e, index);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCardDrop(e, index);
              }}
              className={`h-5 rounded transition-all ${
                dragOverIndex === index
                  ? 'bg-primary/20 border-2 border-primary border-dashed'
                  : 'hover:bg-muted/30'
              }`}
            >
              {dragOverIndex === index && (
                <div className="flex items-center justify-center h-full">
                  <div className="h-0.5 bg-primary rounded-full w-full animate-pulse" />
                </div>
              )}
            </div>
            <KanbanCard
              lead={lead}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          </div>
        ))}
        {/* Drop zone at the end */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCardDragOver(e, leads.length);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCardDrop(e, leads.length);
          }}
          className={`h-5 rounded transition-all ${
            dragOverIndex === leads.length
              ? 'bg-primary/20 border-2 border-primary border-dashed'
              : 'hover:bg-muted/30'
          }`}
        >
          {dragOverIndex === leads.length && (
            <div className="flex items-center justify-center h-full">
              <div className="h-0.5 bg-primary rounded-full w-full animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
