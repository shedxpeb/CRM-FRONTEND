'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MainLayout } from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CardSkeleton } from '@/components/loading/CardSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { TrackingEngine } from '@/components/tracking/TrackingEngine';
import { ActivityAuditLog } from '@/components/tracking/ActivityAuditLog';
import {
  useInventoryItem,
  useUpdateInventoryItem,
} from '@/features/inventory/hooks/useInventory';
import { getStockStatusVariant } from '@/features/inventory/constants';
import { ROUTES } from '@/core/routes';
import {
  ArrowLeft, Edit, ChevronDown, ChevronRight, Package, AlertTriangle,
  DollarSign, Warehouse, Building2, ExternalLink, Truck, Scale, Box, Hash,
} from 'lucide-react';

const InventoryItemForm = dynamic(
  () => import('@/features/inventory/components/InventoryItemForm').then((m) => ({ default: m.InventoryItemForm })),
  { loading: () => <CardSkeleton />, ssr: false }
);

function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold bg-muted/30 hover:bg-muted/50 transition-colors">
        {title}
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

function InfoGrid({ items }: { items: { label: string; value: React.ReactNode; icon?: React.ReactNode }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(item => (
        <div key={item.label} className="space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">{item.icon}{item.label}</p>
          <p className="text-sm font-medium">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function formatDate(value?: Date | string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function InventoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: item, isLoading, refetch } = useInventoryItem(id);
  const updateMutation = useUpdateInventoryItem();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="sm" onClick={() => (typeof window !== 'undefined' && window.history.length > 1 ? router.back() : router.push(ROUTES.inventory))}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Inventory
            </Button>
            <div className="h-4 w-px bg-border" />
            <div className="min-w-0">
              <h1 className="text-lg font-semibold truncate">{item.itemName}</h1>
              <p className="text-sm text-muted-foreground truncate">{item.itemCode} &middot; {item.warehouseName}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Inventory
          </Button>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={getStockStatusVariant(item.status)}>{item.status}</Badge>
          {item.itemTypeClass && <Badge variant="outline">{item.itemTypeClass}</Badge>}
          {needsReorder && <Badge variant="destructive">Reorder Required</Badge>}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="text-[10px] sm:text-sm text-muted-foreground">Current Stock</span>
              </div>
              <p className="text-base sm:text-lg font-bold">{Number(item.currentStock).toLocaleString()} {item.unit}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Box className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="text-[10px] sm:text-sm text-muted-foreground">Available</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-green-700">{Number(item.availableStock).toLocaleString()} {item.unit}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="text-[10px] sm:text-sm text-muted-foreground">Incoming</span>
              </div>
              <p className="text-base sm:text-lg font-bold">{Number(item.incomingStock ?? 0).toLocaleString()} {item.unit}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="text-[10px] sm:text-sm text-muted-foreground">Outgoing</span>
              </div>
              <p className="text-base sm:text-lg font-bold">{Number(item.outgoingStock ?? 0).toLocaleString()} {item.unit}</p>
            </CardContent>
          </Card>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-3">
          {/* Workflow / Status Pipeline */}
          <Section title="Workflow / Status Pipeline" defaultOpen={true}>
            <TrackingEngine entityType="inventory" entityId={id} />
          </Section>

          {/* Overview */}
          <Section title="Overview" defaultOpen={false}>
            <InfoGrid
              items={[
                { label: 'Item Name', value: item.itemName, icon: <Package className="w-3 h-3" /> },
                { label: 'Item Code', value: item.itemCode, icon: <Hash className="w-3 h-3" /> },
                { label: 'Category', value: item.category || '-' },
                { label: 'Warehouse', value: item.warehouseName, icon: <Warehouse className="w-3 h-3" /> },
                { label: 'Unit', value: item.unit, icon: <Scale className="w-3 h-3" /> },
              ]}
            />
          </Section>

          {/* Information */}
          <Section title="Information" defaultOpen={false}>
            <div className="space-y-6">
              {/* Basic */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Basic</p>
                <InfoGrid
                  items={[
                    { label: 'Item Code', value: <span className="font-mono">{item.itemCode}</span> },
                    { label: 'Item Name', value: item.itemName },
                    { label: 'Category', value: item.category || '-' },
                    { label: 'Unit', value: item.unit },
                    { label: 'Warehouse', value: item.warehouseName },
                    { label: 'Bin Location', value: item.binLocation || '-' },
                  ]}
                />
              </div>

              {/* Stock */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Stock</p>
                <InfoGrid
                  items={[
                    { label: 'Current Stock', value: `${Number(item.currentStock).toLocaleString()} ${item.unit}` },
                    { label: 'Available Stock', value: `${Number(item.availableStock).toLocaleString()} ${item.unit}` },
                    { label: 'Reserved Stock', value: `${Number(item.reservedStock).toLocaleString()} ${item.unit}` },
                    { label: 'Issued Stock', value: `${Number(item.issuedStock).toLocaleString()} ${item.unit}` },
                    { label: 'Min Stock', value: `${Number(item.minimumStock).toLocaleString()} ${item.unit}` },
                    { label: 'Reorder Level', value: `${Number(item.reorderLevel).toLocaleString()} ${item.unit}` },
                    { label: 'Reorder Qty', value: `${Number(item.reorderQuantity ?? 0).toLocaleString()} ${item.unit}` },
                    { label: 'Safety Stock', value: `${Number(item.safetyStock).toLocaleString()} ${item.unit}` },
                    { label: 'Status', value: <Badge variant={getStockStatusVariant(item.status)}>{item.status}</Badge> },
                  ]}
                />
              </div>

              {/* Pricing */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pricing</p>
                <InfoGrid
                  items={[
                    { label: 'Purchase Rate', value: item.purchaseRate != null ? `₹${item.purchaseRate.toLocaleString()}` : '-', icon: <DollarSign className="w-3 h-3" /> },
                    { label: 'Total Value', value: `₹${Number(item.totalValue).toLocaleString()}`, icon: <DollarSign className="w-3 h-3" /> },
                  ]}
                />
              </div>

              {/* Specs */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Specifications</p>
                <InfoGrid
                  items={[
                    { label: 'Brand', value: item.brand || '-' },
                    { label: 'Item Type', value: item.itemTypeClass || '-' },
                    { label: 'Last Movement', value: formatDate(item.lastMovementDate) },
                  ]}
                />
              </div>
            </div>
          </Section>

          {/* Related Records */}
          <Section title="Related Records" defaultOpen={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(ROUTES.items)}>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium">Item Master</span>
                </div>
                <p className="text-sm font-semibold">{item.itemMasterId}</p>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs">View Item Master</Button>
              </div>
              <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(ROUTES.documentsEstimates)}>
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium">Estimates</span>
                </div>
                <p className="text-sm font-semibold">Linked Documents</p>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs">View Estimates</Button>
              </div>
              <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(ROUTES.finance)}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium">Finance</span>
                </div>
                <p className="text-sm font-semibold">Financial Records</p>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs">View Finance</Button>
              </div>
            </div>
          </Section>

          {/* Activities & Audit Log */}
          <Section title="Activities & Audit Log" defaultOpen={false}>
            <ActivityAuditLog entityType="inventory" entityId={id} />
          </Section>
        </div>
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
