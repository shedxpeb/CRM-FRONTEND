'use client';

import { memo } from 'react';
import { EntityRowActionsMenu } from '@/components/row-actions';
import { AnyCommercialDocument } from '../utils/documentHelpers';
import {
  Eye,
  Edit,
  Send,
  FileText,
  CheckCircle,
  XCircle,
  RefreshCw,
  GitBranch,
  MessageSquare,
  Mail,
  FileSearch,
  Printer,
  Download,
  Trash2,
  Copy,
  Building2,
} from 'lucide-react';

interface DocumentRowActionsProps {
  document: AnyCommercialDocument;
  onView: (document: AnyCommercialDocument) => void;
  onEdit: (document: AnyCommercialDocument) => void;
  onDelete: (document: AnyCommercialDocument) => void;
  onSend?: (document: AnyCommercialDocument) => void;
  onConvert?: (document: AnyCommercialDocument, targetType: 'Estimate' | 'Proposal' | 'Quotation') => void;
  onConvertToProject?: (document: AnyCommercialDocument) => void;
  onApprove?: (document: AnyCommercialDocument) => void;
  onReject?: (document: AnyCommercialDocument) => void;
  onVersion?: (document: AnyCommercialDocument) => void;
  onEmail?: (document: AnyCommercialDocument) => void;
  onWhatsApp?: (document: AnyCommercialDocument) => void;
  onPrint?: (document: AnyCommercialDocument) => void;
  onPreviewPdf?: (document: AnyCommercialDocument) => void;
  onDownload?: (document: AnyCommercialDocument) => void;
  onCopy?: (document: AnyCommercialDocument) => void;
  onDuplicate?: (document: AnyCommercialDocument) => void;
}

function getDocumentType(document: AnyCommercialDocument) {
  const doc = document as unknown as Record<string, unknown>;
  if (doc.estimateNumber) return 'Estimate';
  if (doc.proposalNumber) return 'Proposal';
  if (doc.quotationNumber) return 'Quotation';
  if (doc.documentType === 'Invoice') return 'Invoice';
  return 'Unknown';
}

export const DocumentRowActions = memo(function DocumentRowActions({
  document,
  onView,
  onEdit,
  onDelete,
  onSend,
  onConvert,
  onConvertToProject,
  onApprove,
  onReject,
  onVersion,
  onEmail,
  onWhatsApp,
  onPrint,
  onPreviewPdf,
  onDownload,
  onCopy,
  onDuplicate,
}: DocumentRowActionsProps) {
  const doc = document as unknown as Record<string, unknown>;
  const docType = getDocumentType(document);
  const canConvert = doc.status === 'Accepted' || doc.status === 'Sent';
  const canConvertToProject =
    docType === 'Quotation' && doc.status === 'Accepted' && !doc.convertedToProjectId;
  const canApprove = doc.status === 'Draft' && !doc.approvalStatus;
  const canReject = doc.status === 'Draft' && !doc.approvalStatus;

  const convertTargets: Array<'Estimate' | 'Proposal' | 'Quotation'> = (
    ['Estimate', 'Proposal', 'Quotation'] as const
  ).filter((t) => t !== docType);

  return (
    <EntityRowActionsMenu
      sections={{
        view: [
          {
            key: 'view',
            label: 'View Details',
            icon: Eye,
            onClick: () => onView(document),
          },
        ],
        edit: [
          {
            key: 'edit',
            label: 'Edit Document',
            icon: Edit,
            onClick: () => onEdit(document),
          },
        ],
        exportPrint: [
          {
            key: 'print',
            label: 'Print',
            icon: Printer,
            onClick: () => onPrint?.(document),
            hidden: !onPrint,
          },
          {
            key: 'preview-pdf',
            label: 'Preview PDF',
            icon: FileSearch,
            onClick: () => onPreviewPdf?.(document),
            hidden: !onPreviewPdf,
          },
          {
            key: 'download-pdf',
            label: 'Download PDF',
            icon: Download,
            onClick: () => onDownload?.(document),
            hidden: !onDownload,
          },
        ],
        communication: [
          {
            key: 'send',
            label: 'Send Document',
            icon: Send,
            onClick: () => onSend?.(document),
            hidden: !onSend,
          },
          {
            key: 'email',
            label: 'Send Email',
            icon: Mail,
            onClick: () => onEmail?.(document),
            hidden: !onEmail,
          },
          {
            key: 'whatsapp',
            label: 'Send WhatsApp',
            icon: MessageSquare,
            onClick: () => onWhatsApp?.(document),
            hidden: !onWhatsApp,
          },
        ],
        workflow: [
          {
            key: 'convert-to',
            label: 'Convert To',
            icon: RefreshCw,
            items: convertTargets.map((target) => ({
              key: `convert-${target}`,
              label: target,
              icon: FileText,
              onClick: () => onConvert?.(document, target),
            })),
            hidden: !(canConvert && onConvert && convertTargets.length > 0),
          },
          {
            key: 'convert-project',
            label: 'Convert to Project',
            icon: Building2,
            onClick: () => onConvertToProject?.(document),
            hidden: !(canConvertToProject && onConvertToProject),
          },
          {
            key: 'approve',
            label: 'Approve',
            icon: CheckCircle,
            onClick: () => onApprove?.(document),
            hidden: !(canApprove && onApprove),
          },
          {
            key: 'reject',
            label: 'Reject',
            icon: XCircle,
            onClick: () => onReject?.(document),
            hidden: !(canReject && onReject),
          },
          {
            key: 'version',
            label: 'Create Version',
            icon: GitBranch,
            onClick: () => onVersion?.(document),
            hidden: !onVersion,
          },
        ],
        utility: [
          {
            key: 'copy',
            label: 'Copy Document',
            icon: Copy,
            onClick: () => onCopy?.(document),
            hidden: !onCopy,
          },
          {
            key: 'duplicate',
            label: 'Duplicate Document',
            icon: Copy,
            onClick: () => onDuplicate?.(document),
            hidden: !onDuplicate,
          },
        ],
        danger: [
          {
            key: 'delete',
            label: 'Delete Document',
            icon: Trash2,
            onClick: () => onDelete(document),
          },
        ],
      }}
    />
  );
});
