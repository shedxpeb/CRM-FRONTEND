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
import { useBankAccountById } from '@/features/finance/hooks/useFinance';
import { formatCurrency } from '@/features/finance/constants';
import {
  formatFinanceDate,
  InfoGrid,
  Section,
  useFinanceBack,
} from '@/features/finance/components/FinanceDetailShared';
import { ROUTES } from '@/core/routes';
import { ArrowLeft, Building2, CreditCard } from 'lucide-react';

export default function BankAccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const handleBack = useFinanceBack();
  const { data: account, isLoading, isError } = useBankAccountById(id);

  if (isLoading) {
    return (
      <MainLayout>
        <CardSkeleton count={4} />
      </MainLayout>
    );
  }

  if (!account || isError) {
    return (
      <MainLayout>
        <ErrorState
          title="Bank account not found"
          message={`Could not load bank account ${id}. It may have been removed or is only available in local list state.`}
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
              <h1 className="text-xl font-semibold truncate">{account.accountName}</h1>
              <Badge variant={account.status === 'Active' ? 'default' : 'secondary'}>{account.status}</Badge>
              <Badge variant="outline">{account.accountType}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {account.bankName} · {account.accountCode}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Balance</p>
              <p className="text-sm font-semibold mt-0.5 text-green-700">{formatCurrency(account.currentBalance)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Type</p>
              <p className="text-sm font-semibold mt-0.5">{account.accountType}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Branch</p>
              <p className="text-sm font-semibold mt-0.5 truncate">{account.branch || '-'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">IFSC</p>
              <p className="text-sm font-semibold mt-0.5 font-mono">{account.ifscCode || '-'}</p>
            </CardContent>
          </Card>
        </div>

        <Section title="Workflow / Status Pipeline" defaultOpen>
          <TrackingEngine entityType="bank-account" entityId={id} />
        </Section>

        <Section title="Overview">
          <InfoGrid
            items={[
              { label: 'Account Name', value: account.accountName, icon: <CreditCard className="w-3 h-3" /> },
              { label: 'Account Code', value: account.accountCode },
              { label: 'Bank', value: account.bankName, icon: <Building2 className="w-3 h-3" /> },
              { label: 'Account Number', value: <span className="font-mono">{account.accountNumber}</span> },
            ]}
          />
        </Section>

        <Section title="Information">
          <InfoGrid
            items={[
              { label: 'IFSC Code', value: <span className="font-mono">{account.ifscCode}</span> },
              { label: 'Branch', value: account.branch },
              { label: 'Account Type', value: account.accountType },
              { label: 'Current Balance', value: formatCurrency(account.currentBalance) },
              { label: 'Status', value: account.status },
              { label: 'Created', value: formatFinanceDate(account.createdAt) },
              { label: 'Updated', value: formatFinanceDate(account.updatedAt) },
            ]}
          />
        </Section>

        <Section title="Related">
          <p className="text-sm text-muted-foreground">
            Linked bank transactions appear under Finance dashboard activity when available.
          </p>
        </Section>

        <Section title="Activities & Audit Log" defaultOpen={false}>
          <ActivityAuditLog entityType="bank-account" entityId={id} />
        </Section>
      </div>
    </MainLayout>
  );
}
