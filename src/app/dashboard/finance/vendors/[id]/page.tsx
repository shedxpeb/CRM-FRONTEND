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
import { useVendorById } from '@/features/finance/hooks/useFinance';
import { formatCurrency } from '@/features/finance/constants';
import {
  formatFinanceDate,
  InfoGrid,
  Section,
  useFinanceBack,
} from '@/features/finance/components/FinanceDetailShared';
import { ROUTES } from '@/core/routes';
import { ArrowLeft, MapPin, Star, User } from 'lucide-react';

export default function VendorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const handleBack = useFinanceBack();
  const { data: vendor, isLoading, isError } = useVendorById(id);

  if (isLoading) {
    return (
      <MainLayout>
        <CardSkeleton count={4} />
      </MainLayout>
    );
  }

  if (!vendor || isError) {
    return (
      <MainLayout>
        <ErrorState
          title="Vendor not found"
          message={`Could not load vendor ${id}. It may have been removed or is only available in local list state.`}
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
              <h1 className="text-xl font-semibold truncate">{vendor.name}</h1>
              <Badge variant={vendor.status === 'Active' ? 'default' : 'secondary'}>{vendor.status}</Badge>
              {vendor.performanceRating !== undefined && (
                <Badge variant="outline">{vendor.performanceRating}/5</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {vendor.vendorCode} · {vendor.city}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Purchases</p>
              <p className="text-sm font-semibold mt-0.5">{formatCurrency(vendor.totalPurchases)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Payments</p>
              <p className="text-sm font-semibold mt-0.5 text-green-700">{formatCurrency(vendor.totalPayments)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Outstanding</p>
              <p className="text-sm font-semibold mt-0.5 text-amber-700">{formatCurrency(vendor.outstandingBalance)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Credit Limit</p>
              <p className="text-sm font-semibold mt-0.5">{formatCurrency(vendor.creditLimit || 0)}</p>
            </CardContent>
          </Card>
        </div>

        <Section title="Workflow / Status Pipeline" defaultOpen>
          <TrackingEngine entityType="vendor" entityId={id} />
        </Section>

        <Section title="Overview">
          <InfoGrid
            items={[
              { label: 'Vendor Code', value: vendor.vendorCode },
              { label: 'Contact Person', value: vendor.contactPerson, icon: <User className="w-3 h-3" /> },
              { label: 'Mobile', value: vendor.mobile },
              { label: 'Email', value: vendor.email || '-' },
              { label: 'City', value: vendor.city, icon: <MapPin className="w-3 h-3" /> },
              { label: 'Payment Terms', value: vendor.paymentTerms || '-' },
            ]}
          />
        </Section>

        <Section title="Information">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Address</h4>
              <InfoGrid
                items={[
                  { label: 'Address', value: vendor.address },
                  { label: 'City', value: vendor.city },
                  { label: 'State', value: vendor.state },
                  { label: 'Pincode', value: vendor.pincode || '-' },
                ]}
              />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Tax & Credit</h4>
              <InfoGrid
                items={[
                  { label: 'GST Number', value: vendor.gstNumber || '-' },
                  { label: 'PAN Number', value: vendor.panNumber || '-' },
                  { label: 'Credit Period', value: vendor.creditPeriod ? `${vendor.creditPeriod} days` : '-' },
                  {
                    label: 'Rating',
                    value: vendor.performanceRating !== undefined ? (
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        {vendor.performanceRating}/5
                      </span>
                    ) : (
                      '-'
                    ),
                  },
                  { label: 'Created', value: formatFinanceDate(vendor.createdAt) },
                ]}
              />
            </div>
          </div>
        </Section>

        <Section title="Related">
          <p className="text-sm text-muted-foreground">
            Vendor payables and expense history can be reviewed from the Finance payables and expenses tabs.
          </p>
        </Section>

        <Section title="Activities & Audit Log" defaultOpen={false}>
          <ActivityAuditLog entityType="vendor" entityId={id} />
        </Section>
      </div>
    </MainLayout>
  );
}
