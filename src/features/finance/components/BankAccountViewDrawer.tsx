'use client';

import { BankAccount } from '@/features/finance/types';
import { formatCurrency } from '@/features/finance/constants';
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
  formatDrawerDateTime,
} from '@/components/drawer/EntityViewDrawer';
import { Building2, CreditCard, IndianRupee, MapPin } from 'lucide-react';

interface BankAccountViewDrawerProps {
  bankAccount: BankAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BankAccountViewDrawer({ bankAccount, open, onOpenChange }: BankAccountViewDrawerProps) {
  if (!bankAccount) return null;

  return (
    <EntityViewDrawer open={open} onOpenChange={onOpenChange}>
      <EntityViewHeader
        title={bankAccount.accountName}
        subtitle={bankAccount.bankName}
        onClose={() => onOpenChange(false)}
      />

      <EntityViewBody>
        <EntityViewBadges>
          <Badge variant={bankAccount.status === 'Active' ? 'default' : 'secondary'}>
            {bankAccount.status}
          </Badge>
          <Badge variant="outline">{bankAccount.accountType}</Badge>
        </EntityViewBadges>

        <EntityViewKpiStrip
          items={[
            {
              label: 'Current Balance',
              value: formatCurrency(bankAccount.currentBalance || 0),
              icon: <IndianRupee className="h-4 w-4 text-green-600" />,
              accentClassName: 'text-green-600',
            },
            {
              label: 'Account Type',
              value: bankAccount.accountType,
              icon: <CreditCard className="h-4 w-4 text-blue-600" />,
              accentClassName: 'text-blue-600',
            },
            {
              label: 'Branch',
              value: bankAccount.branch || '-',
              icon: <MapPin className="h-4 w-4 text-purple-600" />,
              accentClassName: 'text-purple-600',
            },
            {
              label: 'IFSC',
              value: bankAccount.ifscCode || '-',
              icon: <Building2 className="h-4 w-4 text-amber-600" />,
              accentClassName: 'text-amber-600',
            },
          ]}
        />

        <EntityViewSection title="Account Information" icon={<CreditCard className="h-4 w-4" />}>
          <EntityViewFieldGrid>
            <EntityViewField label="Account Number" value={<span className="font-mono">{bankAccount.accountNumber}</span>} />
            <EntityViewField label="Account Name" value={bankAccount.accountName} />
          </EntityViewFieldGrid>
        </EntityViewSection>

        <EntityViewSection title="Bank Details" icon={<Building2 className="h-4 w-4" />}>
          <EntityViewFieldGrid>
            <EntityViewField label="Bank Name" value={bankAccount.bankName} />
            <EntityViewField label="Branch" value={bankAccount.branch} />
            <EntityViewField label="IFSC Code" value={<span className="font-mono">{bankAccount.ifscCode}</span>} />
            <EntityViewField label="Account Type" value={bankAccount.accountType} />
          </EntityViewFieldGrid>
        </EntityViewSection>

        <EntityViewSection title="Balance Information">
          <EntityViewField label="Current Balance" value={formatCurrency(bankAccount.currentBalance || 0)} />
        </EntityViewSection>

        <EntityViewSection title="Timestamps">
          <EntityViewFieldGrid>
            {bankAccount.createdAt && <EntityViewField label="Created" value={formatDrawerDateTime(bankAccount.createdAt)} />}
            {bankAccount.updatedAt && <EntityViewField label="Updated" value={formatDrawerDateTime(bankAccount.updatedAt)} />}
          </EntityViewFieldGrid>
        </EntityViewSection>
      </EntityViewBody>

      <EntityViewFooter onClose={() => onOpenChange(false)} />
    </EntityViewDrawer>
  );
}
