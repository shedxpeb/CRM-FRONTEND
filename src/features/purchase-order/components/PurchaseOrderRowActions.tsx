'use client';

import { useState, memo } from 'react';
import { EntityRowActionsMenu } from '@/components/row-actions';
import { PurchaseOrder } from '../types/purchase-order.types';
import {
  Edit,
  Eye,
  FileText,
  Trash2,
  CheckCircle,
  GitBranch,
  Download,
  Send,
  MessageCircle,
} from 'lucide-react';
import { DeleteCustomerDialog } from '@/components/dialog/DangerConfirmationDialog';

interface PurchaseOrderRowActionsProps {
  purchaseOrder: PurchaseOrder;
  onEdit: (purchaseOrder: PurchaseOrder) => void;
  onDelete: (purchaseOrder: PurchaseOrder) => void;
  onViewDetails?: (purchaseOrder: PurchaseOrder) => void;
  onApprove?: (purchaseOrder: PurchaseOrder) => void;
  onGeneratePDF?: (purchaseOrder: PurchaseOrder) => void;
  onSendToVendor?: (purchaseOrder: PurchaseOrder) => void;
  onSendWhatsApp?: (purchaseOrder: PurchaseOrder) => void;
  onStatusChange?: (purchaseOrder: PurchaseOrder, status: string) => void;
}

const PO_STATUSES = ['Draft', 'PendingApproval', 'Approved', 'Sent', 'Cancelled'];

export const PurchaseOrderRowActions = memo(function PurchaseOrderRowActions({
  purchaseOrder,
  onEdit,
  onDelete,
  onViewDetails,
  onApprove,
  onGeneratePDF,
  onSendToVendor,
  onSendWhatsApp,
  onStatusChange,
}: PurchaseOrderRowActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(purchaseOrder);
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const canEdit = purchaseOrder.status === 'Draft' || purchaseOrder.status === 'PendingApproval';
  const canDelete = purchaseOrder.status === 'Draft' || purchaseOrder.status === 'PendingApproval';
  const canApprove = purchaseOrder.status === 'Draft' || purchaseOrder.status === 'PendingApproval';

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
              onClick: () => onEdit(purchaseOrder),
              hidden: !canEdit,
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
              key: 'change-status',
              label: 'Change Status',
              icon: GitBranch,
              items: PO_STATUSES.map((status) => ({
                key: `status-${status}`,
                label: status,
                icon: purchaseOrder.status === status ? CheckCircle : GitBranch,
                onClick: () => onStatusChange?.(purchaseOrder, status),
              })),
              hidden: !onStatusChange,
            },
          ],
          utility: [
            {
              key: 'generate-pdf',
              label: 'Generate PDF',
              icon: Download,
              onClick: () => onGeneratePDF?.(purchaseOrder),
              hidden: !onGeneratePDF || purchaseOrder.status === 'Draft',
            },
            {
              key: 'send-whatsapp',
              label: 'Send via WhatsApp',
              icon: MessageCircle,
              onClick: () => onSendWhatsApp?.(purchaseOrder),
              hidden: !onSendWhatsApp || purchaseOrder.status === 'Draft',
            },
            {
              key: 'send-vendor',
              label: 'Send to Vendor',
              icon: Send,
              onClick: () => onSendToVendor?.(purchaseOrder),
              hidden: !onSendToVendor || purchaseOrder.status !== 'Approved',
            },
          ],
          danger: [
            {
              key: 'delete',
              label: 'Delete PO',
              icon: Trash2,
              onClick: () => setShowDeleteDialog(true),
              hidden: !canDelete,
            },
          ],
        }}
      />
      <DeleteCustomerDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        entityName={`${purchaseOrder.poNumber}`}
      />
    </>
  );
});
