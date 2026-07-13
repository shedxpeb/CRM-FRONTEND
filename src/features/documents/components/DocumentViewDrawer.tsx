'use client';

import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/core/routes';
import { DOCUMENT_STATUS_BADGE_VARIANTS } from '@/features/documents/constants';
import { DocumentActivity } from '../types';
import { DocumentActivityTimeline } from './DocumentActivityTimeline';
import { DocumentCustomFields } from './DocumentCustomFields';
import { useDocumentConfiguration, useDocumentActivities } from '@/features/documents/hooks/useDocuments';
import {
  AnyCommercialDocument,
  getDocumentDiscount,
  getDocumentNumber,
  getDocumentSubtotal,
  getDocumentTax,
  getDocumentTotal,
  getDocumentType,
  getLineItems,
  isApiDocument,
} from '@/features/documents/utils/documentHelpers';
import {
  EntityViewDrawer,
  EntityViewHeader,
  EntityViewBadges,
  EntityViewKpiStrip,
  EntityViewBody,
  EntityViewSection,
  EntityViewFieldGrid,
  EntityViewField,
  EntityViewTabs,
  EntityViewTabsList,
  EntityViewTabTrigger,
  EntityViewTabContent,
  EntityViewFooter,
  formatDrawerDate,
} from '@/components/drawer/EntityViewDrawer';
import { ExternalLink, User, Building2, IndianRupee, Percent, FileText } from 'lucide-react';

interface DocumentViewDrawerProps {
  document: AnyCommercialDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (document: AnyCommercialDocument) => void;
  onPreviewPdf?: (document: AnyCommercialDocument) => void;
  onDownloadPdf?: (document: AnyCommercialDocument) => void;
}

function formatCurrency(amount?: number) {
  if (amount === undefined || amount === null) return '-';
  return `₹${amount.toLocaleString('en-IN')}`;
}

export const DocumentViewDrawer = memo(function DocumentViewDrawer({ document, open, onOpenChange, onEdit, onPreviewPdf, onDownloadPdf }: DocumentViewDrawerProps) {
  const router = useRouter();
  const docConfig = useDocumentConfiguration();
  const { data: activities } = useDocumentActivities(document?.id ?? '');

  if (!document || !open) return null;

  const docType = getDocumentType(document);
  const docNumber = getDocumentNumber(document);
  const total = getDocumentTotal(document);
  const subtotal = getDocumentSubtotal(document);
  const tax = getDocumentTax(document);
  const discount = getDocumentDiscount(document);
  const lineItems = getLineItems(document);
  const customFields = isApiDocument(document) ? document.customFields : (document as { customFields?: Record<string, unknown> }).customFields;

  const customerName = document.customerName;
  const projectName = document.projectName;
  const status = document.status;

  return (
    <EntityViewDrawer open={open} onOpenChange={onOpenChange}>
      <EntityViewHeader
        title={docNumber}
        subtitle={`${docType} · ${customerName}${projectName ? ` · ${projectName}` : ''}`}
        onClose={() => onOpenChange(false)}
      />

      <EntityViewBody>
        <EntityViewBadges>
          <Badge variant={DOCUMENT_STATUS_BADGE_VARIANTS[status as keyof typeof DOCUMENT_STATUS_BADGE_VARIANTS] ?? 'secondary'}>
            {status}
          </Badge>
          <Badge variant="outline">{docType}</Badge>
          {'version' in document && <Badge variant="secondary">v{document.version}</Badge>}
        </EntityViewBadges>

        <EntityViewKpiStrip
          items={[
            { label: 'Amount', value: formatCurrency(subtotal ?? total), icon: <IndianRupee className="h-4 w-4 text-blue-600" />, accentClassName: 'text-blue-600' },
            { label: 'Tax', value: formatCurrency(tax), icon: <Percent className="h-4 w-4 text-purple-600" />, accentClassName: 'text-purple-600' },
            { label: 'Discount', value: formatCurrency(discount ?? 0), icon: <IndianRupee className="h-4 w-4 text-amber-600" />, accentClassName: 'text-amber-600' },
            { label: 'Final Total', value: formatCurrency(total), icon: <IndianRupee className="h-4 w-4 text-green-600" />, accentClassName: 'text-green-600' },
          ]}
        />

        <EntityViewTabs defaultValue="overview">
          <EntityViewTabsList>
            <EntityViewTabTrigger value="overview">Overview</EntityViewTabTrigger>
            <EntityViewTabTrigger value="items">Items</EntityViewTabTrigger>
            <EntityViewTabTrigger value="financials">Financials</EntityViewTabTrigger>
            <EntityViewTabTrigger value="references">References</EntityViewTabTrigger>
            <EntityViewTabTrigger value="activity">Activity</EntityViewTabTrigger>
          </EntityViewTabsList>

          <EntityViewTabContent value="overview">
            <EntityViewSection title="Basic Information" icon={<FileText className="h-4 w-4" />}>
              <EntityViewFieldGrid>
                <EntityViewField label="Document Number" value={<span className="font-mono">{docNumber}</span>} />
                <EntityViewField label="Document Type" value={docType} />
                <EntityViewField label="Customer" value={customerName} />
                <EntityViewField label="Project" value={projectName} />
                <EntityViewField label="Created" value={formatDrawerDate(document.createdAt)} />
                <EntityViewField label="Updated" value={formatDrawerDate(document.updatedAt)} />
              </EntityViewFieldGrid>
            </EntityViewSection>

            {docConfig.customFields.length > 0 && (
              <EntityViewSection title="Custom Fields">
                <DocumentCustomFields mode="view" fields={docConfig.customFields} values={customFields as Record<string, string | number | boolean | undefined>} />
              </EntityViewSection>
            )}

            {'notes' in document && document.notes && (
              <EntityViewSection title="Notes">
                <EntityViewField label="Notes" value={document.notes} />
              </EntityViewSection>
            )}
          </EntityViewTabContent>

          <EntityViewTabContent value="items">
            <EntityViewSection title="Line Items / Materials">
              {lineItems.length > 0 ? (
                <div className="border rounded-lg overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-3 py-2 text-left">Description</th>
                        <th className="px-3 py-2 text-right">Qty</th>
                        <th className="px-3 py-2 text-right">Unit</th>
                        <th className="px-3 py-2 text-right">Rate</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, index) => (
                        <tr key={item.id ?? index} className="border-t">
                          <td className="px-3 py-2">{item.description}</td>
                          <td className="px-3 py-2 text-right">{item.quantity}</td>
                          <td className="px-3 py-2 text-right">{item.unit}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(item.rate)}</td>
                          <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No line items recorded.</p>
              )}
            </EntityViewSection>
          </EntityViewTabContent>

          <EntityViewTabContent value="financials">
            <EntityViewSection title="Financial Summary">
              <EntityViewFieldGrid>
                <EntityViewField label="Subtotal" value={formatCurrency(subtotal)} />
                <EntityViewField label="Tax" value={formatCurrency(tax)} />
                <EntityViewField label="Discount" value={formatCurrency(discount)} />
                <EntityViewField label="Grand Total" value={formatCurrency(total)} />
                {'paymentTerms' in document && <EntityViewField label="Payment Terms" value={document.paymentTerms} />}
                {'validUntil' in document && <EntityViewField label="Valid Until" value={formatDrawerDate(document.validUntil)} />}
              </EntityViewFieldGrid>
            </EntityViewSection>
          </EntityViewTabContent>

          <EntityViewTabContent value="references">
            <EntityViewSection title="Cross-Module References">
              <div className="flex flex-wrap gap-2">
                {document.customerId && (
                  <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.customersDetail(document.customerId))}>
                    <User className="h-3.5 w-3.5 mr-1.5" />
                    Customer
                    <ExternalLink className="h-3 w-3 ml-1.5" />
                  </Button>
                )}
                {document.projectId && (
                  <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.projectsDetail(document.projectId!))}>
                    <Building2 className="h-3.5 w-3.5 mr-1.5" />
                    Project
                    <ExternalLink className="h-3 w-3 ml-1.5" />
                  </Button>
                )}
                {'leadId' in document && document.leadId && (
                  <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.leadsDetail(document.leadId!))}>
                    Lead
                    <ExternalLink className="h-3 w-3 ml-1.5" />
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.items)}>
                  Items
                  <ExternalLink className="h-3 w-3 ml-1.5" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.inventory)}>
                  Inventory
                  <ExternalLink className="h-3 w-3 ml-1.5" />
                </Button>
              </div>
            </EntityViewSection>
          </EntityViewTabContent>

          <EntityViewTabContent value="activity">
            <EntityViewSection title="Activity Timeline">
              <DocumentActivityTimeline activities={(activities as DocumentActivity[] | undefined) ?? []} />
            </EntityViewSection>
          </EntityViewTabContent>
        </EntityViewTabs>
      </EntityViewBody>

      <EntityViewFooter onClose={() => onOpenChange(false)}>
        {onPreviewPdf && <Button variant="outline" onClick={() => onPreviewPdf(document)}>Preview PDF</Button>}
        {onDownloadPdf && <Button variant="outline" onClick={() => onDownloadPdf(document)}>Download PDF</Button>}
        {onEdit && <Button onClick={() => onEdit(document)}>Edit</Button>}
      </EntityViewFooter>
    </EntityViewDrawer>
  );
});
