'use client';

import { useState, memo } from 'react';
import { EntityRowActionsMenu } from '@/components/row-actions';
import { InventoryItem, StockStatus } from '@/features/inventory/types';
import { useInventoryConfiguration } from '@/features/inventory/hooks/useInventory';
import {
  Edit,
  Eye,
  Trash2,
  CheckCircle,
  GitBranch,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightLeft,
  Lock,
  History,
  ShoppingCart,
} from 'lucide-react';
import { DeleteInventoryDialog } from '@/components/dialog/DangerConfirmationDialog';

interface InventoryRowActionsProps {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onViewDetails?: (item: InventoryItem) => void;
  onStockIn?: (item: InventoryItem) => void;
  onStockOut?: (item: InventoryItem) => void;
  onTransfer?: (item: InventoryItem) => void;
  onReserve?: (item: InventoryItem) => void;
  onViewHistory?: (item: InventoryItem) => void;
  onCreatePurchaseRequest?: (item: InventoryItem) => void;
  onStatusChange?: (item: InventoryItem, status: StockStatus) => void;
}

export const InventoryRowActions = memo(function InventoryRowActions({
  item,
  onEdit,
  onDelete,
  onViewDetails,
  onStockIn,
  onStockOut,
  onTransfer,
  onReserve,
  onViewHistory,
  onCreatePurchaseRequest,
  onStatusChange,
}: InventoryRowActionsProps) {
  const { stockStatuses } = useInventoryConfiguration();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(item);
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
              onClick: () => onViewDetails?.(item),
              hidden: !onViewDetails,
            },
          ],
          edit: [
            {
              key: 'edit',
              label: 'Edit Inventory',
              icon: Edit,
              onClick: () => onEdit(item),
            },
          ],
          workflow: [
            {
              key: 'stock-in',
              label: 'Stock In',
              icon: ArrowDownToLine,
              onClick: () => onStockIn?.(item),
              hidden: !onStockIn,
            },
            {
              key: 'stock-out',
              label: 'Stock Out',
              icon: ArrowUpFromLine,
              onClick: () => onStockOut?.(item),
              hidden: !onStockOut,
            },
            {
              key: 'transfer',
              label: 'Transfer Stock',
              icon: ArrowRightLeft,
              onClick: () => onTransfer?.(item),
              hidden: !onTransfer,
            },
            {
              key: 'reserve',
              label: 'Reserve Stock',
              icon: Lock,
              onClick: () => onReserve?.(item),
              hidden: !onReserve,
            },
            {
              key: 'change-status',
              label: 'Change Status',
              icon: GitBranch,
              items: stockStatuses.map((status) => ({
                key: `status-${status}`,
                label: status,
                icon: item.status === status ? CheckCircle : GitBranch,
                onClick: () => onStatusChange?.(item, status as StockStatus),
              })),
              hidden: !onStatusChange,
            },
            {
              key: 'purchase-request',
              label: 'Create Purchase Request',
              icon: ShoppingCart,
              onClick: () => onCreatePurchaseRequest?.(item),
              hidden: !onCreatePurchaseRequest,
            },
          ],
          utility: [
            {
              key: 'history',
              label: 'View Stock History',
              icon: History,
              onClick: () => onViewHistory?.(item),
              hidden: !onViewHistory,
            },
          ],
          danger: [
            {
              key: 'delete',
              label: 'Delete Inventory',
              icon: Trash2,
              onClick: () => setShowDeleteDialog(true),
            },
          ],
        }}
      />
      <DeleteInventoryDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        entityName={`${item.itemCode} - ${item.itemName}`}
      />
    </>
  );
});
