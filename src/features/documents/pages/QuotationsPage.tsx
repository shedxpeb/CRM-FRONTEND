'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MainLayout } from '@/layouts/MainLayout';
import { DataTable, Column } from '@/components/data-table/DataTable';
import { KPICard } from '@/components/dashboard/KPICard';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { FilterConfig } from '@/components/layout/FilterBar';
import { QuotationBuilder } from '@/features/documents/components/QuotationBuilder';
import { DocumentRowActions } from '@/features/documents/components/DocumentRowActions';
import { useQuotations } from '@/features/documents/hooks';
import { useDocumentConfiguration } from '@/features/documents/hooks/useDocuments';
import { useDocumentPdfActions } from '@/features/documents/hooks/useDocumentPdfActions';
import { Quotation, CreateQuotationDto, Proposal } from '@/features/documents/types/peb-commercial';
import { DOCUMENT_STATUS_BADGE_VARIANTS } from '@/features/documents/constants';
import { getDetailRoute, normalizeQuotation } from '@/features/documents/utils/documentHelpers';
import {
  consumeConversionSnapshot,
  DOCUMENT_CONVERSION_KEYS,
  storeConversionSnapshot,
} from '@/features/documents/utils/documentConversion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ROUTES } from '@/core/routes';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { FileSpreadsheet, Plus, Clock, CheckCircle, TrendingUp } from 'lucide-react';

export function QuotationsPage() {
  const { documentStatuses } = useDocumentConfiguration();
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId');
  const shouldCreate = searchParams.get('create') === 'true';

  const { data: quotationsResponse, loading, createQuotation, updateQuotation, deleteQuotation, refetch } = useQuotations({ page: 1, pageSize: 1000 });
  const { previewPdf, downloadPdf, PdfPreviewDialog } = useDocumentPdfActions();
  const quotations = quotationsResponse || [];

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [createdByFilter, setCreatedByFilter] = useState<string>('all');

  const [isBuilderDialogOpen, setIsBuilderDialogOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  useEffect(() => {
    if (shouldCreate && customerId) {
      setEditingQuotation(null);
      setIsBuilderDialogOpen(true);
    }
  }, [shouldCreate, customerId]);

  useEffect(() => {
    const proposal = consumeConversionSnapshot<Proposal>(DOCUMENT_CONVERSION_KEYS.proposal);
    if (proposal) {
      setSelectedProposal(proposal);
      setEditingQuotation(null);
      setIsBuilderDialogOpen(true);
    }
  }, []);

  const filterOptions = useMemo(() => {
    const customers = new Set<string>();
    const projects = new Set<string>();
    const creators = new Set<string>();
    for (const quot of quotations) {
      if (quot.customerName) customers.add(quot.customerName);
      if (quot.projectName) projects.add(quot.projectName);
      const creator = (quot as Quotation & { createdBy?: string }).createdBy;
      if (creator) creators.add(creator);
    }
    return { customers: [...customers].sort(), projects: [...projects].sort(), creators: [...creators].sort() };
  }, [quotations]);

  const filteredQuotations = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return quotations.filter((quot) => {
      const creator = (quot as Quotation & { createdBy?: string }).createdBy ?? '';
      const matchesStatus = statusFilter === 'all' || quot.status === statusFilter;
      const matchesCustomer = customerFilter === 'all' || quot.customerName === customerFilter;
      const matchesProject = projectFilter === 'all' || quot.projectName === projectFilter;
      const matchesCreator = createdByFilter === 'all' || creator === createdByFilter;
      const matchesSearch =
        !debouncedSearch ||
        quot.quotationNumber.toLowerCase().includes(q) ||
        quot.customerName.toLowerCase().includes(q) ||
        (quot.projectName?.toLowerCase().includes(q) ?? false) ||
        quot.proposalNumber.toLowerCase().includes(q) ||
        quot.status.toLowerCase().includes(q) ||
        creator.toLowerCase().includes(q);
      return matchesStatus && matchesCustomer && matchesProject && matchesCreator && matchesSearch;
    });
  }, [quotations, debouncedSearch, statusFilter, customerFilter, projectFilter, createdByFilter]);

  const filteredStats = useMemo(() => {
    let draft = 0;
    let sent = 0;
    let accepted = 0;
    let pipeline = 0;
    for (const quot of filteredQuotations) {
      if (quot.status === 'Draft') draft++;
      if (quot.status === 'Sent') sent++;
      if (quot.status === 'Accepted') accepted++;
      pipeline += quot.grandTotal ?? 0;
    }
    return { total: filteredQuotations.length, draft, sent, accepted, pipeline };
  }, [filteredQuotations]);

  const kpiData = useMemo(
    () => [
      { title: 'Total Quotations', value: String(filteredStats.total), change: 0, icon: <FileSpreadsheet className="h-5 w-5 text-blue-600" />, color: 'text-blue-600' },
      { title: 'Draft', value: String(filteredStats.draft), change: 0, icon: <Clock className="h-5 w-5 text-gray-600" />, color: 'text-gray-600' },
      { title: 'Sent', value: String(filteredStats.sent), change: 0, icon: <FileSpreadsheet className="h-5 w-5 text-orange-600" />, color: 'text-orange-600' },
      { title: 'Accepted', value: String(filteredStats.accepted), change: 0, icon: <CheckCircle className="h-5 w-5 text-green-600" />, color: 'text-green-600' },
      { title: 'Revenue Pipeline', value: `₹${filteredStats.pipeline.toLocaleString()}`, change: 0, icon: <TrendingUp className="h-5 w-5 text-purple-600" />, color: 'text-purple-600' },
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

  const columns: Column<Quotation>[] = useMemo(
    () => [
      { key: 'quotationNumber', label: 'Quotation #', sortable: true, render: (v) => <span className="font-mono text-xs">{v}</span> },
      { key: 'customerName', label: 'Customer', sortable: true, render: (v, row) => (
        <div className="min-w-0">
          <p className="text-xs font-medium truncate">{v}</p>
          <p className="text-[11px] text-muted-foreground truncate">{row.projectName || '-'}</p>
        </div>
      )},
      { key: 'proposalNumber', label: 'From Proposal', sortable: true, className: 'hidden lg:table-cell', headerClassName: 'hidden lg:table-cell', render: (v) => <span className="text-xs font-mono">{v}</span> },
      { key: 'grandTotal', label: 'Amount', sortable: true, render: (v) => <span className="text-xs font-medium">₹{Number(v ?? 0).toLocaleString()}</span> },
      { key: 'status', label: 'Status', sortable: true, render: (v) => <Badge variant={DOCUMENT_STATUS_BADGE_VARIANTS[v as keyof typeof DOCUMENT_STATUS_BADGE_VARIANTS] ?? 'secondary'} className="text-[10px]">{v}</Badge> },
      { key: 'createdAt', label: 'Created', sortable: true, className: 'hidden md:table-cell', headerClassName: 'hidden md:table-cell', render: (v) => <span className="text-xs text-muted-foreground">{v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '-'}</span> },
    ],
    []
  );

  const handleRowClick = useCallback((quot: Quotation) => {
    router.push(getDetailRoute(normalizeQuotation(quot)));
  }, [router]);

  const handleViewDetails = useCallback((quot: Quotation) => {
    router.push(getDetailRoute(normalizeQuotation(quot)));
  }, [router]);

  const handleEditQuotation = useCallback((quot: Quotation) => {
    setEditingQuotation(quot);
    setSelectedProposal(null);
    setIsBuilderDialogOpen(true);
  }, []);

  const handleDeleteQuotation = async (quot: Quotation) => {
    if (confirm(`Are you sure you want to delete ${quot.quotationNumber}?`)) {
      try {
        await deleteQuotation(quot.id);
        refetch();
      } catch (err) {
        // Failed to delete quotation
      }
    }
  };

  const handleConvertToProject = (quotation: Quotation) => {
    if (quotation.status !== 'Accepted') {
      alert('Only Accepted quotations can be converted to projects.');
      return;
    }
    storeConversionSnapshot(DOCUMENT_CONVERSION_KEYS.quotation, quotation);
    router.push(ROUTES.projects);
  };

  const handleDuplicateQuotation = async (quotation: Quotation) => {
    try {
      const duplicateData: CreateQuotationDto = {
        proposalId: quotation.proposalId,
        paymentTerms: quotation.paymentTerms,
        pricingConfiguration: quotation.pricingConfiguration,
        validUntil: quotation.validUntil,
        deliveryTerms: quotation.deliveryTerms,
        termsAndConditions: quotation.termsAndConditions,
        notes: quotation.notes,
      };
      await createQuotation(duplicateData);
      refetch();
    } catch (err) {
      // Failed to duplicate quotation
    }
  };

  const handleBuilderSave = async (data: CreateQuotationDto) => {
    try {
      if (editingQuotation) {
        await updateQuotation(editingQuotation.id, data);
      } else {
        await createQuotation(data);
      }
      setIsBuilderDialogOpen(false);
      setEditingQuotation(null);
      setSelectedProposal(null);
      refetch();
    } catch (err) {
      // Failed to save quotation
    }
  };

  return (
    <MainLayout>
      <StandardPageLayout
        title="Quotations"
        subtitle="Manage quotation documents"
        kpiGridClassName="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4"
        headerActions={
          <Button onClick={() => alert('Quotations are created from Proposals. Convert a proposal to create a quotation snapshot.')} className="h-9" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Quotation
          </Button>
        }
        kpiCards={kpiData.map((kpi, i) => <KPICard key={i} data={kpi} />)}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by quotation number, customer, project, proposal, status..."
        filters={filterConfigs}
        onClearFilters={handleClearFilters}
        filterMode="popover"
        className="gap-4 sm:gap-6"
      >
        <DataTable
          key={tableFilterKey}
          columns={columns}
          data={filteredQuotations}
          showToolbar={false}
          compact
          loading={loading}
          onRowClick={handleRowClick}
          enableSelection
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          rowIdKey="id"
          emptyMessage="No quotations found."
          rowActions={(row) => (
            <DocumentRowActions
              document={row}
              onView={() => handleViewDetails(row)}
              onEdit={() => handleEditQuotation(row)}
              onDelete={() => handleDeleteQuotation(row)}
              onSend={() => {}}
              onConvertToProject={() => handleConvertToProject(row)}
              onPreviewPdf={() => previewPdf(row)}
              onDownload={() => downloadPdf(row)}
              onDuplicate={() => handleDuplicateQuotation(row)}
            />
          )}
        />
      </StandardPageLayout>

      <Dialog open={isBuilderDialogOpen} onOpenChange={setIsBuilderDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuotation ? `Edit Quotation ${editingQuotation.quotationNumber}` : 'Create New Quotation'}</DialogTitle>
          </DialogHeader>
          {(selectedProposal || editingQuotation) && (
            <QuotationBuilder
              proposal={selectedProposal ?? ({ id: editingQuotation!.proposalId, proposalNumber: editingQuotation!.proposalNumber, customerId: editingQuotation!.customerId, customerName: editingQuotation!.customerName } as Proposal)}
              quotation={editingQuotation || undefined}
              onSave={handleBuilderSave}
              onCancel={() => { setIsBuilderDialogOpen(false); setEditingQuotation(null); setSelectedProposal(null); }}
            />
          )}
        </DialogContent>
      </Dialog>

      {PdfPreviewDialog}
    </MainLayout>
  );
}
