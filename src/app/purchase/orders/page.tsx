'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Filter } from 'lucide-react';
import { purchaseOrderApi, PurchaseOrder, PurchaseOrderQuery } from '@/features/purchase-order';
import { PurchaseOrderForm } from '@/features/purchase-order/components/PurchaseOrderForm';
import { PurchaseOrderRowActions } from '@/features/purchase-order/components/PurchaseOrderRowActions';
import { toast } from '@/components/ui/toast';
import { downloadPurchaseOrderPDF, getPurchaseOrderPDFBlob } from '@/features/purchase-order/utils/generatePurchaseOrderPDF';

export default function PurchaseOrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [vendorFilter, setVendorFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const query: PurchaseOrderQuery = {
    page,
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    filter: {
      search: search || undefined,
      status: statusFilter || undefined,
      vendorId: vendorFilter || undefined,
    },
  };

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-orders', query],
    queryFn: () => purchaseOrderApi.getAll(query),
  });

  const { data: stats } = useQuery({
    queryKey: ['po-stats'],
    queryFn: () => purchaseOrderApi.getStats(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof purchaseOrderApi.create>[0]) => purchaseOrderApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['po-stats'] });
      setShowForm(false);
      toast.success('Purchase Order created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create purchase order');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof purchaseOrderApi.update>[1] }) =>
      purchaseOrderApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      setShowForm(false);
      setEditingPO(null);
      toast.success('Purchase Order updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update purchase order');
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => purchaseOrderApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['po-stats'] });
      toast.success('Purchase Order approved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve purchase order');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => purchaseOrderApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['po-stats'] });
      toast.success('Purchase Order deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete purchase order');
    },
  });

  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync(data);
    } catch (error) {
      console.error('Create error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingPO) {
        await updateMutation.mutateAsync({ id: editingPO.id, data });
      }
    } catch (error) {
      console.error('Edit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (po: PurchaseOrder) => {
    await deleteMutation.mutateAsync(po.id);
  };

  const handleApprove = async (po: PurchaseOrder) => {
    await approveMutation.mutateAsync(po.id);
  };

  const handleStatusChange = async (po: PurchaseOrder, status: string) => {
    await updateMutation.mutateAsync({ id: po.id, data: { status } });
  };

  const handleGeneratePDF = (po: PurchaseOrder) => {
    try {
      // TODO: Fetch organization data from API
      const organizationData = {
        name: 'PEB CRM',
        logo: undefined,
        gst: '27AAPFU0939J1ZP',
        pan: 'AAPFU0939J',
        address: '123 Business Park',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        pincode: '400001',
        phone: '+91 9876543210',
        email: 'admin@pebcrm.com',
        website: 'www.pebcrm.com',
      };
      
      downloadPurchaseOrderPDF(po, { organization: organizationData });
      toast.success('PDF generated successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handleSendWhatsApp = async (po: PurchaseOrder) => {
    try {
      // TODO: Fetch organization data from API
      const organizationData = {
        name: 'PEB CRM',
        logo: undefined,
        gst: '27AAPFU0939J1ZP',
        pan: 'AAPFU0939J',
        address: '123 Business Park',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        pincode: '400001',
        phone: '+91 9876543210',
        email: 'admin@pebcrm.com',
        website: 'www.pebcrm.com',
      };
      
      const pdfBlob = getPurchaseOrderPDFBlob(po, { organization: organizationData });
      const file = new File([pdfBlob], `PO-${po.poNumber}.pdf`, { type: 'application/pdf' });
      
      // Create WhatsApp message
      const message = `Dear ${po.vendorName},\n\nPlease find attached Purchase Order ${po.poNumber} for your reference.\n\nTotal Amount: ₹${po.grandTotal.toLocaleString()}\n\nRegards,\nPEB CRM`;
      
      // Create WhatsApp URL with file (this will open WhatsApp Web/desktop app)
      // Note: Direct file sharing via WhatsApp Web API has limitations
      // This implementation opens WhatsApp with the message, user needs to attach file manually
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      toast.success('WhatsApp opened. Please attach the PDF manually.');
      
      // Also download the PDF for manual attachment
      downloadPurchaseOrderPDF(po, { organization: organizationData });
    } catch (error) {
      console.error('WhatsApp send error:', error);
      toast.error('Failed to send via WhatsApp');
    }
  };

  const openEditForm = (po: PurchaseOrder) => {
    setEditingPO(po);
    setShowForm(true);
  };

  const openCreateForm = () => {
    setEditingPO(null);
    setShowForm(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'PendingApproval':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Sent':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage your purchase orders</p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Create PO
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="text-sm font-medium text-muted-foreground">Total POs</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="text-sm font-medium text-muted-foreground">Draft</div>
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="text-sm font-medium text-muted-foreground">Approved</div>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="text-sm font-medium text-muted-foreground">Pending Approval</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingApproval}</div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="text-sm font-medium text-muted-foreground">Total Purchase</div>
            <div className="text-2xl font-bold">₹{(stats.totalPurchase / 100000).toFixed(1)}L</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search POs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="PendingApproval">Pending Approval</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Sent">Sent</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO Number</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No purchase orders found
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((po: PurchaseOrder) => (
                <TableRow key={po.id}>
                  <TableCell className="font-medium">{po.poNumber}</TableCell>
                  <TableCell>{po.vendorName}</TableCell>
                  <TableCell>{po.projectName || '-'}</TableCell>
                  <TableCell>{po.items?.length || 0}</TableCell>
                  <TableCell>₹{po.grandTotal.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}>
                      {po.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(po.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <PurchaseOrderRowActions
                      purchaseOrder={po}
                      onEdit={openEditForm}
                      onDelete={handleDelete}
                      onApprove={handleApprove}
                      onStatusChange={handleStatusChange}
                      onGeneratePDF={handleGeneratePDF}
                      onSendWhatsApp={handleSendWhatsApp}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {data.meta.page} of {data.meta.totalPages} ({data.meta.total} total)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
              disabled={page === data.meta.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <PurchaseOrderForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={editingPO ? handleEdit : handleCreate}
        initialData={editingPO || undefined}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
