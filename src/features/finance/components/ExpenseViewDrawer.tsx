'use client';

import { memo } from 'react';
import { Expense } from '@/features/finance/types';
import { formatCurrency, getExpenseStatusVariant } from '@/features/finance/constants';
import { Badge } from '@/components/ui/badge';
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
import { User, Building2, FileText, Receipt, IndianRupee, CheckCircle, XCircle } from 'lucide-react';

interface ExpenseViewDrawerProps {
  expense: Expense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ExpenseViewDrawer = memo(function ExpenseViewDrawer({ expense, open, onOpenChange }: ExpenseViewDrawerProps) {
  if (!expense) return null;

  return (
    <EntityViewDrawer open={open} onOpenChange={onOpenChange}>
      <EntityViewHeader
        title={expense.expenseNumber}
        subtitle={`${expense.vendorName} · ${formatDrawerDate(expense.date)}`}
        onClose={() => onOpenChange(false)}
      />

      <EntityViewBody>
        <EntityViewBadges>
          <Badge variant={getExpenseStatusVariant(expense.status)}>{expense.status}</Badge>
          <Badge variant="outline">{expense.category}</Badge>
        </EntityViewBadges>

        <EntityViewKpiStrip
          items={[
            { label: 'Amount', value: formatCurrency(expense.amount), icon: <IndianRupee className="h-4 w-4 text-blue-600" />, accentClassName: 'text-blue-600' },
            { label: 'Tax', value: formatCurrency(expense.taxAmount || 0), icon: <Receipt className="h-4 w-4 text-purple-600" />, accentClassName: 'text-purple-600' },
            { label: 'Total', value: formatCurrency(expense.totalAmount), icon: <IndianRupee className="h-4 w-4 text-green-600" />, accentClassName: 'text-green-600' },
            { label: 'Expense Date', value: formatDrawerDate(expense.date), icon: <FileText className="h-4 w-4 text-amber-600" />, accentClassName: 'text-amber-600' },
          ]}
        />

        <EntityViewSection title="Vendor Information" icon={<User className="h-4 w-4" />}>
          <EntityViewFieldGrid>
            <EntityViewField label="Vendor Name" value={expense.vendorName} />
            <EntityViewField label="Vendor ID" value={expense.vendorId} />
          </EntityViewFieldGrid>
        </EntityViewSection>

        {expense.projectName && (
          <EntityViewSection title="Project Information" icon={<Building2 className="h-4 w-4" />}>
            <EntityViewFieldGrid>
              <EntityViewField label="Project Name" value={expense.projectName} />
              <EntityViewField label="Project ID" value={expense.projectId} />
            </EntityViewFieldGrid>
          </EntityViewSection>
        )}

        <EntityViewSection title="Category">
          <EntityViewFieldGrid>
            <EntityViewField label="Category" value={expense.category} />
            <EntityViewField label="Sub Category" value={expense.subCategory} />
          </EntityViewFieldGrid>
        </EntityViewSection>

        <EntityViewSection title="Amount Details">
          <EntityViewFieldGrid>
            <EntityViewField label="Amount" value={formatCurrency(expense.amount)} />
            <EntityViewField label="Tax Amount" value={formatCurrency(expense.taxAmount || 0)} />
            <EntityViewField label="Total Amount" value={formatCurrency(expense.totalAmount)} />
          </EntityViewFieldGrid>
        </EntityViewSection>

        <EntityViewSection title="Description & References">
          <EntityViewFieldGrid>
            <EntityViewField label="Description" value={expense.description} />
            <EntityViewField label="Receipt Number" value={expense.receiptNumber} />
            <EntityViewField label="Invoice Number" value={expense.invoiceNumber} />
            <EntityViewField label="Notes" value={expense.notes} />
          </EntityViewFieldGrid>
        </EntityViewSection>

        {expense.status === 'Approved' && (
          <EntityViewSection title="Approval Information" icon={<CheckCircle className="h-4 w-4 text-green-600" />}>
            <EntityViewFieldGrid>
              <EntityViewField label="Approved By" value={expense.approvedBy} />
              <EntityViewField label="Approved At" value={expense.approvedAt ? formatDrawerDateTime(expense.approvedAt) : '-'} />
            </EntityViewFieldGrid>
          </EntityViewSection>
        )}

        {expense.status === 'Rejected' && (
          <EntityViewSection title="Rejection Information" icon={<XCircle className="h-4 w-4 text-red-600" />}>
            <EntityViewField label="Rejection Reason" value={expense.rejectionReason} />
          </EntityViewSection>
        )}

        <EntityViewSection title="Timestamps">
          <EntityViewFieldGrid>
            {expense.createdAt && <EntityViewField label="Created" value={formatDrawerDateTime(expense.createdAt)} />}
            {expense.updatedAt && <EntityViewField label="Updated" value={formatDrawerDateTime(expense.updatedAt)} />}
          </EntityViewFieldGrid>
        </EntityViewSection>
      </EntityViewBody>

      <EntityViewFooter onClose={() => onOpenChange(false)} />
    </EntityViewDrawer>
  );
});
