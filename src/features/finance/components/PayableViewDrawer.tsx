'use client';

import { Payable } from '@/features/finance/types';
import { formatCurrency } from '@/features/finance/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Building2, IndianRupee, Clock, AlertCircle, FileText } from 'lucide-react';

interface PayableViewDrawerProps {
  payable: Payable | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayableViewDrawer({ payable, open, onOpenChange }: PayableViewDrawerProps) {
  if (!payable) return null;

  const isOverdue = payable.overdueDays && payable.overdueDays > 0;

  return (
    <EntityViewDrawer open={open} onOpenChange={onOpenChange}>
      <EntityViewHeader
        title={payable.vendorName}
        subtitle={`Bill ${payable.billNumber}`}
        onClose={() => onOpenChange(false)}
      />

      <EntityViewBody>
        <EntityViewBadges>
          <Badge variant={isOverdue ? 'destructive' : 'default'}>{payable.status}</Badge>
          <Badge variant={payable.agingBucket === '90+ Days' ? 'destructive' : 'outline'}>
            {payable.agingBucket}
          </Badge>
          {isOverdue && <Badge variant="destructive">Overdue {payable.overdueDays}d</Badge>}
        </EntityViewBadges>

        <EntityViewKpiStrip
          items={[
            { label: 'Total', value: formatCurrency(payable.totalAmount), icon: <IndianRupee className="h-4 w-4 text-blue-600" />, accentClassName: 'text-blue-600' },
            { label: 'Paid', value: formatCurrency(payable.paidAmount), icon: <IndianRupee className="h-4 w-4 text-green-600" />, accentClassName: 'text-green-600' },
            { label: 'Pending', value: formatCurrency(payable.pendingAmount), icon: <IndianRupee className="h-4 w-4 text-amber-600" />, accentClassName: 'text-amber-600' },
            { label: 'Due Date', value: formatDrawerDate(payable.dueDate), icon: <Clock className="h-4 w-4 text-purple-600" />, accentClassName: 'text-purple-600' },
          ]}
        />

        {payable.projectName && (
          <EntityViewSection title="Project" icon={<Building2 className="h-4 w-4" />}>
            <EntityViewField label="Project Name" value={payable.projectName} />
          </EntityViewSection>
        )}

        <EntityViewSection title="Amount Summary">
          <EntityViewFieldGrid>
            <EntityViewField label="Total Amount" value={formatCurrency(payable.totalAmount)} />
            <EntityViewField label="Paid Amount" value={formatCurrency(payable.paidAmount)} />
            <EntityViewField label="Pending Amount" value={formatCurrency(payable.pendingAmount)} />
          </EntityViewFieldGrid>
        </EntityViewSection>

        <EntityViewSection title="Due Date & Aging" icon={<AlertCircle className="h-4 w-4" />}>
          <EntityViewFieldGrid>
            <EntityViewField label="Due Date" value={formatDrawerDate(payable.dueDate)} />
            <EntityViewField label="Aging Bucket" value={payable.agingBucket} />
            {isOverdue && (
              <EntityViewField label="Overdue" value={`${payable.overdueDays} days`} />
            )}
          </EntityViewFieldGrid>
        </EntityViewSection>

        <EntityViewSection title="Payment History" icon={<FileText className="h-4 w-4" />}>
          <EntityViewField
            label="Payments Made"
            value={
              payable.paidAmount > 0
                ? formatCurrency(payable.paidAmount)
                : 'No payments made yet'
            }
          />
        </EntityViewSection>

        <EntityViewSection title="Linked Expense">
          <Button variant="outline" size="sm">
            View Expense {payable.billNumber}
          </Button>
        </EntityViewSection>

        <EntityViewSection title="Timestamps">
          <EntityViewFieldGrid>
            {payable.createdAt && <EntityViewField label="Created" value={formatDrawerDateTime(payable.createdAt)} />}
            {payable.updatedAt && <EntityViewField label="Updated" value={formatDrawerDateTime(payable.updatedAt)} />}
          </EntityViewFieldGrid>
        </EntityViewSection>
      </EntityViewBody>

      <EntityViewFooter onClose={() => onOpenChange(false)} />
    </EntityViewDrawer>
  );
}
