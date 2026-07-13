'use client';

import { useState, useEffect, memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lead, LeadStatus } from '@/types/leads';
import { GitBranch, CheckCircle, ArrowRight } from 'lucide-react';
import { DEFAULT_LEAD_CONFIGURATION } from '@/features/leads/hooks/useLeads';

interface StatusChangeDialogProps {
  lead: Lead;
  statusOptions?: LeadStatus[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (status: LeadStatus) => void;
}

export const StatusChangeDialog = memo(function StatusChangeDialog({
  lead,
  statusOptions = DEFAULT_LEAD_CONFIGURATION.statuses as LeadStatus[],
  open,
  onOpenChange,
  onSubmit,
}: StatusChangeDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>(lead.status);
  const [notes, setNotes] = useState('');

  // Reset selected status when dialog opens with a new lead
  useEffect(() => {
    if (open) {
      setSelectedStatus(lead.status);
      setNotes('');
    }
  }, [open, lead.status]);

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'New': return 'info';
      case 'Contacted': return 'warning';
      case 'DesignPending':
      case 'BOQPending':
      case 'EstimateSent':
      case 'ProposalSent':
      case 'Negotiation': return 'secondary';
      case 'Approved':
      case 'Converted': return 'success';
      case 'Rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedStatus);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Change Lead Status - #{lead.leadNumber}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Current Status */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Current Status</p>
                    <Badge variant={getStatusColor(lead.status)} className="text-sm">
                      {lead.status}
                    </Badge>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">New Status</p>
                    <Badge variant={getStatusColor(selectedStatus)} className="text-sm">
                      {selectedStatus}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Options */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select New Status</label>
              <div className="grid grid-cols-2 gap-2">
                {statusOptions.map((status, index) => (
                  <button
                    key={`${status}-${index}`}
                    type="button"
                    onClick={() => setSelectedStatus(status)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      selectedStatus === status
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{status}</span>
                      {selectedStatus === status && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Notes <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Add a note about this status change..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={selectedStatus === lead.status}>
              Update Status
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});
