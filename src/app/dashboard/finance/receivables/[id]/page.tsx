'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/layouts/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/loading/CardSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { ActivityAuditLog } from '@/components/tracking/ActivityAuditLog';
import { useInvoiceById, useReceivables } from '@/features/finance/hooks/useFinance';
import { formatCurrency } from '@/features/finance/constants';
import type { Receivable } from '@/features/finance/types';
import {
  formatFinanceDate,
  InfoGrid,
  Section,
  useFinanceBack,
} from '@/features/finance/components/FinanceDetailShared';
import { ROUTES } from '@/core/routes';
import { ArrowLeft, Building2, ExternalLink, FileText, User } from 'lucide-react';

function receivableFromInvoice(invoiceId: string, invoice: NonNullable<ReturnType<typeof useInvoiceById>['data']>): Receivable {
  const overdueDays = Math.max(
    0,
    Math.floor((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))
  );
  const agingBucket =
    overdueDays <= 30 ? '0-30 Days' : overdueDays <= 60 ? '31-60 Days' : overdueDays <= 90 ? '61-90 Days' : '90+ Days';

  return {
    id: `rec-${invoiceId}`,
    customerId: invoice.customerId,
    customerName: invoice.customerName,
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.createdAt ?? invoice.sentAt ?? invoice.dueDate,
    projectId: invoice.projectId,
    projectName: invoice.projectName,
    totalAmount: invoice.totalAmount,
    paidAmount: invoice.paidAmount,
    pendingAmount: invoice.pendingAmount,
    dueDate: invoice.dueDate,
    overdueDays,
    agingBucket,
    status: overdueDays > 0 ? 'Overdue' : invoice.paidAmount > 0 ? 'Partial' : 'Pending',
  };
}

export default function ReceivableDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const handleBack = useFinanceBack();

  const derivedInvoiceId = id.startsWith('rec-') ? id.slice(4) : '';
  const { data: receivablesResponse, isLoading: listLoading } = useReceivables({ page: 1, pageSize: 1000 });
  const { data: invoice, isLoading: invoiceLoading } = useInvoiceById(derivedInvoiceId);

  const receivable = useMemo(() => {
    const fromApi = receivablesResponse?.data?.find((row) => row.id === id);
    if (fromApi) return fromApi;
    if (invoice && derivedInvoiceId) return receivableFromInvoice(derivedInvoiceId, invoice);
    return null;
  }, [receivablesResponse, id, invoice, derivedInvoiceId]);

  const isLoading = listLoading || (!!derivedInvoiceId && invoiceLoading);

  if (isLoading) {
    return (
      <MainLayout>
        <CardSkeleton count={4} />
      </MainLayout>
    );
  }

  if (!receivable) {
    return (
      <MainLayout>
        <ErrorState
          title="Receivable not found"
          message={`Could not load receivable ${id}. Derived receivables use ids like rec-&#123;invoiceId&#125;; API mock ids may differ.`}
          retryLabel="Back to Finance"
          onRetry={() => router.push(ROUTES.finance)}
        />
      </MainLayout>
    );
  }

  const isOverdue = (receivable.overdueDays || 0) > 0;

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
              <h1 className="text-xl font-semibold truncate">{receivable.customerName}</h1>
              <Badge variant={isOverdue ? 'destructive' : 'default'}>{receivable.status}</Badge>
              <Badge variant={receivable.agingBucket === '90+ Days' ? 'destructive' : 'outline'}>
                {receivable.agingBucket}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Invoice {receivable.invoiceNumber}
              {receivable.projectName ? ` · ${receivable.projectName}` : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</p>
              <p className="text-sm font-semibold mt-0.5">{formatCurrency(receivable.totalAmount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Paid</p>
              <p className="text-sm font-semibold mt-0.5 text-green-700">{formatCurrency(receivable.paidAmount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Pending</p>
              <p className="text-sm font-semibold mt-0.5 text-amber-700">{formatCurrency(receivable.pendingAmount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Due Date</p>
              <p className="text-sm font-semibold mt-0.5">{formatFinanceDate(receivable.dueDate)}</p>
            </CardContent>
          </Card>
        </div>

        <Section title="Overview" defaultOpen>
          <InfoGrid
            items={[
              { label: 'Customer', value: receivable.customerName, icon: <User className="w-3 h-3" /> },
              { label: 'Invoice', value: receivable.invoiceNumber, icon: <FileText className="w-3 h-3" /> },
              { label: 'Project', value: receivable.projectName || '-', icon: <Building2 className="w-3 h-3" /> },
              { label: 'Aging', value: receivable.agingBucket },
              { label: 'Overdue Days', value: receivable.overdueDays },
              { label: 'Invoice Date', value: formatFinanceDate(receivable.invoiceDate) },
            ]}
          />
        </Section>

        <Section title="Information">
          <InfoGrid
            items={[
              { label: 'Total Amount', value: formatCurrency(receivable.totalAmount) },
              { label: 'Paid Amount', value: formatCurrency(receivable.paidAmount) },
              { label: 'Pending Amount', value: formatCurrency(receivable.pendingAmount) },
              { label: 'Due Date', value: formatFinanceDate(receivable.dueDate) },
              { label: 'Status', value: receivable.status },
              { label: 'Customer ID', value: receivable.customerId },
            ]}
          />
        </Section>

        <Section title="Related">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {receivable.invoiceId && (
              <button
                type="button"
                onClick={() => router.push(ROUTES.financeInvoice(receivable.invoiceId))}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left"
              >
                <FileText className="w-5 h-5 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Invoice</p>
                  <p className="text-xs text-muted-foreground truncate">{receivable.invoiceNumber}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
            {receivable.customerId && (
              <button
                type="button"
                onClick={() => router.push(ROUTES.customersDetail(receivable.customerId))}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left"
              >
                <User className="w-5 h-5 text-green-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Customer</p>
                  <p className="text-xs text-muted-foreground truncate">{receivable.customerName}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Tracking is not shown for receivables (derived entity). Open the linked invoice for workflow.
          </p>
        </Section>

        <Section title="Activities & Audit Log" defaultOpen={false}>
          <ActivityAuditLog entityType="invoice" entityId={receivable.invoiceId || id} />
        </Section>
      </div>
    </MainLayout>
  );
}
