'use client';

import { memo } from 'react';
import { Payment } from '@/features/finance/types';
import { formatCurrency, getPaymentStatusVariant } from '@/features/finance/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  EntityViewDrawer,
  EntityViewHeader,
  EntityViewBadges,
  EntityViewKpiStrip,
  EntityViewBody,
  EntityViewSection,
  EntityViewFieldGrid,
  EntityViewField,
  EntityViewFooter,
  formatDrawerDate,
  formatDrawerDateTime,
} from '@/components/drawer/EntityViewDrawer';
import { User, Building2, FileText, Receipt, IndianRupee, CreditCard, ExternalLink } from 'lucide-react';

interface PaymentViewDrawerProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PaymentViewDrawer = memo(function PaymentViewDrawer({ payment, open, onOpenChange }: PaymentViewDrawerProps) {
  const router = useRouter();

  if (!payment) return null;

  return (
    <EntityViewDrawer open={open} onOpenChange={onOpenChange}>
      <EntityViewHeader
        title={payment.paymentNumber}
        subtitle={`${payment.type} · ${formatDrawerDate(payment.paymentDate)}`}
        onClose={() => onOpenChange(false)}
      />

      <EntityViewBody>
        <EntityViewBadges>
          <Badge variant={getPaymentStatusVariant(payment.status)}>{payment.status}</Badge>
          <Badge variant="outline">{payment.paymentMethod}</Badge>
        </EntityViewBadges>

        <EntityViewKpiStrip
          items={[
            { label: 'Amount', value: formatCurrency(payment.amount), icon: <IndianRupee className="h-4 w-4 text-blue-600" />, accentClassName: 'text-blue-600' },
            { label: 'Tax', value: formatCurrency(payment.taxAmount || 0), icon: <Receipt className="h-4 w-4 text-purple-600" />, accentClassName: 'text-purple-600' },
            { label: 'Total', value: formatCurrency(payment.totalAmount), icon: <IndianRupee className="h-4 w-4 text-green-600" />, accentClassName: 'text-green-600' },
            { label: 'Payment Date', value: formatDrawerDate(payment.paymentDate), icon: <CreditCard className="h-4 w-4 text-amber-600" />, accentClassName: 'text-amber-600' },
          ]}
        />

        <EntityViewSection title="Payment Type" icon={<Receipt className="h-4 w-4" />}>
          <EntityViewField label="Type" value={payment.type} />
        </EntityViewSection>

        {payment.customerName && (
          <EntityViewSection title="Customer" icon={<User className="h-4 w-4" />}>
            <EntityViewFieldGrid>
              <EntityViewField label="Customer Name" value={payment.customerName} />
              <EntityViewField label="Customer ID" value={payment.customerId} />
            </EntityViewFieldGrid>
          </EntityViewSection>
        )}

        {payment.projectName && (
          <EntityViewSection title="Project" icon={<Building2 className="h-4 w-4" />}>
            <EntityViewFieldGrid>
              <EntityViewField label="Project Name" value={payment.projectName} />
              <EntityViewField label="Project ID" value={payment.projectId} />
            </EntityViewFieldGrid>
          </EntityViewSection>
        )}

        {payment.invoiceNumber && (
          <EntityViewSection title="Invoice" icon={<FileText className="h-4 w-4" />}>
            <EntityViewFieldGrid>
              <EntityViewField label="Invoice Number" value={payment.invoiceNumber} />
              <EntityViewField label="Invoice ID" value={payment.invoiceId} />
            </EntityViewFieldGrid>
            {payment.invoiceId && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => router.push(`/dashboard/finance?tab=invoices`)}
              >
                View Invoice
                <ExternalLink className="h-3 w-3 ml-1.5" />
              </Button>
            )}
          </EntityViewSection>
        )}

        <EntityViewSection title="Reference Information">
          <EntityViewFieldGrid>
            <EntityViewField label="Reference Number" value={payment.referenceNumber} />
            <EntityViewField label="Transaction ID" value={payment.transactionId} />
            <EntityViewField label="Notes" value={payment.notes} />
          </EntityViewFieldGrid>
        </EntityViewSection>

        <EntityViewSection title="Timestamps">
          <EntityViewFieldGrid>
            {payment.createdAt && <EntityViewField label="Created" value={formatDrawerDateTime(payment.createdAt)} />}
            {payment.updatedAt && <EntityViewField label="Updated" value={formatDrawerDateTime(payment.updatedAt)} />}
          </EntityViewFieldGrid>
        </EntityViewSection>
      </EntityViewBody>

      <EntityViewFooter onClose={() => onOpenChange(false)} />
    </EntityViewDrawer>
  );
});
