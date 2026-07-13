'use client';

import { memo } from 'react';
import { EntityRowActionsMenu } from '@/components/row-actions';
import { Customer, CustomerStatus } from '@/features/customers/types';
import { useCustomerConfiguration } from '@/features/customers/hooks/useCustomers';
import {
  Edit,
  Eye,
  FolderKanban,
  FileText,
  Trash2,
  CheckCircle,
  GitBranch,
  MessageSquare,
  Mail,
  Calendar,
  Phone,
} from 'lucide-react';

interface CustomerRowActionsProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onViewDetails?: (customer: Customer) => void;
  onViewProjects?: (customer: Customer) => void;
  onViewDocuments?: (customer: Customer) => void;
  onCreateProject?: (customer: Customer) => void;
  onSendWhatsApp?: (customer: Customer) => void;
  onSendEmail?: (customer: Customer) => void;
  onScheduleMeeting?: (customer: Customer) => void;
  onLogCall?: (customer: Customer) => void;
  onStatusChange?: (customer: Customer, status: CustomerStatus) => void;
}

export const CustomerRowActions = memo(function CustomerRowActions({
  customer,
  onEdit,
  onDelete,
  onViewDetails,
  onViewProjects,
  onViewDocuments,
  onCreateProject,
  onSendWhatsApp,
  onSendEmail,
  onScheduleMeeting,
  onLogCall,
  onStatusChange,
}: CustomerRowActionsProps) {
  const { statuses } = useCustomerConfiguration();

  return (
    <EntityRowActionsMenu
      sections={{
        view: [
          {
            key: 'view',
            label: 'View Details',
            icon: Eye,
            onClick: () => onViewDetails?.(customer),
            hidden: !onViewDetails,
          },
        ],
        edit: [
          {
            key: 'edit',
            label: 'Edit Customer',
            icon: Edit,
            onClick: () => onEdit(customer),
          },
        ],
        communication: [
          {
            key: 'whatsapp',
            label: 'Send WhatsApp',
            icon: MessageSquare,
            onClick: () => onSendWhatsApp?.(customer),
            hidden: !onSendWhatsApp,
          },
          {
            key: 'email',
            label: 'Send Email',
            icon: Mail,
            onClick: () => onSendEmail?.(customer),
            hidden: !onSendEmail,
          },
          {
            key: 'meeting',
            label: 'Schedule Meeting',
            icon: Calendar,
            onClick: () => onScheduleMeeting?.(customer),
            hidden: !onScheduleMeeting,
          },
          {
            key: 'call',
            label: 'Log Call',
            icon: Phone,
            onClick: () => (onLogCall ? onLogCall(customer) : onEdit(customer)),
          },
        ],
        workflow: [
          {
            key: 'change-status',
            label: 'Change Status',
            icon: GitBranch,
            items: statuses.map((status) => ({
              key: `status-${status}`,
              label: status,
              icon: customer.status === status ? CheckCircle : GitBranch,
              onClick: () => onStatusChange?.(customer, status as CustomerStatus),
            })),
            hidden: !onStatusChange,
          },
          {
            key: 'create-project',
            label: 'Create Project',
            icon: FolderKanban,
            onClick: () => onCreateProject?.(customer),
            hidden: !onCreateProject,
          },
        ],
        utility: [
          {
            key: 'view-projects',
            label: 'View Projects',
            icon: FolderKanban,
            onClick: () => onViewProjects?.(customer),
            hidden: !onViewProjects,
          },
          {
            key: 'view-documents',
            label: 'View Documents',
            icon: FileText,
            onClick: () => onViewDocuments?.(customer),
            hidden: !onViewDocuments,
          },
        ],
        danger: [
          {
            key: 'delete',
            label: 'Delete Customer',
            icon: Trash2,
            onClick: () => onDelete(customer),
          },
        ],
      }}
    />
  );
});
