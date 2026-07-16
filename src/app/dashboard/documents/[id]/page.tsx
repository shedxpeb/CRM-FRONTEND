'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardSkeleton } from '@/components/loading/CardSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { TrackingEngine } from '@/components/tracking/TrackingEngine';
import { ActivityAuditLog } from '@/components/tracking/ActivityAuditLog';
import { DocumentPrintView, companyToPrintInfo } from '@/features/documents/components/print/DocumentPrintView';
import { useUnifiedDocument } from '@/features/documents/hooks/useUnifiedDocuments';
import { useDocumentPdfActions } from '@/features/documents/hooks/useDocumentPdfActions';
import { useDocumentConfiguration, useDocumentActivities } from '@/features/documents/hooks/useDocuments';
import { useCompany } from '@/features/settings/hooks/useSettings';
import type { Company } from '@/features/settings/types';
import { DocumentActivity } from '@/features/documents/types';
import { buildDocumentPrintModel } from '@/features/documents/utils/documentPrintData';
import {
  getDocumentDiscount,
  getDocumentNumber,
  getDocumentSubtotal,
  getDocumentTax,
  getDocumentTotal,
  getDocumentType,
  getEditRoute,
  getLineItems,
  isApiDocument,
} from '@/features/documents/utils/documentHelpers';
import { DOCUMENT_STATUS_BADGE_VARIANTS } from '@/features/documents/constants';
import { ROUTES } from '@/core/routes';
import {
  ArrowLeft, Edit, ChevronDown, ChevronRight, FileText, IndianRupee,
  Percent, FileSearch, Download, Printer, User, Building2, ExternalLink,
} from 'lucide-react';

function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold bg-muted/30 hover:bg-muted/50 transition-colors">
        {title}
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

function InfoGrid({ items }: { items: { label: string; value: React.ReactNode; icon?: React.ReactNode }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(item => (
        <div key={item.label} className="space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">{item.icon}{item.label}</p>
          <p className="text-sm font-medium">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function formatDate(value?: Date | string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatCurrency(amount?: number) {
  if (amount === undefined || amount === null) return '-';
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { document: unified, loading } = useUnifiedDocument(id);
  const docConfig = useDocumentConfiguration();
  const { data: company } = useCompany();
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const { data: activities } = useDocumentActivities(id);

  const printModel = useMemo(
    () => (unified ? buildDocumentPrintModel(unified.source) : null),
    [unified]
  );

  const companyPrint = useMemo(
    () => companyToPrintInfo({
      companyName: (company as Company | undefined)?.companyName ?? 'PEB Solutions',
      legalCompanyName: (company as Company | undefined)?.legalCompanyName,
      address: (company as Company | undefined)?.address,
      city: (company as Company | undefined)?.city,
      state: (company as Company | undefined)?.state,
      postalCode: (company as Company | undefined)?.postalCode,
      mobile: (company as Company | undefined)?.mobile,
      email: (company as Company | undefined)?.email,
      gstNumber: (company as Company | undefined)?.gstNumber,
      website: (company as Company | undefined)?.website,
    }),
    [company]
  );

  const { previewPdf, downloadPdf, PdfPreviewDialog } = useDocumentPdfActions();

  if (loading) {
    return (
      <MainLayout>
        <CardSkeleton count={4} />
      </MainLayout>
    );
  }

  if (!unified) {
    return (
      <MainLayout>
        <ErrorState
          title="Document not found"
          message="The selected document could not be loaded."
          retryLabel="Back to Documents"
          onRetry={() => router.push(ROUTES.documents)}
        />
      </MainLayout>
    );
  }

  const document = unified.source;
  const docType = getDocumentType(document);
  const docNumber = getDocumentNumber(document);
  const total = getDocumentTotal(document);
  const subtotal = getDocumentSubtotal(document);
  const tax = getDocumentTax(document);
  const discount = getDocumentDiscount(document);
  const lineItems = getLineItems(document);
  const customFields = isApiDocument(document)
    ? document.customFields
    : (document as { customFields?: Record<string, unknown> }).customFields;

  return (
    <MainLayout>
      {printModel && (
        <div className="hidden print:block">
          <DocumentPrintView
            model={printModel}
            company={companyPrint}
            authorizedBy={unified.createdBy}
            authorizedDesignation="Sales Executive"
            mode="print"
          />
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="sm" onClick={() => (typeof window !== 'undefined' && window.history.length > 1 ? router.back() : router.push(ROUTES.documents))}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Documents
            </Button>
            <div className="h-4 w-px bg-border" />
            <div className="min-w-0">
              <h1 className="text-lg font-semibold truncate">{docNumber}</h1>
              <p className="text-sm text-muted-foreground truncate">
                {docType} &middot; {unified.customerName}
                {unified.projectName ? ` &middot; ${unified.projectName}` : ''}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => previewPdf(document)}>
              <FileSearch className="h-4 w-4 mr-2" />
              Preview PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadPdf(document)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowPrintPreview(true)}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowPrintPreview((v) => !v)}>
              <FileText className="h-4 w-4 mr-2" />
              {showPrintPreview ? 'Hide' : 'Show'} Layout
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push(getEditRoute(unified))}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={DOCUMENT_STATUS_BADGE_VARIANTS[unified.status as keyof typeof DOCUMENT_STATUS_BADGE_VARIANTS] ?? 'secondary'}>
            {unified.status}
          </Badge>
          <Badge variant="outline">{docType}</Badge>
          {'version' in document && <Badge variant="secondary">v{document.version}</Badge>}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <IndianRupee className="h-3.5 w-3.5 text-blue-600" />
                Amount
              </div>
              <p className="text-lg font-semibold text-blue-600">{formatCurrency(subtotal ?? total)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Percent className="h-3.5 w-3.5 text-purple-600" />
                Tax
              </div>
              <p className="text-lg font-semibold text-purple-600">{formatCurrency(tax)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <IndianRupee className="h-3.5 w-3.5 text-amber-600" />
                Discount
              </div>
              <p className="text-lg font-semibold text-amber-600">{formatCurrency(discount ?? 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <IndianRupee className="h-3.5 w-3.5 text-green-600" />
                Total
              </div>
              <p className="text-lg font-semibold text-green-600">{formatCurrency(total)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-3">
          {/* Workflow */}
          <Section title="Workflow / Status Pipeline" defaultOpen={true}>
            <TrackingEngine entityType="document" entityId={id} />
          </Section>

          {/* Overview */}
          <Section title="Overview" defaultOpen={false}>
            <InfoGrid
              items={[
                { label: 'Document Number', value: <span className="font-mono">{docNumber}</span> },
                { label: 'Document Type', value: docType },
                { label: 'Status', value: <Badge variant={DOCUMENT_STATUS_BADGE_VARIANTS[unified.status as keyof typeof DOCUMENT_STATUS_BADGE_VARIANTS] ?? 'secondary'}>{unified.status}</Badge> },
                { label: 'Date', value: formatDate(unified.createdAt) },
                { label: 'Customer', value: unified.customerName, icon: <User className="w-3 h-3" /> },
                { label: 'Project', value: unified.projectName || '-', icon: <Building2 className="w-3 h-3" /> },
              ]}
            />
          </Section>

          {/* Information */}
          <Section title="Information" defaultOpen={false}>
            <div className="space-y-6">
              {/* Basic */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Basic</p>
                <InfoGrid
                  items={[
                    { label: 'Document Number', value: <span className="font-mono">{docNumber}</span> },
                    { label: 'Document Type', value: docType },
                    { label: 'Status', value: <Badge variant={DOCUMENT_STATUS_BADGE_VARIANTS[unified.status as keyof typeof DOCUMENT_STATUS_BADGE_VARIANTS] ?? 'secondary'}>{unified.status}</Badge> },
                    { label: 'Date', value: formatDate(unified.createdAt) },
                    { label: 'Valid Until', value: 'validUntil' in document && document.validUntil ? formatDate(document.validUntil) : '-' },
                    { label: 'Customer', value: unified.customerName, icon: <User className="w-3 h-3" /> },
                    { label: 'Project', value: unified.projectName || '-', icon: <Building2 className="w-3 h-3" /> },
                    { label: 'Created By', value: unified.createdBy || '-' },
                    { label: 'Last Updated', value: formatDate(unified.updatedAt) },
                  ]}
                />
              </div>

              {/* Financials */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Financials</p>
                <InfoGrid
                  items={[
                    { label: 'Subtotal', value: formatCurrency(subtotal), icon: <IndianRupee className="w-3 h-3" /> },
                    { label: 'Tax', value: formatCurrency(tax), icon: <Percent className="w-3 h-3" /> },
                    { label: 'Discount', value: formatCurrency(discount), icon: <IndianRupee className="w-3 h-3" /> },
                    { label: 'Grand Total', value: <span className="font-semibold">{formatCurrency(total)}</span> },
                    { label: 'Payment Terms', value: 'paymentTerms' in document ? document.paymentTerms || '-' : '-' },
                  ]}
                />
              </div>

              {/* Line Items */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Line Items</p>
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
                        {lineItems.map((lineItem, index) => (
                          <tr key={lineItem.id ?? index} className="border-t">
                            <td className="px-3 py-2">{lineItem.description}</td>
                            <td className="px-3 py-2 text-right">{lineItem.quantity}</td>
                            <td className="px-3 py-2 text-right">{lineItem.unit}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(lineItem.rate)}</td>
                            <td className="px-3 py-2 text-right font-medium">{formatCurrency(lineItem.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No line items recorded.</p>
                )}
              </div>

              {/* Notes */}
              {'notes' in document && document.notes && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Notes</p>
                  <p className="text-sm">{document.notes}</p>
                </div>
              )}

              {/* Custom Fields */}
              {docConfig.customFields.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Custom Fields</p>
                  <InfoGrid
                    items={docConfig.customFields.map((f) => ({
                      label: f.label,
                      value: (customFields as Record<string, string | number | boolean | undefined>)?.[f.key] ?? '-',
                    }))}
                  />
                </div>
              )}
            </div>
          </Section>

          {/* Related Records */}
          <Section title="Related Records" defaultOpen={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {document.customerId && (
                <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(ROUTES.customersDetail(document.customerId))}>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-medium">Customer</span>
                  </div>
                  <p className="text-sm font-semibold">{unified.customerName}</p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">View Customer</Button>
                </div>
              )}
              {document.projectId && (
                <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(ROUTES.projectsDetail(document.projectId!))}>
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-medium">Project</span>
                  </div>
                  <p className="text-sm font-semibold">{unified.projectName || document.projectId}</p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">View Project</Button>
                </div>
              )}
              {'leadId' in document && document.leadId && (
                <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(ROUTES.leadsDetail(document.leadId!))}>
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-medium">Lead</span>
                  </div>
                  <p className="text-sm font-semibold">{document.leadId}</p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">View Lead</Button>
                </div>
              )}
            </div>
          </Section>

          {/* Activities */}
          <Section title="Activities & Audit Log" defaultOpen={false}>
            <ActivityAuditLog entityType="document" entityId={id} />
          </Section>
        </div>

        {/* Print Preview */}
        {showPrintPreview && printModel && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Client Document Layout (PDF Source)</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <DocumentPrintView
                model={printModel}
                company={companyPrint}
                authorizedBy={unified.createdBy}
                authorizedDesignation="Sales Executive"
                mode="preview"
              />
            </CardContent>
          </Card>
        )}
      </div>
      {PdfPreviewDialog}
    </MainLayout>
  );
}
