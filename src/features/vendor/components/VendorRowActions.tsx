'use client';

import { useState, memo } from 'react';
import { EntityRowActionsMenu } from '@/components/row-actions';
import { Vendor } from '../types/vendor.types';
import {
  Edit,
  Eye,
  FileText,
  Trash2,
  CheckCircle,
  GitBranch,
  Mail,
  Phone,
} from 'lucide-react';
import { DeleteCustomerDialog } from '@/components/dialog/DangerConfirmationDialog';

interface VendorRowActionsProps {
  vendor: Vendor;
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendor: Vendor) => void;
  onViewDetails?: (vendor: Vendor) => void;
  onViewPurchaseOrders?: (vendor: Vendor) => void;
  onSendEmail?: (vendor: Vendor) => void;
  onStatusChange?: (vendor: Vendor, status: string) => void;
}

const VENDOR_STATUSES = ['Active', 'Inactive'];

export const VendorRowActions = memo(function VendorRowActions({
  vendor,
  onEdit,
  onDelete,
  onViewDetails,
  onViewPurchaseOrders,
  onSendEmail,
  onStatusChange,
}: VendorRowActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(vendor);
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <EntityRowActionsMenu
        sections={{
          view: [
            {
              key: 'view',
              label: 'View Details',
              icon: Eye,
              onClick: () => onViewDetails?.(vendor),
              hidden: !onViewDetails,
            },
          ],
          edit: [
            {
              key: 'edit',
              label: 'Edit Vendor',
              icon: Edit,
              onClick: () => onEdit(vendor),
            },
          ],
          communication: [
            {
              key: 'email',
              label: 'Send Email',
              icon: Mail,
              onClick: () => onSendEmail?.(vendor),
              hidden: !onSendEmail || !vendor.email,
            },
            {
              key: 'call',
              label: 'Call',
              icon: Phone,
              onClick: () => window.open(`tel:${vendor.phone}`),
            },
          ],
          workflow: [
            {
              key: 'change-status',
              label: 'Change Status',
              icon: GitBranch,
              items: VENDOR_STATUSES.map((status) => ({
                key: `status-${status}`,
                label: status,
                icon: vendor.status === status ? CheckCircle : GitBranch,
                onClick: () => onStatusChange?.(vendor, status),
              })),
              hidden: !onStatusChange,
            },
          ],
          utility: [
            {
              key: 'view-purchase-orders',
              label: 'View Purchase Orders',
              icon: FileText,
              onClick: () => onViewPurchaseOrders?.(vendor),
              hidden: !onViewPurchaseOrders,
            },
          ],
          danger: [
            {
              key: 'delete',
              label: 'Delete Vendor',
              icon: Trash2,
              onClick: () => setShowDeleteDialog(true),
            },
          ],
        }}
      />
      <DeleteCustomerDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        entityName={`${vendor.companyName}`}
      />
    </>
  );
});
