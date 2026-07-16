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
import { useExpenseById, usePayables } from '@/features/finance/hooks/useFinance';
import { formatCurrency } from '@/features/finance/constants';
import type { Payable } from '@/features/finance/types';
import {
  formatFinanceDate,
  InfoGrid,
  Section,
  useFinanceBack,
} from '@/features/finance/components/FinanceDetailShared';
import { ROUTES } from '@/core/routes';
import { ArrowLeft, Building2, ExternalLink, FileText, User } from 'lucide-react';

function payableFromExpense(
  expenseId: string,
  expense: NonNullable<ReturnType<typeof useExpenseById>['data']>
): Payable {
  const dueDate = new Date(expense.date);
  dueDate.setDate(dueDate.getDate() + 30);
  const overdueDays = Math.max(
    0,
    Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  const agingBucket =
    overdueDays <= 30 ? '0-30 Days' : overdueDays <= 60 ? '31-60 Days' : overdueDays <= 90 ? '61-90 Days' : '90+ Days';

  return {
    id: `payable-${expenseId}`,
    vendorId: expense.vendorId,
    vendorName: expense.vendorName,
    billId: expense.id,
    billNumber: expense.expenseNumber,
    billDate: expense.date,
    projectId: expense.projectId,
    projectName: expense.projectName,
    totalAmount: expense.totalAmount,
    paidAmount: 0,
    pendingAmount: expense.totalAmount,
    dueDate,
    overdueDays,
    agingBucket,
    status: overdueDays > 0 ? 'Overdue' : 'Pending',
  };
}

export default function PayableDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const handleBack = useFinanceBack();

  const derivedExpenseId = id.startsWith('payable-') ? id.slice(8) : '';
  const { data: payablesResponse, isLoading: listLoading } = usePayables({ page: 1, pageSize: 1000 });
  const { data: expense, isLoading: expenseLoading } = useExpenseById(derivedExpenseId);

  const payable = useMemo(() => {
    const fromApi = payablesResponse?.data?.find((row) => row.id === id);
    if (fromApi) return fromApi;
    if (expense && derivedExpenseId) return payableFromExpense(derivedExpenseId, expense);
    return null;
  }, [payablesResponse, id, expense, derivedExpenseId]);

  const isLoading = listLoading || (!!derivedExpenseId && expenseLoading);

  if (isLoading) {
    return (
      <MainLayout>
        <CardSkeleton count={4} />
      </MainLayout>
    );
  }

  if (!payable) {
    return (
      <MainLayout>
        <ErrorState
          title="Payable not found"
          message={`Could not load payable ${id}. Derived payables use ids like payable-{expenseId}; API mock ids may differ.`}
          retryLabel="Back to Finance"
          onRetry={() => router.push(ROUTES.finance)}
        />
      </MainLayout>
    );
  }

  const isOverdue = (payable.overdueDays || 0) > 0;

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
              <h1 className="text-xl font-semibold truncate">{payable.vendorName}</h1>
              <Badge variant={isOverdue ? 'destructive' : 'default'}>{payable.status}</Badge>
              <Badge variant={payable.agingBucket === '90+ Days' ? 'destructive' : 'outline'}>
                {payable.agingBucket}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Bill {payable.billNumber}
              {payable.projectName ? ` · ${payable.projectName}` : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</p>
              <p className="text-sm font-semibold mt-0.5">{formatCurrency(payable.totalAmount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Paid</p>
              <p className="text-sm font-semibold mt-0.5 text-green-700">{formatCurrency(payable.paidAmount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Pending</p>
              <p className="text-sm font-semibold mt-0.5 text-amber-700">{formatCurrency(payable.pendingAmount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Due Date</p>
              <p className="text-sm font-semibold mt-0.5">{formatFinanceDate(payable.dueDate)}</p>
            </CardContent>
          </Card>
        </div>

        <Section title="Overview" defaultOpen>
          <InfoGrid
            items={[
              { label: 'Vendor', value: payable.vendorName, icon: <User className="w-3 h-3" /> },
              { label: 'Bill', value: payable.billNumber, icon: <FileText className="w-3 h-3" /> },
              { label: 'Project', value: payable.projectName || '-', icon: <Building2 className="w-3 h-3" /> },
              { label: 'Aging', value: payable.agingBucket },
              { label: 'Overdue Days', value: payable.overdueDays },
              { label: 'Bill Date', value: formatFinanceDate(payable.billDate) },
            ]}
          />
        </Section>

        <Section title="Information">
          <InfoGrid
            items={[
              { label: 'Total Amount', value: formatCurrency(payable.totalAmount) },
              { label: 'Paid Amount', value: formatCurrency(payable.paidAmount) },
              { label: 'Pending Amount', value: formatCurrency(payable.pendingAmount) },
              { label: 'Due Date', value: formatFinanceDate(payable.dueDate) },
              { label: 'Status', value: payable.status },
              { label: 'Vendor ID', value: payable.vendorId },
            ]}
          />
        </Section>

        <Section title="Related">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {payable.billId && (
              <button
                type="button"
                onClick={() => router.push(ROUTES.financeExpense(payable.billId))}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left"
              >
                <FileText className="w-5 h-5 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Expense / Bill</p>
                  <p className="text-xs text-muted-foreground truncate">{payable.billNumber}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
            {payable.vendorId && (
              <button
                type="button"
                onClick={() => router.push(ROUTES.financeVendor(payable.vendorId))}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left"
              >
                <User className="w-5 h-5 text-green-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Vendor</p>
                  <p className="text-xs text-muted-foreground truncate">{payable.vendorName}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Tracking is not shown for payables (derived entity). Open the linked expense for workflow.
          </p>
        </Section>

        <Section title="Activities & Audit Log" defaultOpen={false}>
          <ActivityAuditLog entityType="expense" entityId={derivedExpenseId || payable.billId || id} />
        </Section>
      </div>
    </MainLayout>
  );
}
