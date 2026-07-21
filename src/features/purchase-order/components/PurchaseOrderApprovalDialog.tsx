'use client';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PurchaseOrder } from '../types/purchase-order.types';
import { formatCurrency } from '../utils/format';
import { CheckCircle, XCircle } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  po: PurchaseOrder | null;
  onApprove: () => void;
  onReject: (reason?: string) => void;
  isProcessing: boolean;
}

export function PurchaseOrderApprovalDialog({ open, onOpenChange, po, onApprove, onReject, isProcessing }: Props) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  const isApproveMode = po?.status === 'Draft' || po?.status === 'PendingApproval';
  const isRejectMode = po?.status === 'Approved';

  const handleApprove = () => {
    onApprove();
  };

  const handleReject = () => {
    onReject(reason || undefined);
  };

  if (!po) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isApproveMode ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Approve Purchase Order
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                Reject Purchase Order
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isApproveMode
              ? `You are about to approve purchase order ${po.poNumber}.`
              : `You are about to reject purchase order ${po.poNumber}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">PO Number:</span>
            <span className="font-medium">{po.poNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Vendor:</span>
            <span className="font-medium">{po.vendorName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Grand Total:</span>
            <span className="font-medium">{formatCurrency(po.grandTotal, po.currency)}</span>
          </div>
        </div>

        {isRejectMode && (
          <div className="space-y-2">
            <Label htmlFor="rejectReason">Rejection Reason</Label>
            <Textarea
              id="rejectReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={3}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          {isApproveMode ? (
            <Button onClick={handleApprove} disabled={isProcessing} className="bg-green-600 hover:bg-green-700">
              {isProcessing ? 'Processing...' : 'Approve'}
            </Button>
          ) : (
            <Button variant="destructive" onClick={handleReject} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Reject'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
