'use client';

import React from 'react';
import { EntityRowActionsMenu } from '@/components/row-actions';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { ItemMaster } from '@/features/item-master/types';
import { usePermission } from '@/features/auth/usePermission';

interface ItemRowActionsProps {
  item: ItemMaster;
  onView: (item: ItemMaster) => void;
  onEdit: (item: ItemMaster) => void;
  onDelete: (item: ItemMaster) => void;
}

export const ItemRowActions = React.memo(function ItemRowActions({
  item,
  onView,
  onEdit,
  onDelete,
}: ItemRowActionsProps) {
  const { hasPermission } = usePermission();
  const canEdit = hasPermission('item-master:update');
  const canDelete = hasPermission('item-master:delete');

  return (
    <EntityRowActionsMenu
      sections={{
        view: [
          {
            key: 'view',
            label: 'View Details',
            icon: Eye,
            onClick: () => onView(item),
          },
        ],
        ...(canEdit
          ? {
              edit: [
                {
                  key: 'edit',
                  label: 'Edit Item',
                  icon: Edit,
                  onClick: () => onEdit(item),
                },
              ],
            }
          : {}),
        ...(canDelete
          ? {
              danger: [
                {
                  key: 'delete',
                  label: 'Delete Item',
                  icon: Trash2,
                  onClick: () => onDelete(item),
                },
              ],
            }
          : {}),
      }}
    />
  );
});
