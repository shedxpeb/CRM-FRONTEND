'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { toast } from '@/components/ui/toast';
import {
  ArrowLeft,
  Edit,
  CheckCircle,
  Send,
  Download,
  Printer,
  Trash2,
  History,
} from 'lucide-react';
import {
  usePurchaseOrder,
  useUpdatePurchaseOrder,
  useApprovePurchaseOrder,
  useRejectPurchaseOrder,
  useSendPurchaseOrder,
  useDeletePurchaseOrder,
} from '@/features/purchase-order/hooks/usePurchaseOrders';
import { PurchaseOrderForm } from '@/features/purchase-order/components/PurchaseOrderForm';
import { PurchaseOrderStatusBadge } from '@/features/purchase-order/components/PurchaseOrderStatusBadge';
import { PurchaseOrderTimeline } from '@/features/purchase-order/components/PurchaseOrderTimeline';
import { PurchaseOrderApprovalDialog } from '@/features/purchase-order/components/PurchaseOrderApprovalDialog';
import { PurchaseOrderPdfViewer } from '@/features/purchase-order/components/PurchaseOrderPdfViewer';
import { cn } from '@/lib/utils';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  calculateLineAmount,
  fetchPdfBlob,
  downloadBlob,
} from '@/features/purchase-order/utils/format';
import type { PurchaseOrder as PurchaseOrderType } from '@/features/purchase-order/types/purchase-order.types';

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value || '-'}</p>
    </div>
  );
}

export default function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: po, isLoading } = usePurchaseOrder(id);
  const updateMutation = useUpdatePurchaseOrder();
  const approveMutation = useApprovePurchaseOrder();
  const rejectMutation = useRejectPurchaseOrder();
  const sendMutation = useSendPurchaseOrder();
  const deleteMutation = useDeletePurchaseOrder();

  const [activeTab, setActiveTab] = useState('details');
  const [showEditForm, setShowEditForm] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  const canEdit = po?.status === 'Draft' || po?.status === 'PendingApproval';
  const canDelete = po?.status === 'Draft' || po?.status === 'PendingApproval';
  const canApprove = po?.status === 'Draft' || po?.status === 'PendingApproval';
  const canSend = po?.status === 'Approved';

  const handleBack = () => {
    router.back();
  };

  const handleEdit = useCallback(
    async (formData: any) => {
      if (!po) return;
      try {
        await updateMutation.mutateAsync({ id: po.id, data: formData });
        setShowEditForm(false);
        toast.success('Purchase Order updated successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to update purchase order');
      }
    },
    [po, updateMutation]
  );

  const handleApprove = useCallback(async () => {
    if (!po) return;
    try {
      await approveMutation.mutateAsync(po.id);
      setShowApprovalDialog(false);
      toast.success('Purchase Order approved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve purchase order');
    }
  }, [po, approveMutation]);

  const handleReject = useCallback(
    async (reason?: string) => {
      if (!po) return;
      try {
        await rejectMutation.mutateAsync({ id: po.id, data: { reason } });
        setShowApprovalDialog(false);
        toast.success('Purchase Order rejected');
      } catch (error: any) {
        toast.error(error.message || 'Failed to reject purchase order');
      }
    },
    [po, rejectMutation]
  );

  const handleSend = useCallback(async () => {
    if (!po) return;
    try {
      await sendMutation.mutateAsync(po.id);
      toast.success('Purchase Order sent to vendor');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send purchase order');
    }
  }, [po, sendMutation]);

  const handleDelete = useCallback(async () => {
    if (!po) return;
    try {
      await deleteMutation.mutateAsync(po.id);
      toast.success('Purchase Order deleted successfully');
      router.push('/purchase/orders');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete purchase order');
    }
  }, [po, deleteMutation, router]);

  const handleDownloadPdf = useCallback(async () => {
    if (!po) return;
    try {
      const blob = await fetchPdfBlob(po.id);
      downloadBlob(blob, `${po.poNumber}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch {
      toast.error('Failed to download PDF');
    }
  }, [po]);

  const handlePrintPdf = useCallback(async () => {
    if (!po) return;
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
  }, [po]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!po) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Purchase Orders
        </Button>
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-muted-foreground">Purchase Order not found.</p>
        </div>
      </div>
    );
  }

  const timeline = po.timeline || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2 self-start">
        <ArrowLeft className="h-4 w-4" />
        Back to Purchase Orders
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{po.poNumber}</h1>
            <PurchaseOrderStatusBadge status={po.status} />
            {po.revision > 0 && (
              <Badge variant="outline">Rev {po.revision}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Vendor: {po.vendorName}
            {po.projectName && <> &middot; Project: {po.projectName}</>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => setShowEditForm(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {canApprove && (
            <Button variant="outline" size="sm" onClick={() => setShowApprovalDialog(true)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          )}
          {canSend && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSend}
              disabled={sendMutation.isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              {sendMutation.isPending ? 'Sending...' : 'Mark as Sent'}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowPdfViewer(true)}>
            <Download className="mr-2 h-4 w-4" />
            Preview PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrintPdf}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowTimeline(true)}>
            <History className="mr-2 h-4 w-4" />
            Timeline
          </Button>
          {canDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="financial">Financial Summary</TabsTrigger>
          <TabsTrigger value="terms">Terms & Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Purchase Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <DetailField label="PO Number" value={po.poNumber} />
                <DetailField label="Vendor" value={po.vendorName} />
                <DetailField label="Project" value={po.projectName} />
                <DetailField label="Warehouse" value={po.warehouseName} />
                <DetailField label="Payment Terms" value={po.paymentTerms} />
                <DetailField label="Expected Delivery" value={formatDate(po.expectedDeliveryDate)} />
                <DetailField label="Status" value={<PurchaseOrderStatusBadge status={po.status} />} />
                <DetailField label="Currency" value={po.currency} />
                <DetailField label="Grand Total" value={formatCurrency(po.grandTotal, po.currency)} />
                <DetailField label="Created By" value={po.createdBy} />
                <DetailField label="Created Date" value={formatDateTime(po.createdAt)} />
                <DetailField label="Updated By" value={po.updatedBy} />
                <DetailField label="Updated Date" value={formatDateTime(po.updatedAt)} />
                {po.sentAt && (
                  <DetailField label="Sent Date" value={formatDateTime(po.sentAt)} />
                )}
                {po.approvedBy && (
                  <DetailField label="Approved By" value={po.approvedBy} />
                )}
                {po.approvedAt && (
                  <DetailField label="Approved Date" value={formatDateTime(po.approvedAt)} />
                )}
              </div>
              {po.revision > 0 && po.revisionNote && (
                <div className="mt-6 p-4 rounded-lg bg-muted/50">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Revision Note</p>
                  <p className="text-sm">{po.revisionNote}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Line Items ({po.items?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>HSN</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Discount</TableHead>
                      <TableHead className="text-right">GST%</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(!po.items || po.items.length === 0) ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                          No items found
                        </TableCell>
                      </TableRow>
                    ) : (
                      po.items.map((item, index) => {
                        const lineAmount = calculateLineAmount(item);
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                            <TableCell className="font-medium">{item.itemCode}</TableCell>
                            <TableCell>{item.description || item.itemName || '-'}</TableCell>
                            <TableCell>{item.hsnCode || '-'}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell>{item.unit}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.rate, po.currency)}</TableCell>
                            <TableCell className="text-right">
                              {item.discount > 0
                                ? item.discountType === 'Percentage'
                                  ? `${item.discount}%`
                                  : formatCurrency(item.discount, po.currency)
                                : '-'}
                            </TableCell>
                            <TableCell className="text-right">{item.gstRate ? `${item.gstRate}%` : '-'}</TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.total || lineAmount, po.currency)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-md space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(po.subtotal, po.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span>-{formatCurrency(po.discount, po.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(po.tax, po.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Freight</span>
                  <span>{formatCurrency(po.freight, po.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Packing Charges</span>
                  <span>{formatCurrency(po.packingCharges, po.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping Charges</span>
                  <span>{formatCurrency(po.shippingCharges, po.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Other Charges</span>
                  <span>{formatCurrency(po.otherCharges, po.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Round Off</span>
                  <span>{formatCurrency(po.roundOff, po.currency)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Grand Total</span>
                  <span>{formatCurrency(po.grandTotal, po.currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terms" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {po.notes && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{po.notes}</p>
                </CardContent>
              </Card>
            )}
            {po.terms && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Terms</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{po.terms}</p>
                </CardContent>
              </Card>
            )}
            {po.internalNotes && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Internal Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{po.internalNotes}</p>
                </CardContent>
              </Card>
            )}
            {!po.notes && !po.terms && !po.internalNotes && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground text-sm">
                  No notes, terms, or internal notes recorded.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <PurchaseOrderForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        onSubmit={handleEdit}
        initialData={po}
        isSubmitting={updateMutation.isPending}
      />

      <PurchaseOrderApprovalDialog
        open={showApprovalDialog}
        onOpenChange={setShowApprovalDialog}
        po={po}
        onApprove={handleApprove}
        onReject={handleReject}
        isProcessing={approveMutation.isPending || rejectMutation.isPending}
      />

      <PurchaseOrderPdfViewer
        poId={po.id}
        poNumber={po.poNumber}
        open={showPdfViewer}
        onOpenChange={setShowPdfViewer}
      />

      <Drawer open={showTimeline} onOpenChange={setShowTimeline}>
        <DrawerContent className="min-w-[420px]">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <DrawerTitle>Timeline &mdash; {po.poNumber}</DrawerTitle>
              <DrawerClose onClick={() => setShowTimeline(false)} />
            </div>
          </DrawerHeader>
          <div className="px-6 py-4 overflow-y-auto max-h-[70vh]">
            <PurchaseOrderTimeline timeline={timeline} />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
