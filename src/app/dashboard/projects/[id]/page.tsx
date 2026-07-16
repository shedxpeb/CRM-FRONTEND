'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { CardSkeleton } from '@/components/loading/CardSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { TrackingEngine } from '@/components/tracking/TrackingEngine';
import { useProject, useProjectActivities, useUpdateProject, useProjectConfiguration } from '@/features/projects/hooks/useProjects';
import { ProjectCustomFields } from '@/features/projects/components/ProjectCustomFields';
import { useCustomers } from '@/features/customers/hooks/useCustomers';
import { getProjectStatusVariant, getPriorityVariant, getHealthStatusVariant, getHealthStatusColor } from '@/features/projects/constants';
import { ROUTES } from '@/core/routes';
import type { Customer } from '@/features/customers/types';
import type { Project, UpdateProjectDto } from '@/features/projects/types';
import { ProjectForm } from '@/features/projects/components/ProjectForm';
import { ArrowLeft, Edit, Building2, Calendar, DollarSign, AlertCircle, Users, Map, Package, CreditCard, FileText, Receipt, FileCheck, Wrench, ChevronDown, ChevronRight, Shield } from 'lucide-react';

function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold bg-muted/30 hover:bg-muted/50 transition-colors">
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
          <p className="text-xs text-muted-foreground flex items-center gap-1">{item.icon}{item.label}</p>
          <p className="text-sm font-medium">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function formatDate(value?: Date | string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function projectToFormInitial(project: Project) {
  const toDateInput = (d?: Date | string) => {
    if (!d) return '';
    return new Date(d).toISOString().split('T')[0];
  };
  return {
    projectName: project.projectName,
    customerId: project.customerId,
    leadId: project.leadId,
    projectType: project.projectType,
    value: project.value,
    budget: project.budget,
    location: project.location,
    city: project.city,
    state: project.state,
    pincode: project.pincode,
    startDate: toDateInput(project.startDate),
    endDate: toDateInput(project.endDate),
    priority: project.priority,
    projectManagerId: project.projectManagerId,
    structureType: project.structureType,
    width: project.width,
    length: project.length,
    height: project.height,
    baySpacing: project.baySpacing,
    roofType: project.roofType,
    craneSystem: project.craneSystem,
    mezzanine: project.mezzanine,
    wallType: project.wallType,
    insulation: project.insulation,
    coveredArea: project.coveredArea,
    totalWeight: project.totalWeight,
    customFields: project.customFields ?? {},
  };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { data: projectResponse, isLoading } = useProject(projectId);
  const project = projectResponse?.data ?? null;
  const projectConfig = useProjectConfiguration();
  const updateMutation = useUpdateProject();
  const { data: activitiesResponse } = useProjectActivities(projectId);
  const activities = activitiesResponse?.data;
  const { data: customersData } = useCustomers({ page: 1, pageSize: 1000 });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const linkedCustomer = project?.customerId && customersData?.data?.rows
    ? customersData.data.rows.find((customer: Customer) => customer.id === project.customerId)
    : null;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton count={6} />
        </div>
      </MainLayout>
    );
  }

  if (!project) {
    return (
      <MainLayout>
        <ErrorState
          title="Project not found"
          message="The selected project could not be loaded. It may have been removed or the link may be invalid."
          retryLabel="Go Back"
          onRetry={() => router.push(ROUTES.projects)}
          className="min-h-64"
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="sm" onClick={() => (typeof window !== 'undefined' && window.history.length > 1 ? router.back() : router.push(ROUTES.projects))}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
            <div className="h-4 w-px bg-border" />
            <div className="min-w-0">
              <h1 className="text-lg font-semibold truncate">{project.projectName}</h1>
              <p className="text-sm text-muted-foreground truncate">{project.projectCode} &middot; {project.customerName}</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="flex flex-wrap gap-2">
          {linkedCustomer && (
            <Button variant="outline" size="sm" className="text-xs" onClick={() => router.push(ROUTES.customersDetail(linkedCustomer.id))}>
              <Users className="h-3.5 w-3.5 mr-1.5" /> View Customer
            </Button>
          )}
          {project.leadId && (
            <Button variant="outline" size="sm" className="text-xs" onClick={() => router.push(ROUTES.leadsDetail(project.leadId!))}>
              <FileText className="h-3.5 w-3.5 mr-1.5" /> View Lead
            </Button>
          )}
          {project.estimateId && (
            <Button variant="outline" size="sm" className="text-xs" onClick={() => router.push(`${ROUTES.documentsEstimates}?ref=${project.estimateId}`)}>
              <FileText className="h-3.5 w-3.5 mr-1.5" /> View Estimate
            </Button>
          )}
          {project.proposalId && (
            <Button variant="outline" size="sm" className="text-xs" onClick={() => router.push(`${ROUTES.documentsProposals}?ref=${project.proposalId}`)}>
              <FileText className="h-3.5 w-3.5 mr-1.5" /> View Proposal
            </Button>
          )}
          {project.quotationId && (
            <Button variant="outline" size="sm" className="text-xs" onClick={() => router.push(`${ROUTES.documentsQuotations}?ref=${project.quotationId}`)}>
              <Receipt className="h-3.5 w-3.5 mr-1.5" /> View Quotation
            </Button>
          )}
          {project.invoiceIds && project.invoiceIds.length > 0 && (
            <Button variant="outline" size="sm" className="text-xs" onClick={() => router.push(ROUTES.finance)}>
              <CreditCard className="h-3.5 w-3.5 mr-1.5" /> View Finance ({project.invoiceIds.length})
            </Button>
          )}
          {project.reservedItems && project.reservedItems.length > 0 && (
            <Button variant="outline" size="sm" className="text-xs" onClick={() => router.push(ROUTES.inventory)}>
              <Package className="h-3.5 w-3.5 mr-1.5" /> View Inventory
            </Button>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <Card>
            <CardContent className="p-2 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="text-[10px] sm:text-sm text-muted-foreground">Status</span>
              </div>
              <Badge variant={getProjectStatusVariant(project.status)} className="text-[10px] sm:text-xs">{project.status}</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="text-[10px] sm:text-sm text-muted-foreground">Stage</span>
              </div>
              <Badge variant="outline" className="text-[10px] sm:text-xs">{project.stage}</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="text-[10px] sm:text-sm text-muted-foreground">Value</span>
              </div>
              <p className="text-base sm:text-lg font-bold">₹{(project.value / 1000000).toFixed(2)}M</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="text-[10px] sm:text-sm text-muted-foreground">Priority</span>
              </div>
              <Badge variant={getPriorityVariant(project.priority)} className="text-[10px] sm:text-xs">{project.priority}</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-3">
          <Section title="Tracking" defaultOpen={true}>
            <TrackingEngine entityType="project" entityId={projectId} />
          </Section>

          {/* Overview */}
          <Section title="Overview" defaultOpen={false}>
            <InfoGrid
              items={[
                { label: 'Project Code', value: project.projectCode },
                { label: 'Project Type', value: project.projectType, icon: <Building2 className="w-3 h-3" /> },
                { label: 'Status', value: <Badge variant={getProjectStatusVariant(project.status)}>{project.status}</Badge> },
                { label: 'Stage', value: <Badge variant="outline">{project.stage}</Badge> },
                { label: 'Value', value: <>₹{project.value.toLocaleString()}</>, icon: <DollarSign className="w-3 h-3" /> },
                { label: 'Budget', value: <>₹{project.budget.toLocaleString()}</>, icon: <DollarSign className="w-3 h-3" /> },
                { label: 'Priority', value: <Badge variant={getPriorityVariant(project.priority)}>{project.priority}</Badge> },
                { label: 'Customer', value: project.customerName, icon: <Users className="w-3 h-3" /> },
                { label: 'Project Manager', value: project.projectManager, icon: <Users className="w-3 h-3" /> },
                { label: 'Overall Progress', value: <>{project.progress}%</> },
                { label: 'Health', value: <Badge variant={getHealthStatusVariant(project.healthStatus)} className={getHealthStatusColor(project.healthStatus)}>{project.healthStatus}</Badge> },
                { label: 'Start - End', value: <>{formatDate(project.startDate)} &ndash; {formatDate(project.endDate)}</>, icon: <Calendar className="w-3 h-3" /> },
              ]}
            />
          </Section>

          {/* Information */}
          <Section title="Information" defaultOpen={false}>
            <div className="space-y-6">
              {/* General Info */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">General Info</p>
                <InfoGrid
                  items={[
                    { label: 'Project Name', value: project.projectName },
                    { label: 'Project Code', value: project.projectCode },
                    { label: 'Project Type', value: project.projectType },
                    { label: 'Priority', value: <Badge variant={getPriorityVariant(project.priority)}>{project.priority}</Badge> },
                    { label: 'Status', value: <Badge variant={getProjectStatusVariant(project.status)}>{project.status}</Badge> },
                    { label: 'Stage', value: <Badge variant="outline">{project.stage}</Badge> },
                    { label: 'Value', value: <>₹{project.value.toLocaleString()}</> },
                    { label: 'Budget', value: <>₹{project.budget.toLocaleString()}</> },
                  ]}
                />
              </div>

              {projectConfig.customFields.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Custom Fields</p>
                  <ProjectCustomFields mode="view" fields={projectConfig.customFields} values={project.customFields ?? {}} />
                </div>
              )}

              {/* Customer */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Customer</p>
                {linkedCustomer ? (
                  <InfoGrid
                    items={[
                      { label: 'Company Name', value: <Button variant="link" size="sm" className="h-auto p-0 text-sm font-medium" onClick={() => router.push(ROUTES.customersDetail(linkedCustomer.id))}>{linkedCustomer.companyName}</Button> },
                      { label: 'Contact Person', value: linkedCustomer.customerName },
                      { label: 'Phone', value: linkedCustomer.mobile || '-' },
                      { label: 'Email', value: linkedCustomer.email || '-' },
                      { label: 'GST', value: linkedCustomer.gstNumber || '-' },
                      { label: 'Address', value: <>{linkedCustomer.address}, {linkedCustomer.city}, {linkedCustomer.state}</> },
                    ]}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{project.customerName} (ID: {project.customerId})</p>
                )}
              </div>

              {/* Schedule */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Schedule</p>
                <InfoGrid
                  items={[
                    { label: 'Start Date', value: formatDate(project.startDate), icon: <Calendar className="w-3 h-3" /> },
                    { label: 'End Date', value: formatDate(project.endDate), icon: <Calendar className="w-3 h-3" /> },
                    { label: 'Duration', value: <>{(() => { const diff = new Date(project.endDate).getTime() - new Date(project.startDate).getTime(); return Math.ceil(diff / (1000 * 60 * 60 * 24)).toLocaleString()})()} days</> },
                  ]}
                />
              </div>

              {/* Location */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Location</p>
                <InfoGrid
                  items={[
                    { label: 'Location / Address', value: project.location, icon: <Map className="w-3 h-3" /> },
                    { label: 'City', value: project.city },
                    { label: 'State', value: project.state },
                    { label: 'Pincode', value: project.pincode || '-' },
                  ]}
                />
              </div>

              {/* PEB Specs */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">PEB Specifications</p>
                <InfoGrid
                  items={[
                    { label: 'Structure Type', value: project.structureType },
                    { label: 'Width', value: project.width ? `${project.width}m` : '-' },
                    { label: 'Length', value: project.length ? `${project.length}m` : '-' },
                    { label: 'Height', value: project.height ? `${project.height}m` : '-' },
                    { label: 'Bay Spacing', value: project.baySpacing ? `${project.baySpacing}m` : '-' },
                    { label: 'Roof Type', value: project.roofType },
                    { label: 'Wall Type', value: project.wallType },
                    { label: 'Crane System', value: project.craneSystem },
                    { label: 'Mezzanine', value: project.mezzanine ? 'Yes' : 'No' },
                    { label: 'Insulation', value: project.insulation ? 'Yes' : 'No' },
                    { label: 'Covered Area', value: project.coveredArea ? `${project.coveredArea.toLocaleString()} sq.m` : '-' },
                    { label: 'Total Weight', value: project.totalWeight ? `${project.totalWeight.toLocaleString()} tons` : '-' },
                  ]}
                />
              </div>

              {/* Progress */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Progress</p>
                <InfoGrid
                  items={[
                    { label: 'Overall Progress', value: <>{project.progress}%</> },
                    { label: 'Design Progress', value: <>{project.designProgress}%</> },
                    { label: 'Procurement Progress', value: <>{project.procurementProgress}%</> },
                    { label: 'Fabrication Progress', value: <>{project.fabricationProgress}%</> },
                    { label: 'Installation Progress', value: <>{project.installationProgress}%</> },
                  ]}
                />
              </div>

              {/* Health */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Health</p>
                <InfoGrid
                  items={[
                    { label: 'Overall Health', value: <Badge variant={getHealthStatusVariant(project.healthStatus)} className={getHealthStatusColor(project.healthStatus)}>{project.healthStatus}</Badge>, icon: <Shield className="w-3 h-3" /> },
                    { label: 'Timeline Health', value: <Badge variant={getHealthStatusVariant(project.timelineHealth)}>{project.timelineHealth}</Badge> },
                    { label: 'Budget Health', value: <Badge variant={getHealthStatusVariant(project.budgetHealth)}>{project.budgetHealth}</Badge> },
                    { label: 'Material Health', value: <Badge variant={getHealthStatusVariant(project.materialHealth)}>{project.materialHealth}</Badge> },
                    { label: 'Resource Health', value: <Badge variant={getHealthStatusVariant(project.resourceHealth)}>{project.resourceHealth}</Badge> },
                  ]}
                />
              </div>

              {/* Costs */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Costs</p>
                <InfoGrid
                  items={[
                    { label: 'Material Cost', value: <>₹{(project.materialCost || 0).toLocaleString()}</>, icon: <DollarSign className="w-3 h-3" /> },
                    { label: 'Procurement Cost', value: <>₹{(project.procurementCost || 0).toLocaleString()}</>, icon: <DollarSign className="w-3 h-3" /> },
                    { label: 'Fabrication Cost', value: <>₹{(project.fabricationCost || 0).toLocaleString()}</>, icon: <DollarSign className="w-3 h-3" /> },
                    { label: 'Installation Cost', value: <>₹{(project.installationCost || 0).toLocaleString()}</>, icon: <DollarSign className="w-3 h-3" /> },
                    { label: 'Total Spent', value: <span className="font-semibold">₹{((project.materialCost || 0) + (project.procurementCost || 0) + (project.fabricationCost || 0) + (project.installationCost || 0)).toLocaleString()}</span> },
                    { label: 'Profit Margin', value: <span className="text-green-600 font-semibold">{project.profitMargin ?? '-'}%</span> },
                  ]}
                />
              </div>

              {/* Team */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Team</p>
                {project.team.length > 0 ? (
                  <div className="space-y-2">
                    {project.team.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                          </div>
                        </div>
                        {member.workload != null && (
                          <div className="text-right text-xs text-muted-foreground">
                            {member.workload}% workload
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Project Manager: {project.projectManager}</p>
                )}
              </div>

              {/* Milestones */}
              {project.milestones.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Milestones</p>
                  <div className="space-y-2">
                    {project.milestones.map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{m.name}</p>
                          <p className="text-xs text-muted-foreground">Planned: {formatDate(m.plannedDate)}{m.actualDate ? ` | Actual: ${formatDate(m.actualDate)}` : ''}</p>
                        </div>
                        <Badge variant={m.status === 'Completed' ? 'success' : m.status === 'Delayed' ? 'destructive' : m.status === 'In Progress' ? 'warning' : 'outline'} className="text-xs">{m.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* Related Records */}
          <Section title="Related Records" defaultOpen={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {linkedCustomer && (
                <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(ROUTES.customersDetail(linkedCustomer.id))}>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-medium">Customer</span>
                  </div>
                  <p className="text-sm font-semibold">{linkedCustomer.companyName || linkedCustomer.customerName}</p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">View Customer</Button>
                </div>
              )}
              {project.leadId && (
                <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(ROUTES.leadsDetail(project.leadId!))}>
                  <div className="flex items-center gap-2 mb-2">
                    <FileCheck className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-medium">Lead</span>
                  </div>
                  <p className="text-sm font-semibold">{project.leadId}</p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">View Lead</Button>
                </div>
              )}
              {project.estimateId && (
                <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(`${ROUTES.documentsEstimates}?ref=${project.estimateId}`)}>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-medium">Estimate</span>
                  </div>
                  <p className="text-sm font-semibold">{project.estimateId}</p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">View Estimate</Button>
                </div>
              )}
              {project.proposalId && (
                <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(`${ROUTES.documentsProposals}?ref=${project.proposalId}`)}>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-orange-600" />
                    <span className="text-xs font-medium">Proposal</span>
                  </div>
                  <p className="text-sm font-semibold">{project.proposalId}</p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">View Proposal</Button>
                </div>
              )}
              {project.quotationId && (
                <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(`${ROUTES.documentsQuotations}?ref=${project.quotationId}`)}>
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-medium">Quotation</span>
                  </div>
                  <p className="text-sm font-semibold">{project.quotationId}</p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">View Quotation</Button>
                </div>
              )}
              {project.invoiceIds && project.invoiceIds.length > 0 && (
                <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(ROUTES.finance)}>
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-pink-600" />
                    <span className="text-xs font-medium">Invoices</span>
                  </div>
                  <p className="text-sm font-semibold">{project.invoiceIds.length} invoices</p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">View Finance</Button>
                </div>
              )}
              {project.reservedItems && project.reservedItems.length > 0 && (
                <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(ROUTES.inventory)}>
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-medium">Inventory</span>
                  </div>
                  <p className="text-sm font-semibold">{project.reservedItems.length} items</p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">View Inventory</Button>
                </div>
              )}
            </div>
          </Section>

          {/* Documents */}
          <Section title="Documents" defaultOpen={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link href={`${ROUTES.documents}?projectId=${project.id}`} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-medium">All Documents</span>
                </div>
                <p className="text-xs text-muted-foreground">Open Documents module filtered for this project</p>
              </Link>
              {project.estimateId && (
                <Link href={`${ROUTES.documentsEstimates}?projectId=${project.id}`} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-medium">Estimates</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Project estimates and costing</p>
                </Link>
              )}
              {project.proposalId && (
                <Link href={`${ROUTES.documentsProposals}?projectId=${project.id}`} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench className="h-4 w-4 text-cyan-600" />
                    <span className="text-xs font-medium">Proposals</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Commercial proposals for this project</p>
                </Link>
              )}
              {project.quotationId && (
                <Link href={`${ROUTES.documentsQuotations}?projectId=${project.id}`} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-medium">Quotations</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Final quotations and commitments</p>
                </Link>
              )}
            </div>
          </Section>

          {/* Activities live inside Tracking → Activity tab */}
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <ProjectForm
            initialData={projectToFormInitial(project)}
            onSubmit={(data) =>
              updateMutation.mutate(
                { id: project.id, data: data as UpdateProjectDto },
                { onSuccess: () => setIsEditDialogOpen(false) }
              )
            }
            onCancel={() => setIsEditDialogOpen(false)}
            isLoading={updateMutation.isPending}
            isEditMode
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
