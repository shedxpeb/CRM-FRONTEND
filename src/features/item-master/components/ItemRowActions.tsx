'use client';

import React from 'react';
import { EntityRowActionsMenu } from '@/components/row-actions';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { ItemMaster } from '@/features/item-master/types';

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
        edit: [
          {
            key: 'edit',
            label: 'Edit Item',
            icon: Edit,
            onClick: () => onEdit(item),
          },
        ],
        danger: [
          {
            key: 'delete',
            label: 'Delete Item',
            icon: Trash2,
            onClick: () => onDelete(item),
          },
        ],
      }}
    />
  );
});
