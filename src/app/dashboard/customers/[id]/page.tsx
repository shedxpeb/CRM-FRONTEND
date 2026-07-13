'use client';

import { useState, useMemo, useCallback, lazy, Suspense, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { MainLayout } from '@/layouts/MainLayout';
import { DataTable, Column } from '@/components/data-table/DataTable';
import { CustomerActivityTimeline } from '@/features/customers/components/CustomerActivityTimeline';
import { CustomerQuickActions } from '@/features/customers/components/CustomerQuickActions';
import { CustomerHeroCard } from '@/features/customers/components/CustomerHeroCard';
import { CustomerCustomFields } from '@/features/customers/components/CustomerCustomFields';
import { CustomerHealthScore } from '@/features/customers/components/CustomerHealthScore';
import { CustomerSummary } from '@/features/customers/components/CustomerSummary';
import { ClickableKPICard } from '@/features/customers/components/ClickableKPICard';
import { CustomerRevenueTrendChart } from '@/features/customers/components/CustomerRevenueTrendChart';
import { CustomerProjectTrendChart } from '@/features/customers/components/CustomerProjectTrendChart';
import { CustomerActivityTrendChart } from '@/features/customers/components/CustomerActivityTrendChart';
import { CustomerQuotationTrendChart } from '@/features/customers/components/CustomerQuotationTrendChart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Customer, CustomerStatus } from '@/features/customers';
import { getStatusVariant } from '@/features/customers/constants';
import { useCustomer, useCustomerActivities, useCustomerConfiguration } from '@/features/customers/hooks/useCustomers';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useQuotations } from '@/features/documents/hooks';
import { useLeads } from '@/features/leads/hooks/useLeads';
import { documentsApi } from '@/features/documents/services/documentsApi';
import { EstimateBuilder } from '@/features/documents/components/EstimateBuilder';
import { ProposalBuilder } from '@/features/documents/components/ProposalBuilder';
import { QuotationBuilder } from '@/features/documents/components/QuotationBuilder';
import { useEstimates } from '@/features/documents/hooks/useEstimate';
import { useProposals } from '@/features/documents/hooks/useProposal';
import { useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '@/core/routes';
import { cn } from '@/lib/utils';
import { componentTextSizes } from '@/lib/design-system';

// Lazy load heavy components
const CommunicationCenter = lazy(() => import('@/features/customers/components/CommunicationCenter').then(m => ({ default: m.CommunicationCenter })));
import {
  ArrowLeft,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  User,
  Hash,
  CreditCard,
  DollarSign,
  FolderKanban,
  CheckCircle,
  FileText,
  MessageSquare,
  Zap,
} from 'lucide-react';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = params.id as string;
  const queryClient = useQueryClient();

  // React Query hooks - single source of truth
  const { data: customerResponse, isLoading, error } = useCustomer(customerId);
  const customer = customerResponse?.data ?? null;
  const customerConfig = useCustomerConfiguration();
  const { data: activitiesResponse } = useCustomerActivities(customerId);
  const activities = activitiesResponse?.data;
  const { data: projectsData } = useProjects({ page: 1, pageSize: 100, customer: customerId });
  const { data: quotationsData } = useQuotations({ customerId });
  const { data: leadsData } = useLeads({ page: 1, pageSize: 1000 });
  const { createEstimate } = useEstimates();
  const { createProposal } = useProposals();
  const { createQuotation } = useQuotations();

  // UI state only
  const [activeTab, setActiveTab] = useState('overview');
  const [timelineFilter, setTimelineFilter] = useState('all');
  const [documents, setDocuments] = useState<any[]>([]);
  
  // Dialog states for inline document creation
  const [estimateDialogOpen, setEstimateDialogOpen] = useState(false);
  const [proposalDialogOpen, setProposalDialogOpen] = useState(false);
  const [quotationDialogOpen, setQuotationDialogOpen] = useState(false);

  // Sticky header state
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // Extract projects from data
  const projects = projectsData?.data?.rows || [];
  const leads = leadsData?.data?.rows || [];

  // Find originating lead
  const originatingLead = customer?.leadId ? leads.find((l: any) => l.id === customer.leadId) : null;

  // Extract documents from quotations data and sync with state
  useEffect(() => {
    if (quotationsData) {
      setDocuments(quotationsData);
    }
  }, [quotationsData]);

  // Sticky header detection using scroll on main element
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

  // Auto-open dialogs from query params
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create-estimate') {
      setEstimateDialogOpen(true);
    } else if (action === 'create-proposal') {
      setProposalDialogOpen(true);
    } else if (action === 'create-quotation') {
      setQuotationDialogOpen(true);
    }
  }, [searchParams]);

  const handleEditDocument = useCallback((docId: string) => {
    router.push(`/dashboard/documents/quotations/${docId}`);
  }, [router]);

  const handleDeleteDocument = useCallback(async (docId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await documentsApi.deleteDocument(docId);
        setDocuments(prev => prev.filter(doc => doc.id !== docId));
      } catch (error) {
        alert('Failed to delete document. Please try again.');
      }
    }
  }, []);

  const handleCreateProject = useCallback(() => {
    // Navigate to projects page with customer pre-selected
    router.push(`/dashboard/projects?customerId=${customerId}&create=true`);
  }, [router, customerId]);

  const handleCreateDocument = useCallback(() => {
    // Navigate to documents page with customer pre-selected
    router.push(`/dashboard/documents?customerId=${customerId}&create=true`);
  }, [router, customerId]);

  const handleTimelineFilter = useCallback((filter: string) => {
    setTimelineFilter(filter);
  }, []);

  const handleProjectRowClick = useCallback((row: any) => {
    router.push(`/dashboard/projects/${row.id}`);
  }, [router]);

  // Document save handlers
  const handleEstimateSave = useCallback(async (data: any) => {
    try {
      await createEstimate(data);
      setEstimateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      queryClient.invalidateQueries({ queryKey: ['customer', customerId, 'activities'] });
    } catch (error) {
      alert('Failed to create estimate. Please try again.');
    }
  }, [createEstimate, customerId, queryClient]);

  const handleProposalSave = useCallback(async (data: any) => {
    try {
      await createProposal(data);
      setProposalDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      queryClient.invalidateQueries({ queryKey: ['customer', customerId, 'activities'] });
    } catch (error) {
      alert('Failed to create proposal. Please try again.');
    }
  }, [createProposal, customerId, queryClient]);

  const handleQuotationSave = useCallback(async (data: any) => {
    try {
      await createQuotation(data);
      setQuotationDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      queryClient.invalidateQueries({ queryKey: ['customer', customerId, 'activities'] });
    } catch (error) {
      alert('Failed to create quotation. Please try again.');
    }
  }, [createQuotation, customerId, queryClient]);

  // Communications will come from their respective module hooks
  const communications: any[] = [];

  // Memoized computed values
  const lastActivity = useMemo(() => {
    return activities && activities.length > 0
      ? new Date(activities[0].performedAt)
      : undefined;
  }, [activities]);

  const handleExportReport = useCallback(() => {
    if (!customer) return;

    // Generate CSV content
    const csvContent = [
      ['Customer Report'],
      ['Generated:', new Date().toLocaleString()],
      [],
      ['Customer Information'],
      ['Name', customer.customerName],
      ['Company', customer.companyName],
      ['Email', customer.email || 'N/A'],
      ['Mobile', customer.mobile],
      ['Status', customer.status],
      ['Industry', customer.industry],
      ['Business Type', customer.businessType],
      [],
      ['Financial Summary'],
      ['Total Revenue', `₹${customer.totalRevenue.toLocaleString()}`],
      ['Active Projects', customer.activeProjects],
      ['Completed Projects', customer.completedProjects],
      ['Pending Quotations', customer.pendingQuotations],
      [],
      ['Address'],
      ['Address Line', customer.address],
      ['City', customer.city],
      ['State', customer.state],
      ['Country', customer.country],
      ['Pincode', customer.pincode],
      [],
      ['Additional Information'],
      ['Source', customer.source],
      ['Customer Since', customer.customerSince ? new Date(customer.customerSince).toLocaleDateString() : 'N/A'],
      ['Last Activity', lastActivity ? lastActivity.toLocaleDateString() : 'N/A'],
      ['Notes', customer.notes || 'N/A'],
    ]
      .map(row => row.join(','))
      .join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `customer-report-${customer.customerName.replace(/\s+/g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [customer, lastActivity]);

  const healthScore = useMemo(() => {
    let score = 50;
    if (customer && customer.totalRevenue > 1000000) score += 15;
    if (customer && customer.activeProjects > 0) score += 10;
    if (customer && customer.completedProjects > 0) score += 10;
    if (customer && customer.status === 'Active') score += 10;
    if (customer && customer.pendingQuotations === 0) score += 5;
    return Math.min(score, 100);
  }, [customer]);

  // Filter activities based on timeline filter
  const filteredActivities = useMemo(() => {
    if (!activities || activities.length === 0) return [];
    if (timelineFilter === 'all') return activities;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return activities.filter((activity: any) => {
      const activityDate = new Date(activity.performedAt);
      switch (timelineFilter) {
        case 'today':
          return activityDate >= today;
        case 'this_week':
          return activityDate >= thisWeek;
        case 'this_month':
          return activityDate >= thisMonth;
        default:
          return true;
      }
    });
  }, [activities, timelineFilter]);

  const detailKPIs = useMemo(() => {
    if (!customer) return [];
    return [
      {
        title: 'Total Revenue',
        value: `₹${(customer.totalRevenue / 100000).toFixed(1)}L`,
        change: 12.5,
        icon: <DollarSign className="h-5 w-5 text-green-600" />,
        color: 'text-green-600',
        onClick: () => setActiveTab('analytics'),
      },
      {
        title: 'Active Projects',
        value: String(customer.activeProjects),
        change: 0,
        icon: <FolderKanban className="h-5 w-5 text-blue-600" />,
        color: 'text-blue-600',
        onClick: () => setActiveTab('projects'),
      },
      {
        title: 'Completed',
        value: String(customer.completedProjects),
        change: 8.3,
        icon: <CheckCircle className="h-5 w-5 text-emerald-600" />,
        color: 'text-emerald-600',
        onClick: () => setActiveTab('projects'),
      },
      {
        title: 'Pending Quotes',
        value: String(customer.pendingQuotations),
        change: -5,
        icon: <FileText className="h-5 w-5 text-amber-600" />,
        color: 'text-amber-600',
        onClick: () => setActiveTab('documents'),
      },
    ];
  }, [customer]);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  const handleBack = useCallback(() => {
    router.push(ROUTES.customers);
  }, [router]);

  const tabs = [
    { id: 'overview', label: 'Overview', count: null },
    { id: 'documents', label: 'Documents', count: documents.length },
    { id: 'projects', label: 'Projects', count: projects.length },
    { id: 'timeline', label: 'Timeline', count: filteredActivities.length },
    { id: 'communication', label: 'Communication', count: communications.length },
  ];

  const handleTabKeyDown = useCallback((e: React.KeyboardEvent, tabId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabChange(tabId);
    }
  }, [handleTabChange]);

  // Project table columns
  const projectColumns: Column<any>[] = [
    { key: 'projectId', label: 'Project ID', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'name', label: 'Project Name', sortable: true },
    { key: 'type', label: 'Type', filterable: true },
    { key: 'status', label: 'Status', sortable: true, filterable: true, render: (v) => <Badge variant={v === 'Completed' ? 'success' : v === 'In Progress' ? 'info' : 'warning'}>{v}</Badge> },
    { key: 'value', label: 'Value', sortable: true, render: (v) => <span className="text-xs font-medium">₹{(v / 100000).toFixed(1)}L</span> },
    { key: 'startDate', label: 'Start Date', sortable: true, render: (v) => <span className="text-xs">{v}</span> },
  ];

  // Document table columns
  const documentColumns: Column<any>[] = [
    { key: 'documentType', label: 'Type', filterable: true, render: (v) => <Badge variant="secondary">{v || 'Quotation'}</Badge> },
    { key: 'quotationNumber', label: 'Number', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'createdAt', label: 'Date', sortable: true, render: (v) => <span className="text-xs">{v ? new Date(v).toLocaleDateString() : '-'}</span> },
    { key: 'totalAmount', label: 'Amount', sortable: true, render: (v) => <span className="text-xs font-medium">₹{(v / 100000).toFixed(1)}L</span> },
    { key: 'status', label: 'Status', filterable: true, render: (v) => <Badge variant={v === 'Accepted' ? 'success' : v === 'Sent' ? 'info' : v === 'Draft' ? 'secondary' : 'warning'}>{v}</Badge> },
    { key: 'actions', label: 'Actions', render: (_: any, row: any) => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => handleEditDocument(row.id)}>
          Edit
        </Button>
        <Button size="sm" variant="destructive" onClick={() => handleDeleteDocument(row.id)}>
          Delete
        </Button>
      </div>
    )},
  ];

  // Communication table columns
  const communicationColumns: Column<any>[] = [
    { key: 'userName', label: 'User' },
    { key: 'action', label: 'Activity' },
    { key: 'module', label: 'Module', render: (v) => <Badge variant="secondary" className="text-[10px]">{v}</Badge> },
    { key: 'time', label: 'When', render: (v) => <span className="text-xs text-muted-foreground">{v}</span> },
  ];

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Loading customer details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error or not found state
  if (error || !customer) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <p className="text-sm text-destructive">Failed to load customer details</p>
            <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.customers)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Customers
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header - contained within content area */}
        <div
          ref={headerRef}
          className={cn(
            'bg-background transition-all duration-300',
            'sticky top-16 z-40',
            isSticky && 'shadow-md border-b'
          )}
        >
          <div className="px-6 py-4">
            <div className={cn("flex items-center justify-between transition-all duration-300", !isSticky && "mb-4")}>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2 flex-shrink-0">
                  <ArrowLeft className="h-4 w-4" />
                  <span className={cn("transition-all duration-300", isSticky && "hidden")}>Back to Customers</span>
                  <span className={cn("transition-all duration-300", !isSticky && "hidden")}>Back</span>
                </Button>
                <div className="h-4 w-px bg-border flex-shrink-0" />
                <Badge variant={getStatusVariant(customer.status as CustomerStatus)} className="flex-shrink-0">
                  {customer.status}
                </Badge>
                {isSticky && (
                  <div className="flex items-center gap-2 min-w-0 flex-1 animate-in fade-in slide-in-from-left duration-300">
                    <CustomerHeroCard
                      customer={customer}
                      metrics={{
                        totalRevenue: customer.totalRevenue,
                        activeProjects: customer.activeProjects,
                        completedProjects: customer.completedProjects,
                        pendingQuotations: customer.pendingQuotations,
                      }}
                      compact
                      status={customer.status}
                    />
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                <CustomerQuickActions
                  onCreateEstimate={() => setEstimateDialogOpen(true)}
                  onCreateProposal={() => setProposalDialogOpen(true)}
                  onCreateQuotation={() => setQuotationDialogOpen(true)}
                />
              </div>
            </div>
            <div className={cn("transition-all duration-300", isSticky && "hidden")}>
              <CustomerHeroCard
                customer={customer}
                metrics={{
                  totalRevenue: customer.totalRevenue,
                  activeProjects: customer.activeProjects,
                  completedProjects: customer.completedProjects,
                  pendingQuotations: customer.pendingQuotations,
                }}
              />
            </div>
          </div>
        </div>

        {/* Add spacer when header is sticky */}
        {isSticky && <div className="h-20" />}

        {/* Tabs with Counts */}
        <div className="border-b" role="tablist" aria-label="Customer details tabs">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleTabKeyDown(e, tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5">
                    {tab.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4" role="tabpanel" id="panel-overview" aria-labelledby="tab-overview">
            {/* Recent Activity Timeline (Compact) */}
            {filteredActivities && filteredActivities.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('timeline')}
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CustomerActivityTimeline
                    activities={filteredActivities.slice(0, 5)}
                    onFilterChange={handleTimelineFilter}
                    currentFilter={timelineFilter}
                  />
                </CardContent>
              </Card>
            )}

            {/* Business Details Grid (Compact) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className={cn(componentTextSizes.cardHeader.title, 'font-medium')}>Contact Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-start gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Primary</p>
                      <p className="font-medium">{customer.mobile}</p>
                      {customer.alternateMobile && (
                        <p className="text-xs text-muted-foreground mt-1">Alt: {customer.alternateMobile}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium break-all">{customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="font-medium">{customer.address}</p>
                      <p className="text-xs text-muted-foreground">
                        {customer.city}, {customer.state} {customer.pincode}
                      </p>
                    </div>
                  </div>
                  {customer.website && (
                    <div className="flex items-start gap-3 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Website</p>
                        <a
                          href={customer.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {customer.website}
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Business Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className={cn(componentTextSizes.cardHeader.title, 'font-medium')}>Business Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Industry</span>
                    <span className="font-medium">{customer.industry}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Business Type</span>
                    <span className="font-medium">{customer.businessType}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Lead Source</span>
                    <span className="font-medium">{customer.source}</span>
                  </div>
                  {customer.gstNumber && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">GST Number</span>
                      <span className="font-mono text-xs font-medium">{customer.gstNumber}</span>
                    </div>
                  )}
                  {customer.panNumber && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">PAN Number</span>
                      <span className="font-mono text-xs font-medium">{customer.panNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Customer Since</span>
                    <span className="font-medium">{customer.customerSince.toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {customerConfig.customFields.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className={cn(componentTextSizes.cardHeader.title, 'font-medium')}>Custom Fields</CardTitle>
                </CardHeader>
                <CardContent>
                  <CustomerCustomFields
                    mode="view"
                    fields={customerConfig.customFields}
                    values={customer.customFields ?? {}}
                  />
                </CardContent>
              </Card>
            )}

            {/* Originating Lead (Compact) */}
            {originatingLead && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className={cn(componentTextSizes.cardHeader.title, 'font-medium')}>Originating Lead</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/leads/${originatingLead.id}`)}
                    >
                      View Lead
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Lead ID</p>
                      <p className="font-mono font-medium">{originatingLead.leadNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Location</p>
                      <p className="font-medium">{originatingLead.city}, {originatingLead.state}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Created</p>
                      <p className="font-medium">
                        {originatingLead.createdAt ? new Date(originatingLead.createdAt).toLocaleDateString() : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <Badge variant={originatingLead.status === 'Converted' ? 'success' : 'secondary'}>
                        {originatingLead.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {customer.notes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className={cn(componentTextSizes.cardHeader.title, 'font-medium')}>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{customer.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-4" role="tabpanel" id="panel-projects" aria-labelledby="tab-projects">
            <div className="flex items-center justify-between">
              <h3 className={cn(componentTextSizes.cardHeader.title, 'font-semibold')}>Linked Projects</h3>
              <Button size="sm" onClick={handleCreateProject}>
                <FolderKanban className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </div>

            {/* Project Summary Cards (Compact) */}
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Active</p>
                      <p className="text-xl font-bold text-blue-600">
                        {projects.filter((p: any) => p.status === 'Design' || p.status === 'BOQ' || p.status === 'Procurement' || p.status === 'Fabrication' || p.status === 'Installation').length}
                      </p>
                    </div>
                    <FolderKanban className="h-6 w-6 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Completed</p>
                      <p className="text-xl font-bold text-green-600">
                        {projects.filter((p: any) => p.status === 'Completion' || p.status === 'After Sales').length}
                      </p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">On Hold</p>
                      <p className="text-xl font-bold text-amber-600">
                        {projects.filter((p: any) => p.status === 'On Hold').length}
                      </p>
                    </div>
                    <Zap className="h-6 w-6 text-amber-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Projects Table */}
            <Card>
              <CardContent className="p-0">
                <DataTable 
                  columns={projectColumns} 
                  data={projects} 
                  emptyMessage="No projects linked to this customer yet"
                  onRowClick={handleProjectRowClick}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4" role="tabpanel" id="panel-documents" aria-labelledby="tab-documents">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Documents</h3>
              <Button size="sm" onClick={handleCreateDocument}>
                <FileText className="h-4 w-4 mr-2" />
                Create Document
              </Button>
            </div>

            {/* Document Summary Cards (Compact) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-xl font-bold">{documents.length}</p>
                    </div>
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Draft</p>
                      <p className="text-xl font-bold text-gray-600">
                        {documents.filter((d: any) => d.status === 'Draft').length}
                      </p>
                    </div>
                    <FileText className="h-6 w-6 text-gray-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Sent</p>
                      <p className="text-xl font-bold text-blue-600">
                        {documents.filter((d: any) => d.status === 'Sent').length}
                      </p>
                    </div>
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Accepted</p>
                      <p className="text-xl font-bold text-green-600">
                        {documents.filter((d: any) => d.status === 'Accepted').length}
                      </p>
                    </div>
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Documents Table */}
            <Card>
              <CardContent className="p-0">
                <DataTable 
                  columns={documentColumns} 
                  data={documents} 
                  emptyMessage="No documents for this customer yet"
                  onRowClick={(row) => router.push(`/dashboard/documents/quotations/${(row as any).id}`)}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'communication' && (
          <div className="space-y-4" role="tabpanel" id="panel-communication" aria-labelledby="tab-communication">
            <Suspense fallback={<div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Loading communication center...</div>}>
              <CommunicationCenter customerId={customerId} customerName={customer.customerName} />
            </Suspense>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-4" role="tabpanel" id="panel-timeline" aria-labelledby="tab-timeline">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold">Activity Timeline</h3>
              <div className="flex gap-2">
                <Button size="sm" variant={timelineFilter === 'all' ? 'default' : 'outline'} onClick={() => handleTimelineFilter('all')}>
                  All
                </Button>
                <Button size="sm" variant={timelineFilter === 'today' ? 'default' : 'outline'} onClick={() => handleTimelineFilter('today')}>
                  Today
                </Button>
                <Button size="sm" variant={timelineFilter === 'this_week' ? 'default' : 'outline'} onClick={() => handleTimelineFilter('this_week')}>
                  This Week
                </Button>
              </div>
            </div>
            <Card>
              <CardContent className="p-4">
                <CustomerActivityTimeline
                  activities={filteredActivities ?? []}
                  onFilterChange={handleTimelineFilter}
                  currentFilter={timelineFilter}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6" role="tabpanel" id="panel-analytics" aria-labelledby="tab-analytics">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Customer Analytics</h3>
              <Button size="sm" variant="outline" onClick={handleExportReport}>
                Export Report
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CustomerRevenueTrendChart
                data={[
                  { month: 'Jan', revenue: 150000 },
                  { month: 'Feb', revenue: 200000 },
                  { month: 'Mar', revenue: 180000 },
                  { month: 'Apr', revenue: 250000 },
                  { month: 'May', revenue: 300000 },
                  { month: 'Jun', revenue: 280000 },
                ]}
              />
              <CustomerProjectTrendChart
                data={[
                  { month: 'Jan', projects: 2, completed: 1 },
                  { month: 'Feb', projects: 3, completed: 2 },
                  { month: 'Mar', projects: 1, completed: 1 },
                  { month: 'Apr', projects: 4, completed: 2 },
                  { month: 'May', projects: 2, completed: 1 },
                  { month: 'Jun', projects: 3, completed: 2 },
                ]}
              />
              <CustomerActivityTrendChart
                data={[
                  { month: 'Jan', activities: 15 },
                  { month: 'Feb', activities: 22 },
                  { month: 'Mar', activities: 18 },
                  { month: 'Apr', activities: 25 },
                  { month: 'May', activities: 30 },
                  { month: 'Jun', activities: 28 },
                ]}
              />
              <CustomerQuotationTrendChart
                data={[
                  { name: 'Draft', value: 3 },
                  { name: 'Sent', value: 5 },
                  { name: 'Accepted', value: 4 },
                  { name: 'Rejected', value: 1 },
                  { name: 'Expired', value: 2 },
                ]}
              />
            </div>
          </div>
        )}
      </div>

      {/* Document Creation Dialogs */}
      <Dialog open={estimateDialogOpen} onOpenChange={setEstimateDialogOpen} modal={false}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Estimate for {customer.companyName}</DialogTitle>
          </DialogHeader>
          <EstimateBuilder
            lead={{
              id: customer.id,
              leadId: customer.id,
              customerId: customer.id,
              customerName: customer.customerName,
              companyName: customer.companyName,
            }}
            onSave={handleEstimateSave}
            onCancel={() => setEstimateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={proposalDialogOpen} onOpenChange={setProposalDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Proposal for {customer.companyName}</DialogTitle>
          </DialogHeader>
          <ProposalBuilder
            estimate={null}
            onSave={handleProposalSave}
            onCancel={() => setProposalDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={quotationDialogOpen} onOpenChange={setQuotationDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Quotation for {customer.companyName}</DialogTitle>
          </DialogHeader>
          <QuotationBuilder
            proposal={null}
            onSave={handleQuotationSave}
            onCancel={() => setQuotationDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
