'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MainLayout } from '@/layouts/MainLayout';
import { DataTable, Column } from '@/components/data-table/DataTable';
import { KPICard } from '@/components/dashboard/KPICard';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { FilterConfig } from '@/components/layout/FilterBar';
import { getProjectCustomFieldValue } from '@/features/projects/components/ProjectCustomFields';

// Lazy load row actions to reduce initial bundle size
const ProjectRowActions = dynamic(
  () => import('@/features/projects/components/ProjectRowActions').then((mod) => ({ default: mod.ProjectRowActions })),
  { loading: () => <div className="p-2">Loading...</div> }
);
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateProjectInput } from '@/features/projects/validations';
import { Project, ProjectPriority, ProjectStage, ProjectStatus, CreateProjectDto, UpdateProjectDto, ProjectCustomFieldValues } from '@/features/projects/types';
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useProjectConfiguration,
} from '@/features/projects/hooks/useProjects';
import {
  getProjectStatusVariant,
  getPriorityVariant,
  getHealthStatusVariant,
} from '@/features/projects/constants';
import { ROUTES } from '@/core/routes';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { Plus, Download, Building2, CheckCircle, Clock, DollarSign } from 'lucide-react';

const ProjectForm = dynamic(
  () => import('@/features/projects/components/ProjectForm').then((mod) => ({ default: mod.ProjectForm })),
  { loading: () => <div className="p-8 text-center">Loading form...</div> }
);

function projectToFormInitial(project: Project) {
  const toDateInput = (d?: Date | string) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toISOString().split('T')[0];
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

export default function ProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId');
  const shouldCreate = searchParams.get('create') === 'true';
  const projectConfig = useProjectConfiguration();

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [stageFilter, setStageFilter] = useState<ProjectStage | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ProjectPriority | 'all'>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');

  const { data: allProjectsResponse, isLoading, error } = useProjects({ page: 1, pageSize: 1000 });
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [createInitialData, setCreateInitialData] = useState<any>(undefined);

  useEffect(() => {
    if (shouldCreate && customerId) {
      setIsCreateDialogOpen(true);
    }
  }, [shouldCreate, customerId]);

  useEffect(() => {
    const leadDataStr = sessionStorage.getItem('convertFromLead');
    if (leadDataStr) {
      try {
        const lead = JSON.parse(leadDataStr);
        const initial = {
          leadId: lead.id,
          customerId: lead.customerId,
          projectName: lead.projectName || lead.projectTitle || '',
          projectType: lead.projectType || 'Industrial Shed',
          structureType: lead.structureType || 'PEB Building',
          width: lead.width,
          length: lead.length,
          height: lead.height,
          baySpacing: lead.baySpacing,
          roofType: lead.roofType || 'Standing Seam',
          craneSystem: lead.craneSystem || (lead.craneRequired ? (lead.craneCapacity ? `${lead.craneCapacity} tons` : 'Single Girder') : 'None'),
          mezzanine: lead.mezzanine || false,
          wallType: lead.wallType || 'Single Skin',
          insulation: lead.insulation ?? lead.insulationRequired ?? false,
          location: lead.location || lead.siteAddress || lead.addressLine1 || lead.addressLine2 || '',
          city: lead.city || '',
          state: lead.state || '',
          pincode: lead.pincode || '',
          notes: lead.notes,
          customFields: lead.customFields,
        };
        setCreateInitialData(initial);
        setIsCreateDialogOpen(true);
        sessionStorage.removeItem('convertFromLead');
      } catch (err) {
        // Failed to parse lead data
      }
    }
  }, []);

  useEffect(() => {
    const quotationData = sessionStorage.getItem('convertFromQuotation');
    if (quotationData) {
      try {
        sessionStorage.setItem('quotationForProject', quotationData);
        setIsCreateDialogOpen(true);
        sessionStorage.removeItem('convertFromQuotation');
      } catch (err) {
        // Failed to parse quotation data
      }
    }
  }, []);

  const projectFilterOptions = useMemo(() => {
    const cities = new Set<string>();
    for (const project of allProjectsResponse?.data?.rows ?? []) {
      if (project.city) cities.add(project.city);
    }
    return { cities: [...cities].sort() };
  }, [allProjectsResponse?.data?.rows]);

  const filteredProjects = useMemo(() => {
    if (!allProjectsResponse?.data?.rows) return [];
    const q = debouncedSearch.toLowerCase();
    return allProjectsResponse.data.rows.filter((project) => {
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesStage = stageFilter === 'all' || project.stage === stageFilter;
      const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
      const matchesCity = cityFilter === 'all' || project.city === cityFilter;
      const matchesHealth = healthFilter === 'all' || project.healthStatus === healthFilter;
      const matchesSearch =
        !debouncedSearch ||
        project.projectName.toLowerCase().includes(q) ||
        project.projectCode.toLowerCase().includes(q) ||
        project.customerName.toLowerCase().includes(q) ||
        project.city?.toLowerCase().includes(q) ||
        project.projectManager.toLowerCase().includes(q) ||
        project.projectId.toString().includes(debouncedSearch);
      return matchesStatus && matchesStage && matchesPriority && matchesCity && matchesHealth && matchesSearch;
    });
  }, [
    allProjectsResponse?.data?.rows,
    debouncedSearch,
    statusFilter,
    stageFilter,
    priorityFilter,
    cityFilter,
    healthFilter,
  ]);

  const projects = filteredProjects;

  const selectedProject = useMemo(
    () =>
      selectedProjectId
        ? allProjectsResponse?.data?.rows?.find((p) => p.id === selectedProjectId) ?? null
        : null,
    [allProjectsResponse?.data?.rows, selectedProjectId]
  );

  // Move activeStatuses outside to prevent recreation on every render
  const ACTIVE_STATUSES = new Set([
    'Approved',
    'Design',
    'BOQ',
    'Procurement',
    'Fabrication',
    'Dispatch',
    'Installation',
  ]);

  // Combine stats and KPI data computation to reduce re-renders
  const { filteredStats, kpiData } = useMemo(() => {
    const now = new Date();
    let total = 0;
    let active = 0;
    let delayed = 0;
    let totalRevenue = 0;
    for (const p of projects) {
      total++;
      if (ACTIVE_STATUSES.has(p.status)) active++;
      if (p.endDate && new Date(p.endDate) < now && p.status !== 'Completion' && p.status !== 'Cancelled') {
        delayed++;
      }
      totalRevenue += p.value || 0;
    }
    const stats = { total, active, delayed, totalRevenue };
    
    const kpi = [
      {
        title: 'Total Projects',
        value: String(stats.total),
        change: 0,
        icon: <Building2 className="h-5 w-5 text-blue-600" />,
        color: 'text-blue-600',
      },
      {
        title: 'Active',
        value: String(stats.active),
        change: 0,
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        color: 'text-green-600',
      },
      {
        title: 'Delayed',
        value: String(stats.delayed),
        change: 0,
        icon: <Clock className="h-5 w-5 text-amber-600" />,
        color: 'text-amber-600',
      },
      {
        title: 'Revenue',
        value: `₹${(stats.totalRevenue / 1000000).toFixed(1)}M`,
        change: 0,
        icon: <DollarSign className="h-5 w-5 text-emerald-600" />,
        color: 'text-emerald-600',
      },
    ];
    
    return { filteredStats: stats, kpiData: kpi };
  }, [projects]);

  const tableFilterKey = useMemo(
    () => [debouncedSearch, statusFilter, stageFilter, priorityFilter, cityFilter, healthFilter].join('|'),
    [debouncedSearch, statusFilter, stageFilter, priorityFilter, cityFilter, healthFilter]
  );

  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        key: 'status',
        label: 'Status',
        value: statusFilter,
        onChange: (value: string) => setStatusFilter(value as ProjectStatus | 'all'),
        options: [{ value: 'all', label: 'All Status' }, ...projectConfig.statuses.map((s) => ({ value: s, label: s }))],
      },
      {
        key: 'stage',
        label: 'Stage',
        value: stageFilter,
        onChange: (value: string) => setStageFilter(value as ProjectStage | 'all'),
        options: [{ value: 'all', label: 'All Stages' }, ...projectConfig.stages.map((s) => ({ value: s, label: s }))],
      },
      {
        key: 'priority',
        label: 'Priority',
        value: priorityFilter,
        onChange: (value: string) => setPriorityFilter(value as ProjectPriority | 'all'),
        options: [
          { value: 'all', label: 'All Priorities' },
          ...projectConfig.priorities.map((p) => ({ value: p, label: p })),
        ],
      },
      {
        key: 'city',
        label: 'City',
        value: cityFilter,
        onChange: setCityFilter,
        options: [
          { value: 'all', label: 'All Cities' },
          ...projectFilterOptions.cities.map((city) => ({ value: city, label: city })),
        ],
      },
      {
        key: 'health',
        label: 'Health',
        value: healthFilter,
        onChange: setHealthFilter,
        options: [
          { value: 'all', label: 'All Health' },
          ...projectConfig.healthIndicators.map((h) => ({ value: h, label: h })),
        ],
      },
    ],
    [statusFilter, stageFilter, priorityFilter, cityFilter, healthFilter, projectFilterOptions, projectConfig]
  );

  const handleClearFilters = useCallback(() => {
    setStatusFilter('all');
    setStageFilter('all');
    setPriorityFilter('all');
    setCityFilter('all');
    setHealthFilter('all');
    setSearchQuery('');
  }, []);

  const baseColumns: Column<Project>[] = useMemo(
    () => [
      {
        key: 'projectCode',
        label: 'Code',
        sortable: true,
        className: 'w-[100px]',
        render: (value) => <span className="font-mono text-xs">{value}</span>,
      },
      {
        key: 'projectName',
        label: 'Project',
        sortable: true,
        className: 'min-w-[140px] max-w-[200px]',
        render: (_, row) => (
          <div className="min-w-0">
            <p className="font-medium text-xs truncate">{row.projectName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{row.customerName}</p>
          </div>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (value) => (
          <Badge variant={getProjectStatusVariant(value as string)} className="text-[10px]">
            {value}
          </Badge>
        ),
      },
      {
        key: 'stage',
        label: 'Stage',
        sortable: true,
        className: 'hidden md:table-cell',
        headerClassName: 'hidden md:table-cell',
        render: (value) => (
          <Badge variant="outline" className="text-[10px]">
            {value}
          </Badge>
        ),
      },
      {
        key: 'priority',
        label: 'Priority',
        sortable: true,
        className: 'hidden lg:table-cell',
        headerClassName: 'hidden lg:table-cell',
        render: (value) => (
          <Badge variant={getPriorityVariant(value as string)} className="text-[10px]">
            {value}
          </Badge>
        ),
      },
      {
        key: 'progress',
        label: 'Progress',
        sortable: true,
        className: 'hidden sm:table-cell min-w-[100px]',
        headerClassName: 'hidden sm:table-cell',
        render: (value) => (
          <div className="flex items-center gap-2">
            <div className="w-12 h-1.5 bg-card-hover rounded-full overflow-hidden">
              <div className="h-full bg-blue-600" style={{ width: `${Number(value)}%` }} />
            </div>
            <span className="text-[11px]">{Number(value)}%</span>
          </div>
        ),
      },
      {
        key: 'projectManager',
        label: 'Manager',
        sortable: true,
        className: 'hidden xl:table-cell',
        headerClassName: 'hidden xl:table-cell',
        render: (value) => <span className="text-xs truncate block">{value}</span>,
      },
      {
        key: 'city',
        label: 'City',
        sortable: true,
        className: 'hidden lg:table-cell',
        headerClassName: 'hidden lg:table-cell',
      },
      {
        key: 'value',
        label: 'Value',
        sortable: true,
        className: 'hidden xl:table-cell',
        headerClassName: 'hidden xl:table-cell',
        render: (value) => (
          <span className="text-xs font-medium">₹{(Number(value) / 100000).toFixed(1)}L</span>
        ),
      },
      {
        key: 'healthStatus',
        label: 'Health',
        sortable: true,
        className: 'hidden 2xl:table-cell',
        headerClassName: 'hidden 2xl:table-cell',
        render: (value) => (
          <Badge variant={getHealthStatusVariant(value as string)} className="text-[10px]">
            {value}
          </Badge>
        ),
      },
    ],
    []
  );

  const settingsCustomColumnDefs = useMemo(
    () =>
      projectConfig.customFields.map((field) => ({
        key: field.key as keyof Project,
        label: field.label,
        sortable: true,
        className: 'min-w-[100px] max-w-[130px] hidden 2xl:table-cell',
        headerClassName: 'hidden 2xl:table-cell',
        render: (_: unknown, row: Project) => (
          <span className="text-xs truncate block">
            {getProjectCustomFieldValue(row, field.key)?.toString() ?? '-'}
          </span>
        ),
      })),
    [projectConfig.customFields]
  );

  const columns = useMemo(
    () => [...baseColumns, ...settingsCustomColumnDefs],
    [baseColumns, settingsCustomColumnDefs]
  );

  const handleCreate = useCallback(
    (data: Partial<CreateProjectInput> & { customFields?: ProjectCustomFieldValues }) => {
      createMutation.mutate(data as unknown as CreateProjectDto, {
        onSuccess: () => setIsCreateDialogOpen(false),
      });
    },
    [createMutation]
  );

  const handleEdit = useCallback(
    (data: Partial<CreateProjectInput> & { customFields?: ProjectCustomFieldValues }) => {
      if (!selectedProject) return;
      updateMutation.mutate(
        { id: selectedProject.id, data: data as unknown as UpdateProjectDto },
        {
          onSuccess: () => {
            setIsEditDialogOpen(false);
            setSelectedProjectId(null);
          },
        }
      );
    },
    [selectedProject, updateMutation]
  );

  const handleDelete = useCallback(
    (project: Project) => {
      if (confirm(`Are you sure you want to delete project "${project.projectName}"?`)) {
        deleteMutation.mutate(project.id);
      }
    },
    [deleteMutation]
  );

  const handleRowClick = useCallback((project: Project) => {
    router.push(ROUTES.projectsDetail(project.id));
  }, [router]);

  const handleViewDetails = useCallback(
    (project: Project) => {
      router.push(ROUTES.projectsDetail(project.id));
    },
    [router]
  );

  const handleEditFromRow = useCallback((project: Project) => {
    setSelectedProjectId(project.id);
    setIsEditDialogOpen(true);
  }, []);

  const handleExport = useCallback(() => {
    const headers = [
      'Project Code',
      'Project Name',
      'Customer',
      'Status',
      'Stage',
      'Priority',
      'Progress',
      'Manager',
      'City',
      'Value',
      'Health',
    ];
    const csvContent = [
      headers.join(','),
      ...projects.map((p) =>
        [
          p.projectCode,
          `"${p.projectName.replace(/"/g, '""')}"`,
          `"${p.customerName.replace(/"/g, '""')}"`,
          p.status,
          p.stage,
          p.priority,
          p.progress,
          `"${p.projectManager}"`,
          p.city,
          p.value,
          p.healthStatus,
        ].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `projects_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [projects]);

  if (isLoading && !allProjectsResponse) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <p className="text-sm text-destructive">Failed to load projects</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <StandardPageLayout
        title="Projects"
        subtitle="Manage all projects"
        headerActions={
          <Button onClick={() => setIsCreateDialogOpen(true)} className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </Button>
        }
        kpiCards={
          <>
            <KPICard data={kpiData[0]} />
            <KPICard data={kpiData[1]} />
            <KPICard data={kpiData[2]} />
            <KPICard data={kpiData[3]} />
          </>
        }
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name, code, customer, city, manager, or ID..."
        filters={filterConfigs}
        onClearFilters={handleClearFilters}
        filterMode="popover"
        toolbarActions={
          <Button variant="outline" size="sm" onClick={handleExport} className="h-9 gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        }
        className="gap-4 sm:gap-6"
      >
        <div className="min-w-0">
          <DataTable
            key={tableFilterKey}
            columns={columns}
            data={projects}
            showToolbar={false}
            compact
            onRowClick={handleRowClick}
            enableSelection={true}
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            rowIdKey="id"
            emptyMessage="No projects found. Adjust your filters or create a new project."
            rowActions={(row) => (
              <ProjectRowActions
                project={row as Project}
                onView={handleViewDetails}
                onEdit={handleEditFromRow}
                onDelete={handleDelete}
              />
            )}
          />
        </div>
      </StandardPageLayout>

      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open);
        if (!open) setCreateInitialData(undefined);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <ProjectForm
            onSubmit={handleCreate}
            onCancel={() => {
              setIsCreateDialogOpen(false);
              setCreateInitialData(undefined);
            }}
            isLoading={createMutation.isPending}
            prefillCustomerId={customerId || undefined}
            initialData={createInitialData}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <ProjectForm
              initialData={projectToFormInitial(selectedProject)}
              onSubmit={handleEdit}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedProjectId(null);
              }}
              isLoading={updateMutation.isPending}
              isEditMode
            />
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
