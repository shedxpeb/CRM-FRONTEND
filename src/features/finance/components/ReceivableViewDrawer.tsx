'use client';

import { Receivable } from '@/features/finance/types';
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

interface ReceivableViewDrawerProps {
  receivable: Receivable | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReceivableViewDrawer({ receivable, open, onOpenChange }: ReceivableViewDrawerProps) {
  if (!receivable) return null;

  const isOverdue = receivable.overdueDays && receivable.overdueDays > 0;

  return (
    <EntityViewDrawer open={open} onOpenChange={onOpenChange}>
      <EntityViewHeader
        title={receivable.customerName}
        subtitle={`Invoice ${receivable.invoiceNumber}`}
        onClose={() => onOpenChange(false)}
      />

      <EntityViewBody>
        <EntityViewBadges>
          <Badge variant={isOverdue ? 'destructive' : 'default'}>{receivable.status}</Badge>
          <Badge variant={receivable.agingBucket === '90+ Days' ? 'destructive' : 'outline'}>
            {receivable.agingBucket}
          </Badge>
          {isOverdue && <Badge variant="destructive">Overdue {receivable.overdueDays}d</Badge>}
        </EntityViewBadges>

        <EntityViewKpiStrip
          items={[
            { label: 'Total', value: formatCurrency(receivable.totalAmount), icon: <IndianRupee className="h-4 w-4 text-blue-600" />, accentClassName: 'text-blue-600' },
            { label: 'Paid', value: formatCurrency(receivable.paidAmount), icon: <IndianRupee className="h-4 w-4 text-green-600" />, accentClassName: 'text-green-600' },
            { label: 'Pending', value: formatCurrency(receivable.pendingAmount), icon: <IndianRupee className="h-4 w-4 text-amber-600" />, accentClassName: 'text-amber-600' },
            { label: 'Due Date', value: formatDrawerDate(receivable.dueDate), icon: <Clock className="h-4 w-4 text-purple-600" />, accentClassName: 'text-purple-600' },
          ]}
        />

        {receivable.projectName && (
          <EntityViewSection title="Project" icon={<Building2 className="h-4 w-4" />}>
            <EntityViewField label="Project Name" value={receivable.projectName} />
          </EntityViewSection>
        )}

        <EntityViewSection title="Amount Summary">
          <EntityViewFieldGrid>
            <EntityViewField label="Total Amount" value={formatCurrency(receivable.totalAmount)} />
            <EntityViewField label="Paid Amount" value={formatCurrency(receivable.paidAmount)} />
            <EntityViewField label="Pending Amount" value={formatCurrency(receivable.pendingAmount)} />
          </EntityViewFieldGrid>
        </EntityViewSection>

        <EntityViewSection title="Due Date & Aging" icon={<AlertCircle className="h-4 w-4" />}>
          <EntityViewFieldGrid>
            <EntityViewField label="Due Date" value={formatDrawerDate(receivable.dueDate)} />
            <EntityViewField label="Aging Bucket" value={receivable.agingBucket} />
            {isOverdue && (
              <EntityViewField label="Overdue" value={`${receivable.overdueDays} days`} />
            )}
          </EntityViewFieldGrid>
        </EntityViewSection>

        <EntityViewSection title="Payment History" icon={<FileText className="h-4 w-4" />}>
          <EntityViewField
            label="Payments Received"
            value={
              receivable.paidAmount > 0
                ? formatCurrency(receivable.paidAmount)
                : 'No payments received yet'
            }
          />
        </EntityViewSection>

        <EntityViewSection title="Linked Invoice">
          <Button variant="outline" size="sm">
            View Invoice {receivable.invoiceNumber}
          </Button>
        </EntityViewSection>

        <EntityViewSection title="Timestamps">
          <EntityViewFieldGrid>
            {receivable.createdAt && <EntityViewField label="Created" value={formatDrawerDateTime(receivable.createdAt)} />}
            {receivable.updatedAt && <EntityViewField label="Updated" value={formatDrawerDateTime(receivable.updatedAt)} />}
          </EntityViewFieldGrid>
        </EntityViewSection>
      </EntityViewBody>

      <EntityViewFooter onClose={() => onOpenChange(false)} />
    </EntityViewDrawer>
  );
}
