'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { DataTable, Column } from '@/components/data-table/DataTable';
import { KPICard } from '@/components/dashboard/KPICard';
import { Button } from '@/components/ui/button';
import { PurchaseOrderForm } from '@/features/purchase-order/components/PurchaseOrderForm';
import { PurchaseOrderRowActions } from '@/features/purchase-order/components/PurchaseOrderRowActions';
import { PurchaseOrderStatusBadge } from '@/features/purchase-order/components/PurchaseOrderStatusBadge';
import { PurchaseOrderPdfViewer } from '@/features/purchase-order/components/PurchaseOrderPdfViewer';
import {
  usePurchaseOrders,
  usePoStats,
  useCreatePurchaseOrder,
  useUpdatePurchaseOrder,
  useApprovePurchaseOrder,
  useRejectPurchaseOrder,
  useSendPurchaseOrder,
  useDeletePurchaseOrder,
} from '@/features/purchase-order/hooks/usePurchaseOrders';
import { PurchaseOrder, PurchaseOrderQuery } from '@/features/purchase-order/types/purchase-order.types';
import { PO_STATUS_FILTER_OPTIONS } from '@/features/purchase-order/constants';
import { formatCurrency, formatDate, fetchPdfBlob, downloadBlob } from '@/features/purchase-order/utils/format';
import { toast } from '@/components/ui/toast';
import {
  Plus,
  ShoppingCart,
  FileEdit,
  Clock,
  CheckCircle,
  Send,
  XCircle,
  PackageCheck,
  DollarSign,
  Download,
} from 'lucide-react';

export default function PurchaseOrdersPage() {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showForm, setShowForm] = useState(false);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [previewPdfPo, setPreviewPdfPo] = useState<PurchaseOrder | null>(null);

  const query: PurchaseOrderQuery = useMemo(() => ({
    page,
    pageSize,
    sortBy,
    sortOrder,
    filter: {
      search: search || undefined,
      status: statusFilter || undefined,
    },
  }), [page, pageSize, sortBy, sortOrder, search, statusFilter]);

  const { data, isLoading } = usePurchaseOrders(query);
  const { data: stats } = usePoStats();

  const createMutation = useCreatePurchaseOrder();
  const updateMutation = useUpdatePurchaseOrder();
  const approveMutation = useApprovePurchaseOrder();
  const rejectMutation = useRejectPurchaseOrder();
  const sendMutation = useSendPurchaseOrder();
  const deleteMutation = useDeletePurchaseOrder();

  const handleCreate = useCallback(
    async (formData: any) => {
      try {
        await createMutation.mutateAsync(formData);
        setShowForm(false);
        toast.success('Purchase Order created successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to create purchase order');
      }
    },
    [createMutation]
  );

  const handleEdit = useCallback(
    async (formData: any) => {
      if (!editingPO) return;
      try {
        await updateMutation.mutateAsync({ id: editingPO.id, data: formData });
        setShowForm(false);
        setEditingPO(null);
        toast.success('Purchase Order updated successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to update purchase order');
      }
    },
    [editingPO, updateMutation]
  );

  const handleDelete = useCallback(
    async (po: PurchaseOrder) => {
      try {
        await deleteMutation.mutateAsync(po.id);
        toast.success('Purchase Order deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete purchase order');
      }
    },
    [deleteMutation]
  );

  const handleApprove = useCallback(
    async (po: PurchaseOrder) => {
      try {
        await approveMutation.mutateAsync(po.id);
        toast.success('Purchase Order approved successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to approve purchase order');
      }
    },
    [approveMutation]
  );

  const handleSendToVendor = useCallback(
    async (po: PurchaseOrder) => {
      try {
        await sendMutation.mutateAsync(po.id);
        toast.success(`PO ${po.poNumber} sent to vendor`);
      } catch (error: any) {
        toast.error(error.message || 'Failed to send purchase order');
      }
    },
    [sendMutation]
  );

  const handleDownloadPdf = useCallback(async (po: PurchaseOrder) => {
    try {
      const blob = await fetchPdfBlob(po.id);
      downloadBlob(blob, `${po.poNumber}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch {
      toast.error('Failed to download PDF');
    }
  }, []);

  const handlePrintPdf = useCallback(async (po: PurchaseOrder) => {
    try {
      const blob = await fetchPdfBlob(po.id);
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (win) {
        win.onload = () => {
          win.print();
        };
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      toast.error('Failed to print PDF');
    }
  }, []);

  const openCreateForm = () => {
    setEditingPO(null);
    setShowForm(true);
  };

  const openEditForm = (po: PurchaseOrder) => {
    setEditingPO(po);
    setShowForm(true);
  };

  const handleViewDetails = (po: PurchaseOrder) => {
    router.push(`/purchase/orders/${po.id}`);
  };

  const handleDuplicate = useCallback((po: PurchaseOrder) => {
    const duplicateData = {
      ...po,
      id: undefined,
      poNumber: undefined,
      status: 'Draft',
      items: (po.items || []).map((item) => ({
        itemCode: item.itemCode,
        itemName: item.itemName,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        rate: item.rate,
        gstRate: item.gstRate,
        discount: item.discount,
        discountType: item.discountType,
        hsnCode: item.hsnCode,
      })),
    };
    setEditingPO(duplicateData as any);
    setShowForm(true);
    toast.info('Duplicating PO - edit details before saving');
  }, []);

  const handleStatusChange = useCallback(
    async (po: PurchaseOrder, status: string) => {
      try {
        if (status === 'Approved') {
          await approveMutation.mutateAsync(po.id);
        } else if (status === 'Cancelled') {
          await rejectMutation.mutateAsync({ id: po.id, data: { reason: 'Cancelled' } });
        } else {
          await updateMutation.mutateAsync({ id: po.id, data: { status } });
        }
        toast.success(`Status changed to ${status}`);
      } catch (error: any) {
        toast.error(error.message || 'Failed to change status');
      }
    },
    [approveMutation, rejectMutation, updateMutation]
  );

  const columns: Column<PurchaseOrder>[] = useMemo(() => [
    {
      key: 'poNumber',
      label: 'PO Number',
      sortable: true,
      className: 'font-medium',
    },
    {
      key: 'vendorName',
      label: 'Vendor',
      sortable: true,
    },
    {
      key: 'projectName',
      label: 'Project',
      render: (value: string) => value || '-',
    },
    {
      key: 'items',
      label: 'Items',
      className: 'text-center',
      render: (_: any, row: PurchaseOrder) => row.items?.length || 0,
    },
    {
      key: 'grandTotal',
      label: 'Amount',
      sortable: true,
      className: 'text-right font-medium',
      render: (value: number, row: PurchaseOrder) => formatCurrency(value, row.currency),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => <PurchaseOrderStatusBadge status={value} />,
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value: string) => formatDate(value),
    },
  ], []);

  const kpiCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        title: 'Total POs',
        value: stats.total,
        change: 0,
        icon: <ShoppingCart className="h-4 w-4" />,
        color: 'text-blue-600',
      },
      {
        title: 'Draft',
        value: stats.draft,
        change: 0,
        icon: <FileEdit className="h-4 w-4" />,
        color: 'text-gray-600',
      },
      {
        title: 'Pending Approval',
        value: stats.pendingApproval,
        change: 0,
        icon: <Clock className="h-4 w-4" />,
        color: 'text-amber-600',
      },
      {
        title: 'Approved',
        value: stats.approved,
        change: 0,
        icon: <CheckCircle className="h-4 w-4" />,
        color: 'text-emerald-600',
      },
      {
        title: 'Sent',
        value: stats.sent,
        change: 0,
        icon: <Send className="h-4 w-4" />,
        color: 'text-blue-600',
      },
      {
        title: 'Rejected',
        value: stats.rejected,
        change: 0,
        icon: <XCircle className="h-4 w-4" />,
        color: 'text-red-600',
      },
      {
        title: 'Received',
        value: (stats.partiallyReceived || 0) + (stats.fullyReceived || 0),
        change: 0,
        icon: <PackageCheck className="h-4 w-4" />,
        color: 'text-violet-600',
      },
      {
        title: 'Total Purchase',
        value: formatCurrency(stats.totalPurchase),
        change: 0,
        icon: <DollarSign className="h-4 w-4" />,
        color: 'text-emerald-600',
      },
    ];
  }, [stats]);

  return (
    <StandardPageLayout
      title="Purchase Orders"
      subtitle="Manage and track all purchase orders"
      headerActions={
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Create Purchase Order
        </Button>
      }
      kpiCards={kpiCards.map((kpi, i) => (
        <KPICard key={i} data={kpi} />
      ))}
      kpiGridClassName="xl:grid-cols-4 2xl:grid-cols-8"
      searchValue={search}
      onSearchChange={(v) => { setSearch(v); setPage(1); }}
      searchPlaceholder="Search POs by number, vendor..."
      filters={[
        {
          key: 'status',
          label: 'Status',
          value: statusFilter,
          onChange: (v) => { setStatusFilter(v); setPage(1); },
          options: PO_STATUS_FILTER_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label })),
        },
      ]}
      onClearFilters={() => { setStatusFilter(''); setSearch(''); setPage(1); }}
    >
      <DataTable
        data={data?.data || []}
        columns={columns}
        loading={isLoading}
        showToolbar={false}
        onRowClick={handleViewDetails}
        rowActions={(po) => (
          <PurchaseOrderRowActions
            purchaseOrder={po}
            onViewDetails={handleViewDetails}
            onEdit={openEditForm}
            onDelete={handleDelete}
            onApprove={handleApprove}
            onStatusChange={handleStatusChange}
            onSendToVendor={handleSendToVendor}
            onPreviewPdf={setPreviewPdfPo}
            onDownloadPdf={handleDownloadPdf}
            onPrintPdf={handlePrintPdf}
            onDuplicate={handleDuplicate}
          />
        )}
        emptyMessage="No purchase orders found"
        pagination={data?.meta ? {
          page: data.meta.page,
          pageSize: data.meta.limit,
          total: data.meta.total,
          totalPages: data.meta.totalPages,
        } : undefined}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        onSortChange={(col, order) => { setSortBy(col); setSortOrder(order); }}
        currentSortBy={sortBy}
        currentSortOrder={sortOrder}
      />

      <PurchaseOrderForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={editingPO?.id ? handleEdit : handleCreate}
        initialData={editingPO || undefined}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <PurchaseOrderPdfViewer
        poId={previewPdfPo?.id || ''}
        poNumber={previewPdfPo?.poNumber || ''}
        open={!!previewPdfPo}
        onOpenChange={(open) => { if (!open) setPreviewPdfPo(null); }}
      />
    </StandardPageLayout>
  );
}
