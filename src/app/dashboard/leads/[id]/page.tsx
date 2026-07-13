'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MainLayout } from '@/layouts/MainLayout';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LeadActivityTimeline } from '@/features/leads/components/LeadActivityTimeline';
import { LeadQuickActions } from '@/features/leads/components/LeadQuickActions';
import { LeadHeroCard } from '@/features/leads/components/LeadHeroCard';
import { LeadCustomFields } from '@/features/leads/components/LeadCustomFields';
import { Lead, LeadPriority, LeadStatus } from '@/types/leads';
import { getLeadActivities } from '@/features/leads/utils/leadActivities';
import { useLeadConfiguration, useLead, useUpdateLead } from '@/features/leads/hooks/useLeads';
import { ROUTES } from '@/core/routes';
import { cn } from '@/lib/utils';
import { componentTextSizes } from '@/lib/design-system';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Ruler,
  FileText,
  User,
  Clock,
} from 'lucide-react';

const LeadForm = dynamic(() => import('@/features/leads/components/LeadForm').then(mod => ({ default: mod.LeadForm })), {
  loading: () => <div className="p-8 text-center text-sm text-muted-foreground">Loading form...</div>,
  ssr: false,
});

type TabType = 'overview' | 'customer' | 'project' | 'design' | 'boq' | 'estimate' | 'proposal' | 'activity' | 'notes' | 'files';

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

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const leadConfig = useLeadConfiguration();
  const updateLeadMutation = useUpdateLead();
  const leadId = params.id as string;

  // Fetch lead from backend
  const { data: leadData, isLoading, error } = useLead(leadId);
  const lead = leadData?.data || null;

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        const topbar = document.querySelector('header');
        const topbarHeight = topbar ? topbar.offsetHeight : 64;
        setIsSticky(rect.top <= topbarHeight);
      }
    };

    const main = document.querySelector('main');
    if (main) {
      main.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (main) {
        main.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const activities = useMemo(
    () => (lead ? getLeadActivities(lead.id, lead) : []),
    [lead]
  );

  const handleBack = useCallback(() => {
    router.push(ROUTES.leads);
  }, [router]);

  const handleEditLead = useCallback(async (data: Partial<Lead> | Lead) => {
    if (!leadId) return;
    try {
      await updateLeadMutation.mutateAsync({ id: leadId, data });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update lead:', error);
    }
  }, [leadId, updateLeadMutation]);

  const handleTabChange = useCallback((tabId: TabType) => {
    setActiveTab(tabId);
  }, []);

  const handleTabKeyDown = useCallback((e: React.KeyboardEvent, tabId: TabType) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabChange(tabId);
    }
  }, [handleTabChange]);

  const tabs: { id: TabType; label: string; icon: typeof Building2 }[] = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'customer', label: 'Customer', icon: User },
    { id: 'project', label: 'Project', icon: FileText },
    { id: 'design', label: 'Design', icon: Ruler },
    { id: 'boq', label: 'BOQ', icon: FileText },
    { id: 'estimate', label: 'Estimate', icon: FileText },
    { id: 'proposal', label: 'Proposal', icon: FileText },
    { id: 'activity', label: 'Activity', icon: Clock },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'files', label: 'Files', icon: FileText },
  ];

  const renderTabContent = () => {
    if (!lead) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4" role="tabpanel" id="panel-overview">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={cn(componentTextSizes.cardHeader.title, 'font-medium')}>
                    Lead Status
                  </CardTitle>
                  {lead.customerId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(ROUTES.customersDetail(lead.customerId!))}
                    >
                      <User className="h-3.5 w-3.5 mr-1.5" />
                      View Customer
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4">
                  <Badge variant={getStatusVariant(lead.status)} className="text-sm px-3 py-1">
                    {lead.status}
                  </Badge>
                  <Badge variant={getPriorityVariant(lead.priority)} className="text-sm px-3 py-1">
                    {lead.priority} Priority
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Next Follow-up: {formatDate(lead.nextFollowUpDate)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-500/15 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Project Type</p>
                      <p className="font-medium">{lead.projectType}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-500/15 rounded-lg flex items-center justify-center">
                      <Ruler className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Structure Type</p>
                      <p className="font-medium">{lead.structureType}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-purple-500/15 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{lead.city}, {lead.state}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className={cn(componentTextSizes.cardHeader.title, 'font-medium')}>
                  Structure Dimensions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Width</p>
                    <p className="font-medium">{lead.width}m</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Length</p>
                    <p className="font-medium">{lead.length}m</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Height</p>
                    <p className="font-medium">{lead.height}m</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Bay Spacing</p>
                    <p className="font-medium">{lead.baySpacing}m</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Roof Type</p>
                    <p className="font-medium">{lead.roofType || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Wall Type</p>
                    <p className="font-medium">{lead.wallType || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Crane</p>
                    <p className="font-medium">{lead.craneRequired ? `${lead.craneCapacity} tons` : 'No'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Mezzanine</p>
                    <p className="font-medium">{lead.mezzanine ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {leadConfig.customFields.length > 0 && (
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <LeadCustomFields
                    mode="view"
                    fields={leadConfig.customFields}
                    values={lead.customFields}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'customer':
        return (
          <div className="space-y-4" role="tabpanel" id="panel-customer">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className={cn(componentTextSizes.cardHeader.title, 'font-medium')}>
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Customer Name</p>
                    <p className="font-medium">{lead.customerName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Company Name</p>
                    <p className="font-medium">{lead.companyName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Mobile</p>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {lead.mobile}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Alternate Mobile</p>
                    <p className="font-medium">{lead.alternateMobile || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {lead.email}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">GST Number</p>
                    <p className="font-medium">{lead.gstNumber || '-'}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Address Line 1</p>
                  <p className="font-medium">{lead.addressLine1 || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Address Line 2</p>
                  <p className="font-medium">{lead.addressLine2 || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Area</p>
                  <p className="font-medium">{lead.area || '-'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">City</p>
                    <p className="font-medium">{lead.city}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">State</p>
                    <p className="font-medium">{lead.state}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Country</p>
                    <p className="font-medium">{lead.country || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Pincode</p>
                    <p className="font-medium">{lead.pincode || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className={cn(componentTextSizes.cardHeader.title, 'font-medium')}>
                  Site Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Site Location</p>
                  <p className="font-medium">{lead.siteLocation || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Site Address</p>
                  <p className="font-medium">{lead.siteAddress || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Map Coordinates</p>
                  <p className="font-medium">{lead.mapCoordinates || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Soil Notes</p>
                  <p className="font-medium">{lead.soilNotes || '-'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'project':
        return (
          <Card role="tabpanel" id="panel-project">
            <CardHeader className="pb-3">
              <CardTitle className={cn(componentTextSizes.cardHeader.title, 'font-medium')}>
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Project Title</p>
                <p className="font-medium">{lead.projectTitle}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Project Type</p>
                  <p className="font-medium">{lead.projectType}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Structure Type</p>
                  <p className="font-medium">{lead.structureType}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Material Preference</p>
                <p className="font-medium">{lead.materialPreference || '-'}</p>
              </div>
            </CardContent>
          </Card>
        );

      case 'design':
        return (
          <Card role="tabpanel" id="panel-design">
            <CardContent className="p-8 text-center">
              <Ruler className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Design requirements pending</p>
              <Button className="mt-4">Create Design</Button>
            </CardContent>
          </Card>
        );

      case 'boq':
        return (
          <Card role="tabpanel" id="panel-boq">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">BOQ not yet generated</p>
              <Button className="mt-4">Generate BOQ</Button>
            </CardContent>
          </Card>
        );

      case 'estimate':
        return (
          <Card role="tabpanel" id="panel-estimate">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Estimate not yet created</p>
              <Button className="mt-4">Create Estimate</Button>
            </CardContent>
          </Card>
        );

      case 'proposal':
        return (
          <Card role="tabpanel" id="panel-proposal">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Proposal not yet created</p>
              <Button className="mt-4">Create Proposal</Button>
            </CardContent>
          </Card>
        );

      case 'activity':
        return (
          <div role="tabpanel" id="panel-activity">
            <LeadActivityTimeline activities={activities} />
          </div>
        );

      case 'notes':
        return (
          <Card role="tabpanel" id="panel-notes">
            <CardHeader className="pb-3">
              <CardTitle className={cn(componentTextSizes.cardHeader.title, 'font-medium')}>
                Customer Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{lead.customerNotes || 'No notes added'}</p>
              <div className="mt-4 space-y-1">
                <p className="text-xs text-muted-foreground">Special Requirement</p>
                <p className="text-sm">{lead.specialRequirement || 'None'}</p>
              </div>
            </CardContent>
          </Card>
        );

      case 'files':
        return (
          <Card role="tabpanel" id="panel-files">
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No files attached</p>
              <Button className="mt-4">Upload Files</Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  if (!lead) {
    return (
      <MainLayout title="Lead Not Found" subtitle="">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <p className="text-sm text-destructive">Lead not found or may have been removed.</p>
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
      <StandardPageLayout
        title={`Lead #${lead.leadNumber}`}
        subtitle={`${lead.customerName} · ${lead.companyName}`}
        breadcrumbs={[
          { label: 'Leads', href: ROUTES.leads },
          { label: `#${lead.leadNumber}` },
        ]}
        headerActions={
          <LeadQuickActions
            showAddLead={false}
            onEdit={() => setIsEditDialogOpen(true)}
            onAddFollowUp={() => {}}
            onSendEstimate={() => {}}
            onSendProposal={() => {}}
            onConvertToProject={() => {
              if (lead) {
                if (!lead.customerId) {
                  alert('This lead has not been converted to a customer yet. Please convert the lead to a customer first.');
                  return;
                }
                sessionStorage.setItem('convertFromLead', JSON.stringify(lead));
                router.push(`/dashboard/projects?create=true&customerId=${lead.customerId}`);
              }
            }}
          />
        }
        className="gap-4"
      >
        <div className="space-y-4">
          <div
            ref={headerRef}
            className={cn(
              'bg-background transition-all duration-300',
              'sticky top-16 z-40',
              isSticky && 'shadow-md border-b'
            )}
          >
            <div className="py-4">
              <div className={cn('flex items-center justify-between transition-all duration-300', !isSticky && 'mb-4')}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2 flex-shrink-0">
                    <ArrowLeft className="h-4 w-4" />
                    <span className={cn('transition-all duration-300', isSticky && 'hidden')}>Back to Leads</span>
                    <span className={cn('transition-all duration-300', !isSticky && 'hidden')}>Back</span>
                  </Button>
                  <div className="h-4 w-px bg-border flex-shrink-0" />
                  <Badge variant={getStatusVariant(lead.status)} className="flex-shrink-0">
                    {lead.status}
                  </Badge>
                  <Badge variant={getPriorityVariant(lead.priority)} className="flex-shrink-0">
                    {lead.priority}
                  </Badge>
                  {isSticky && (
                    <div className="flex items-center gap-2 min-w-0 flex-1 animate-in fade-in slide-in-from-left duration-300">
                      <LeadHeroCard lead={lead} compact />
                    </div>
                  )}
                </div>
              </div>
              <div className={cn('transition-all duration-300', isSticky && 'hidden')}>
                <LeadHeroCard lead={lead} />
              </div>
            </div>
          </div>

          {isSticky && <div className="h-20" />}

          <div className="border-b" role="tablist" aria-label="Lead details tabs">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`panel-${tab.id}`}
                    tabIndex={activeTab === tab.id ? 0 : -1}
                    className={cn(
                      'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0',
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {renderTabContent()}
        </div>
      </StandardPageLayout>

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
