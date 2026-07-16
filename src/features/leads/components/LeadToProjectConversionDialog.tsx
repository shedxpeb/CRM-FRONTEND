'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConversionWizard } from '@/features/conversion/components/ConversionWizard';
import {
  buildFieldGroups,
  buildLeadGroupCounts,
  buildProjectFromLead,
  mapCustomFields,
} from '@/features/conversion/fieldCatalog';
import type {
  ConversionResultSummary,
  CustomFieldMapping,
  FieldGroupId,
} from '@/features/conversion/types';
import { Lead } from '@/types/leads';
import { useLeadConfiguration } from '@/features/leads/hooks/useLeads';
import { useProjectConfiguration } from '@/features/projects/hooks/useProjects';
import { useAttachments, useComments, useTimeline } from '@/features/tracking/hooks/useTracking';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/core/routes';

interface LeadToProjectConversionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead;
}

/**
 * Conversion wizard for Lead → Project.
 * Uses sessionStorage only as a one-shot form prefills for the project create dialog
 * (draft handoff). Project is persisted via the Project create API (DB source of truth).
 */
export function LeadToProjectConversionDialog({
  open,
  onOpenChange,
  lead,
}: LeadToProjectConversionDialogProps) {
  const router = useRouter();
  const leadConfig = useLeadConfiguration();
  const projectConfig = useProjectConfiguration();

  const { data: commentsData } = useComments('lead', open ? lead.id : '');
  const { data: attachmentsData } = useAttachments('lead', open ? lead.id : '');
  const { data: timelineData } = useTimeline('lead', open ? lead.id : '');

  const [mappings, setMappings] = useState<CustomFieldMapping[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConversionResultSummary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const commentCount = Array.isArray(commentsData)
    ? commentsData.length
    : (commentsData as any)?.data?.length || 0;
  const attachmentCount = Array.isArray(attachmentsData)
    ? attachmentsData.length
    : (attachmentsData as any)?.data?.length || 0;
  const activityCount = Array.isArray(timelineData)
    ? timelineData.length
    : (timelineData as any)?.data?.length || 0;

  const groups = useMemo(() => {
    const counts = buildLeadGroupCounts(lead, commentCount, attachmentCount, activityCount);
    return buildFieldGroups('lead-to-project', counts);
  }, [lead, commentCount, attachmentCount, activityCount]);

  const sourceDefs = useMemo(
    () =>
      (leadConfig.customFields || []).map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type,
        options: f.options,
      })),
    [leadConfig.customFields],
  );

  const destDefs = useMemo(
    () =>
      (projectConfig.customFields || []).map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type,
        options: f.options,
      })),
    [projectConfig.customFields],
  );

  useEffect(() => {
    if (!open) return;
    setError(null);
    setResult(null);
    setMappings(
      mapCustomFields(
        sourceDefs,
        (lead.customFields || {}) as Record<string, string | number | boolean>,
        destDefs,
      ),
    );
  }, [open, lead.id, lead.customFields, sourceDefs, destDefs]);

  const handleClose = () => {
    setError(null);
    setResult(null);
    onOpenChange(false);
  };

  const handleConvert = async (
    selectedGroups: FieldGroupId[],
    customMappings: CustomFieldMapping[],
  ) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const draft = buildProjectFromLead(lead, selectedGroups, customMappings);

      // One-shot form recovery only — never the permanent store of business data
      sessionStorage.setItem(
        'convertFromLead',
        JSON.stringify({
          ...lead,
          ...draft,
          id: lead.id,
          customerId: lead.customerId,
          projectTitle: draft.projectName,
        }),
      );

      const nextSummary: ConversionResultSummary = {
        transferred: {
          standardFields: selectedGroups.filter((g) =>
            ['standard', 'project_requirements', 'technical', 'site', 'address'].includes(g),
          ).length,
          customFields: customMappings.filter((m) => m.action !== 'ignore').length,
          documents: 0,
          attachments: selectedGroups.includes('attachments') ? (lead.attachments?.length || 0) : 0,
          activities: 0,
          comments: 0,
          notes: selectedGroups.includes('notes'),
          tags: 0,
        },
        destinationId: '',
        destinationCode: null,
        destinationName: String(draft.projectName || 'New Project'),
        sourceId: lead.id,
      };
      setResult(nextSummary);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to prepare project conversion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const leadCode = lead.leadNumber
    ? `LD-${String(lead.leadNumber).padStart(6, '0')}`
    : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Convert Lead to Project</DialogTitle>
        </DialogHeader>

        <ConversionWizard
          pairId="lead-to-project"
          title="Select what to transfer"
          sourceLabel={lead.customerName || lead.companyName || 'Lead'}
          sourceCode={leadCode}
          groups={groups}
          customFieldMappings={mappings}
          isSubmitting={isSubmitting}
          error={error}
          result={result}
          onCustomMappingsChange={setMappings}
          onConvert={handleConvert}
          onCancel={handleClose}
          onDone={() => {
            handleClose();
            router.push(ROUTES.projects);
          }}
          destinationFieldOptions={destDefs.map((d) => ({ key: d.key, label: d.label }))}
        />
      </DialogContent>
    </Dialog>
  );
}
