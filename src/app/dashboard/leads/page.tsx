'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/layouts/MainLayout';
import { DataTable } from '@/components/data-table/DataTable';
import { KPICard } from '@/components/dashboard/KPICard';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { FilterConfig } from '@/components/layout/FilterBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/core/routes';

// Lazy load heavy components to reduce initial bundle size
const LeadForm = dynamic(() => import('@/features/leads/components/LeadForm').then(mod => ({ default: mod.LeadForm })), {
  loading: () => <div className="p-8 text-center">Loading form...</div>,
  ssr: false
});
const LeadRowActions = dynamic(() => import('@/features/leads/components/LeadRowActions').then(mod => ({ default: mod.LeadRowActions })), {
  loading: () => <div className="p-2">Loading...</div>,
  ssr: false
});
const LeadToCustomerConversionDialog = dynamic(() => import('@/features/leads/components/LeadToCustomerConversionDialog').then(mod => ({ default: mod.LeadToCustomerConversionDialog })), {
  loading: () => <div className="p-8 text-center">Loading...</div>,
  ssr: false
});
const LeadToProjectConversionDialog = dynamic(() => import('@/features/leads/components/LeadToProjectConversionDialog').then(mod => ({ default: mod.LeadToProjectConversionDialog })), {
  loading: () => <div className="p-8 text-center">Loading...</div>,
  ssr: false
});
const KanbanBoard = dynamic(() => import('@/features/leads/components/KanbanBoard').then(mod => ({ default: mod.KanbanBoard })), {
  loading: () => <div className="p-8 text-center">Loading kanban...</div>,
  ssr: false
});
const LeadCalendarView = dynamic(() => import('@/features/leads/components/LeadCalendarView').then(mod => ({ default: mod.LeadCalendarView })), {
  loading: () => <div className="p-8 text-center">Loading calendar...</div>,
  ssr: false
});
import { Lead, LeadStatus, LeadPriority } from '@/types/leads';
import { useLeadConfiguration, useLeads, useKanbanLeads, useCalendarLeads, useDeleteLead, useCreateLead, useUpdateLead, useBulkStatusUpdate, useBulkDelete, useImportLeads } from '@/features/leads/hooks/useLeads';
import { getLeadCustomFieldValue } from '@/features/leads/components/LeadCustomFields';
import { leadsApi, ImportResult } from '@/features/leads/services/leadsApi';
import { toast } from '@/components/ui/toast';
import {
  Plus,
  Download,
  RefreshCw,
  Trash2,
  CheckCircle,
  Send,
  FileText,
  LayoutList,
  Calendar,
  Columns,
  Upload,
  Users,
  Sparkles,
  FileSpreadsheet,
  ChevronDown,
} from 'lucide-react';

const statusBadge = (value: LeadStatus) => (
  <Badge
    variant={
      value === 'New' ? 'info' :
      value === 'Contacted' ? 'warning' :
      value === 'Converted' || value === 'Approved' ? 'success' :
      value === 'Rejected' ? 'destructive' :
      'secondary'
    }
    className="text-[10px] sm:text-xs whitespace-nowrap"
  >
    {value}
  </Badge>
);

const priorityBadge = (value: LeadPriority) => (
  <Badge
    variant={
      value === 'Urgent' ? 'destructive' :
      value === 'High' ? 'warning' :
      value === 'Medium' ? 'info' :
      'secondary'
    }
    className="text-[10px] sm:text-xs whitespace-nowrap"
  >
    {value}
  </Badge>
);

// Move baseColumns outside component to prevent recreation on every render
const baseColumns = [
  {
    key: 'leadNumber' as const,
    label: 'ID',
    sortable: true,
    className: 'w-[72px] min-w-[72px]',
    render: (value: number) => <span className="font-mono text-xs text-muted-foreground">#{value}</span>,
  },
  {
    key: 'customerName' as const,
    label: 'Customer',
    sortable: true,
    className: 'min-w-[140px] max-w-[180px]',
    render: (_: string, row: Lead) => (
      <div className="min-w-0">
        <p className="font-medium text-sm truncate">{row.customerName}</p>
        <p className="text-xs text-muted-foreground truncate">{row.companyName}</p>
      </div>
    ),
  },
  {
    key: 'companyName' as const,
    label: 'Company',
    sortable: true,
    className: 'min-w-[120px] max-w-[160px] hidden xl:table-cell',
    headerClassName: 'hidden xl:table-cell',
    render: (value: string) => <span className="text-xs truncate block">{value}</span>,
  },
  {
    key: 'mobile' as const,
    label: 'Mobile',
    className: 'min-w-[110px] whitespace-nowrap',
    render: (value: string) => <span className="text-xs">{value}</span>,
  },
  {
    key: 'city' as const,
    label: 'Location',
    className: 'min-w-[120px] max-w-[150px]',
    render: (_: unknown, row: Lead) => (
      <span className="text-xs truncate block">{row.city}, {row.state}</span>
    ),
  },
  {
    key: 'projectType' as const,
    label: 'Project',
    filterable: true,
    className: 'min-w-[100px] max-w-[130px] hidden lg:table-cell',
    headerClassName: 'hidden lg:table-cell',
    render: (value: string) => <span className="text-xs truncate block">{value}</span>,
  },
  {
    key: 'structureType' as const,
    label: 'Structure',
    filterable: true,
    className: 'min-w-[100px] max-w-[130px] hidden lg:table-cell',
    headerClassName: 'hidden lg:table-cell',
    render: (value: string) => <span className="text-xs truncate block">{value}</span>,
  },
  {
    key: 'width' as const,
    label: 'Area',
    className: 'min-w-[72px] whitespace-nowrap hidden md:table-cell',
    headerClassName: 'hidden md:table-cell',
    render: (_: unknown, row: Lead) => (
      <span className="text-xs tabular-nums">{(row.width || 0) * (row.length || 0)}</span>
    ),
  },
  {
    key: 'status' as const,
    label: 'Status',
    sortable: true,
    className: 'min-w-[96px]',
    render: (value: LeadStatus) => statusBadge(value),
  },
  {
    key: 'converted' as const,
    label: 'Converted',
    className: 'min-w-[80px] hidden md:table-cell',
    headerClassName: 'hidden md:table-cell',
    render: (_: unknown, row: Lead) => (
      <Badge variant={row.customerId ? 'success' : 'secondary'} className="text-[10px] sm:text-xs">
        {row.customerId ? 'Yes' : 'No'}
      </Badge>
    ),
  },
  {
    key: 'assignedTo' as const,
    label: 'Assigned',
    className: 'min-w-[110px] max-w-[140px] hidden xl:table-cell',
    headerClassName: 'hidden xl:table-cell',
    render: (value: string | undefined) => (
      <span className="text-xs truncate block">{value || '-'}</span>
    ),
  },
  {
    key: 'priority' as const,
    label: 'Priority',
    sortable: true,
    className: 'min-w-[88px]',
    render: (value: LeadPriority) => priorityBadge(value),
  },
  {
    key: 'score' as const,
    label: 'Score',
    sortable: true,
    className: 'min-w-[56px] hidden sm:table-cell',
    headerClassName: 'hidden sm:table-cell',
    render: (value: number | undefined) => (
      <span className="text-xs tabular-nums font-medium">{value ?? '-'}</span>
    ),
  },
  {
    key: 'createdAt' as const,
    label: 'Created',
    sortable: true,
    className: 'min-w-[88px] whitespace-nowrap hidden lg:table-cell',
    headerClassName: 'hidden lg:table-cell',
    render: (value: Date) => {
      if (!value) return '-';
      return (
        <span className="text-xs tabular-nums">
          {new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </span>
      );
    },
  },
  {
    key: 'nextFollowUpDate' as const,
    label: 'Follow-up',
    className: 'min-w-[88px] whitespace-nowrap hidden xl:table-cell',
    headerClassName: 'hidden xl:table-cell',
    render: (value: Date) => {
      if (!value) return '-';
      return (
        <span className="text-xs tabular-nums">
          {new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </span>
      );
    },
  },
];

export default function LeadsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const leadConfig = useLeadConfiguration();
  const deleteLeadMutation = useDeleteLead();
  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();
  const bulkStatusUpdateMutation = useBulkStatusUpdate();
  const bulkDeleteMutation = useBulkDelete();
  const importLeadsMutation = useImportLeads();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [projectTypeFilter, setProjectTypeFilter] = useState<string>('all');
  const [structureTypeFilter, setStructureTypeFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [assignedToFilter, setAssignedToFilter] = useState<string>('all');
  const [kpiFilterMode, setKpiFilterMode] = useState<string>('none');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedLeadData, setSelectedLeadData] = useState<Lead | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConvertToCustomerDialogOpen, setIsConvertToCustomerDialogOpen] = useState(false);
  const [isConvertToProjectDialogOpen, setIsConvertToProjectDialogOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'kanban' | 'calendar'>('table');
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isDateRangeDialogOpen, setIsDateRangeDialogOpen] = useState(false);
  const [exportDateFrom, setExportDateFrom] = useState<string>('');
  const [exportDateTo, setExportDateTo] = useState<string>('');
  const isExportingRef = useRef(false);
  const [customColumns, setCustomColumns] = useState<Array<{key: string, label: string}>>([]);
  const [isCustomColumnDialogOpen, setIsCustomColumnDialogOpen] = useState(false);
  const [quickDateFilter, setQuickDateFilter] = useState<string>('all');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImportResultOpen, setIsImportResultOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Reset page to 1 when search, filters, or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, priorityFilter, cityFilter, projectTypeFilter, structureTypeFilter, sourceFilter, assignedToFilter, pageSize, sortBy, sortOrder]);

  // Fetch leads from backend - only when in table view
  const { data: leadsResponse, isLoading: isLoadingLeads, error: leadsError, refetch: refetchLeads } = useLeads(
    viewMode === 'table' ? {
      page: Math.max(1, currentPage),
      pageSize,
      search: debouncedSearch.trim().length >= 2 ? debouncedSearch.trim() : undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      statusMode: kpiFilterMode === 'in-progress' ? 'in-progress' : undefined,
      priority: priorityFilter === 'all' ? undefined : priorityFilter,
      source: sourceFilter === 'all' ? undefined : sourceFilter,
      projectType: projectTypeFilter === 'all' ? undefined : projectTypeFilter,
      structureType: structureTypeFilter === 'all' ? undefined : structureTypeFilter,
      city: cityFilter === 'all' ? undefined : cityFilter,
      assignedEmployeeId: assignedToFilter === 'all' ? undefined : assignedToFilter,
      sortBy,
      sortOrder,
    } : undefined
  );

  // Transform backend Kanban columns to flat leads array for KanbanBoard component
  const { data: kanbanResponse, isLoading: isLoadingKanban } = useKanbanLeads(
    viewMode === 'kanban' ? {
      search: debouncedSearch.trim().length >= 2 ? debouncedSearch.trim() : undefined,
      priority: priorityFilter === 'all' ? undefined : priorityFilter,
      city: cityFilter === 'all' ? undefined : cityFilter,
      assignedEmployeeId: assignedToFilter === 'all' ? undefined : assignedToFilter,
    } : undefined
  );

  // Fetch Calendar data from backend - only when in calendar view
  const { data: calendarResponse, isLoading: isLoadingCalendar } = useCalendarLeads(
    viewMode === 'calendar' ? {
      search: debouncedSearch.trim().length >= 2 ? debouncedSearch.trim() : undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      priority: priorityFilter === 'all' ? undefined : priorityFilter,
      city: cityFilter === 'all' ? undefined : cityFilter,
      assignedEmployeeId: assignedToFilter === 'all' ? undefined : assignedToFilter,
    } : undefined
  );

  const leads = leadsResponse?.data?.rows || [];
  const pagination = leadsResponse?.data?.pagination;
  const summary = leadsResponse?.data?.summary;

  // Transform backend Kanban columns to flat leads array for KanbanBoard component
  const kanbanLeads = useMemo(() => {
    if (!kanbanResponse?.data?.columns) return [];
    return kanbanResponse.data.columns.flatMap(column => column.cards);
  }, [kanbanResponse]);

  const calendarEvents = calendarResponse?.data?.events || [];

  // Use backend summary data for global KPI counts (never changes based on filtering)
  const { leadStats, kpiData } = useMemo(() => {
    const backendSummary = summary || { total: 0, new: 0, contacted: 0, converted: 0, inProgress: 0 };
    
    const stats = { 
      total: backendSummary.total, 
      newCount: backendSummary.new, 
      inProgress: backendSummary.inProgress || 0, 
      converted: backendSummary.converted 
    };
    
    const kpi = [
      {
        title: 'Total Leads',
        value: String(stats.total),
        change: 0,
        icon: <Users className="h-5 w-5 text-blue-600" />,
        color: 'text-blue-600',
      },
      {
        title: 'New Leads',
        value: String(stats.newCount),
        change: 0,
        icon: <Sparkles className="h-5 w-5 text-green-600" />,
        color: 'text-green-600',
      },
      {
        title: 'In Progress',
        value: String(stats.inProgress),
        change: 0,
        icon: <RefreshCw className="h-5 w-5 text-amber-600" />,
        color: 'text-amber-600',
      },
      {
        title: 'Converted',
        value: String(stats.converted),
        change: 0,
        icon: <CheckCircle className="h-5 w-5 text-emerald-600" />,
        color: 'text-emerald-600',
      },
    ];
    
    return { leadStats: stats, kpiData: kpi };
  }, [summary]);

  const leadFilterOptions = useMemo(() => {
    const cities = new Set<string>();
    const assignedToUsers = new Set<string>();
    for (const lead of leads) {
      if (lead.city) cities.add(lead.city);
      if (lead.assignedTo) assignedToUsers.add(lead.assignedTo);
    }
    return {
      cities: [...cities].sort(),
      projectTypes: [...leadConfig.projectTypes].sort(),
      structureTypes: [...leadConfig.structureTypes].sort(),
      sources: [...leadConfig.sources].sort(),
      assignedTo: [...assignedToUsers].sort(),
    };
  }, [leads, leadConfig]);

  const customColumnDefs = useMemo(() => customColumns.map(col => ({
    key: col.key as any,
    label: col.label,
    sortable: true,
    render: (value: any, row: Lead) => value ?? getLeadCustomFieldValue(row, col.key)?.toString() ?? '-'
  })), [customColumns]);

  const settingsCustomColumnDefs = useMemo(() => {
    const manualKeys = new Set(customColumns.map((c) => c.key));
    return leadConfig.customFields
      .filter((field) => !manualKeys.has(field.key))
      .map((field) => ({
        key: field.key as any,
        label: field.label,
        sortable: true,
        className: 'min-w-[100px] max-w-[130px] hidden 2xl:table-cell',
        headerClassName: 'hidden 2xl:table-cell',
        render: (_: unknown, row: Lead) => (
          <span className="text-xs truncate block">
            {getLeadCustomFieldValue(row, field.key)?.toString() ?? '-'}
          </span>
        ),
      }));
  }, [leadConfig.customFields, customColumns]);

  const columns = useMemo(
    () => [...baseColumns, ...settingsCustomColumnDefs, ...customColumnDefs],
    [settingsCustomColumnDefs, customColumnDefs]
  );

  const handleRowClick = useCallback((lead: Lead) => {
    router.push(ROUTES.leadsDetail(lead.id));
  }, [router]);

  const handleKpiCardClick = useCallback((filter: string) => {
    if (filter === 'all') {
      setStatusFilter('all');
      setPriorityFilter('all');
      setKpiFilterMode('none');
    } else if (filter === 'in-progress') {
      setStatusFilter('all');
      setKpiFilterMode('in-progress');
    } else {
      setStatusFilter(filter);
      setKpiFilterMode('none');
    }

    
  }, []);

  const handleExport = useCallback(async (exportType: 'all' | 'current' | 'selected' | 'dateRange' | 'today' = 'all') => {
    if (isExportingRef.current) return;
    
    try {
      isExportingRef.current = true;
      
      // Use setTimeout without async/await to avoid blocking
      setTimeout(() => {
        const performExport = async () => {
          try {
            let leadsToExport: Lead[] = [];
            
            if (exportType === 'current') {
              leadsToExport = leads;
            } else if (exportType === 'selected') {
              if (selectedRows.size === 0) {
                toast.error('No leads selected for export');
                isExportingRef.current = false;
                return;
              }
              leadsToExport = leads.filter(lead => selectedRows.has(lead.id));
            } else if (exportType === 'dateRange') {
              if (!exportDateFrom || !exportDateTo) {
                toast.error('Please select both from and to dates');
                isExportingRef.current = false;
                return;
              }
              
              const response = await leadsApi.export({ 
                dateFrom: exportDateFrom,
                dateTo: exportDateTo,
                sortBy: 'createdAt',
                sortOrder: 'desc'
              });
              leadsToExport = response.data.rows;
            } else if (exportType === 'today') {
              const today = new Date().toISOString().split('T')[0];
              const response = await leadsApi.export({ 
                dateFrom: today,
                dateTo: today,
                sortBy: 'createdAt',
                sortOrder: 'desc'
              });
              leadsToExport = response.data.rows;
            } else {
              const response = await leadsApi.export({});
              leadsToExport = response.data.rows;
            }
            
            if (leadsToExport.length === 0) {
              toast.error('No leads found to export');
              isExportingRef.current = false;
              return;
            }
            
            // Excel generation in another setTimeout
            setTimeout(() => {
              void (async () => {
              try {
                const XLSX = await import('xlsx');
                const formatDate = (dateValue: string | Date | null | undefined) => {
                  if (!dateValue) return '';
                  
                  let date: Date;
                  if (typeof dateValue === 'string') {
                    const parts = dateValue.split('T')[0].split('-');
                    if (parts.length === 3) {
                      const [year, month, day] = parts;
                      return `${day}-${month}-${year}`;
                    }
                    date = new Date(dateValue);
                  } else {
                    date = dateValue;
                  }
                  
                  const day = String(date.getDate()).padStart(2, '0');
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const year = date.getFullYear();
                  return `${day}-${month}-${year}`;
                };
                
                const headers = [
                  'Lead ID', 'Customer Name', 'Company', 'Mobile', 'Alternate Mobile', 'Email', 'GST Number',
                  'Address', 'City', 'State', 'Pincode', 'Project Title', 'Project Type', 'Structure Type',
                  'Width', 'Length', 'Height', 'Bay Spacing', 'Roof Type', 'Crane Required', 'Crane Capacity',
                  'Mezzanine', 'Mezzanine Area', 'Mezzanine Load', 'Wall Type', 'Insulation Required', 
                  'Insulation Type', 'Insulation Thickness', 'Material Preference',
                  'Site Location', 'Site Address', 'Map Coordinates', 'Soil Notes',
                  'Customer Notes', 'Special Requirement', 'Status', 'Priority', 'Score', 
                  'Assigned To', 'Source', 'Created Date', 'Next Follow-up', 'Remarks'
                ];
                
                const customFieldKeys = Object.keys(leadConfig.customFields || {});
                customFieldKeys.forEach(key => {
                  const field = (leadConfig.customFields as any)?.[key];
                  headers.push(field?.label || key);
                });
                
                const data = leadsToExport.map(lead => {
                  const row: any[] = [
                    lead.leadNumber,
                    lead.customerName,
                    lead.companyName,
                    lead.mobile,
                    lead.alternateMobile || '',
                    lead.email,
                    lead.gstNumber || '',
                    lead.addressLine1 || '',
                    lead.city || '',
                    lead.state || '',
                    lead.pincode || '',
                    lead.projectTitle,
                    lead.projectType,
                    lead.structureType,
                    lead.width || '',
                    lead.length || '',
                    lead.height || '',
                    lead.baySpacing || '',
                    lead.roofType || '',
                    lead.craneRequired ? 'Yes' : 'No',
                    lead.craneCapacity || '',
                    lead.mezzanine ? 'Yes' : 'No',
                    lead.mezzanineArea || '',
                    lead.mezzanineLoad || '',
                    lead.wallType || '',
                    lead.insulationRequired ? 'Yes' : 'No',
                    lead.insulationType || '',
                    lead.insulationThickness || '',
                    lead.materialPreference || '',
                    lead.siteLocation || '',
                    lead.siteAddress || '',
                    lead.mapCoordinates || '',
                    lead.soilNotes || '',
                    lead.customerNotes || '',
                    lead.specialRequirement || '',
                    lead.status,
                    lead.priority,
                    lead.score || '',
                    lead.assignedTo || '',
                    lead.source,
                    formatDate(lead.createdAt),
                    formatDate(lead.nextFollowUpDate),
                    lead.remarks || '',
                  ];
                  
                  customFieldKeys.forEach(key => {
                    const customValue = lead.customFields?.[key];
                    if (Array.isArray(customValue)) {
                      row.push(customValue.join(', '));
                    } else {
                      row.push(customValue || '');
                    }
                  });
                  
                  return row;
                });
                
                const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Leads');
                
                const date = new Date().toISOString().split('T')[0];
                let filename = '';
                if (exportType === 'all') {
                  filename = `leads_all_${date}.xlsx`;
                } else if (exportType === 'current') {
                  filename = `leads_page_${currentPage}_${date}.xlsx`;
                } else if (exportType === 'selected') {
                  filename = `leads_selected_${selectedRows.size}_${date}.xlsx`;
                } else if (exportType === 'dateRange') {
                  filename = `leads_${exportDateFrom}_to_${exportDateTo}.xlsx`;
                } else if (exportType === 'today') {
                  filename = `leads_today_${date}.xlsx`;
                }
                
                XLSX.writeFile(wb, filename);
                
                toast.success(`Successfully exported ${leadsToExport.length} leads to Excel`);
                isExportingRef.current = false;
                
                // Manually restore pointer events on body in case Radix UI scroll lock didn't clean up
                document.body.style.pointerEvents = '';
              } catch (error) {
                isExportingRef.current = false;
                console.error('Export failed:', error);
                toast.error('Failed to export leads');
              }
              })();
            }, 50);
          } catch (error) {
            isExportingRef.current = false;
            console.error('Export failed:', error);
            toast.error('Failed to export leads');
          }
        };
        
        performExport();
      }, 50);
    } catch (error) {
      isExportingRef.current = false;
      console.error('Export failed:', error);
      toast.error('Failed to export leads');
    }
  }, [leads, currentPage, leadConfig.customFields, selectedRows, exportDateFrom, exportDateTo]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const result = await importLeadsMutation.mutateAsync(file);
        const data = result.data;
        setImportResult(data);
        setIsImportResultOpen(true);
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Import failed';
        toast.error(typeof message === 'string' ? message : 'Import failed');
      }
    };
    input.click();
  }, [importLeadsMutation]);

  const handleAddCustomColumn = useCallback((key: string, label: string) => {
    setCustomColumns(prevColumns => [...prevColumns, { key, label }]);
    setIsCustomColumnDialogOpen(false);
  }, []);

  const handleRemoveCustomColumn = useCallback((key: string) => {
    setCustomColumns(prevColumns => prevColumns.filter(col => col.key !== key));
  }, []);

  const handleQuickDateFilterChange = useCallback((filter: string) => {
    setQuickDateFilter(filter);
  }, []);

  const handleSortChange = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    setSortBy(sortBy);
    setSortOrder(sortOrder);
  }, []);

  const handleViewModeChange = useCallback((mode: 'table' | 'kanban' | 'calendar') => {
    setViewMode(mode);
    setSelectedRows(new Set());
  }, []);

  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      key: 'status',
      label: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [{ value: 'all', label: 'All Status' }, ...leadConfig.statuses.map(s => ({ value: s, label: s }))],
    },
    {
      key: 'priority',
      label: 'Priority',
      value: priorityFilter,
      onChange: setPriorityFilter,
      options: [{ value: 'all', label: 'All Priority' }, ...leadConfig.priorities.map(p => ({ value: p, label: p }))],
    },
    {
      key: 'source',
      label: 'Source',
      value: sourceFilter,
      onChange: setSourceFilter,
      options: [{ value: 'all', label: 'All Sources' }, ...leadFilterOptions.sources.map(s => ({ value: s, label: s }))],
    },
    {
      key: 'createdDate',
      label: 'Created',
      value: quickDateFilter,
      onChange: handleQuickDateFilterChange,
      options: [
        { value: 'all', label: 'All Dates' },
        { value: 'today', label: 'Today' },
        { value: 'tomorrow', label: 'Tomorrow' },
        { value: 'this_week', label: 'This Week' },
        { value: 'this_month', label: 'This Month' },
        { value: 'this_year', label: 'This Year' },
      ],
    },
    {
      key: 'city',
      label: 'City',
      value: cityFilter,
      onChange: setCityFilter,
      options: [{ value: 'all', label: 'All Cities' }, ...leadFilterOptions.cities.map(c => ({ value: c, label: c }))],
    },
    {
      key: 'projectType',
      label: 'Project Type',
      value: projectTypeFilter,
      onChange: setProjectTypeFilter,
      options: [{ value: 'all', label: 'All Types' }, ...leadFilterOptions.projectTypes.map(p => ({ value: p, label: p }))],
    },
    {
      key: 'structureType',
      label: 'Structure Type',
      value: structureTypeFilter,
      onChange: setStructureTypeFilter,
      options: [{ value: 'all', label: 'All Structures' }, ...leadFilterOptions.structureTypes.map(s => ({ value: s, label: s }))],
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      value: assignedToFilter,
      onChange: setAssignedToFilter,
      options: [{ value: 'all', label: 'All Employees' }, ...leadFilterOptions.assignedTo.map(e => ({ value: e, label: e }))],
    },
  ], [statusFilter, priorityFilter, cityFilter, projectTypeFilter, structureTypeFilter, sourceFilter, assignedToFilter, quickDateFilter, leadFilterOptions, leadConfig.statuses, leadConfig.priorities, handleQuickDateFilterChange]);

  const handleClearFilters = useCallback(() => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setCityFilter('all');
    setProjectTypeFilter('all');
    setStructureTypeFilter('all');
    setSourceFilter('all');
    setAssignedToFilter('all');
    setKpiFilterMode('none');
    setSearchQuery('');
    setQuickDateFilter('all');
  }, []);

  const handleEditLeadFromRow = useCallback((lead: Lead) => {
    setSelectedLeadId(lead.id);
    setIsEditDialogOpen(true);
  }, []);

  // Phase 2: Create lead using backend API
  const handleCreateLead = useCallback(async (data: Partial<Lead>) => {
    try {
      await createLeadMutation.mutateAsync(data);
      setIsCreateDialogOpen(false);
      toast.success('Lead created successfully');
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to create lead';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  }, [createLeadMutation]);

  // Phase 2: Edit lead using backend API
  const handleEditLead = useCallback(async (data: Partial<Lead>) => {
    if (!selectedLeadId) return;
    try {
      await updateLeadMutation.mutateAsync({ id: selectedLeadId, data });
      setIsEditDialogOpen(false);
      setSelectedLeadId(null);
      toast.success('Lead updated successfully');
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to update lead';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  }, [selectedLeadId, updateLeadMutation]);

  // Phase 2: Delete lead using backend API
  const handleDeleteLead = useCallback(async (lead: Lead) => {
    try {
      await deleteLeadMutation.mutateAsync(lead.id);
      toast.success('Lead deleted successfully');
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to delete lead';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  }, [deleteLeadMutation]);

  const handleConvertLead = useCallback((lead: Lead) => {
    setSelectedLeadData(lead);
    setIsConvertToProjectDialogOpen(true);
  }, []);

  const handleConvertToCustomer = useCallback((lead: Lead) => {
    setSelectedLeadData(lead);
    setIsConvertToCustomerDialogOpen(true);
  }, []);

  const handleCustomerCreated = useCallback((customer: any) => {
    refetchLeads();
    queryClient.invalidateQueries({ queryKey: ['leads-kanban'] });
    queryClient.invalidateQueries({ queryKey: ['leads-calendar'] });
    queryClient.invalidateQueries({ queryKey: ['leads-stats'] });
    toast.success(`Customer "${customer?.customerName}" created successfully`);
  }, [refetchLeads, queryClient]);

  // Phase 1: Score/Status/Bulk handlers disabled - using backend data only
  const handleAddScore = useCallback(async (lead: Lead, score: number) => {
    try {
      let priority: LeadPriority = 'Low';
      if (score >= 90) priority = 'Urgent';
      else if (score >= 70) priority = 'High';
      else if (score >= 50) priority = 'Medium';
      
      await updateLeadMutation.mutateAsync({ id: lead.id, data: { score, priority } });
      toast.success(`Score updated to ${score}, Priority updated to ${priority}`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to update score';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  }, [updateLeadMutation]);

  const handleStatusChange = useCallback(async (lead: Lead, status: LeadStatus) => {
    try {
      await updateLeadMutation.mutateAsync({ id: lead.id, data: { status } });
      toast.success(`Status changed to ${status}`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to change status';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  }, [updateLeadMutation]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedRows.size === 0) return;
    
    try {
      const ids = Array.from(selectedRows).map(String);
      await bulkDeleteMutation.mutateAsync(ids);
      setSelectedRows(new Set());
      toast.success(`${ids.length} leads deleted successfully`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to delete leads';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  }, [selectedRows, bulkDeleteMutation]);

  const handleBulkStatusChange = useCallback(async (status: LeadStatus) => {
    if (selectedRows.size === 0) return;
    
    try {
      const ids = Array.from(selectedRows).map(String);
      await bulkStatusUpdateMutation.mutateAsync({ ids, status });
      setSelectedRows(new Set());
      toast.success(`${ids.length} leads updated to ${status}`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to update leads';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  }, [selectedRows, bulkStatusUpdateMutation]);

  const viewToggle = (
    <div className="flex items-center bg-card-hover rounded-lg p-1">
      <button
        type="button"
        onClick={() => handleViewModeChange('table')}
        className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
          viewMode === 'table'
            ? 'bg-card shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <LayoutList className="h-4 w-4" />
        <span className="hidden sm:inline">Table</span>
      </button>
      <button
        type="button"
        onClick={() => handleViewModeChange('kanban')}
        className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
          viewMode === 'kanban'
            ? 'bg-card shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Columns className="h-4 w-4" />
        <span className="hidden sm:inline">Kanban</span>
      </button>
      <button
        type="button"
        onClick={() => handleViewModeChange('calendar')}
        className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
          viewMode === 'calendar'
            ? 'bg-card shadow-sm text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Calendar className="h-4 w-4" />
        <span className="hidden sm:inline">Calendar</span>
      </button>
    </div>
  );

  return (
    <MainLayout>
      <StandardPageLayout
        title="Leads"
        subtitle="Manage customer enquiries and PEB requirements"
        headerActions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            {viewToggle}
            <Button onClick={() => setIsCreateDialogOpen(true)} className="h-9">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Lead</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        }
        kpiCards={
          <>
            <KPICard data={kpiData[0]} onClick={() => handleKpiCardClick('all')} />
            <KPICard data={kpiData[1]} onClick={() => handleKpiCardClick('New')} />
            <KPICard data={kpiData[2]} onClick={() => handleKpiCardClick('in-progress')} />
            <KPICard data={kpiData[3]} onClick={() => handleKpiCardClick('Converted')} />
          </>
        }
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search leads by name, company, mobile, email, or ID..."
        filters={filterConfigs}
        onClearFilters={handleClearFilters}
        filterMode="popover"
        toolbarActions={
          <>
            <DropdownMenu open={isExportDropdownOpen} onOpenChange={setIsExportDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Export</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('all')}>
                  <Download className="h-3.5 w-3.5 mr-2" />
                  Export All Leads
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('current')}>
                  <Download className="h-3.5 w-3.5 mr-2" />
                  Export Current Page
                </DropdownMenuItem>
                {selectedRows.size > 0 && (
                  <DropdownMenuItem onClick={() => handleExport('selected')}>
                    <Download className="h-3.5 w-3.5 mr-2" />
                    Export Selected ({selectedRows.size})
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setIsDateRangeDialogOpen(true)}>
                  <Calendar className="h-3.5 w-3.5 mr-2" />
                  Export by Date Range
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('today')}>
                  <Calendar className="h-3.5 w-3.5 mr-2" />
                  Export Today
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={handleImport} disabled={importLeadsMutation.isPending} className="h-9 gap-1.5 text-xs">
              <Upload className={`h-3.5 w-3.5 ${importLeadsMutation.isPending ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{importLeadsMutation.isPending ? 'Importing...' : 'Import'}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsCustomColumnDialogOpen(true)} className="h-9 gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Columns</span>
            </Button>
          </>
        }
        className="gap-4 sm:gap-6"
      >
        <div className="min-w-0">
          {/* Loading state */}
          {isLoadingLeads && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading leads...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {leadsError && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-sm text-destructive mb-2">Error loading leads</p>
                <p className="text-xs text-muted-foreground mb-4">{leadsError instanceof Error ? leadsError.message : 'Unknown error'}</p>
                <Button variant="outline" size="sm" onClick={() => refetchLeads()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Empty state - only show in table view */}
          {!isLoadingLeads && !leadsError && leads.length === 0 && viewMode === 'table' && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">No leads found</p>
                <p className="text-xs text-muted-foreground">Adjust your filters or add a new lead</p>
              </div>
            </div>
          )}

          {/* Table view */}
          {!isLoadingLeads && !leadsError && leads.length > 0 && viewMode === 'table' && (
            <>
              {selectedRows.size > 0 && (
                <Card className="bg-card-hover border-dashed mb-3 sm:mb-4">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <p className="text-sm font-medium">{selectedRows.size} lead(s) selected</p>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleBulkStatusChange('Contacted')}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Contacted
                        </Button>
                        <Button variant="outline" size="sm">
                          <Send className="h-4 w-4 mr-2" />
                          Send Estimate
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Send Proposal
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <DataTable
                columns={columns}
                data={leads}
                showToolbar={false}
                compact
                onRowClick={handleRowClick}
                enableSelection={true}
                selectedRows={selectedRows}
                onSelectionChange={setSelectedRows}
                rowIdKey="id"
                emptyMessage="No leads found. Adjust your filters or add a new lead."
                pagination={pagination}
                onPageChange={(page) => setCurrentPage(Math.max(1, page))}
                onPageSizeChange={setPageSize}
                onSortChange={handleSortChange}
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                rowActions={(row) => (
                  <LeadRowActions
                    lead={row as Lead}
                    statusOptions={leadConfig.statuses as LeadStatus[]}
                    onEdit={handleEditLeadFromRow}
                    onDelete={handleDeleteLead}
                    onConvert={handleConvertLead}
                    onConvertToCustomer={handleConvertToCustomer}
                    onView={handleRowClick}
                    onAddScore={handleAddScore}
                    onStatusChange={handleStatusChange}
                  />
                )}
              />
            </>
          )}

          {/* Kanban view */}
          {viewMode === 'kanban' && (
            <div className="py-4">
              {isLoadingKanban && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading kanban...</p>
                  </div>
                </div>
              )}
              {!isLoadingKanban && kanbanLeads.length > 0 && (
                <KanbanBoard
                  leads={kanbanLeads}
                  pipelineStages={leadConfig.statuses as LeadStatus[]}
                  onLeadUpdate={async (lead) => {
                    try {
                      const { id, status } = lead;
                      await updateLeadMutation.mutateAsync({ id, data: { status } });
                    } catch (error: any) {
                      const msg = error?.response?.data?.message || error?.message || 'Failed to update lead status';
                      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
                    }
                  }}
                />
              )}
              {!isLoadingKanban && kanbanLeads.length === 0 && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">No leads found</p>
                    <p className="text-xs text-muted-foreground">Adjust your filters or add a new lead</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Calendar view */}
          {viewMode === 'calendar' && (
            <div className="py-4">
              {isLoadingCalendar && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading calendar...</p>
                  </div>
                </div>
              )}
              {!isLoadingCalendar && calendarEvents.length > 0 && (
                <LeadCalendarView
                  leads={calendarEvents}
                  onLeadClick={handleRowClick}
                />
              )}
              {!isLoadingCalendar && calendarEvents.length === 0 && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">No follow-ups scheduled</p>
                    <p className="text-xs text-muted-foreground">Adjust your filters or add follow-up dates</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </StandardPageLayout>

      {/* Date Range Export Dialog */}
      <Dialog open={isDateRangeDialogOpen} onOpenChange={setIsDateRangeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export by Date Range</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <input
                type="date"
                value={exportDateFrom}
                onChange={(e) => setExportDateFrom(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <input
                type="date"
                value={exportDateTo}
                onChange={(e) => setExportDateTo(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDateRangeDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setIsDateRangeDialogOpen(false);
                setTimeout(() => handleExport('dateRange'), 300);
              }}>
                Export
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Phase 2: Create Lead Dialog - Enabled */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" onCloseAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Create Lead</DialogTitle>
          </DialogHeader>
          <LeadForm
            existingLeads={leads}
            configuration={leadConfig}
            onSubmit={handleCreateLead}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={createLeadMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Phase 2: Edit Lead Dialog - Enabled */}
      {selectedLeadId && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Lead</DialogTitle>
            </DialogHeader>
            <LeadForm
              initialData={leads.find(l => l.id === selectedLeadId)}
              existingLeads={leads}
              configuration={leadConfig}
              onSubmit={handleEditLead}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedLeadId(null);
              }}
              isLoading={updateLeadMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Custom Columns Dialog */}
      <Dialog open={isCustomColumnDialogOpen} onOpenChange={setIsCustomColumnDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Custom Columns</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Column Key</label>
              <input
                type="text"
                placeholder="e.g., customField1"
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                id="customColumnKey"
                defaultValue=""
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Column Label</label>
              <input
                type="text"
                placeholder="e.g., Custom Field 1"
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                id="customColumnLabel"
                defaultValue=""
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsCustomColumnDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                const keyInput = document.getElementById('customColumnKey') as HTMLInputElement;
                const labelInput = document.getElementById('customColumnLabel') as HTMLInputElement;
                if (keyInput?.value && labelInput?.value) {
                  handleAddCustomColumn(keyInput.value, labelInput.value);
                  keyInput.value = '';
                  labelInput.value = '';
                }
              }}>
                Add Column
              </Button>
            </div>
            {customColumns.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Existing Custom Columns</p>
                <div className="space-y-2">
                  {customColumns.map((col) => (
                    <div key={col.key} className="flex items-center justify-between p-2 border rounded-md">
                      <span className="text-sm">{col.label} ({col.key})</span>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveCustomColumn(col.key)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {isConvertToCustomerDialogOpen && selectedLeadData ? (
        <LeadToCustomerConversionDialog
          open={isConvertToCustomerDialogOpen}
          onOpenChange={setIsConvertToCustomerDialogOpen}
          lead={selectedLeadData}
          onCustomerCreated={handleCustomerCreated}
        />
      ) : null}

      {isConvertToProjectDialogOpen && selectedLeadData ? (
        <LeadToProjectConversionDialog
          open={isConvertToProjectDialogOpen}
          onOpenChange={setIsConvertToProjectDialogOpen}
          lead={selectedLeadData}
        />
      ) : null}

      {/* Import Result Dialog */}
      <Dialog open={isImportResultOpen} onOpenChange={setIsImportResultOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Import Results</DialogTitle>
          </DialogHeader>
          {importResult && (
            <div className="space-y-4 overflow-y-auto">
              <div className="grid grid-cols-5 gap-3">
                {[
                  { label: 'Total', value: importResult.total, color: 'text-muted-foreground' },
                  { label: 'Imported', value: importResult.imported, color: 'text-green-600' },
                  { label: 'Skipped', value: importResult.skipped, color: 'text-yellow-600' },
                  { label: 'Duplicates', value: importResult.duplicates, color: 'text-orange-600' },
                  { label: 'Invalid', value: importResult.invalid, color: 'text-red-600' },
                ].map(item => (
                  <div key={item.label} className="text-center p-3 rounded-lg border">
                    <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>

              {importResult.rows.filter(r => r.status !== 'imported').length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted px-4 py-2 font-medium text-sm">
                    Failed Rows ({importResult.rows.filter(r => r.status !== 'imported').length})
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y">
                    {importResult.rows
                      .filter(r => r.status !== 'imported')
                      .map((row, idx) => (
                        <div key={idx} className="px-4 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-muted-foreground">Row {row.rowNumber}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              row.status === 'duplicate' ? 'bg-orange-100 text-orange-700' :
                              row.status === 'invalid' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {row.status}
                            </span>
                          </div>
                          <ul className="mt-1 space-y-0.5">
                            {row.errors.map((err, ei) => (
                              <li key={ei} className="text-xs text-red-600">{err}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setIsImportResultOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
