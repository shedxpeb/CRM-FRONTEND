'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Lead, LeadStatus } from '@/types/leads';
import { leadsApi } from '@/features/leads/services/leadsApi';
import { toast } from '@/components/ui/toast';

interface LeadWorkflowDialogProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  statusOptions: LeadStatus[];
}

export function LeadWorkflowDialog({ lead, open, onClose, onSuccess, statusOptions }: LeadWorkflowDialogProps) {
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lead && open) {
      setSelectedStage(lead.status || '');
      setNotes(lead.remarks || '');
    }
  }, [lead, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lead || !selectedStage) return;

    setIsSubmitting(true);
    try {
      await leadsApi.updateWorkflow(lead.id, selectedStage, notes);
      toast.success('Workflow updated successfully');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to update workflow';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Lead Workflow</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stage">Current Stage</Label>
            <div className="text-sm font-medium text-muted-foreground">
              {lead?.status || 'New'}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newStage">New Stage</Label>
            <Select value={selectedStage} onValueChange={setSelectedStage} required>
              <SelectTrigger id="newStage">
                <SelectValue placeholder="Select new stage" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add workflow notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedStage}>
              {isSubmitting ? 'Updating...' : 'Update Workflow'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
