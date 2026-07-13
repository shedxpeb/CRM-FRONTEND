'use client';

import { useState, memo } from 'react';
import { EntityRowActionsMenu } from '@/components/row-actions';
import { Lead, LeadStatus } from '@/types/leads';
import {
  Edit,
  TrendingUp,
  FileText,
  Trash2,
  CheckCircle,
  GitBranch,
  Eye,
  User,
} from 'lucide-react';
import { LeadTracker } from './LeadTracker';
import { LeadLogsDialog } from './LeadLogsDialog';
import { AddScoreDialog } from './AddScoreDialog';
import { DEFAULT_LEAD_CONFIGURATION } from '@/features/leads/hooks/useLeads';

interface LeadRowActionsProps {
  lead: Lead;
  statusOptions?: LeadStatus[];
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
  onConvertToCustomer?: (lead: Lead) => void;
  onCreateEstimate?: (lead: Lead) => void;
  onView?: (lead: Lead) => void;
  onAddScore?: (lead: Lead, score: number) => void;
  onStatusChange?: (lead: Lead, status: LeadStatus) => void;
}

export const LeadRowActions = memo(function LeadRowActions({
  lead,
  statusOptions = DEFAULT_LEAD_CONFIGURATION.statuses as LeadStatus[],
  onEdit,
  onDelete,
  onConvert,
  onConvertToCustomer,
  onCreateEstimate,
  onView,
  onAddScore,
  onStatusChange,
}: LeadRowActionsProps) {
  const [showTracker, setShowTracker] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showScore, setShowScore] = useState(false);

  return (
    <>
      <EntityRowActionsMenu
        sections={{
          view: [
            {
              key: 'view',
              label: 'View Details',
              icon: Eye,
              onClick: () => (onView ? onView(lead) : setShowTracker(true)),
            },
          ],
          edit: [
            {
              key: 'edit',
              label: 'Edit Lead',
              icon: Edit,
              onClick: () => onEdit(lead),
            },
          ],
          workflow: [
            {
              key: 'add-score',
              label: 'Add Score',
              icon: TrendingUp,
              onClick: () => setShowScore(true),
              hidden: !onAddScore,
            },
            {
              key: 'change-status',
              label: 'Change Status',
              icon: GitBranch,
              items: statusOptions.map((status) => ({
                key: `status-${status}`,
                label: status,
                icon: lead.status === status ? CheckCircle : GitBranch,
                onClick: () => onStatusChange?.(lead, status),
                hidden: !onStatusChange,
              })),
              hidden: !onStatusChange,
            },
            {
              key: 'create-estimate',
              label: 'Create Estimate',
              icon: FileText,
              onClick: () => onCreateEstimate?.(lead),
              hidden: !onCreateEstimate,
            },
            {
              key: 'convert-customer',
              label: 'Convert to Customer',
              icon: User,
              onClick: () => onConvertToCustomer?.(lead),
              hidden: !onConvertToCustomer,
            },
            {
              key: 'convert-project',
              label: 'Convert to Project',
              icon: CheckCircle,
              onClick: () => onConvert(lead),
            },
          ],
          utility: [
            {
              key: 'logs',
              label: 'View Logs',
              icon: FileText,
              onClick: () => setShowLogs(true),
            },
          ],
          danger: [
            {
              key: 'delete',
              label: 'Delete Lead',
              icon: Trash2,
              onClick: () => onDelete(lead),
            },
          ],
        }}
      />

      <LeadTracker lead={lead} open={showTracker} onOpenChange={setShowTracker} />
      <LeadLogsDialog lead={lead} open={showLogs} onOpenChange={setShowLogs} />
      <AddScoreDialog
        lead={lead}
        open={showScore}
        onOpenChange={setShowScore}
        onSubmit={(score: number) => {
          onAddScore?.(lead, score);
          setShowScore(false);
        }}
      />
    </>
  );
});
