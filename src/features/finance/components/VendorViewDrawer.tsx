'use client';

import { memo } from 'react';
import { Vendor } from '@/features/finance/types';
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
import { User, MapPin, FileText, IndianRupee, Building2, Star } from 'lucide-react';

interface VendorViewDrawerProps {
  vendor: Vendor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VendorViewDrawer = memo(function VendorViewDrawer({ vendor, open, onOpenChange }: VendorViewDrawerProps) {
  if (!vendor) return null;

  return (
    <EntityViewDrawer open={open} onOpenChange={onOpenChange}>
      <EntityViewHeader
        title={vendor.name}
        subtitle={`${vendor.vendorCode}`}
        onClose={() => onOpenChange(false)}
      />

      <EntityViewBody>
        <EntityViewBadges>
          <Badge variant={vendor.status === 'Active' ? 'default' : 'secondary'}>{vendor.status}</Badge>
          {vendor.performanceRating !== undefined && (
            <Badge variant="outline">{vendor.performanceRating}/5 Rating</Badge>
          )}
        </EntityViewBadges>

        <EntityViewKpiStrip
          items={[
            { label: 'Total Purchases', value: formatCurrency(vendor.totalPurchases), icon: <IndianRupee className="h-4 w-4 text-blue-600" />, accentClassName: 'text-blue-600' },
            { label: 'Total Payments', value: formatCurrency(vendor.totalPayments), icon: <IndianRupee className="h-4 w-4 text-green-600" />, accentClassName: 'text-green-600' },
            { label: 'Outstanding', value: formatCurrency(vendor.outstandingBalance), icon: <IndianRupee className="h-4 w-4 text-amber-600" />, accentClassName: 'text-amber-600' },
            { label: 'Credit Limit', value: formatCurrency(vendor.creditLimit || 0), icon: <Building2 className="h-4 w-4 text-purple-600" />, accentClassName: 'text-purple-600' },
          ]}
        />

        <EntityViewSection title="Contact Information" icon={<User className="h-4 w-4" />}>
          <EntityViewFieldGrid>
            <EntityViewField label="Contact Person" value={vendor.contactPerson} />
            <EntityViewField label="Mobile" value={vendor.mobile} />
            <EntityViewField label="Email" value={vendor.email} />
          </EntityViewFieldGrid>
        </EntityViewSection>

        <EntityViewSection title="Address" icon={<MapPin className="h-4 w-4" />}>
          <EntityViewFieldGrid>
            <EntityViewField label="Address" value={vendor.address} />
            <EntityViewField label="City" value={vendor.city} />
            <EntityViewField label="State" value={vendor.state} />
            <EntityViewField label="Pincode" value={vendor.pincode} />
          </EntityViewFieldGrid>
        </EntityViewSection>

        <EntityViewSection title="Tax Information" icon={<FileText className="h-4 w-4" />}>
          <EntityViewFieldGrid>
            <EntityViewField label="GST Number" value={vendor.gstNumber} />
            <EntityViewField label="PAN Number" value={vendor.panNumber} />
          </EntityViewFieldGrid>
        </EntityViewSection>

        <EntityViewSection title="Credit Information">
          <EntityViewFieldGrid>
            <EntityViewField label="Credit Limit" value={formatCurrency(vendor.creditLimit || 0)} />
            <EntityViewField label="Credit Period" value={vendor.creditPeriod ? `${vendor.creditPeriod} days` : '-'} />
            <EntityViewField label="Payment Terms" value={vendor.paymentTerms} />
          </EntityViewFieldGrid>
        </EntityViewSection>

        {vendor.performanceRating !== undefined && (
          <EntityViewSection title="Performance Rating" icon={<Star className="h-4 w-4" />}>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= (vendor.performanceRating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-sm ml-2 text-muted-foreground">({vendor.performanceRating}/5)</span>
            </div>
          </EntityViewSection>
        )}

        <EntityViewSection title="Timestamps">
          <EntityViewFieldGrid>
            {vendor.createdAt && <EntityViewField label="Created" value={formatDrawerDateTime(vendor.createdAt)} />}
            {vendor.updatedAt && <EntityViewField label="Updated" value={formatDrawerDateTime(vendor.updatedAt)} />}
          </EntityViewFieldGrid>
        </EntityViewSection>
      </EntityViewBody>

      <EntityViewFooter onClose={() => onOpenChange(false)} />
    </EntityViewDrawer>
  );
});
