'use client';

import React from 'react';
import { EntityRowActionsMenu } from '@/components/row-actions';
import { Eye, Edit, Trash2, FileText, Package, Users, CheckCircle } from 'lucide-react';
import { Project } from '@/features/projects/types';

interface ProjectRowActionsProps {
  project: Project;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onStartDesign?: (project: Project) => void;
  onCreateBOQ?: (project: Project) => void;
  onReserveInventory?: (project: Project) => void;
  onAssignTeam?: (project: Project) => void;
  onMarkComplete?: (project: Project) => void;
}

export const ProjectRowActions = React.memo(function ProjectRowActions({
  project,
  onView,
  onEdit,
  onDelete,
  onStartDesign,
  onCreateBOQ,
  onReserveInventory,
  onAssignTeam,
  onMarkComplete,
}: ProjectRowActionsProps) {
  return (
    <EntityRowActionsMenu
      sections={{
        view: [
          {
            key: 'view',
            label: 'View Details',
            icon: Eye,
            onClick: () => onView(project),
          },
        ],
        edit: [
          {
            key: 'edit',
            label: 'Edit Project',
            icon: Edit,
            onClick: () => onEdit(project),
          },
        ],
        workflow: [
          {
            key: 'start-design',
            label: 'Start Design',
            icon: FileText,
            onClick: () => onStartDesign?.(project),
            hidden: !(project.status === 'Approved' && onStartDesign),
          },
          {
            key: 'create-boq',
            label: 'Create BOQ',
            icon: FileText,
            onClick: () => onCreateBOQ?.(project),
            hidden: !(project.status === 'Design' && onCreateBOQ),
          },
          {
            key: 'reserve-inventory',
            label: 'Reserve Inventory',
            icon: Package,
            onClick: () => onReserveInventory?.(project),
            hidden: !((project.status === 'BOQ' || project.status === 'Procurement') && onReserveInventory),
          },
          {
            key: 'assign-team',
            label: 'Assign Team',
            icon: Users,
            onClick: () => onAssignTeam?.(project),
            hidden: !onAssignTeam,
          },
          {
            key: 'mark-complete',
            label: 'Mark Complete',
            icon: CheckCircle,
            onClick: () => onMarkComplete?.(project),
            hidden: !(project.status === 'Installation' && onMarkComplete),
          },
        ],
        danger: [
          {
            key: 'delete',
            label: 'Delete Project',
            icon: Trash2,
            onClick: () => onDelete(project),
          },
        ],
      }}
    />
  );
});
