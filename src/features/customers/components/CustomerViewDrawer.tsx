'use client';

import { memo } from 'react';
import { Customer, CustomerActivity, CustomerStatus } from '@/features/customers/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CustomerActivityTimeline } from './CustomerActivityTimeline';
import { CustomerCustomFields } from './CustomerCustomFields';
import { useCustomerConfiguration } from '@/features/customers/hooks/useCustomers';
import { getStatusVariant } from '@/features/customers/constants';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/core/routes';
import {
  EntityViewDrawer,
  EntityViewHeader,
  EntityViewBadges,
  EntityViewKpiStrip,
  EntityViewBody,
  EntityViewSection,
  EntityViewFieldGrid,
  EntityViewField,
  EntityViewTabs,
  EntityViewTabsList,
  EntityViewTabTrigger,
  EntityViewTabContent,
  EntityViewFooter,
  formatDrawerDate,
} from '@/components/drawer/EntityViewDrawer';
import { ExternalLink, FileText, Briefcase, DollarSign, FileStack, FolderKanban } from 'lucide-react';

interface CustomerViewDrawerProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (customer: Customer) => void;
  activities?: CustomerActivity[];
}

export const CustomerViewDrawer = memo(function CustomerViewDrawer({
  customer,
  open,
  onOpenChange,
  onEdit,
  activities = [],
}: CustomerViewDrawerProps) {
  const router = useRouter();
  const customerConfig = useCustomerConfiguration();

  if (!customer) return null;

  return (
    <EntityViewDrawer open={open} onOpenChange={onOpenChange}>
      <EntityViewHeader
        title={customer.companyName}
        subtitle={`${customer.customerName} · #${customer.customerId}`}
        onClose={() => onOpenChange(false)}
      />

      <EntityViewBody>
        <EntityViewBadges>
          <Badge variant={getStatusVariant(customer.status as CustomerStatus)}>{customer.status}</Badge>
          <Badge variant="outline">{customer.industry}</Badge>
          {customer.leadId && <Badge variant="secondary">From Lead</Badge>}
        </EntityViewBadges>

        <EntityViewKpiStrip
          items={[
            {
              label: 'Projects',
              value: customer.totalProjects ?? 0,
              icon: <FolderKanban className="h-4 w-4 text-blue-600" />,
              accentClassName: 'text-blue-600',
            },
            {
              label: 'Active Jobs',
              value: customer.activeProjects ?? 0,
              icon: <Briefcase className="h-4 w-4 text-green-600" />,
              accentClassName: 'text-green-600',
            },
            {
              label: 'Revenue',
              value: `₹${((customer.totalRevenue ?? 0) / 100000).toFixed(1)}L`,
              icon: <DollarSign className="h-4 w-4 text-emerald-600" />,
              accentClassName: 'text-emerald-600',
            },
            {
              label: 'Open Quotes',
              value: customer.pendingQuotations ?? 0,
              icon: <FileStack className="h-4 w-4 text-amber-600" />,
              accentClassName: 'text-amber-600',
            },
          ]}
        />

        <EntityViewTabs defaultValue="overview">
          <EntityViewTabsList>
            <EntityViewTabTrigger value="overview">Overview</EntityViewTabTrigger>
            <EntityViewTabTrigger value="address">Address</EntityViewTabTrigger>
            <EntityViewTabTrigger value="business">Business</EntityViewTabTrigger>
            <EntityViewTabTrigger value="activity">Activity</EntityViewTabTrigger>
          </EntityViewTabsList>

          <EntityViewTabContent value="overview">
            <EntityViewSection title="Contact Details">
              <EntityViewFieldGrid>
                <EntityViewField label="Customer Name" value={customer.customerName} />
                <EntityViewField label="Company Name" value={customer.companyName} />
                <EntityViewField label="Mobile" value={customer.mobile} />
                <EntityViewField label="Alternate Mobile" value={customer.alternateMobile} />
                <EntityViewField label="Email" value={customer.email} />
                <EntityViewField label="Website" value={customer.website} />
                <EntityViewField label="Assigned To" value={customer.assignedEmployee} />
                <EntityViewField label="Customer Since" value={formatDrawerDate(customer.customerSince)} />
              </EntityViewFieldGrid>
            </EntityViewSection>

            <EntityViewSection title="References">
              <div className="flex flex-wrap gap-2">
                {customer.leadId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(ROUTES.leadsDetail(customer.leadId!))}
                  >
                    <FileText className="h-3.5 w-3.5 mr-1.5" />
                    View Originating Lead
                    <ExternalLink className="h-3 w-3 ml-1.5" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(ROUTES.customersDetail(customer.id))}
                >
                  Open Full Profile
                  <ExternalLink className="h-3 w-3 ml-1.5" />
                </Button>
              </div>
            </EntityViewSection>

            <EntityViewSection title="Custom Fields">
              <CustomerCustomFields mode="view" fields={customerConfig.customFields} values={customer.customFields} />
            </EntityViewSection>

            <EntityViewSection title="Notes">
              <EntityViewField label="Notes" value={customer.notes} />
            </EntityViewSection>
          </EntityViewTabContent>

          <EntityViewTabContent value="address">
            <EntityViewSection title="Address Information">
              <EntityViewFieldGrid>
                <EntityViewField label="Address" value={customer.address} />
                <EntityViewField label="City" value={customer.city} />
                <EntityViewField label="State" value={customer.state} />
                <EntityViewField label="Country" value={customer.country} />
                <EntityViewField label="Pincode" value={customer.pincode} />
              </EntityViewFieldGrid>
            </EntityViewSection>
          </EntityViewTabContent>

          <EntityViewTabContent value="business">
            <EntityViewSection title="Business Information">
              <EntityViewFieldGrid>
                <EntityViewField label="GST Number" value={customer.gstNumber} />
                <EntityViewField label="PAN Number" value={customer.panNumber} />
                <EntityViewField label="Industry" value={customer.industry} />
                <EntityViewField label="Business Type" value={customer.businessType} />
                <EntityViewField label="Source" value={customer.source} />
                <EntityViewField label="Status" value={customer.status} />
              </EntityViewFieldGrid>
            </EntityViewSection>
          </EntityViewTabContent>

          <EntityViewTabContent value="activity">
            <EntityViewSection title="Activity Timeline">
              <CustomerActivityTimeline activities={activities} />
            </EntityViewSection>
          </EntityViewTabContent>
        </EntityViewTabs>
      </EntityViewBody>

      <EntityViewFooter onClose={() => onOpenChange(false)}>
        {onEdit && <Button onClick={() => onEdit(customer)}>Edit</Button>}
      </EntityViewFooter>
    </EntityViewDrawer>
  );
});
