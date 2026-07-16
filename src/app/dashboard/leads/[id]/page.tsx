'use client';

import { useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MainLayout } from '@/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TrackingEngine } from '@/components/tracking/TrackingEngine';
import { useLead, useUpdateLead, useLeadConfiguration } from '@/features/leads/hooks/useLeads';
import { ROUTES } from '@/core/routes';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Building2,
  MapPin,
  Phone,
  Mail,
  Ruler,
  User,
  FileText,
  ExternalLink,
  Edit3,
  Pencil,
} from 'lucide-react';
import type { Lead, LeadStatus, LeadPriority } from '@/types/leads';

const LeadForm = dynamic(() => import('@/features/leads/components/LeadForm').then(mod => ({ default: mod.LeadForm })), {
  loading: () => <div className="p-8 text-center text-sm text-muted-foreground">Loading form...</div>,
  ssr: false,
});

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

function formatDate(value?: Date | string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function Section({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        {title}
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

function InfoGrid({ items }: { items: { label: string; value: React.ReactNode; icon?: React.ReactNode }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(item => (
        <div key={item.label} className="space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {item.icon}
            {item.label}
          </p>
          <p className="text-sm font-medium">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;
  const { data: leadData, isLoading } = useLead(leadId);
  const leadConfig = useLeadConfiguration();
  const updateLeadMutation = useUpdateLead();
  const lead = leadData?.data || null;

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(ROUTES.leads);
    }
  }, [router]);

  const handleEditLead = useCallback(async (data: Partial<Lead> | Lead) => {
    if (!leadId) return;
    try {
      await updateLeadMutation.mutateAsync({ id: leadId, data });
      setIsEditDialogOpen(false);
    } catch { /* */ }
  }, [leadId, updateLeadMutation]);

  const sectionProps = useMemo(() => lead ? {
    name: lead.customerName,
    company: lead.companyName,
    projectTitle: lead.projectTitle,
    city: lead.city,
    status: lead.status,
    priority: lead.priority,
    leadNumber: lead.leadNumber,
  } : null, [lead]);

  if (!lead) {
    return (
      <MainLayout title="Lead Not Found" subtitle="">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <p className="text-sm text-destructive">
              {isLoading ? 'Loading lead...' : 'Lead not found or may have been removed.'}
            </p>
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leads
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ─── HEADER ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2 flex-shrink-0 self-start">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold truncate">LD-{String(lead.leadNumber).padStart(6, '0')}</h1>
              <Badge variant={getStatusVariant(lead.status)}>{lead.status}</Badge>
              <Badge variant={getPriorityVariant(lead.priority)}>{lead.priority} Priority</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {lead.customerName}{lead.companyName ? ` · ${lead.companyName}` : ''}{lead.city ? ` · ${lead.city}` : ''}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)} className="gap-1.5">
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Button>
        </div>

        {/* ─── KPI CARDS ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Project Type</p>
              <p className="text-sm font-medium mt-0.5">{lead.projectType}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Structure</p>
              <p className="text-sm font-medium mt-0.5">{lead.structureType}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Source</p>
              <p className="text-sm font-medium mt-0.5">{lead.source}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Assigned To</p>
              <p className="text-sm font-medium mt-0.5 truncate">{lead.assignedTo || lead.assignedToId || 'Unassigned'}</p>
            </CardContent>
          </Card>
        </div>

        {/* ─── FULL TRACKING (pipeline + activity + comments + files) ── */}
        <Section title="Tracking" defaultOpen={true}>
          <TrackingEngine entityType="lead" entityId={leadId} />
        </Section>

        {/* ─── OVERVIEW ──────────────────────────────────── */}
        <Section title="Overview" defaultOpen={false}>
          <div className="space-y-4">
            <InfoGrid items={[
              { label: 'Customer Name', value: lead.customerName, icon: <User className="w-3 h-3" /> },
              { label: 'Company', value: lead.companyName || '-', icon: <Building2 className="w-3 h-3" /> },
              { label: 'Mobile', value: lead.mobile, icon: <Phone className="w-3 h-3" /> },
              { label: 'Email', value: lead.email, icon: <Mail className="w-3 h-3" /> },
              { label: 'City', value: lead.city, icon: <MapPin className="w-3 h-3" /> },
              { label: 'Project', value: lead.projectTitle, icon: <Building2 className="w-3 h-3" /> },
              { label: 'Next Follow-up', value: formatDate(lead.nextFollowUpDate), icon: <Ruler className="w-3 h-3" /> },
              { label: 'Created', value: formatDate(lead.createdAt) },
              { label: 'Customer Since', value: formatDate(lead.createdAt) },
            ]} />
          </div>
        </Section>

        {/* ─── INFORMATION ──────────────────────────────── */}
        <Section title="Information" defaultOpen={false}>
          <div className="space-y-6">
            {/* Customer Information */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Customer Details</h4>
              <InfoGrid items={[
                { label: 'Customer Name', value: lead.customerName, icon: <User className="w-3 h-3" /> },
                { label: 'Company Name', value: lead.companyName || '-', icon: <Building2 className="w-3 h-3" /> },
                { label: 'Designation', value: lead.designation || '-' },
                { label: 'Mobile', value: lead.mobile, icon: <Phone className="w-3 h-3" /> },
                { label: 'Alternate Mobile', value: lead.alternateMobile || '-' },
                { label: 'Email', value: lead.email, icon: <Mail className="w-3 h-3" /> },
                { label: 'GST Number', value: lead.gstNumber || '-' },
                { label: 'PAN Number', value: lead.panNumber || '-' },
                { label: 'Industry', value: lead.industry || '-' },
                { label: 'Business Type', value: lead.businessType || '-' },
                { label: 'Website', value: lead.website || '-' },
                { label: 'Source', value: lead.source },
              ]} />
            </div>

            {/* Address */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Address</h4>
              <InfoGrid items={[
                { label: 'Address Line 1', value: lead.addressLine1 || '-' },
                { label: 'Address Line 2', value: lead.addressLine2 || '-' },
                { label: 'Area', value: lead.area || '-' },
                { label: 'City', value: lead.city },
                { label: 'State', value: lead.state || '-' },
                { label: 'Country', value: lead.country || '-' },
                { label: 'Pincode', value: lead.pincode || '-' },
              ]} />
            </div>

            {/* Project Details */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Project Details</h4>
              <InfoGrid items={[
                { label: 'Project Title', value: lead.projectTitle },
                { label: 'Project Type', value: lead.projectType },
                { label: 'Structure Type', value: lead.structureType },
                { label: 'Material Preference', value: lead.materialPreference || '-' },
                { label: 'Priority', value: lead.priority },
              ]} />
            </div>

            {/* Dimensions */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Structure Dimensions</h4>
              <InfoGrid items={[
                { label: 'Width', value: lead.width ? `${lead.width}m` : '-' },
                { label: 'Length', value: lead.length ? `${lead.length}m` : '-' },
                { label: 'Height', value: lead.height ? `${lead.height}m` : '-' },
                { label: 'Bay Spacing', value: lead.baySpacing ? `${lead.baySpacing}m` : '-' },
                { label: 'Roof Type', value: lead.roofType || '-' },
                { label: 'Wall Type', value: lead.wallType || '-' },
                { label: 'Crane Required', value: lead.craneRequired ? `${lead.craneCapacity || ''} tons` : 'No' },
                { label: 'Mezzanine', value: lead.mezzanine ? `Yes${lead.mezzanineArea ? ` (${lead.mezzanineArea}m²)` : ''}` : 'No' },
                { label: 'Insulation', value: lead.insulationRequired ? (lead.insulationType || 'Yes') : 'No' },
              ]} />
            </div>

            {/* Site Details */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Site Details</h4>
              <InfoGrid items={[
                { label: 'Site Location', value: lead.siteLocation || '-' },
                { label: 'Site Address', value: lead.siteAddress || '-' },
                { label: 'Map Coordinates', value: lead.mapCoordinates || '-' },
                { label: 'Soil Notes', value: lead.soilNotes || '-' },
              ]} />
            </div>

            {/* Notes & Remarks */}
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Notes</h4>
              <InfoGrid items={[
                { label: 'Customer Notes', value: lead.customerNotes || '-' },
                { label: 'Special Requirements', value: lead.specialRequirement || '-' },
                { label: 'Remarks', value: lead.remarks || '-' },
              ]} />
            </div>
          </div>
        </Section>

        {/* ─── RELATED RECORDS ───────────────────────────── */}
        <Section title="Related Records" defaultOpen={false}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {lead.customerId && (
              <button
                onClick={() => router.push(ROUTES.customersDetail(lead.customerId!))}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left"
              >
                <User className="w-5 h-5 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Customer</p>
                  <p className="text-xs text-muted-foreground truncate">View linked customer</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              </button>
            )}
            {lead.convertedDate && (
              <button className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left">
                <FileText className="w-5 h-5 text-green-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Project</p>
                  <p className="text-xs text-muted-foreground truncate">Converted on {formatDate(lead.convertedDate)}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              </button>
            )}
          </div>
        </Section>

        {/* ─── DOCUMENTS ────────────────────────────────── */}
        <Section title="Documents" defaultOpen={false}>
          {lead.attachments && lead.attachments.length > 0 ? (
            <div className="space-y-2">
              {lead.attachments.map((url: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded border text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate flex-1">{url.split('/').pop() || url}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No documents attached yet</p>
          )}
        </Section>

        {/* Activities live inside Tracking → Activity tab */}
      </div>

      {/* ─── EDIT DIALOG ─────────────────────────────────── */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          <LeadForm
            initialData={lead}
            configuration={leadConfig}
            onSubmit={handleEditLead}
            onCancel={() => setIsEditDialogOpen(false)}
            isLoading={updateLeadMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
