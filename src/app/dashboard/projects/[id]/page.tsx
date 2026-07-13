'use client';

import { useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { MainLayout } from '@/layouts/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CardSkeleton } from '@/components/loading/CardSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { useProject, useProjectActivities, useUpdateProject, useProjectConfiguration } from '@/features/projects/hooks/useProjects';
import { ProjectCustomFields } from '@/features/projects/components/ProjectCustomFields';
import { useCustomers } from '@/features/customers/hooks/useCustomers';
import { getProjectStatusVariant, getPriorityVariant } from '@/features/projects/constants';
import { ROUTES } from '@/core/routes';
import type { Customer } from '@/features/customers/types';
import type { Project, UpdateProjectDto } from '@/features/projects/types';
import { ArrowLeft, Edit, Calendar, DollarSign, Users, Building2, FileText, AlertCircle, Link2, Package, Truck, Receipt, FileCheck, Wrench, Shield, AlertTriangle, MessageSquare, Map, CreditCard } from 'lucide-react';

// Lazy load tab components to reduce initial bundle size
const ProjectTimeline = dynamic(() => import('@/features/projects/components/ProjectTimeline').then(mod => ({ default: mod.ProjectTimeline })), {
  loading: () => <CardSkeleton />,
  ssr: false
});

const ProjectHealthCard = dynamic(() => import('@/features/projects/components/ProjectHealthCard').then(mod => ({ default: mod.ProjectHealthCard })), {
  loading: () => <CardSkeleton />,
  ssr: false
});

const MilestoneTracker = dynamic(() => import('@/features/projects/components/MilestoneTracker').then(mod => ({ default: mod.MilestoneTracker })), {
  loading: () => <CardSkeleton />,
  ssr: false
});

const ProjectForm = dynamic(
  () => import('@/features/projects/components/ProjectForm').then((mod) => ({ default: mod.ProjectForm })),
  { loading: () => <CardSkeleton />, ssr: false }
);

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

  // Find linked customer
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
            <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.projects)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
            <div className="h-4 w-px bg-border" />
            <div className="min-w-0">
              <h1 className="text-lg font-semibold truncate">{project.projectName}</h1>
              <p className="text-sm text-muted-foreground truncate">{project.projectCode} · {project.customerName}</p>
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
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => router.push(ROUTES.customersDetail(linkedCustomer.id))}
            >
              <Users className="h-3.5 w-3.5 mr-1.5" />
              View Customer
            </Button>
          )}
          {project.leadId && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => router.push(ROUTES.leadsDetail(project.leadId!))}
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              View Lead
            </Button>
          )}
          {project.estimateId && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => router.push(`${ROUTES.documentsEstimates}?ref=${project.estimateId}`)}
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              View Estimate
            </Button>
          )}
          {project.proposalId && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => router.push(`${ROUTES.documentsProposals}?ref=${project.proposalId}`)}
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              View Proposal
            </Button>
          )}
          {project.quotationId && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => router.push(`${ROUTES.documentsQuotations}?ref=${project.quotationId}`)}
            >
              <Receipt className="h-3.5 w-3.5 mr-1.5" />
              View Quotation
            </Button>
          )}
          {project.invoiceIds && project.invoiceIds.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => router.push(ROUTES.finance)}
            >
              <CreditCard className="h-3.5 w-3.5 mr-1.5" />
              View Finance ({project.invoiceIds.length})
            </Button>
          )}
          {project.reservedItems && project.reservedItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => router.push(ROUTES.inventory)}
            >
              <Package className="h-3.5 w-3.5 mr-1.5" />
              View Inventory
            </Button>
          )}
        </div>

        {/* Project Summary Cards */}
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

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="milestones" className="text-xs">Milestones</TabsTrigger>
            <TabsTrigger value="team" className="text-xs">Team</TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
            <TabsTrigger value="budget" className="text-xs">Budget</TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs">Tasks</TabsTrigger>
            <TabsTrigger value="payments" className="text-xs">Payments</TabsTrigger>
            <TabsTrigger value="documents" className="text-xs">Documents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* General Information */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">General Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Customer</p>
                      <p className="text-sm font-medium">{project.customerName}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Project Type</p>
                      <p className="text-sm font-medium">{project.projectType}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Location</p>
                      <p className="text-sm font-medium">{project.location}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">City, State</p>
                      <p className="text-sm font-medium">{project.city}, {project.state}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Start Date</p>
                      <p className="text-sm font-medium">{new Date(project.startDate).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">End Date</p>
                      <p className="text-sm font-medium">{new Date(project.endDate).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Project Manager</p>
                      <p className="text-sm font-medium">{project.projectManager}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Progress</p>
                      <p className="text-sm font-medium">{project.progress}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Health Card */}
              <Suspense fallback={<CardSkeleton />}>
                <ProjectHealthCard
                  healthStatus={project.healthStatus}
                  timelineHealth={project.timelineHealth}
                  budgetHealth={project.budgetHealth}
                  materialHealth={project.materialHealth}
                  resourceHealth={project.resourceHealth}
                />
              </Suspense>
            </div>

            {projectConfig.customFields.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Custom Fields</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProjectCustomFields
                    mode="view"
                    fields={projectConfig.customFields}
                    values={project.customFields ?? {}}
                  />
                </CardContent>
              </Card>
            )}

            {/* PEB Specifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">PEB Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Structure Type</p>
                    <p className="text-sm font-medium">{project.structureType}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Width</p>
                    <p className="text-sm font-medium">{project.width}m</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Length</p>
                    <p className="text-sm font-medium">{project.length}m</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Height</p>
                    <p className="text-sm font-medium">{project.height}m</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Bay Spacing</p>
                    <p className="text-sm font-medium">{project.baySpacing}m</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Roof Type</p>
                    <p className="text-sm font-medium">{project.roofType}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Crane System</p>
                    <p className="text-sm font-medium">{project.craneSystem}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Wall Type</p>
                    <p className="text-sm font-medium">{project.wallType}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Covered Area</p>
                    <p className="text-sm font-medium">{project.coveredArea?.toLocaleString()} sq.m</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Total Weight</p>
                    <p className="text-sm font-medium">{project.totalWeight?.toLocaleString()} tons</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Mezzanine</p>
                    <p className="text-sm font-medium">{project.mezzanine ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Insulation</p>
                    <p className="text-sm font-medium">{project.insulation ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cross-Module Relationships */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Related Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {project.leadId && (
                    <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <FileCheck className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium">Lead</span>
                      </div>
                      <p className="text-sm font-semibold">#{project.leadId}</p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs">View Lead</Button>
                    </div>
                  )}
                  {project.estimateId && (
                    <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-purple-600" />
                        <span className="text-xs font-medium">Estimate</span>
                      </div>
                      <p className="text-sm font-semibold">{project.estimateId}</p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs">View Estimate</Button>
                    </div>
                  )}
                  {project.proposalId && (
                    <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-orange-600" />
                        <span className="text-xs font-medium">Proposal</span>
                      </div>
                      <p className="text-sm font-semibold">{project.proposalId}</p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs">View Proposal</Button>
                    </div>
                  )}
                  {project.quotationId && (
                    <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Receipt className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-medium">Quotation</span>
                      </div>
                      <p className="text-sm font-semibold">{project.quotationId}</p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs">View Quotation</Button>
                    </div>
                  )}
                  {project.invoiceIds && project.invoiceIds.length > 0 && (
                    <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Receipt className="h-4 w-4 text-pink-600" />
                        <span className="text-xs font-medium">Invoices</span>
                      </div>
                      <p className="text-sm font-semibold">{project.invoiceIds.length} invoices</p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs">View All</Button>
                    </div>
                  )}
                  {project.reservedItems && project.reservedItems.length > 0 && (
                    <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-4 w-4 text-amber-600" />
                        <span className="text-xs font-medium">Inventory</span>
                      </div>
                      <p className="text-sm font-semibold">{project.reservedItems.length} items</p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs">View Reservations</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Commercial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Commercial Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.estimateId && (
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Estimate Number</p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-sm font-medium">{project.estimateId}</Button>
                    </div>
                  )}
                  {project.estimateId && (
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Estimate Status</p>
                      <Badge variant="outline" className="text-xs">Approved</Badge>
                    </div>
                  )}
                  {project.proposalId && (
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Proposal Number</p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-sm font-medium">{project.proposalId}</Button>
                    </div>
                  )}
                  {project.proposalId && (
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Proposal Status</p>
                      <Badge variant="outline" className="text-xs">Accepted</Badge>
                    </div>
                  )}
                  {project.quotationId && (
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Quotation Number</p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-sm font-medium">{project.quotationId}</Button>
                    </div>
                  )}
                  {project.quotationId && (
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Quotation Status</p>
                      <Badge variant="default" className="text-xs">Approved</Badge>
                    </div>
                  )}
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Final Approved Amount</p>
                    <p className="text-sm font-medium">₹{project.value.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Approval Date</p>
                    <p className="text-sm font-medium">{new Date(project.startDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Created By</p>
                    <p className="text-sm font-medium">{project.projectManager}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Snapshot */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Customer Snapshot
                  </CardTitle>
                  {linkedCustomer && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/dashboard/customers/${linkedCustomer.id}`}
                    >
                      View Customer
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {linkedCustomer ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Company Name</p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-sm font-medium">{linkedCustomer.companyName}</Button>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Contact Person</p>
                      <p className="text-sm font-medium">{linkedCustomer.customerName}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Phone</p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-sm font-medium">{linkedCustomer.mobile}</Button>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Email</p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-sm font-medium">{linkedCustomer.email}</Button>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">GST</p>
                      <p className="text-sm font-medium">{linkedCustomer.gstNumber || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Address</p>
                      <p className="text-sm font-medium">{linkedCustomer.address}, {linkedCustomer.city}, {linkedCustomer.state}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No customer linked to this project
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Site Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  Site Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Full Address</p>
                    <p className="text-sm font-medium">{project.location}, {project.city}, {project.state} - {project.pincode || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Project Duration</p>
                    <p className="text-sm font-medium">
                      {new Date(project.startDate).toLocaleDateString('en-IN')} to {new Date(project.endDate).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Map className="h-8 w-8" />
                    <p className="text-sm">Map integration placeholder - Google Maps will be integrated here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Connection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Inventory Connection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium text-muted-foreground">Item</th>
                        <th className="text-right p-2 font-medium text-muted-foreground">Qty Required</th>
                        <th className="text-right p-2 font-medium text-muted-foreground">Qty Reserved</th>
                        <th className="text-right p-2 font-medium text-muted-foreground">Qty Issued</th>
                        <th className="text-right p-2 font-medium text-muted-foreground">Qty Remaining</th>
                        <th className="text-left p-2 font-medium text-muted-foreground">Warehouse</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-muted/50 cursor-pointer">
                        <td className="p-2 font-medium">ISMB 300</td>
                        <td className="p-2 text-right">120</td>
                        <td className="p-2 text-right">120</td>
                        <td className="p-2 text-right">80</td>
                        <td className="p-2 text-right">40</td>
                        <td className="p-2 text-left">Main Warehouse</td>
                      </tr>
                      <tr className="border-b hover:bg-muted/50 cursor-pointer">
                        <td className="p-2 font-medium">Roofing Sheet</td>
                        <td className="p-2 text-right">500</td>
                        <td className="p-2 text-right">500</td>
                        <td className="p-2 text-right">200</td>
                        <td className="p-2 text-right">300</td>
                        <td className="p-2 text-left">Main Warehouse</td>
                      </tr>
                      <tr className="hover:bg-muted/50 cursor-pointer">
                        <td className="p-2 font-medium">Z-Purlin 200</td>
                        <td className="p-2 text-right">80</td>
                        <td className="p-2 text-right">80</td>
                        <td className="p-2 text-right">50</td>
                        <td className="p-2 text-right">30</td>
                        <td className="p-2 text-left">Fabrication Yard</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Finance Connection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Finance Connection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Contract Value</p>
                    <Button variant="link" size="sm" className="h-auto p-0 text-sm font-medium">₹{project.value.toLocaleString()}</Button>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Invoiced</p>
                    <Button variant="link" size="sm" className="h-auto p-0 text-sm font-medium">₹{(project.value * 0.4).toLocaleString()}</Button>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Received</p>
                    <Button variant="link" size="sm" className="h-auto p-0 text-sm font-medium">₹{(project.value * 0.35).toLocaleString()}</Button>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Outstanding</p>
                    <Button variant="link" size="sm" className="h-auto p-0 text-sm font-medium">₹{(project.value * 0.6).toLocaleString()}</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents Connection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents Connection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.estimateId && (
                    <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium">Estimate PDF</span>
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm" className="flex-1 text-xs">Preview</Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs">Download</Button>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button variant="ghost" size="sm" className="flex-1 text-xs">Version History</Button>
                        <Button variant="ghost" size="sm" className="flex-1 text-xs">Duplicate</Button>
                      </div>
                    </div>
                  )}
                  {project.proposalId && (
                    <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium">Proposal PDF</span>
                        <FileText className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm" className="flex-1 text-xs">Preview</Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs">Download</Button>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button variant="ghost" size="sm" className="flex-1 text-xs">Version History</Button>
                        <Button variant="ghost" size="sm" className="flex-1 text-xs">Duplicate</Button>
                      </div>
                    </div>
                  )}
                  {project.quotationId && (
                    <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium">Quotation PDF</span>
                        <Receipt className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button variant="outline" size="sm" className="flex-1 text-xs">Preview</Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs">Download</Button>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button variant="ghost" size="sm" className="flex-1 text-xs">Version History</Button>
                        <Button variant="ghost" size="sm" className="flex-1 text-xs">Duplicate</Button>
                      </div>
                    </div>
                  )}
                  {project.invoiceIds && project.invoiceIds.length > 0 && (
                    <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium">Invoices ({project.invoiceIds.length})</span>
                        <Receipt className="h-4 w-4 text-pink-600" />
                      </div>
                      <Button variant="outline" size="sm" className="w-full text-xs mt-2">View All Invoices</Button>
                    </div>
                  )}
                  <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium">Attachments</span>
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <Button variant="outline" size="sm" className="w-full text-xs mt-2">View Attachments</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                      <div className="w-0.5 h-full bg-gray-200"></div>
                    </div>
                    <div className="pb-4">
                      <p className="text-xs text-muted-foreground">10 Jan</p>
                      <p className="text-sm font-medium">Lead Created</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-purple-600"></div>
                      <div className="w-0.5 h-full bg-gray-200"></div>
                    </div>
                    <div className="pb-4">
                      <p className="text-xs text-muted-foreground">12 Jan</p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-sm font-medium">Estimate Sent</Button>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-orange-600"></div>
                      <div className="w-0.5 h-full bg-gray-200"></div>
                    </div>
                    <div className="pb-4">
                      <p className="text-xs text-muted-foreground">15 Jan</p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-sm font-medium">Proposal Sent</Button>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-green-600"></div>
                      <div className="w-0.5 h-full bg-gray-200"></div>
                    </div>
                    <div className="pb-4">
                      <p className="text-xs text-muted-foreground">18 Jan</p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-sm font-medium">Quotation Approved</Button>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-indigo-600"></div>
                      <div className="w-0.5 h-full bg-gray-200"></div>
                    </div>
                    <div className="pb-4">
                      <p className="text-xs text-muted-foreground">22 Jan</p>
                      <p className="text-sm font-medium">Project Created</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-amber-600"></div>
                      <div className="w-0.5 h-full bg-gray-200"></div>
                    </div>
                    <div className="pb-4">
                      <p className="text-xs text-muted-foreground">25 Jan</p>
                      <p className="text-sm font-medium">Material Reserved</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-pink-600"></div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">30 Jan</p>
                      <p className="text-sm font-medium">First Invoice Generated</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Internal Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Internal Notes
                  </span>
                  <Button size="sm">Add Note</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No internal notes added yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Add manual notes, comments, and updates for internal team communication</p>
                </div>
              </CardContent>
            </Card>

            {/* Risk and Issues Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Risks & Issues
                  </span>
                  <Button size="sm">Add Risk</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No risks or issues identified</p>
                  <p className="text-sm text-muted-foreground mt-1">Track project risks, issues, and mitigation plans</p>
                </div>
              </CardContent>
            </Card>

            {/* Change Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Change Orders
                  </span>
                  <Button size="sm">Add Change Order</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No change orders</p>
                  <p className="text-sm text-muted-foreground mt-1">Track modifications, scope changes, and their impact on budget/timeline</p>
                </div>
              </CardContent>
            </Card>

            {/* Quality Control */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Quality Control
                  </span>
                  <Button size="sm">Add Inspection</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No QC inspections recorded</p>
                  <p className="text-sm text-muted-foreground mt-1">Track quality inspections, test results, and compliance checks</p>
                </div>
              </CardContent>
            </Card>

            {/* Safety Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Safety Compliance
                  </span>
                  <Button size="sm">Add Record</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No safety records</p>
                  <p className="text-sm text-muted-foreground mt-1">Track safety certificates, compliance documents, and incident reports</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones">
            <Suspense fallback={<CardSkeleton />}>
              <MilestoneTracker milestones={project.milestones} />
            </Suspense>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span>Project Team</span>
                  <Button size="sm" className="w-full sm:w-auto">Add Team Member</Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.team.map((member) => (
                    <div key={member.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-right sm:text-left">
                        <p className="text-sm font-medium">{member.workload}% Workload</p>
                        <p className="text-xs text-muted-foreground">
                          Assigned: {new Date(member.assignedDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <Suspense fallback={<CardSkeleton />}>
              <ProjectTimeline activities={activities || []} />
            </Suspense>
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Budget Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Budget</span>
                    <span className="font-bold">₹{project.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Material Cost</span>
                    <span className="font-medium">₹{(project.materialCost || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Procurement Cost</span>
                    <span className="font-medium">₹{(project.procurementCost || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Fabrication Cost</span>
                    <span className="font-medium">₹{(project.fabricationCost || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Installation Cost</span>
                    <span className="font-medium">₹{(project.installationCost || 0).toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="text-sm font-medium">Total Spent</span>
                    <span className="font-bold">
                      ₹{((project.materialCost || 0) + (project.procurementCost || 0) + (project.fabricationCost || 0) + (project.installationCost || 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Profit Margin</span>
                    <span className="font-bold text-green-600">{project.profitMargin}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Progress by Stage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Design</span>
                      <span className="text-sm font-medium">{project.designProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${project.designProgress}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Procurement</span>
                      <span className="text-sm font-medium">{project.procurementProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${project.procurementProgress}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Fabrication</span>
                      <span className="text-sm font-medium">{project.fabricationProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${project.fabricationProgress}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Installation</span>
                      <span className="text-sm font-medium">{project.installationProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-pink-600 h-2 rounded-full" style={{ width: `${project.installationProgress}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Project Tasks</span>
                  <Button size="sm">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tasks assigned yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Create and assign tasks to team members for tracking project progress</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Payment Schedule</span>
                    <Button size="sm">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Add Payment
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No payment schedule defined</p>
                    <p className="text-sm text-muted-foreground mt-1">Create milestone-based payment schedule for this project</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Payment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Contract Value</span>
                    <span className="font-bold">₹{project.value.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Received</span>
                    <span className="font-medium text-green-600">₹0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending</span>
                    <span className="font-medium text-orange-600">₹{project.value.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Payment Progress</span>
                      <span className="font-bold">0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '0%' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab — linked records only; uploads live in Documents module */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Linked Documents</span>
                  <Button size="sm" asChild>
                    <Link href={`${ROUTES.documents}?projectId=${project.id}`}>
                      <FileText className="h-4 w-4 mr-2" />
                      Open Documents Module
                    </Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <Link
                    href={`${ROUTES.documentsEstimates}?projectId=${project.id}`}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-indigo-600" />
                      <span className="text-sm font-medium">Estimates</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Project estimates and costing</p>
                  </Link>
                  <Link
                    href={`${ROUTES.documentsProposals}?projectId=${project.id}`}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="h-5 w-5 text-cyan-600" />
                      <span className="text-sm font-medium">Proposals</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Commercial proposals for this project</p>
                  </Link>
                  <Link
                    href={`${ROUTES.documentsQuotations}?projectId=${project.id}`}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Receipt className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">Quotations</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Final quotations and commitments</p>
                  </Link>
                </div>
                <div className="text-center py-8 border-t pt-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Document management is handled in the Documents module</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create estimates, proposals, quotations, and manage attachments from Documents.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
