'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/layouts/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardSkeleton } from '@/components/loading/CardSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { DocumentActivityTimeline } from '@/features/documents/components/DocumentActivityTimeline';
import { DocumentCustomFields } from '@/features/documents/components/DocumentCustomFields';
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
  ArrowLeft,
  Edit,
  FileText,
  IndianRupee,
  Percent,
  User,
  Building2,
  ExternalLink,
  Download,
  FileSearch,
  Printer,
} from 'lucide-react';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium break-words">{value ?? '-'}</p>
    </div>
  );
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
  const [activeTab, setActiveTab] = useState('overview');
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const { data: activities } = useDocumentActivities(activeTab === 'activity' ? id : '');

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

  const handlePrint = () => {
    window.print();
  };

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
        <DocumentPrintView
          model={printModel}
          company={companyPrint}
          authorizedBy={unified.createdBy}
          authorizedDesignation="Sales Executive"
          mode="print"
        />
      )}

      <div className="print-screen-ui space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.documents)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Documents
            </Button>
            <div className="h-4 w-px bg-border" />
            <div className="min-w-0">
              <h1 className="text-lg font-semibold truncate">{docNumber}</h1>
              <p className="text-sm text-muted-foreground truncate">
                {docType} · {unified.customerName}
                {unified.projectName ? ` · ${unified.projectName}` : ''}
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
              Download PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowPrintPreview((v) => !v)}>
              <FileText className="h-4 w-4 mr-2" />
              {showPrintPreview ? 'Hide' : 'Show'} PDF Layout
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push(getEditRoute(unified))}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Document
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={DOCUMENT_STATUS_BADGE_VARIANTS[unified.status as keyof typeof DOCUMENT_STATUS_BADGE_VARIANTS] ?? 'secondary'}>
            {unified.status}
          </Badge>
          <Badge variant="outline">{docType}</Badge>
          {'version' in document && <Badge variant="secondary">v{document.version}</Badge>}
        </div>

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
                Final Total
              </div>
              <p className="text-lg font-semibold text-green-600">{formatCurrency(total)}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="references">References</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Field label="Document Number" value={<span className="font-mono">{docNumber}</span>} />
                  <Field label="Document Type" value={docType} />
                  <Field label="Customer" value={unified.customerName} />
                  <Field label="Project" value={unified.projectName} />
                  <Field label="Created By" value={unified.createdBy} />
                  <Field
                    label="Created"
                    value={unified.createdAt ? new Date(unified.createdAt).toLocaleDateString('en-IN') : '-'}
                  />
                  <Field
                    label="Updated"
                    value={unified.updatedAt ? new Date(unified.updatedAt).toLocaleDateString('en-IN') : '-'}
                  />
                </div>
              </CardContent>
            </Card>

            {docConfig.customFields.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Custom Fields</CardTitle>
                </CardHeader>
                <CardContent>
                  <DocumentCustomFields
                    mode="view"
                    fields={docConfig.customFields}
                    values={customFields as Record<string, string | number | boolean | undefined>}
                  />
                </CardContent>
              </Card>
            )}

            {'notes' in document && document.notes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{document.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="items" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Line Items / Materials</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financials" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Subtotal" value={formatCurrency(subtotal)} />
                  <Field label="Tax" value={formatCurrency(tax)} />
                  <Field label="Discount" value={formatCurrency(discount)} />
                  <Field label="Grand Total" value={formatCurrency(total)} />
                  {'paymentTerms' in document && <Field label="Payment Terms" value={document.paymentTerms} />}
                  {'validUntil' in document && document.validUntil && (
                    <Field label="Valid Until" value={new Date(document.validUntil).toLocaleDateString('en-IN')} />
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="references" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Cross-Module References</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">Read-only references. No live coupling between modules.</p>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentActivityTimeline activities={(activities as DocumentActivity[] | undefined) ?? []} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
