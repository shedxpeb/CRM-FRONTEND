'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MainLayout } from '@/layouts/MainLayout';
import { DataTable, Column } from '@/components/data-table/DataTable';
import { KPICard } from '@/components/dashboard/KPICard';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { FilterConfig } from '@/components/layout/FilterBar';
import { DocumentRowActions } from '@/features/documents/components/DocumentRowActions';
import { useUnifiedDocuments } from '@/features/documents/hooks/useUnifiedDocuments';
import { useDocumentConfiguration } from '@/features/documents/hooks/useDocuments';
import { useDocumentPdfActions } from '@/features/documents/hooks/useDocumentPdfActions';
import { UnifiedDocument, getDetailRoute, getEditRoute } from '@/features/documents/utils/documentHelpers';
import { DOCUMENT_STATUS_BADGE_VARIANTS } from '@/features/documents/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { ROUTES } from '@/core/routes';
import {
  FileText,
  File,
  FileSpreadsheet,
  Receipt,
  Plus,
  ChevronDown,
  Download,
} from 'lucide-react';

const DOC_TYPES = ['all', 'Estimate', 'Proposal', 'Quotation', 'Invoice'] as const;

export function DocumentsDashboard() {
  const { documentStatuses } = useDocumentConfiguration();
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId');
  const shouldCreate = searchParams.get('create') === 'true';

  const { allDocuments, loading, refetch } = useUnifiedDocuments();
  const { previewPdf, downloadPdf, PdfPreviewDialog } = useDocumentPdfActions();

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [createdByFilter, setCreatedByFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  useEffect(() => {
    if (shouldCreate && customerId) {
      router.push(`${ROUTES.documentsQuotations}?customerId=${customerId}&create=true`);
    }
  }, [shouldCreate, customerId, router]);

  const filterOptions = useMemo(() => {
    const customers = new Set<string>();
    const projects = new Set<string>();
    const creators = new Set<string>();
    for (const doc of allDocuments) {
      if (doc.customerName) customers.add(doc.customerName);
      if (doc.projectName) projects.add(doc.projectName);
      if (doc.createdBy) creators.add(doc.createdBy);
    }
    return {
      customers: [...customers].sort(),
      projects: [...projects].sort(),
      creators: [...creators].sort(),
    };
  }, [allDocuments]);

  const filteredDocuments = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return allDocuments.filter((doc) => {
      const matchesType = typeFilter === 'all' || doc.documentType === typeFilter;
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      const matchesCustomer = customerFilter === 'all' || doc.customerName === customerFilter;
      const matchesProject = projectFilter === 'all' || doc.projectName === projectFilter;
      const matchesCreator = createdByFilter === 'all' || doc.createdBy === createdByFilter;
      const docDate = doc.createdAt ? new Date(doc.createdAt) : null;
      const now = new Date();
      const matchesDate =
        dateFilter === 'all' ||
        (dateFilter === 'this_month' && docDate && docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear()) ||
        (dateFilter === 'last_30' && docDate && now.getTime() - docDate.getTime() <= 30 * 24 * 60 * 60 * 1000);
      const matchesSearch =
        !debouncedSearch ||
        doc.documentNumber.toLowerCase().includes(q) ||
        doc.customerName.toLowerCase().includes(q) ||
        (doc.projectName?.toLowerCase().includes(q) ?? false) ||
        doc.status.toLowerCase().includes(q) ||
        doc.documentType.toLowerCase().includes(q) ||
        (doc.createdBy?.toLowerCase().includes(q) ?? false);
      return matchesType && matchesStatus && matchesCustomer && matchesProject && matchesCreator && matchesDate && matchesSearch;
    });
  }, [allDocuments, debouncedSearch, typeFilter, statusFilter, customerFilter, projectFilter, createdByFilter, dateFilter]);

  // Combine stats and KPI data computation to reduce re-renders
  const { filteredStats, kpiData } = useMemo(() => {
    let estimates = 0;
    let proposals = 0;
    let quotations = 0;
    let invoices = 0;
    let draft = 0;
    let approved = 0;
    let sent = 0;
    for (const doc of filteredDocuments) {
      if (doc.documentType === 'Estimate') estimates++;
      if (doc.documentType === 'Proposal') proposals++;
      if (doc.documentType === 'Quotation') quotations++;
      if (doc.documentType === 'Invoice') invoices++;
      if (doc.status === 'Draft') draft++;
      if (doc.status === 'Approved' || doc.status === 'Accepted') approved++;
      if (doc.status === 'Sent') sent++;
    }
    const stats = { total: filteredDocuments.length, estimates, proposals, quotations, invoices, draft, approved, sent };
    
    const kpi = [
      { title: 'Total Documents', value: String(stats.total), change: 0, icon: <FileText className="h-5 w-5 text-blue-600" />, color: 'text-blue-600' },
      { title: 'Estimates', value: String(stats.estimates), change: 0, icon: <FileText className="h-5 w-5 text-indigo-600" />, color: 'text-indigo-600' },
      { title: 'Proposals', value: String(stats.proposals), change: 0, icon: <File className="h-5 w-5 text-purple-600" />, color: 'text-purple-600' },
      { title: 'Quotations', value: String(stats.quotations), change: 0, icon: <FileSpreadsheet className="h-5 w-5 text-green-600" />, color: 'text-green-600' },
      { title: 'Invoices', value: String(stats.invoices), change: 0, icon: <Receipt className="h-5 w-5 text-emerald-600" />, color: 'text-emerald-600' },
      { title: 'Draft', value: String(stats.draft), change: 0, icon: <FileText className="h-5 w-5 text-gray-600" />, color: 'text-gray-600' },
      { title: 'Approved', value: String(stats.approved), change: 0, icon: <FileText className="h-5 w-5 text-teal-600" />, color: 'text-teal-600' },
      { title: 'Sent', value: String(stats.sent), change: 0, icon: <FileText className="h-5 w-5 text-orange-600" />, color: 'text-orange-600' },
    ];
    
    return { filteredStats: stats, kpiData: kpi };
  }, [filteredDocuments]);

  const tableFilterKey = useMemo(
    () => [debouncedSearch, typeFilter, statusFilter, customerFilter, projectFilter, createdByFilter, dateFilter].join('|'),
    [debouncedSearch, typeFilter, statusFilter, customerFilter, projectFilter, createdByFilter, dateFilter]
  );

  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        key: 'type',
        label: 'Document Type',
        value: typeFilter,
        onChange: setTypeFilter,
        options: [{ value: 'all', label: 'All Types' }, ...DOC_TYPES.filter((t) => t !== 'all').map((t) => ({ value: t, label: t }))],
      },
      {
        key: 'status',
        label: 'Status',
        value: statusFilter,
        onChange: setStatusFilter,
        options: [{ value: 'all', label: 'All Status' }, ...documentStatuses.map((s) => ({ value: s, label: s }))],
      },
      {
        key: 'customer',
        label: 'Customer',
        value: customerFilter,
        onChange: setCustomerFilter,
        options: [{ value: 'all', label: 'All Customers' }, ...filterOptions.customers.map((c) => ({ value: c, label: c }))],
      },
      {
        key: 'project',
        label: 'Project',
        value: projectFilter,
        onChange: setProjectFilter,
        options: [{ value: 'all', label: 'All Projects' }, ...filterOptions.projects.map((p) => ({ value: p, label: p }))],
      },
      {
        key: 'createdBy',
        label: 'Created By',
        value: createdByFilter,
        onChange: setCreatedByFilter,
        options: [{ value: 'all', label: 'All Users' }, ...filterOptions.creators.map((c) => ({ value: c, label: c }))],
      },
      {
        key: 'date',
        label: 'Date',
        value: dateFilter,
        onChange: setDateFilter,
        options: [
          { value: 'all', label: 'All Dates' },
          { value: 'this_month', label: 'This Month' },
          { value: 'last_30', label: 'Last 30 Days' },
        ],
      },
    ],
    [typeFilter, statusFilter, customerFilter, projectFilter, createdByFilter, dateFilter, filterOptions]
  );

  const handleClearFilters = useCallback(() => {
    setTypeFilter('all');
    setStatusFilter('all');
    setCustomerFilter('all');
    setProjectFilter('all');
    setCreatedByFilter('all');
    setDateFilter('all');
    setSearchQuery('');
  }, []);

  const columns: Column<UnifiedDocument>[] = useMemo(
    () => [
      { key: 'documentNumber', label: 'Document #', sortable: true, render: (v) => <span className="font-mono text-xs">{v}</span> },
      {
        key: 'documentType',
        label: 'Type',
        sortable: true,
        render: (v) => (
          <Badge variant="outline" className="text-[10px]">{v}</Badge>
        ),
      },
      {
        key: 'customerName',
        label: 'Customer',
        sortable: true,
        className: 'min-w-[120px] max-w-[180px]',
        render: (v, row) => (
          <div className="min-w-0">
            <p className="text-xs font-medium truncate">{v}</p>
            <p className="text-[11px] text-muted-foreground truncate">{row.projectName || '-'}</p>
          </div>
        ),
      },
      {
        key: 'totalAmount',
        label: 'Amount',
        sortable: true,
        render: (v) => <span className="text-xs font-medium">{v ? `₹${Number(v).toLocaleString()}` : '-'}</span>,
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (v) => (
          <Badge variant={DOCUMENT_STATUS_BADGE_VARIANTS[v as keyof typeof DOCUMENT_STATUS_BADGE_VARIANTS] ?? 'secondary'} className="text-[10px]">
            {v}
          </Badge>
        ),
      },
      {
        key: 'createdBy',
        label: 'Created By',
        className: 'hidden lg:table-cell',
        headerClassName: 'hidden lg:table-cell',
        render: (v) => <span className="text-xs">{v || '-'}</span>,
      },
      {
        key: 'createdAt',
        label: 'Created',
        sortable: true,
        className: 'hidden md:table-cell',
        headerClassName: 'hidden md:table-cell',
        render: (v) => (
          <span className="text-xs text-muted-foreground">
            {v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '-'}
          </span>
        ),
      },
    ],
    []
  );

  const handleRowClick = useCallback((doc: UnifiedDocument) => {
    router.push(getDetailRoute(doc));
  }, [router]);

  const handleViewDetails = useCallback((doc: UnifiedDocument) => {
    router.push(getDetailRoute(doc));
  }, [router]);

  const handleEdit = useCallback((doc: UnifiedDocument) => {
    router.push(getEditRoute(doc));
  }, [router]);

  const handleExport = useCallback(() => {
    const headers = ['Document #', 'Type', 'Customer', 'Project', 'Amount', 'Status', 'Created By'];
    const csv = [
      headers.join(','),
      ...filteredDocuments.map((d) =>
        [d.documentNumber, d.documentType, `"${d.customerName}"`, d.projectName || '', d.totalAmount, d.status, d.createdBy || ''].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `documents_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [filteredDocuments]);

  if (loading && !allDocuments.length) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <StandardPageLayout
        title="Documents"
        subtitle="Estimates, proposals, quotations and invoices"
        headerActions={
          <div className="relative">
            <Button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="h-9">
              <Plus className="h-4 w-4 mr-2" />
              New Document
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-background rounded-md shadow-lg border z-50">
                <div className="py-1">
                  <button type="button" className="w-full text-left px-4 py-2 hover:bg-muted flex items-center gap-2 text-sm" onClick={() => { router.push(`${ROUTES.documentsEstimates}?create=true`); setIsDropdownOpen(false); }}>
                    <FileText className="h-4 w-4" /> New Estimate
                  </button>
                  <button type="button" className="w-full text-left px-4 py-2 hover:bg-muted flex items-center gap-2 text-sm" onClick={() => { router.push(`${ROUTES.documentsProposals}?create=true`); setIsDropdownOpen(false); }}>
                    <File className="h-4 w-4" /> New Proposal
                  </button>
                  <button type="button" className="w-full text-left px-4 py-2 hover:bg-muted flex items-center gap-2 text-sm" onClick={() => { router.push(`${ROUTES.documentsQuotations}?create=true`); setIsDropdownOpen(false); }}>
                    <FileSpreadsheet className="h-4 w-4" /> New Quotation
                  </button>
                </div>
              </div>
            )}
          </div>
        }
        kpiCards={kpiData.map((kpi, i) => <KPICard key={i} data={kpi} />)}
        kpiGridClassName="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by document number, customer, project, status, type, or created by..."
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
            data={filteredDocuments}
            showToolbar={false}
            compact
            loading={loading}
            onRowClick={handleRowClick}
            enableSelection
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            rowIdKey="id"
            emptyMessage="No documents found. Adjust filters or create a new document."
            rowActions={(row) => (
              <DocumentRowActions
                document={row.source}
                onView={() => handleViewDetails(row)}
                onEdit={() => handleEdit(row)}
                onDelete={() => {}}
                onSend={() => {}}
                onApprove={() => {}}
                onReject={() => {}}
                onVersion={() => {}}
                onEmail={() => {}}
                onWhatsApp={() => {}}
                onPrint={() => handleViewDetails(row)}
                onPreviewPdf={() => previewPdf(row.source)}
                onDownload={() => downloadPdf(row.source)}
                onCopy={() => {}}
              />
            )}
          />
        </div>
      </StandardPageLayout>

      {PdfPreviewDialog}
    </MainLayout>
  );
}
