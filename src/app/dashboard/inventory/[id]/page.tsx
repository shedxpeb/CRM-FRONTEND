'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MainLayout } from '@/layouts/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DataTable, Column } from '@/components/data-table/DataTable';
import { CardSkeleton } from '@/components/loading/CardSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { InventoryActivityTimeline } from '@/features/inventory/components/InventoryActivityTimeline';
import { InventoryCustomFields } from '@/features/inventory/components/InventoryCustomFields';
import {
  useInventoryItem,
  useUpdateInventoryItem,
  useInventoryConfiguration,
  useInventoryActivities,
  useStockMovementHistory,
} from '@/features/inventory/hooks/useInventory';
import { InventoryItem, StockMovement, CreateInventoryItemDto } from '@/features/inventory/types';
import { getStockStatusVariant, getMovementTypeVariant } from '@/features/inventory/constants';
import { MOCK_PROJECT_ALLOCATIONS } from '@/features/inventory/data/mockInventoryData';
import { ROUTES } from '@/core/routes';
import {
  ArrowLeft,
  Edit,
  Package,
  AlertTriangle,
  Warehouse,
  ExternalLink,
  Truck,
  Building2,
} from 'lucide-react';

const InventoryItemForm = dynamic(
  () => import('@/features/inventory/components/InventoryItemForm').then((m) => ({ default: m.InventoryItemForm })),
  { loading: () => <CardSkeleton />, ssr: false }
);

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium break-words">{value ?? '-'}</p>
    </div>
  );
}

export default function InventoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: item, isLoading, refetch } = useInventoryItem(id);
  const inventoryConfig = useInventoryConfiguration();
  const updateMutation = useUpdateInventoryItem();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { data: activities } = useInventoryActivities(id, activeTab === 'activity');
  const { data: movements } = useStockMovementHistory(id, activeTab === 'stock-history');

  if (isLoading) {
    return (
      <MainLayout>
        <CardSkeleton count={4} />
      </MainLayout>
    );
  }

  if (!item) {
    return (
      <MainLayout>
        <ErrorState
          title="Inventory entry not found"
          message="The selected inventory record could not be loaded."
          retryLabel="Back to Inventory"
          onRetry={() => router.push(ROUTES.inventory)}
        />
      </MainLayout>
    );
  }

  const needsReorder = item.currentStock <= item.reorderLevel;

  const movementColumns: Column<StockMovement>[] = [
    { key: 'movementNumber', label: 'Movement #', sortable: true, render: (v) => <span className="font-mono text-xs">{v}</span> },
    { key: 'type', label: 'Type', render: (v) => <Badge variant={getMovementTypeVariant(v as StockMovement['type'])} className="text-[10px]">{v}</Badge> },
    { key: 'quantity', label: 'Qty', sortable: true, render: (v) => <span className="text-xs font-medium">{Number(v).toLocaleString()}</span> },
    { key: 'warehouse', label: 'Warehouse' },
    { key: 'referenceNumber', label: 'Reference', render: (v) => <span className="text-xs font-mono">{v || '-'}</span> },
    { key: 'date', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '-' },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.inventory)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Inventory
            </Button>
            <div className="h-4 w-px bg-border" />
            <div className="min-w-0">
              <h1 className="text-lg font-semibold truncate">{item.itemName}</h1>
              <p className="text-sm text-muted-foreground truncate">
                {item.itemCode} · {item.warehouseName} · {item.category || 'No category'}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Inventory
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={getStockStatusVariant(item.status)}>{item.status}</Badge>
          {item.itemTypeClass && <Badge variant="outline">{item.itemTypeClass}</Badge>}
          {needsReorder && <Badge variant="destructive">Reorder Required</Badge>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground mb-1">Current Stock</p>
              <p className="text-base font-bold">{Number(item.currentStock).toLocaleString()} {item.unit}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground mb-1">Available</p>
              <p className="text-base font-bold text-green-700">{Number(item.availableStock).toLocaleString()} {item.unit}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground mb-1">Reserved</p>
              <p className="text-base font-bold">{Number(item.reservedStock).toLocaleString()} {item.unit}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground mb-1">Incoming</p>
              <p className="text-base font-bold">{Number(item.incomingStock ?? 0).toLocaleString()} {item.unit}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground mb-1">Outgoing</p>
              <p className="text-base font-bold">{Number(item.outgoingStock ?? 0).toLocaleString()} {item.unit}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground mb-1">Stock Value</p>
              <p className="text-base font-bold">₹{Number(item.totalValue).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="warehouse">Warehouse</TabsTrigger>
            <TabsTrigger value="stock-history">Movement</TabsTrigger>
            <TabsTrigger value="references">References</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Item Reference (Read-only)
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <Field label="Item Code" value={<span className="font-mono">{item.itemCode}</span>} />
                  <Field label="Item Master ID" value={item.itemMasterId} />
                  <Field label="Category" value={item.category} />
                  <Field label="Brand" value={item.brand} />
                  <Field label="Item Type" value={item.itemTypeClass} />
                  <Field label="Unit" value={item.unit} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Reorder Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <Field label="Minimum Stock" value={`${Number(item.minimumStock).toLocaleString()} ${item.unit}`} />
                  <Field label="Reorder Level" value={`${Number(item.reorderLevel).toLocaleString()} ${item.unit}`} />
                  <Field label="Reorder Quantity" value={`${Number(item.reorderQuantity ?? 0).toLocaleString()} ${item.unit}`} />
                  <Field label="Safety Stock" value={`${Number(item.safetyStock).toLocaleString()} ${item.unit}`} />
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardContent className="pt-6">
                <InventoryCustomFields mode="view" fields={inventoryConfig.customFields} values={item.customFields} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stock">
            <Card>
              <CardHeader><CardTitle className="text-base">Stock Information</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field label="Current Stock" value={`${Number(item.currentStock).toLocaleString()} ${item.unit}`} />
                <Field label="Reserved Stock" value={`${Number(item.reservedStock).toLocaleString()} ${item.unit}`} />
                <Field label="Issued Stock" value={`${Number(item.issuedStock).toLocaleString()} ${item.unit}`} />
                <Field label="Available Stock" value={`${Number(item.availableStock).toLocaleString()} ${item.unit}`} />
                <Field label="Incoming Stock" value={`${Number(item.incomingStock ?? 0).toLocaleString()} ${item.unit}`} />
                <Field label="Outgoing Stock" value={`${Number(item.outgoingStock ?? 0).toLocaleString()} ${item.unit}`} />
                <Field label="Purchase Rate" value={item.purchaseRate != null ? `₹${item.purchaseRate.toLocaleString()}` : '-'} />
                <Field label="Total Value" value={`₹${Number(item.totalValue).toLocaleString()}`} />
                <Field
                  label="Last Movement"
                  value={item.lastMovementDate ? new Date(item.lastMovementDate).toLocaleDateString('en-IN') : '-'}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="warehouse">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Warehouse className="h-4 w-4" />
                  Warehouse Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Field label="Warehouse" value={item.warehouseName} />
                <Field label="Bin Location" value={item.binLocation} />
                <Field label="Warehouse ID" value={item.warehouseId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stock-history">
            <Card>
              <CardHeader><CardTitle className="text-base">Movement History</CardTitle></CardHeader>
              <CardContent>
                <DataTable columns={movementColumns} data={movements || []} rowIdKey="id" compact showToolbar={false} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="references">
            <Card>
              <CardHeader><CardTitle className="text-base">Cross-Module References</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.items)}>
                    Item Master <ExternalLink className="h-3 w-3 ml-1.5" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.documentsEstimates)}>
                    Estimates <ExternalLink className="h-3 w-3 ml-1.5" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.documentsProposals)}>
                    Proposals <ExternalLink className="h-3 w-3 ml-1.5" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.documentsQuotations)}>
                    Quotations <ExternalLink className="h-3 w-3 ml-1.5" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.finance)}>
                    Finance <ExternalLink className="h-3 w-3 ml-1.5" />
                  </Button>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Project Allocations
                  </h4>
                  <div className="space-y-2">
                    {MOCK_PROJECT_ALLOCATIONS.map((alloc) => (
                      <div key={alloc.projectId} className="p-3 border rounded-lg text-sm">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="font-medium">{alloc.projectName}</p>
                            <p className="text-xs text-muted-foreground">{alloc.customerName}</p>
                          </div>
                          <Badge variant={alloc.status === 'Active' ? 'default' : 'secondary'} className="text-[10px]">{alloc.status}</Badge>
                        </div>
                        <p className="text-xs mt-2 text-muted-foreground">
                          Reserved: {alloc.reservedQuantity} · Issued: {alloc.issuedQuantity} · Balance: {alloc.balanceQuantity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Vendor Reference
                  </h4>
                  <p className="text-sm text-muted-foreground">Supplier linkage available when backend is connected.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <InventoryActivityTimeline activities={activities || []} />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Inventory Entry</DialogTitle></DialogHeader>
          <InventoryItemForm
            mode="edit"
            initialData={item}
            onSubmit={(data) =>
              updateMutation.mutate(
                { id: item.id, data },
                {
                  onSuccess: () => {
                    setIsEditDialogOpen(false);
                    refetch();
                  },
                }
              )
            }
            onCancel={() => setIsEditDialogOpen(false)}
            isLoading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
