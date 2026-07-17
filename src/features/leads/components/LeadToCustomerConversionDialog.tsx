'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConversionWizard } from '@/features/conversion/components/ConversionWizard';
import {
  buildCustomerFromLead,
  buildFieldGroups,
  buildLeadGroupCounts,
  mapCustomFields,
} from '@/features/conversion/fieldCatalog';
import type {
  ConversionResultSummary,
  CustomFieldMapping,
  FieldGroupId,
} from '@/features/conversion/types';
import { Lead } from '@/types/leads';
import { Customer } from '@/features/customers/types';
import { useConvertLeadToCustomer, useCustomerConfiguration } from '@/features/customers/hooks/useCustomers';
import { useLeadConfiguration } from '@/features/leads/hooks/useLeads';
import { useAttachments, useComments, useTimeline } from '@/features/tracking/hooks/useTracking';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/core/routes';

interface LeadToCustomerConversionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead;
  onCustomerCreated?: (customer: Customer) => void;
}

export function LeadToCustomerConversionDialog({
  open,
  onOpenChange,
  lead,
  onCustomerCreated,
}: LeadToCustomerConversionDialogProps) {
  const router = useRouter();
  const convertLeadMutation = useConvertLeadToCustomer();
  const leadConfig = useLeadConfiguration();
  const customerConfig = useCustomerConfiguration();

  const { data: commentsData } = useComments('lead', open ? lead.id : '');
  const { data: attachmentsData } = useAttachments('lead', open ? lead.id : '');
  const { data: timelineData } = useTimeline('lead', open ? lead.id : '');

  const [mappings, setMappings] = useState<CustomFieldMapping[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConversionResultSummary | null>(null);

  const commentCount = Array.isArray(commentsData)
    ? commentsData.length
    : (commentsData as any)?.data?.length || (commentsData as any)?.length || 0;
  const attachmentCount = Array.isArray(attachmentsData)
    ? attachmentsData.length
    : (attachmentsData as any)?.data?.length || (attachmentsData as any)?.length || 0;
  const activityCount = Array.isArray(timelineData)
    ? timelineData.length
    : (timelineData as any)?.data?.length || (timelineData as any)?.length || 0;

  const groups = useMemo(() => {
    const counts = buildLeadGroupCounts(lead, commentCount, attachmentCount, activityCount);
    return buildFieldGroups('lead-to-customer', counts);
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
      (customerConfig.customFields || []).map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type,
        options: f.options,
      })),
    [customerConfig.customFields],
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
    profileId?: string,
  ) => {
    try {
      setError(null);
      const payload = buildCustomerFromLead(lead, selectedGroups, customMappings);
      payload.profileId = profileId;

      const missing: string[] = [];
      if (!payload.customerName) missing.push('customer name');
      if (!payload.companyName) missing.push('company name');
      if (!payload.mobile) missing.push('mobile');
      if (!payload.source) missing.push('source');
      if (missing.length) {
        setError(
          `Cannot convert: lead is missing ${missing.join(', ')}. Update the lead first, or keep Standard/Contact groups selected.`,
        );
        return;
      }

      const customerResult = await convertLeadMutation.mutateAsync(payload as any);
      const resultData = (customerResult as any)?.data ?? customerResult;
      const customer = resultData?.customer ?? resultData;
      const summary = resultData?.summary as ConversionResultSummary | undefined;

      const nextSummary: ConversionResultSummary = summary || {
        transferred: {
          standardFields: selectedGroups.filter((g) =>
            ['standard', 'contact', 'company', 'address'].includes(g),
          ).length,
          customFields: customMappings.filter((m) => m.action !== 'ignore').length,
          documents: 0,
          attachments: selectedGroups.includes('attachments') ? (lead.attachments?.length || 0) : 0,
          activities: selectedGroups.includes('activities') || selectedGroups.includes('timeline') ? 1 : 0,
          comments: selectedGroups.includes('comments') ? commentCount : 0,
          notes: selectedGroups.includes('notes'),
          tags: selectedGroups.includes('tags') ? (lead.tags?.length || 0) : 0,
        },
        destinationId: customer?.id,
        destinationCode: customer?.customerId
          ? `CUS-${String(customer.customerId).padStart(6, '0')}`
          : null,
        destinationName: customer?.customerName,
        sourceId: lead.id,
      };

      setResult(nextSummary);
      onCustomerCreated?.(customer as Customer);
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.message ||
        (err instanceof Error ? err.message : 'Failed to convert lead to customer.');
      setError(typeof message === 'string' ? message : JSON.stringify(message));
    }
  };

  const leadCode = lead.leadNumber
    ? `LD-${String(lead.leadNumber).padStart(6, '0')}`
    : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Convert Lead to Customer</DialogTitle>
        </DialogHeader>

        <ConversionWizard
          pairId="lead-to-customer"
          title="Select what to transfer"
          sourceLabel={lead.customerName || lead.companyName || 'Lead'}
          sourceCode={leadCode}
          groups={groups}
          customFieldMappings={mappings}
          isSubmitting={convertLeadMutation.isPending}
          error={error}
          result={result}
          onCustomMappingsChange={setMappings}
          onConvert={handleConvert}
          onCancel={handleClose}
          onDone={() => {
            handleClose();
            if (result?.destinationId) {
              router.push(ROUTES.customersDetail(result.destinationId));
            }
          }}
          destinationFieldOptions={destDefs.map((d) => ({ key: d.key, label: d.label }))}
        />
      </DialogContent>
    </Dialog>
  );
}
