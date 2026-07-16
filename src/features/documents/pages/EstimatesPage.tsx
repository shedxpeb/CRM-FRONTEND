'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MainLayout } from '@/layouts/MainLayout';
import { DataTable, Column } from '@/components/data-table/DataTable';
import { KPICard } from '@/components/dashboard/KPICard';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { FilterConfig } from '@/components/layout/FilterBar';
import { EstimateBuilder } from '@/features/documents/components/EstimateBuilder';
import { DocumentRowActions } from '@/features/documents/components/DocumentRowActions';
import { useEstimates } from '@/features/documents/hooks';
import { useDocumentConfiguration } from '@/features/documents/hooks/useDocuments';
import { useDocumentPdfActions } from '@/features/documents/hooks/useDocumentPdfActions';
import { Estimate, CreateEstimateDto, UpdateEstimateDto } from '@/features/documents/types/peb-commercial';
import { DOCUMENT_STATUS_BADGE_VARIANTS } from '@/features/documents/constants';
import { getDetailRoute, normalizeEstimate } from '@/features/documents/utils/documentHelpers';
import {
  DOCUMENT_CONVERSION_KEYS,
  storeConversionSnapshot,
} from '@/features/documents/utils/documentConversion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ROUTES } from '@/core/routes';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { FileText, Plus, Clock, CheckCircle } from 'lucide-react';

export function EstimatesPage() {
  const { documentStatuses } = useDocumentConfiguration();
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldCreate = searchParams.get('create') === 'true';

  const { data: estimatesResponse, loading, createEstimate, updateEstimate, deleteEstimate, refetch } = useEstimates({ page: 1, pageSize: 1000 });
  const { previewPdf, downloadPdf, PdfPreviewDialog } = useDocumentPdfActions();
  const estimates = estimatesResponse || [];

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [createdByFilter, setCreatedByFilter] = useState<string>('all');

  const [isBuilderDialogOpen, setIsBuilderDialogOpen] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  useEffect(() => {
    if (shouldCreate) {
      setEditingEstimate(null);
      setIsBuilderDialogOpen(true);
    }
  }, [shouldCreate]);

  const filterOptions = useMemo(() => {
    const customers = new Set<string>();
    const projects = new Set<string>();
    const creators = new Set<string>();
    for (const est of estimates) {
      if (est.customerName) customers.add(est.customerName);
      if (est.projectName) projects.add(est.projectName);
      const creator = est.salesExecutive ?? (est as Estimate & { createdBy?: string }).createdBy;
      if (creator) creators.add(creator);
    }
    return { customers: [...customers].sort(), projects: [...projects].sort(), creators: [...creators].sort() };
  }, [estimates]);

  const filteredEstimates = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return estimates.filter((est) => {
      const creator = est.salesExecutive ?? (est as Estimate & { createdBy?: string }).createdBy ?? '';
      const matchesStatus = statusFilter === 'all' || est.status === statusFilter;
      const matchesCustomer = customerFilter === 'all' || est.customerName === customerFilter;
      const matchesProject = projectFilter === 'all' || est.projectName === projectFilter;
      const matchesCreator = createdByFilter === 'all' || creator === createdByFilter;
      const matchesSearch =
        !debouncedSearch ||
        est.estimateNumber.toLowerCase().includes(q) ||
        est.customerName.toLowerCase().includes(q) ||
        (est.projectName?.toLowerCase().includes(q) ?? false) ||
        est.status.toLowerCase().includes(q) ||
        creator.toLowerCase().includes(q);
      return matchesStatus && matchesCustomer && matchesProject && matchesCreator && matchesSearch;
    });
  }, [estimates, debouncedSearch, statusFilter, customerFilter, projectFilter, createdByFilter]);

  const filteredStats = useMemo(() => {
    let draft = 0;
    let sent = 0;
    let converted = 0;
    for (const est of filteredEstimates) {
      if (est.status === 'Draft') draft++;
      if (est.status === 'Sent') sent++;
      if (est.status === 'Converted') converted++;
    }
    return { total: filteredEstimates.length, draft, sent, converted };
  }, [filteredEstimates]);

  const kpiData = useMemo(
    () => [
      { title: 'Total Estimates', value: String(filteredStats.total), change: 0, icon: <FileText className="h-5 w-5 text-blue-600" />, color: 'text-blue-600' },
      { title: 'Draft', value: String(filteredStats.draft), change: 0, icon: <Clock className="h-5 w-5 text-gray-600" />, color: 'text-gray-600' },
      { title: 'Sent', value: String(filteredStats.sent), change: 0, icon: <FileText className="h-5 w-5 text-orange-600" />, color: 'text-orange-600' },
      { title: 'Converted', value: String(filteredStats.converted), change: 0, icon: <CheckCircle className="h-5 w-5 text-green-600" />, color: 'text-green-600' },
    ],
    [filteredStats]
  );

  const tableFilterKey = useMemo(
    () => [debouncedSearch, statusFilter, customerFilter, projectFilter, createdByFilter].join('|'),
    [debouncedSearch, statusFilter, customerFilter, projectFilter, createdByFilter]
  );

  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      { key: 'status', label: 'Status', value: statusFilter, onChange: setStatusFilter, options: [{ value: 'all', label: 'All Status' }, ...documentStatuses.map((s) => ({ value: s, label: s }))] },
      { key: 'customer', label: 'Customer', value: customerFilter, onChange: setCustomerFilter, options: [{ value: 'all', label: 'All Customers' }, ...filterOptions.customers.map((c) => ({ value: c, label: c }))] },
      { key: 'project', label: 'Project', value: projectFilter, onChange: setProjectFilter, options: [{ value: 'all', label: 'All Projects' }, ...filterOptions.projects.map((p) => ({ value: p, label: p }))] },
      { key: 'createdBy', label: 'Created By', value: createdByFilter, onChange: setCreatedByFilter, options: [{ value: 'all', label: 'All Users' }, ...filterOptions.creators.map((c) => ({ value: c, label: c }))] },
    ],
    [statusFilter, customerFilter, projectFilter, createdByFilter, filterOptions]
  );

  const handleClearFilters = useCallback(() => {
    setStatusFilter('all');
    setCustomerFilter('all');
    setProjectFilter('all');
    setCreatedByFilter('all');
    setSearchQuery('');
  }, []);

  const columns: Column<Estimate>[] = useMemo(
    () => [
      { key: 'estimateNumber', label: 'Estimate #', sortable: true, render: (v) => <span className="font-mono text-xs">{v}</span> },
      { key: 'customerName', label: 'Customer', sortable: true, className: 'min-w-[120px]', render: (v, row) => (
        <div className="min-w-0">
          <p className="text-xs font-medium truncate">{v}</p>
          <p className="text-[11px] text-muted-foreground truncate">{row.projectName || '-'}</p>
        </div>
      )},
      { key: 'totalAmount', label: 'Amount', sortable: true, render: (v) => <span className="text-xs font-medium">{v ? `₹${Number(v).toLocaleString()}` : '-'}</span> },
      { key: 'status', label: 'Status', sortable: true, render: (v) => <Badge variant={DOCUMENT_STATUS_BADGE_VARIANTS[v as keyof typeof DOCUMENT_STATUS_BADGE_VARIANTS] ?? 'secondary'} className="text-[10px]">{v}</Badge> },
      { key: 'createdAt', label: 'Created', sortable: true, className: 'hidden md:table-cell', headerClassName: 'hidden md:table-cell', render: (v) => <span className="text-xs text-muted-foreground">{v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '-'}</span> },
    ],
    []
  );

  const handleRowClick = useCallback((est: Estimate) => {
    router.push(getDetailRoute(normalizeEstimate(est)));
  }, [router]);

  const handleViewDetails = useCallback((est: Estimate) => {
    router.push(getDetailRoute(normalizeEstimate(est)));
  }, [router]);

  const handleEditEstimate = useCallback((est: Estimate) => {
    setEditingEstimate(est);
    setIsBuilderDialogOpen(true);
  }, []);

  const handleDeleteEstimate = async (est: Estimate) => {
    if (confirm(`Are you sure you want to delete ${est.estimateNumber}?`)) {
      try {
        await deleteEstimate(est.id);
        refetch();
      } catch (err) {
        // Failed to delete estimate
      }
    }
  };

  const handleConvertToProposal = (estimate: Estimate) => {
    storeConversionSnapshot(DOCUMENT_CONVERSION_KEYS.estimate, estimate);
    router.push(ROUTES.documentsProposals);
  };

  const handleDuplicateEstimate = async (estimate: Estimate) => {
    try {
      const duplicateData: CreateEstimateDto = {
        customerId: estimate.customerId,
        leadId: estimate.leadId,
        projectId: estimate.projectId,
        includePricing: estimate.includePricing,
        materialSelections: estimate.materialSelections.map(({ id: _id, ...rest }) => rest),
        scopeConfiguration: estimate.scopeConfiguration,
        technicalSpecifications: estimate.technicalSpecifications,
        inclusions: estimate.inclusions,
        exclusions: estimate.exclusions,
        notes: estimate.notes,
        terms: estimate.terms,
        salesExecutive: estimate.salesExecutive,
        validTill: estimate.validTill,
      };
      await createEstimate(duplicateData);
      refetch();
    } catch (err) {
      // Failed to duplicate estimate
    }
  };

  const handleBuilderSave = async (data: CreateEstimateDto) => {
    try {
      if (editingEstimate) {
        await updateEstimate(editingEstimate.id, data as unknown as UpdateEstimateDto);
      } else {
        await createEstimate(data);
      }
      setIsBuilderDialogOpen(false);
      setEditingEstimate(null);
      refetch();
    } catch (err) {
      // Failed to save estimate
    }
  };

  return (
    <MainLayout>
      <StandardPageLayout
        title="Estimates"
        subtitle="Manage estimate documents"
        headerActions={
          <Button onClick={() => { setEditingEstimate(null); setIsBuilderDialogOpen(true); }} className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            New Estimate
          </Button>
        }
        kpiCards={kpiData.map((kpi, i) => <KPICard key={i} data={kpi} />)}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by estimate number, customer, project, status, or created by..."
        filters={filterConfigs}
        onClearFilters={handleClearFilters}
        filterMode="popover"
        className="gap-4 sm:gap-6"
      >
        <DataTable
          key={tableFilterKey}
          columns={columns}
          data={filteredEstimates}
          showToolbar={false}
          compact
          loading={loading}
          onRowClick={handleRowClick}
          enableSelection
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          rowIdKey="id"
          emptyMessage="No estimates found."
          rowActions={(row) => (
            <DocumentRowActions
              document={row}
              onView={() => handleViewDetails(row)}
              onEdit={() => handleEditEstimate(row)}
              onDelete={() => handleDeleteEstimate(row)}
              onSend={() => {}}
              onConvert={(_, target) => target === 'Proposal' && handleConvertToProposal(row)}
              onPreviewPdf={() => previewPdf(row)}
              onDownload={() => downloadPdf(row)}
              onDuplicate={() => handleDuplicateEstimate(row)}
            />
          )}
        />
      </StandardPageLayout>

      <Dialog open={isBuilderDialogOpen} onOpenChange={setIsBuilderDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEstimate ? `Edit Estimate ${editingEstimate.estimateNumber}` : 'Create New Estimate'}</DialogTitle>
          </DialogHeader>
          <EstimateBuilder
            estimate={editingEstimate || undefined}
            onSave={handleBuilderSave}
            onCancel={() => { setIsBuilderDialogOpen(false); setEditingEstimate(null); }}
          />
        </DialogContent>
      </Dialog>

      {PdfPreviewDialog}
    </MainLayout>
  );
}
