'use client';

import { memo } from 'react';
import { EntityRowActionsMenu } from '@/components/row-actions';
import { Eye, Pencil, Trash2, Send, CheckCircle, XCircle, FileText } from 'lucide-react';

interface FinanceRowActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSend?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onGenerateReport?: () => void;
}

export const FinanceRowActions = memo(function FinanceRowActions({
  onView,
  onEdit,
  onDelete,
  onSend,
  onApprove,
  onReject,
  onGenerateReport,
}: FinanceRowActionsProps) {
  return (
    <EntityRowActionsMenu
      sections={{
        view: [
          {
            key: 'view',
            label: 'View Details',
            icon: Eye,
            onClick: () => onView?.(),
            hidden: !onView,
          },
        ],
        edit: [
          {
            key: 'edit',
            label: 'Edit',
            icon: Pencil,
            onClick: () => onEdit?.(),
            hidden: !onEdit,
          },
        ],
        exportPrint: [
          {
            key: 'report',
            label: 'Generate Report',
            icon: FileText,
            onClick: () => onGenerateReport?.(),
            hidden: !onGenerateReport,
          },
        ],
        communication: [
          {
            key: 'send',
            label: 'Send',
            icon: Send,
            onClick: () => onSend?.(),
            hidden: !onSend,
          },
        ],
        workflow: [
          {
            key: 'approve',
            label: 'Approve',
            icon: CheckCircle,
            onClick: () => onApprove?.(),
            hidden: !onApprove,
          },
          {
            key: 'reject',
            label: 'Reject',
            icon: XCircle,
            onClick: () => onReject?.(),
            hidden: !onReject,
          },
        ],
        danger: [
          {
            key: 'delete',
            label: 'Delete',
            icon: Trash2,
            onClick: () => onDelete?.(),
            hidden: !onDelete,
          },
        ],
      }}
    />
  );
});
