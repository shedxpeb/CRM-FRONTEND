'use client';

import { useState, useMemo, memo } from 'react';
import { Lead, LeadStatus } from '@/types/leads';
import { KanbanColumn } from './KanbanColumn';
import { DEFAULT_LEAD_CONFIGURATION } from '@/features/leads/hooks/useLeads';

interface KanbanBoardProps {
  leads: Lead[];
  pipelineStages?: LeadStatus[];
  onLeadUpdate: (lead: Lead) => void;
  onLeadsReorder?: (leads: Lead[]) => void;
}

export const KanbanBoard = memo(function KanbanBoard({ leads, pipelineStages, onLeadUpdate, onLeadsReorder }: KanbanBoardProps) {
  const stages = (pipelineStages ?? DEFAULT_LEAD_CONFIGURATION.statuses) as LeadStatus[];
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Group leads by status and maintain order
  const leadsByStatus = useMemo(() => {
    const grouped: Record<string, Lead[]> = {};

    stages.forEach((status) => {
      grouped[status] = leads
        .filter((lead) => lead.status === status)
        .sort((a, b) => {
          // Sort by orderIndex if exists, otherwise by createdDate
          const orderA = (a as Lead & { orderIndex?: number }).orderIndex ?? 0;
          const orderB = (b as Lead & { orderIndex?: number }).orderIndex ?? 0;
          return orderA - orderB;
        });
    });

    return grouped;
  }, [leads]);

  // Calculate totals for each status
  const statusTotals = useMemo(() => {
    const totals: Record<string, { count: number; value: number }> = {};

    stages.forEach((status) => {
      const statusLeads = leadsByStatus[status] || [];
      totals[status] = {
        count: statusLeads.length,
        value: statusLeads.reduce((sum, lead) => sum + ((lead as Lead & { value?: number }).value || 0), 0),
      };
    });

    return totals;
  }, [leadsByStatus]);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
    setDragOverStatus(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, status?: string, index?: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (status) {
      setDragOverStatus(status);
    }
    if (index !== undefined) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverStatus(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: string, dropIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedLead) {
      return;
    }

    // If dropping in same column, reorder
    if (draggedLead.status === newStatus) {
      // Get all leads in this column
      const columnLeads = leads.filter(l => l.status === newStatus);
      const otherLeads = leads.filter(l => l.status !== newStatus);
      
      // Find and remove the dragged lead
      const draggedIndex = columnLeads.findIndex(l => l.id === draggedLead.id);
      columnLeads.splice(draggedIndex, 1);
      
      // Adjust drop index if needed
      let finalIndex = dropIndex !== undefined ? dropIndex : columnLeads.length;
      
      // If we removed a card before the drop index, decrease the index
      if (draggedIndex < dropIndex!) {
        finalIndex = dropIndex! - 1;
      }
      
      // Ensure index is within bounds
      finalIndex = Math.max(0, Math.min(finalIndex, columnLeads.length));
      
      columnLeads.splice(finalIndex, 0, {
        ...draggedLead,
        updatedAt: new Date(),
      });
      
      // Update all leads in the new order
      const updatedLeads = [...otherLeads, ...columnLeads];
      
      // Use reorder function if available to preserve order
      if (onLeadsReorder) {
        onLeadsReorder(updatedLeads);
      } else {
        // Fallback: update individually (won't preserve order)
        updatedLeads.forEach(lead => onLeadUpdate(lead));
      }
    } else {
      // Moving to different column
      const updatedLead = {
        ...draggedLead,
        status: newStatus as LeadStatus,
        updatedAt: new Date(),
      };

      onLeadUpdate(updatedLead);
    }
    
    setDraggedLead(null);
    setDragOverStatus(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{leads.length} leads in pipeline</p>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {stages.map((status, index) => (
          <KanbanColumn
            key={`${status}-${index}`}
            status={status}
            leads={leadsByStatus[status] || []}
            count={statusTotals[status]?.count || 0}
            totalValue={statusTotals[status]?.value || 0}
            onDragStart={handleDragStart}
            onDragOver={(e, s, idx) => handleDragOver(e, s, idx)}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            isDraggingOver={dragOverStatus === status}
            dragOverIndex={dragOverStatus === status ? dragOverIndex : null}
          />
        ))}
      </div>
    </div>
  );
});
