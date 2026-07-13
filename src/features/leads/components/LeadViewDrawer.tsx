'use client';

import { memo } from 'react';
import { Lead, LeadActivity, LeadPriority, LeadStatus } from '@/types/leads';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LeadActivityTimeline } from './LeadActivityTimeline';
import { LeadCustomFields } from './LeadCustomFields';
import { useLeadConfiguration } from '@/features/leads/hooks/useLeads';
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
  EntityViewTabs,
  EntityViewTabsList,
  EntityViewTabTrigger,
  EntityViewTabContent,
  EntityViewFooter,
  formatDrawerDate,
  formatDrawerDateTime,
  formatDrawerBool,
  getDrawerAgeDays,
} from '@/components/drawer/EntityViewDrawer';
import { ExternalLink, User, Target, Calendar, Clock, Ruler } from 'lucide-react';

interface LeadViewDrawerProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (lead: Lead) => void;
  onConvertToCustomer?: (lead: Lead) => void;
  activities?: LeadActivity[];
}

function getStatusVariant(status: LeadStatus) {
  if (status === 'New') return 'info';
  if (status === 'Contacted') return 'warning';
  if (status === 'Converted' || status === 'Approved') return 'success';
  if (status === 'Rejected') return 'destructive';
  return 'secondary';
}

function getPriorityVariant(priority: LeadPriority) {
  if (priority === 'Urgent') return 'destructive';
  if (priority === 'High') return 'warning';
  if (priority === 'Medium') return 'info';
  return 'secondary';
}

export const LeadViewDrawer = function LeadViewDrawer({
  lead,
  open,
  onOpenChange,
  onEdit,
  onConvertToCustomer,
  activities = [],
}: LeadViewDrawerProps) {
  const router = useRouter();
  const leadConfig = useLeadConfiguration();

  if (!lead) {
    return null;
  }

  const area = lead.width && lead.length ? lead.width * lead.length : undefined;

  return (
    <EntityViewDrawer open={open} onOpenChange={onOpenChange}>
      <EntityViewHeader
        title={`Lead #${lead.leadNumber}`}
        subtitle={`${lead.customerName} · ${lead.companyName}`}
        onClose={() => onOpenChange(false)}
      />

      <EntityViewBody>
        <EntityViewBadges>
          <Badge variant={getStatusVariant(lead.status)}>{lead.status}</Badge>
          <Badge variant={getPriorityVariant(lead.priority)}>{lead.priority}</Badge>
          {lead.customerId && <Badge variant="success">Converted</Badge>}
        </EntityViewBadges>

        <EntityViewKpiStrip
          items={[
            {
              label: 'Score',
              value: lead.score ?? '-',
              icon: <Target className="h-4 w-4 text-blue-600" />,
              accentClassName: 'text-blue-600',
            },
            {
              label: 'Next Follow-up',
              value: formatDrawerDate(lead.nextFollowUpDate),
              icon: <Calendar className="h-4 w-4 text-amber-600" />,
              accentClassName: 'text-amber-600',
            },
            {
              label: 'Age',
              value: getDrawerAgeDays(lead.createdAt),
              icon: <Clock className="h-4 w-4 text-purple-600" />,
              accentClassName: 'text-purple-600',
            },
            {
              label: 'Covered Area',
              value: area ? `${area.toLocaleString()} sqm` : '-',
              icon: <Ruler className="h-4 w-4 text-green-600" />,
              accentClassName: 'text-green-600',
            },
          ]}
        />

        <EntityViewTabs defaultValue="overview">
          <EntityViewTabsList>
            <EntityViewTabTrigger value="overview">Overview</EntityViewTabTrigger>
            <EntityViewTabTrigger value="structure">Structure</EntityViewTabTrigger>
            <EntityViewTabTrigger value="site">Site</EntityViewTabTrigger>
            <EntityViewTabTrigger value="requirements">Requirements</EntityViewTabTrigger>
            <EntityViewTabTrigger value="activity">Activity</EntityViewTabTrigger>
          </EntityViewTabsList>

          <EntityViewTabContent value="overview">
            <EntityViewSection title="Customer Details" icon={<User className="h-4 w-4" />}>
              <EntityViewFieldGrid>
                <EntityViewField label="Customer Name" value={lead.customerName} />
                <EntityViewField label="Company Name" value={lead.companyName} />
                <EntityViewField label="Mobile" value={lead.mobile} />
                <EntityViewField label="Alternate Mobile" value={lead.alternateMobile} />
                <EntityViewField label="Email" value={lead.email} />
                <EntityViewField label="GST Number" value={lead.gstNumber} />
                <EntityViewField label="Address Line 1" value={lead.addressLine1} />
                <EntityViewField label="Address Line 2" value={lead.addressLine2} />
                <EntityViewField label="Area" value={lead.area} />
                <EntityViewField label="City" value={lead.city} />
                <EntityViewField label="State" value={lead.state} />
                <EntityViewField label="Country" value={lead.country} />
                <EntityViewField label="Pincode" value={lead.pincode} />
              </EntityViewFieldGrid>
            </EntityViewSection>

            <EntityViewSection title="Project Details">
              <EntityViewFieldGrid>
                <EntityViewField label="Project Title" value={lead.projectTitle} />
                <EntityViewField label="Project Type" value={lead.projectType} />
                <EntityViewField label="Structure Type" value={lead.structureType} />
              </EntityViewFieldGrid>
            </EntityViewSection>

            <EntityViewSection title="Business Details">
              <EntityViewFieldGrid>
                <EntityViewField label="Lead Source" value={lead.source} />
                <EntityViewField label="Assigned Employee" value={lead.assignedTo} />
                <EntityViewField label="Last Follow-up" value={formatDrawerDate(lead.lastFollowUp)} />
                <EntityViewField label="Remarks" value={lead.remarks} />
              </EntityViewFieldGrid>
            </EntityViewSection>

            <EntityViewSection title="Tracking & References">
              <EntityViewFieldGrid>
                <EntityViewField label="Created Date" value={formatDrawerDate(lead.createdAt)} />
                <EntityViewField label="Created By" value={lead.createdBy} />
                <EntityViewField label="Updated At" value={formatDrawerDateTime(lead.updatedAt)} />
                <EntityViewField label="Converted Date" value={formatDrawerDate(lead.convertedDate)} />
              </EntityViewFieldGrid>
              {lead.customerId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => router.push(`/dashboard/customers/${lead.customerId}`)}
                >
                  <User className="h-3.5 w-3.5 mr-1.5" />
                  View Customer
                  <ExternalLink className="h-3 w-3 ml-1.5" />
                </Button>
              )}
            </EntityViewSection>

            <EntityViewSection title="Custom Fields">
              <LeadCustomFields mode="view" fields={leadConfig.customFields} values={lead.customFields} />
            </EntityViewSection>
          </EntityViewTabContent>

          <EntityViewTabContent value="structure">
            <EntityViewSection title="Structure Specifications">
              <EntityViewFieldGrid>
                <EntityViewField label="Structure Type" value={lead.structureType} />
                <EntityViewField label="Width (m)" value={lead.width} />
                <EntityViewField label="Length (m)" value={lead.length} />
                <EntityViewField label="Height (m)" value={lead.height} />
                <EntityViewField label="Area (sqm)" value={area} />
                <EntityViewField label="Bay Spacing (m)" value={lead.baySpacing} />
                <EntityViewField label="Roof Type" value={lead.roofType} />
                <EntityViewField label="Wall Type" value={lead.wallType} />
                <EntityViewField label="Crane Required" value={formatDrawerBool(lead.craneRequired)} />
                {lead.craneRequired && (
                  <EntityViewField label="Crane Capacity (tons)" value={lead.craneCapacity} />
                )}
                <EntityViewField label="Mezzanine" value={formatDrawerBool(lead.mezzanine)} />
                {lead.mezzanine && (
                  <>
                    <EntityViewField label="Mezzanine Area (sqm)" value={lead.mezzanineArea} />
                    <EntityViewField label="Mezzanine Load (kg/sqm)" value={lead.mezzanineLoad} />
                  </>
                )}
                <EntityViewField label="Insulation Required" value={formatDrawerBool(lead.insulationRequired)} />
                {lead.insulationRequired && (
                  <>
                    <EntityViewField label="Insulation Type" value={lead.insulationType} />
                    <EntityViewField label="Insulation Thickness (mm)" value={lead.insulationThickness} />
                  </>
                )}
                <EntityViewField label="Material Preference" value={lead.materialPreference} />
              </EntityViewFieldGrid>
            </EntityViewSection>
          </EntityViewTabContent>

          <EntityViewTabContent value="site">
            <EntityViewSection title="Site Information">
              <EntityViewFieldGrid>
                <EntityViewField label="Site Location" value={lead.siteLocation} />
                <EntityViewField label="Site Address" value={lead.siteAddress} />
                <EntityViewField label="Map Coordinates" value={lead.mapCoordinates} />
                <EntityViewField label="Soil Notes" value={lead.soilNotes} />
              </EntityViewFieldGrid>
            </EntityViewSection>
          </EntityViewTabContent>

          <EntityViewTabContent value="requirements">
            <EntityViewSection title="Requirements & Notes">
              <EntityViewFieldGrid>
                <EntityViewField label="Customer Notes" value={lead.customerNotes} />
                <EntityViewField label="Special Requirement" value={lead.specialRequirement} />
                <EntityViewField
                  label="Attachments"
                  value={lead.attachments?.length ? lead.attachments.join(', ') : '-'}
                />
              </EntityViewFieldGrid>
            </EntityViewSection>
          </EntityViewTabContent>

          <EntityViewTabContent value="activity">
            <EntityViewSection title="Activity Timeline">
              <LeadActivityTimeline activities={activities} />
            </EntityViewSection>
          </EntityViewTabContent>
        </EntityViewTabs>
      </EntityViewBody>

      <EntityViewFooter onClose={() => onOpenChange(false)}>
        {onConvertToCustomer && !lead.customerId && lead.status !== 'Converted' && (
          <Button variant="secondary" onClick={() => onConvertToCustomer(lead)}>
            Convert to Customer
          </Button>
        )}
        {onEdit && <Button onClick={() => onEdit(lead)}>Edit</Button>}
      </EntityViewFooter>
    </EntityViewDrawer>
  );
};
