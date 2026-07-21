'use client';

import { useState, memo } from 'react';
import { EntityRowActionsMenu } from '@/components/row-actions';
import { PurchaseOrder } from '../types/purchase-order.types';
import { PO_STATUSES } from '../constants';
import {
  Edit,
  Eye,
  Trash2,
  CheckCircle,
  GitBranch,
  Download,
  Send,
  MessageCircle,
  Copy,
  History,
  FileText,
  EyeOff,
  Printer,
  ExternalLink,
} from 'lucide-react';
import { DeleteCustomerDialog } from '@/components/dialog/DangerConfirmationDialog';

interface PurchaseOrderRowActionsProps {
  purchaseOrder: PurchaseOrder;
  onViewDetails?: (purchaseOrder: PurchaseOrder) => void;
  onEdit?: (purchaseOrder: PurchaseOrder) => void;
  onDelete?: (purchaseOrder: PurchaseOrder) => void;
  onApprove?: (purchaseOrder: PurchaseOrder) => void;
  onStatusChange?: (purchaseOrder: PurchaseOrder, status: string) => void;
  onSendToVendor?: (purchaseOrder: PurchaseOrder) => void;
  onPreviewPdf?: (purchaseOrder: PurchaseOrder) => void;
  onDownloadPdf?: (purchaseOrder: PurchaseOrder) => void;
  onPrintPdf?: (purchaseOrder: PurchaseOrder) => void;
  onDuplicate?: (purchaseOrder: PurchaseOrder) => void;
  onSendWhatsApp?: (purchaseOrder: PurchaseOrder) => void;
}

export const PurchaseOrderRowActions = memo(function PurchaseOrderRowActions({
  purchaseOrder,
  onViewDetails,
  onEdit,
  onDelete,
  onApprove,
  onStatusChange,
  onSendToVendor,
  onPreviewPdf,
  onDownloadPdf,
  onPrintPdf,
  onDuplicate,
  onSendWhatsApp,
}: PurchaseOrderRowActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete?.(purchaseOrder);
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const status = purchaseOrder.status;
  const canEdit = status === 'Draft' || status === 'PendingApproval';
  const canDelete = status === 'Draft' || status === 'PendingApproval';
  const canApprove = status === 'Draft' || status === 'PendingApproval';
  const canSend = status === 'Approved';
  const isDraft = status === 'Draft';

  return (
    <>
      <EntityRowActionsMenu
        sections={{
          view: [
            {
              key: 'view',
              label: 'View Details',
              icon: Eye,
              onClick: () => onViewDetails?.(purchaseOrder),
              hidden: !onViewDetails,
            },
          ],
          edit: [
            {
              key: 'edit',
              label: 'Edit PO',
              icon: Edit,
              onClick: () => onEdit?.(purchaseOrder),
              hidden: !canEdit || !onEdit,
            },
            {
              key: 'duplicate',
              label: 'Duplicate PO',
              icon: Copy,
              onClick: () => onDuplicate?.(purchaseOrder),
              hidden: !onDuplicate,
            },
          ],
          workflow: [
            {
              key: 'approve',
              label: 'Approve',
              icon: CheckCircle,
              onClick: () => onApprove?.(purchaseOrder),
              hidden: !canApprove || !onApprove,
            },
            {
              key: 'send-vendor',
              label: 'Send to Vendor',
              icon: Send,
              onClick: () => onSendToVendor?.(purchaseOrder),
              hidden: !canSend || !onSendToVendor,
            },
            {
              key: 'change-status',
              label: 'Change Status',
              icon: GitBranch,
              items: PO_STATUSES.map((s) => ({
                key: `status-${s}`,
                label: s,
                icon: status === s ? CheckCircle : GitBranch,
                onClick: () => onStatusChange?.(purchaseOrder, s),
                hidden: status === s,
              })),
              hidden: !onStatusChange,
            },
          ],
          exportPrint: [
            {
              key: 'preview-pdf',
              label: 'Preview PDF',
              icon: EyeOff,
              onClick: () => onPreviewPdf?.(purchaseOrder),
              hidden: !onPreviewPdf || isDraft,
            },
            {
              key: 'download-pdf',
              label: 'Download PDF',
              icon: Download,
              onClick: () => onDownloadPdf?.(purchaseOrder),
              hidden: !onDownloadPdf || isDraft,
            },
            {
              key: 'print-pdf',
              label: 'Print PDF',
              icon: Printer,
              onClick: () => onPrintPdf?.(purchaseOrder),
              hidden: !onPrintPdf || isDraft,
            },
          ],
          communication: [
            {
              key: 'send-whatsapp',
              label: 'Send via WhatsApp',
              icon: MessageCircle,
              onClick: () => onSendWhatsApp?.(purchaseOrder),
              hidden: !onSendWhatsApp || isDraft,
            },
            {
              key: 'copy-link',
              label: 'Copy Link',
              icon: ExternalLink,
              onClick: () => {
                const url = `${window.location.origin}/purchase/orders/${purchaseOrder.id}`;
                navigator.clipboard.writeText(url);
              },
            },
          ],
          utility: [
            {
              key: 'timeline',
              label: 'View Timeline',
              icon: History,
              onClick: () => onViewDetails?.(purchaseOrder),
              hidden: !onViewDetails,
            },
          ],
          danger: [
            {
              key: 'delete',
              label: 'Delete PO',
              icon: Trash2,
              onClick: () => setShowDeleteDialog(true),
              hidden: !canDelete || !onDelete,
            },
          ],
        }}
      />
      <DeleteCustomerDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        entityName={purchaseOrder.poNumber}
      />
    </>
  );
});
