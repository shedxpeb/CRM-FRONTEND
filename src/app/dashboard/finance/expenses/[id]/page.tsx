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
import { useExpenseById } from '@/features/finance/hooks/useFinance';
import { formatCurrency, getExpenseStatusVariant } from '@/features/finance/constants';
import {
  formatFinanceDate,
  InfoGrid,
  Section,
  useFinanceBack,
} from '@/features/finance/components/FinanceDetailShared';
import { ROUTES } from '@/core/routes';
import { ArrowLeft, Building2, ExternalLink, FileText, User } from 'lucide-react';

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const handleBack = useFinanceBack();
  const { data: expense, isLoading, isError } = useExpenseById(id);

  if (isLoading) {
    return (
      <MainLayout>
        <CardSkeleton count={4} />
      </MainLayout>
    );
  }

  if (!expense || isError) {
    return (
      <MainLayout>
        <ErrorState
          title="Expense not found"
          message={`Could not load expense ${id}. It may have been removed or is only available in local list state.`}
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
              <h1 className="text-xl font-semibold truncate">{expense.expenseNumber}</h1>
              <Badge variant={getExpenseStatusVariant(expense.status)}>{expense.status}</Badge>
              <Badge variant="outline">{expense.category}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {expense.vendorName} · {formatFinanceDate(expense.date)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Amount</p>
              <p className="text-sm font-semibold mt-0.5">{formatCurrency(expense.amount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Tax</p>
              <p className="text-sm font-semibold mt-0.5">{formatCurrency(expense.taxAmount || 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</p>
              <p className="text-sm font-semibold mt-0.5">{formatCurrency(expense.totalAmount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Date</p>
              <p className="text-sm font-semibold mt-0.5">{formatFinanceDate(expense.date)}</p>
            </CardContent>
          </Card>
        </div>

        <Section title="Workflow / Status Pipeline" defaultOpen>
          <TrackingEngine entityType="expense" entityId={id} />
        </Section>

        <Section title="Overview">
          <InfoGrid
            items={[
              { label: 'Expense Number', value: expense.expenseNumber, icon: <FileText className="w-3 h-3" /> },
              { label: 'Vendor', value: expense.vendorName, icon: <User className="w-3 h-3" /> },
              { label: 'Category', value: expense.category },
              { label: 'Sub Category', value: expense.subCategory || '-' },
              { label: 'Project', value: expense.projectName || '-', icon: <Building2 className="w-3 h-3" /> },
              { label: 'Description', value: expense.description || '-' },
            ]}
          />
        </Section>

        <Section title="Information">
          <InfoGrid
            items={[
              { label: 'Receipt Number', value: expense.receiptNumber || '-' },
              { label: 'Invoice Number', value: expense.invoiceNumber || '-' },
              { label: 'Notes', value: expense.notes || '-' },
              { label: 'Approved By', value: expense.approvedBy || '-' },
              { label: 'Approved At', value: formatFinanceDate(expense.approvedAt) },
              { label: 'Rejection Reason', value: expense.rejectionReason || '-' },
            ]}
          />
        </Section>

        <Section title="Related">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {expense.vendorId && (
              <button
                type="button"
                onClick={() => router.push(ROUTES.financeVendor(expense.vendorId))}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left"
              >
                <User className="w-5 h-5 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Vendor</p>
                  <p className="text-xs text-muted-foreground truncate">{expense.vendorName}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
            {expense.projectId && (
              <button
                type="button"
                onClick={() => router.push(ROUTES.projectsDetail(expense.projectId!))}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left"
              >
                <Building2 className="w-5 h-5 text-green-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Project</p>
                  <p className="text-xs text-muted-foreground truncate">{expense.projectName}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </Section>

        <Section title="Activities & Audit Log" defaultOpen={false}>
          <ActivityAuditLog entityType="expense" entityId={id} />
        </Section>
      </div>
    </MainLayout>
  );
}
