'use client';

import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/layouts/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/loading/CardSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { TrackingEngine } from '@/components/tracking/TrackingEngine';
import { ActivityAuditLog } from '@/components/tracking/ActivityAuditLog';
import { useInvoiceById } from '@/features/finance/hooks/useFinance';
import { formatCurrency, getInvoiceStatusVariant } from '@/features/finance/constants';
import {
  formatFinanceDate,
  InfoGrid,
  Section,
  useFinanceBack,
} from '@/features/finance/components/FinanceDetailShared';
import { ROUTES } from '@/core/routes';
import { ArrowLeft, Building2, ExternalLink, FileText, IndianRupee, User } from 'lucide-react';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const handleBack = useFinanceBack();
  const { data: invoice, isLoading, isError } = useInvoiceById(id);

  if (isLoading) {
    return (
      <MainLayout>
        <CardSkeleton count={4} />
      </MainLayout>
    );
  }

  if (!invoice || isError) {
    return (
      <MainLayout>
        <ErrorState
          title="Invoice not found"
          message={`Could not load invoice ${id}. It may have been removed or is only available in local list state.`}
          retryLabel="Back to Finance"
          onRetry={() => router.push(ROUTES.finance)}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2 self-start">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold truncate">{invoice.invoiceNumber}</h1>
              <Badge variant={getInvoiceStatusVariant(invoice.status)}>{invoice.status}</Badge>
              {invoice.gstType && <Badge variant="outline">{invoice.gstType}</Badge>}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {invoice.customerName}
              {invoice.projectName ? ` · ${invoice.projectName}` : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</p>
              <p className="text-sm font-semibold mt-0.5">{formatCurrency(invoice.totalAmount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Paid</p>
              <p className="text-sm font-semibold mt-0.5 text-green-700">{formatCurrency(invoice.paidAmount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Pending</p>
              <p className="text-sm font-semibold mt-0.5 text-amber-700">{formatCurrency(invoice.pendingAmount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Due Date</p>
              <p className="text-sm font-semibold mt-0.5">{formatFinanceDate(invoice.dueDate)}</p>
            </CardContent>
          </Card>
        </div>

        <Section title="Workflow / Status Pipeline" defaultOpen>
          <TrackingEngine entityType="invoice" entityId={id} />
        </Section>

        <Section title="Overview">
          <InfoGrid
            items={[
              { label: 'Invoice Number', value: invoice.invoiceNumber, icon: <FileText className="w-3 h-3" /> },
              { label: 'Customer', value: invoice.customerName, icon: <User className="w-3 h-3" /> },
              { label: 'Project', value: invoice.projectName || '-', icon: <Building2 className="w-3 h-3" /> },
              { label: 'Payment Terms', value: invoice.paymentTerms || '-' },
              { label: 'Source', value: invoice.sourceType || '-' },
              { label: 'Version', value: invoice.version },
            ]}
          />
        </Section>

        <Section title="Information">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Customer</h4>
              <InfoGrid
                items={[
                  { label: 'Customer Name', value: invoice.customerName },
                  { label: 'Customer ID', value: invoice.customerId },
                  { label: 'Address', value: invoice.customerAddress || '-' },
                  { label: 'GST', value: invoice.customerGST || '-' },
                ]}
              />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Amounts</h4>
              <InfoGrid
                items={[
                  { label: 'Subtotal', value: formatCurrency(invoice.subtotal), icon: <IndianRupee className="w-3 h-3" /> },
                  { label: 'Tax', value: formatCurrency(invoice.taxAmount) },
                  { label: 'Total', value: formatCurrency(invoice.totalAmount) },
                  { label: 'Paid', value: formatCurrency(invoice.paidAmount) },
                  { label: 'Pending', value: formatCurrency(invoice.pendingAmount) },
                  { label: 'CGST', value: formatCurrency(invoice.cgstAmount || 0) },
                  { label: 'SGST', value: formatCurrency(invoice.sgstAmount || 0) },
                  { label: 'IGST', value: formatCurrency(invoice.igstAmount || 0) },
                ]}
              />
            </div>
            {invoice.lineItems?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Line Items</h4>
                <div className="space-y-2">
                  {invoice.lineItems.map((line) => (
                    <div key={line.id} className="flex items-center justify-between gap-3 rounded border p-2 text-sm">
                      <span className="truncate">{line.description}</span>
                      <span className="font-medium whitespace-nowrap">{formatCurrency(line.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>

        <Section title="Related">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {invoice.customerId && (
              <button
                type="button"
                onClick={() => router.push(ROUTES.customersDetail(invoice.customerId))}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left"
              >
                <User className="w-5 h-5 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Customer</p>
                  <p className="text-xs text-muted-foreground truncate">{invoice.customerName}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
            {invoice.projectId && (
              <button
                type="button"
                onClick={() => router.push(ROUTES.projectsDetail(invoice.projectId!))}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left"
              >
                <Building2 className="w-5 h-5 text-green-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Project</p>
                  <p className="text-xs text-muted-foreground truncate">{invoice.projectName}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </Section>

        <Section title="Activities & Audit Log" defaultOpen={false}>
          <ActivityAuditLog entityType="invoice" entityId={id} />
        </Section>
      </div>
    </MainLayout>
  );
}
