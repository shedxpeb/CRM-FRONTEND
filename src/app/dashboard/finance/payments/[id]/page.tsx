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
import { usePaymentById } from '@/features/finance/hooks/useFinance';
import { formatCurrency, getPaymentStatusVariant } from '@/features/finance/constants';
import {
  formatFinanceDate,
  InfoGrid,
  Section,
  useFinanceBack,
} from '@/features/finance/components/FinanceDetailShared';
import { ROUTES } from '@/core/routes';
import { ArrowLeft, Building2, CreditCard, ExternalLink, FileText, User } from 'lucide-react';

export default function PaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const handleBack = useFinanceBack();
  const { data: payment, isLoading, isError } = usePaymentById(id);

  if (isLoading) {
    return (
      <MainLayout>
        <CardSkeleton count={4} />
      </MainLayout>
    );
  }

  if (!payment || isError) {
    return (
      <MainLayout>
        <ErrorState
          title="Payment not found"
          message={`Could not load payment ${id}. It may have been removed or is only available in local list state.`}
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
              <h1 className="text-xl font-semibold truncate">{payment.paymentNumber}</h1>
              <Badge variant={getPaymentStatusVariant(payment.status)}>{payment.status}</Badge>
              <Badge variant="outline">{payment.paymentMethod}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {payment.type} · {payment.customerName} · {formatFinanceDate(payment.paymentDate)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Amount</p>
              <p className="text-sm font-semibold mt-0.5">{formatCurrency(payment.amount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Tax</p>
              <p className="text-sm font-semibold mt-0.5">{formatCurrency(payment.taxAmount || 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</p>
              <p className="text-sm font-semibold mt-0.5 text-green-700">{formatCurrency(payment.totalAmount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Date</p>
              <p className="text-sm font-semibold mt-0.5">{formatFinanceDate(payment.paymentDate)}</p>
            </CardContent>
          </Card>
        </div>

        <Section title="Workflow / Status Pipeline" defaultOpen>
          <TrackingEngine entityType="payment" entityId={id} />
        </Section>

        <Section title="Overview">
          <InfoGrid
            items={[
              { label: 'Payment Number', value: payment.paymentNumber, icon: <CreditCard className="w-3 h-3" /> },
              { label: 'Type', value: payment.type },
              { label: 'Method', value: payment.paymentMethod },
              { label: 'Customer', value: payment.customerName, icon: <User className="w-3 h-3" /> },
              { label: 'Invoice', value: payment.invoiceNumber || '-', icon: <FileText className="w-3 h-3" /> },
              { label: 'Project', value: payment.projectName || '-', icon: <Building2 className="w-3 h-3" /> },
            ]}
          />
        </Section>

        <Section title="Information">
          <InfoGrid
            items={[
              { label: 'Reference Number', value: payment.referenceNumber || '-' },
              { label: 'Transaction ID', value: payment.transactionId || '-' },
              { label: 'Notes', value: payment.notes || '-' },
              { label: 'Created', value: formatFinanceDate(payment.createdAt) },
            ]}
          />
        </Section>

        <Section title="Related">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {payment.invoiceId && (
              <button
                type="button"
                onClick={() => router.push(ROUTES.financeInvoice(payment.invoiceId!))}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left"
              >
                <FileText className="w-5 h-5 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Invoice</p>
                  <p className="text-xs text-muted-foreground truncate">{payment.invoiceNumber}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
            {payment.customerId && (
              <button
                type="button"
                onClick={() => router.push(ROUTES.customersDetail(payment.customerId))}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left"
              >
                <User className="w-5 h-5 text-green-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Customer</p>
                  <p className="text-xs text-muted-foreground truncate">{payment.customerName}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </Section>

        <Section title="Activities & Audit Log" defaultOpen={false}>
          <ActivityAuditLog entityType="payment" entityId={id} />
        </Section>
      </div>
    </MainLayout>
  );
}
