'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/layouts/MainLayout';
import { DataTable, Column } from '@/components/data-table/DataTable';
import { KPICard } from '@/components/dashboard/KPICard';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { FilterConfig } from '@/components/layout/FilterBar';
import { ProposalBuilder } from '@/features/documents/components/ProposalBuilder';
import { DocumentRowActions } from '@/features/documents/components/DocumentRowActions';
import { useProposals } from '@/features/documents/hooks';
import { useDocumentConfiguration } from '@/features/documents/hooks/useDocuments';
import { useDocumentPdfActions } from '@/features/documents/hooks/useDocumentPdfActions';
import { Proposal, CreateProposalDto, Estimate } from '@/features/documents/types/peb-commercial';
import { DOCUMENT_STATUS_BADGE_VARIANTS } from '@/features/documents/constants';
import { getDetailRoute, normalizeProposal } from '@/features/documents/utils/documentHelpers';
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
import { File, Plus, Clock, CheckCircle } from 'lucide-react';

export function ProposalsPage() {
  const { documentStatuses } = useDocumentConfiguration();
  const router = useRouter();
  const { data: proposalsResponse, loading, createProposal, updateProposal, deleteProposal, refetch } = useProposals({ page: 1, pageSize: 1000 });
  const { previewPdf, downloadPdf, PdfPreviewDialog } = useDocumentPdfActions();
  const proposals = proposalsResponse || [];

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [createdByFilter, setCreatedByFilter] = useState<string>('all');

  const [isBuilderDialogOpen, setIsBuilderDialogOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  useEffect(() => {
    const estimate = consumeConversionSnapshot<Estimate>(DOCUMENT_CONVERSION_KEYS.estimate);
    if (estimate) {
      setSelectedEstimate(estimate);
      setEditingProposal(null);
      setIsBuilderDialogOpen(true);
    }
  }, []);

  const filterOptions = useMemo(() => {
    const customers = new Set<string>();
    const projects = new Set<string>();
    const creators = new Set<string>();
    for (const prop of proposals) {
      if (prop.customerName) customers.add(prop.customerName);
      if (prop.projectName) projects.add(prop.projectName);
      const creator = (prop as Proposal & { createdBy?: string }).createdBy;
      if (creator) creators.add(creator);
    }
    return { customers: [...customers].sort(), projects: [...projects].sort(), creators: [...creators].sort() };
  }, [proposals]);

  const filteredProposals = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return proposals.filter((prop) => {
      const creator = (prop as Proposal & { createdBy?: string }).createdBy ?? '';
      const matchesStatus = statusFilter === 'all' || prop.status === statusFilter;
      const matchesCustomer = customerFilter === 'all' || prop.customerName === customerFilter;
      const matchesProject = projectFilter === 'all' || prop.projectName === projectFilter;
      const matchesCreator = createdByFilter === 'all' || creator === createdByFilter;
      const matchesSearch =
        !debouncedSearch ||
        prop.proposalNumber.toLowerCase().includes(q) ||
        prop.customerName.toLowerCase().includes(q) ||
        (prop.projectName?.toLowerCase().includes(q) ?? false) ||
        prop.estimateNumber.toLowerCase().includes(q) ||
        prop.status.toLowerCase().includes(q) ||
        creator.toLowerCase().includes(q);
      return matchesStatus && matchesCustomer && matchesProject && matchesCreator && matchesSearch;
    });
  }, [proposals, debouncedSearch, statusFilter, customerFilter, projectFilter, createdByFilter]);

  const filteredStats = useMemo(() => {
    let draft = 0;
    let sent = 0;
    let converted = 0;
    for (const prop of filteredProposals) {
      if (prop.status === 'Draft') draft++;
      if (prop.status === 'Sent') sent++;
      if (prop.status === 'Converted') converted++;
    }
    return { total: filteredProposals.length, draft, sent, converted };
  }, [filteredProposals]);

  const kpiData = useMemo(
    () => [
      { title: 'Total Proposals', value: String(filteredStats.total), change: 0, icon: <File className="h-5 w-5 text-blue-600" />, color: 'text-blue-600' },
      { title: 'Draft', value: String(filteredStats.draft), change: 0, icon: <Clock className="h-5 w-5 text-gray-600" />, color: 'text-gray-600' },
      { title: 'Sent', value: String(filteredStats.sent), change: 0, icon: <File className="h-5 w-5 text-orange-600" />, color: 'text-orange-600' },
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

  const columns: Column<Proposal>[] = useMemo(
    () => [
      { key: 'proposalNumber', label: 'Proposal #', sortable: true, render: (v) => <span className="font-mono text-xs">{v}</span> },
      { key: 'customerName', label: 'Customer', sortable: true, render: (v, row) => (
        <div className="min-w-0">
          <p className="text-xs font-medium truncate">{v}</p>
          <p className="text-[11px] text-muted-foreground truncate">{row.projectName || '-'}</p>
        </div>
      )},
      { key: 'estimateNumber', label: 'From Estimate', sortable: true, className: 'hidden lg:table-cell', headerClassName: 'hidden lg:table-cell', render: (v) => <span className="text-xs font-mono">{v}</span> },
      { key: 'status', label: 'Status', sortable: true, render: (v) => <Badge variant={DOCUMENT_STATUS_BADGE_VARIANTS[v as keyof typeof DOCUMENT_STATUS_BADGE_VARIANTS] ?? 'secondary'} className="text-[10px]">{v}</Badge> },
      { key: 'createdAt', label: 'Created', sortable: true, className: 'hidden md:table-cell', headerClassName: 'hidden md:table-cell', render: (v) => <span className="text-xs text-muted-foreground">{v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '-'}</span> },
    ],
    []
  );

  const handleRowClick = useCallback((prop: Proposal) => {
    router.push(getDetailRoute(normalizeProposal(prop)));
  }, [router]);

  const handleViewDetails = useCallback((prop: Proposal) => {
    router.push(getDetailRoute(normalizeProposal(prop)));
  }, [router]);

  const handleEditProposal = useCallback((prop: Proposal) => {
    setEditingProposal(prop);
    setSelectedEstimate(null);
    setIsBuilderDialogOpen(true);
  }, []);

  const handleDeleteProposal = async (prop: Proposal) => {
    if (confirm(`Are you sure you want to delete ${prop.proposalNumber}?`)) {
      try {
        await deleteProposal(prop.id);
        refetch();
      } catch (err) {
        // Failed to delete proposal
      }
    }
  };

  const handleConvertToQuotation = (proposal: Proposal) => {
    storeConversionSnapshot(DOCUMENT_CONVERSION_KEYS.proposal, proposal);
    router.push(ROUTES.documentsQuotations);
  };

  const handleDuplicateProposal = async (proposal: Proposal) => {
    try {
      const duplicateData: CreateProposalDto = {
        estimateId: proposal.estimateId,
        proposalConfiguration: proposal.proposalConfiguration,
        includeCommercialSummary: proposal.includeCommercialSummary,
        commercialSummary: proposal.commercialSummary,
        timeline: proposal.timeline,
        termsAndConditions: proposal.termsAndConditions,
        notes: proposal.notes,
      };
      await createProposal(duplicateData);
      refetch();
    } catch (err) {
      // Failed to duplicate proposal
    }
  };

  const handleBuilderSave = async (data: CreateProposalDto) => {
    try {
      if (editingProposal) {
        await updateProposal(editingProposal.id, data);
      } else {
        await createProposal(data);
      }
      setIsBuilderDialogOpen(false);
      setEditingProposal(null);
      setSelectedEstimate(null);
      refetch();
    } catch (err) {
      // Failed to save proposal
    }
  };

  return (
    <MainLayout>
      <StandardPageLayout
        title="Proposals"
        subtitle="Manage proposal documents"
        headerActions={
          <Button onClick={() => alert('Proposals are created from Estimates. Convert an estimate to create a proposal snapshot.')} className="h-9" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            New Proposal
          </Button>
        }
        kpiCards={kpiData.map((kpi, i) => <KPICard key={i} data={kpi} />)}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by proposal number, customer, project, estimate, status..."
        filters={filterConfigs}
        onClearFilters={handleClearFilters}
        filterMode="popover"
        className="gap-4 sm:gap-6"
      >
        <DataTable
          key={tableFilterKey}
          columns={columns}
          data={filteredProposals}
          showToolbar={false}
          compact
          loading={loading}
          onRowClick={handleRowClick}
          enableSelection
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          rowIdKey="id"
          emptyMessage="No proposals found."
          rowActions={(row) => (
            <DocumentRowActions
              document={row}
              onView={() => handleViewDetails(row)}
              onEdit={() => handleEditProposal(row)}
              onDelete={() => handleDeleteProposal(row)}
              onSend={() => {}}
              onConvert={(_, target) => target === 'Quotation' && handleConvertToQuotation(row)}
              onPreviewPdf={() => previewPdf(row)}
              onDownload={() => downloadPdf(row)}
              onDuplicate={() => handleDuplicateProposal(row)}
            />
          )}
        />
      </StandardPageLayout>

      <Dialog open={isBuilderDialogOpen} onOpenChange={setIsBuilderDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProposal ? `Edit Proposal ${editingProposal.proposalNumber}` : 'Create New Proposal'}</DialogTitle>
          </DialogHeader>
          {(selectedEstimate || editingProposal) && (
            <ProposalBuilder
              estimate={selectedEstimate ?? ({ id: editingProposal!.estimateId, estimateNumber: editingProposal!.estimateNumber, customerId: editingProposal!.customerId, customerName: editingProposal!.customerName } as Estimate)}
              proposal={editingProposal || undefined}
              onSave={handleBuilderSave}
              onCancel={() => { setIsBuilderDialogOpen(false); setEditingProposal(null); setSelectedEstimate(null); }}
            />
          )}
        </DialogContent>
      </Dialog>

      {PdfPreviewDialog}
    </MainLayout>
  );
}
