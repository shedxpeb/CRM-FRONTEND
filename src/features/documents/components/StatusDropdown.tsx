'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChevronDown } from 'lucide-react';

export type DocumentStatus = 
  | 'Draft' | 'Ready' | 'Sent' | 'Viewed' | 'Under Review' 
  | 'Negotiation' | 'Approved' | 'Accepted' | 'Rejected' 
  | 'Expired' | 'Converted' | 'Cancelled';

interface StatusDropdownProps {
  currentStatus: DocumentStatus;
  documentType: 'Estimate' | 'Proposal' | 'Quotation';
  documentNumber: string;
  onStatusChange: (newStatus: DocumentStatus, note?: string) => Promise<void>;
  variant?: 'default' | 'secondary' | 'info' | 'warning' | 'success' | 'destructive';
}

const STATUS_OPTIONS: Record<string, DocumentStatus[]> = {
  Estimate: ['Draft', 'Ready', 'Sent', 'Viewed', 'Approved', 'Rejected', 'Expired', 'Converted', 'Cancelled'],
  Proposal: ['Draft', 'Sent', 'Viewed', 'Under Review', 'Approved', 'Rejected', 'Converted', 'Expired'],
  Quotation: ['Draft', 'Sent', 'Viewed', 'Negotiation', 'Accepted', 'Rejected', 'Expired', 'Converted'],
};

const STATUS_VARIANTS: Record<DocumentStatus, string> = {
  'Draft': 'secondary',
  'Ready': 'info',
  'Sent': 'default',
  'Viewed': 'info',
  'Under Review': 'warning',
  'Negotiation': 'warning',
  'Approved': 'success',
  'Accepted': 'success',
  'Rejected': 'destructive',
  'Expired': 'secondary',
  'Converted': 'success',
  'Cancelled': 'destructive',
};

export function StatusDropdown({
  currentStatus,
  documentType,
  documentNumber,
  onStatusChange,
  variant,
}: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const availableStatuses = STATUS_OPTIONS[documentType] || [];

  const handleStatusSelect = (status: DocumentStatus) => {
    if (status === currentStatus) {
      setOpen(false);
      return;
    }
    setSelectedStatus(status);
    setOpen(false);
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    if (!selectedStatus) return;
    
    setLoading(true);
    try {
      await onStatusChange(selectedStatus, note);
      setShowConfirmDialog(false);
      setNote('');
      setSelectedStatus(null);
    } catch (error) {
      alert('Failed to change status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    setNote('');
    setSelectedStatus(null);
  };

  const badgeVariant = variant || (STATUS_VARIANTS[currentStatus] as any);

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2">
            <Badge variant={badgeVariant} className="cursor-pointer">
              {currentStatus}
            </Badge>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Change Status
          </div>
          <DropdownMenuSeparator />
          {availableStatuses.map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={() => handleStatusSelect(status)}
              className={currentStatus === status ? 'bg-muted font-medium' : ''}
            >
              <Badge 
                variant={STATUS_VARIANTS[status] as any} 
                className="mr-2"
              >
                {status}
              </Badge>
              {currentStatus === status && '(Current)'}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Status?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{documentType}:</span>
                <span className="font-mono">{documentNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={STATUS_VARIANTS[currentStatus] as any}>
                  {currentStatus}
                </Badge>
                <span>→</span>
                <Badge variant={selectedStatus ? (STATUS_VARIANTS[selectedStatus] as any) : 'secondary'}>
                  {selectedStatus}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Add Note (optional)</Label>
              <Textarea
                id="note"
                placeholder="Add a note about this status change..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={loading}>
              {loading ? 'Updating...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
