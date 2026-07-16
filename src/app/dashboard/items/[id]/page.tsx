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
import { useItemMaster, useUpdateItemMaster } from '@/features/item-master/hooks/useItemMaster';
import { getCategoryPath } from '@/features/item-master/data/categoryMasterData';
import { ROUTES } from '@/core/routes';
import {
  ArrowLeft, Edit, ChevronDown, ChevronRight, Package, DollarSign,
  Percent, Scale, ExternalLink, Hash, FileText, Ruler, Weight,
} from 'lucide-react';

const ItemForm = dynamic(
  () => import('@/features/item-master/components/ItemForm').then((m) => ({ default: m.ItemForm })),
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

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;
  const { data: item, isLoading } = useItemMaster(itemId);
  const updateMutation = useUpdateItemMaster();
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
          title="Item not found"
          message="The selected item could not be loaded."
          retryLabel="Back to Items"
          onRetry={() => router.push(ROUTES.items)}
        />
      </MainLayout>
    );
  }

  const pebFlags = [
    item.isStructural && 'Structural',
    item.isCladding && 'Cladding',
    item.isAccessory && 'Accessory',
    item.isService && 'Service',
  ].filter((f): f is string => Boolean(f));

  const categoryLabel = (() => {
    if (item.itemTypeId) return getCategoryPath(item.itemTypeId);
    if (item.categoryId) return getCategoryPath(item.categoryId);
    if (item.subCategory && item.category) return `${item.category} > ${item.subCategory}`;
    return item.category || '-';
  })();

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="sm" onClick={() => (typeof window !== 'undefined' && window.history.length > 1 ? router.back() : router.push(ROUTES.items))}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Items
            </Button>
            <div className="h-4 w-px bg-border" />
            <div className="min-w-0">
              <h1 className="text-lg font-semibold truncate">{item.itemName}</h1>
              <p className="text-sm text-muted-foreground truncate">{item.itemCode} &middot; {categoryLabel}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Item
          </Button>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>{item.status}</Badge>
          {pebFlags.map((flag) => (
            <Badge key={flag} variant="outline" className="text-xs">{flag}</Badge>
          ))}
          {item.inventoryItemId && (
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => router.push(ROUTES.inventory)}>
              <Package className="h-3.5 w-3.5 mr-1.5" />
              View Inventory
              <ExternalLink className="h-3 w-3 ml-1.5" />
            </Button>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="text-[10px] sm:text-sm text-muted-foreground">Status</span>
              </div>
              <Badge variant={item.status === 'Active' ? 'default' : 'secondary'} className="text-[10px] sm:text-xs">{item.status}</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="text-[10px] sm:text-sm text-muted-foreground">Default Rate</span>
              </div>
              <p className="text-base sm:text-lg font-bold">{item.defaultRate != null ? `₹${item.defaultRate.toLocaleString()}` : '-'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="text-[10px] sm:text-sm text-muted-foreground">GST</span>
              </div>
              <p className="text-base sm:text-lg font-bold">{item.gstRate != null ? `${item.gstRate}%` : '-'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="text-[10px] sm:text-sm text-muted-foreground">Unit</span>
              </div>
              <p className="text-base sm:text-lg font-bold">{item.unit}</p>
            </CardContent>
          </Card>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-3">
          {/* Workflow */}
          <Section title="Workflow / Status Pipeline" defaultOpen={true}>
            <TrackingEngine entityType="item" entityId={itemId} />
          </Section>

          {/* Overview */}
          <Section title="Overview" defaultOpen={false}>
            <InfoGrid
              items={[
                { label: 'Item Code', value: item.itemCode, icon: <Hash className="w-3 h-3" /> },
                { label: 'Item Name', value: item.itemName },
                { label: 'Category', value: categoryLabel },
                { label: 'Unit', value: item.unit, icon: <Scale className="w-3 h-3" /> },
                { label: 'Status', value: <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>{item.status}</Badge> },
                { label: 'Rate', value: item.defaultRate != null ? `₹${item.defaultRate.toLocaleString()}` : '-', icon: <DollarSign className="w-3 h-3" /> },
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
                    { label: 'Item Code', value: item.itemCode },
                    { label: 'SKU', value: item.sku },
                    { label: 'Item Name', value: item.itemName },
                    { label: 'Category', value: categoryLabel },
                    { label: 'Description', value: item.description || '-' },
                    { label: 'Unit', value: item.unit },
                    { label: 'HSN Code', value: item.hsnCode || '-' },
                    { label: 'Manufacturer', value: item.manufacturer || '-' },
                    { label: 'Brand', value: item.brand || '-' },
                    { label: 'Status', value: <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>{item.status}</Badge> },
                  ]}
                />
              </div>

              {/* Pricing & Tax */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pricing &amp; Tax</p>
                <InfoGrid
                  items={[
                    { label: 'Default Rate', value: item.defaultRate != null ? `₹${item.defaultRate.toLocaleString()}` : '-', icon: <DollarSign className="w-3 h-3" /> },
                    { label: 'GST Rate', value: item.gstRate != null ? `${item.gstRate}%` : '-' },
                    { label: 'Tax Type', value: item.taxType || '-' },
                    { label: 'Currency', value: item.currency || 'INR' },
                  ]}
                />
              </div>

              {/* Specifications */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Specifications</p>
                <InfoGrid
                  items={[
                    { label: 'Specification', value: item.specification || '-' },
                    { label: 'Material Grade', value: item.materialGrade || item.grade || '-' },
                    { label: 'Weight', value: item.weight != null ? `${item.weight} kg` : '-', icon: <Weight className="w-3 h-3" /> },
                    { label: 'Thickness', value: item.thickness ?? item.standardDimensions?.thickness ?? '-' },
                    { label: 'Length', value: item.length ?? item.standardDimensions?.length ?? '-' },
                    { label: 'Width', value: item.width ?? item.standardDimensions?.width ?? '-' },
                  ]}
                />
              </div>

              {/* Technical */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Technical</p>
                <InfoGrid
                  items={[
                    { label: 'Technical Description', value: item.technicalDescription || '-' },
                    { label: 'Dimensions', value: item.standardDimensions ? `${item.standardDimensions.length ?? '-'} x ${item.standardDimensions.width ?? '-'} x ${item.standardDimensions.thickness ?? '-'}` : '-' },
                    { label: 'Notes', value: item.notes || '-' },
                  ]}
                />
              </div>
            </div>
          </Section>

          {/* Related Records */}
          <Section title="Related Records" defaultOpen={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(ROUTES.inventory)}>
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium">Inventory</span>
                </div>
                <p className="text-sm font-semibold">Stock Records</p>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs">View Inventory</Button>
              </div>
              <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(ROUTES.documents)}>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium">Documents</span>
                </div>
                <p className="text-sm font-semibold">Linked Documents</p>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs">View Documents</Button>
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

          {/* Documents */}
          <Section title="Documents" defaultOpen={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(ROUTES.documents)}>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-medium">All Documents</span>
                </div>
                <p className="text-xs text-muted-foreground">Open Documents module</p>
              </div>
            </div>
          </Section>

          {/* Activities */}
          <Section title="Activities & Audit Log" defaultOpen={false}>
            <ActivityAuditLog entityType="item" entityId={itemId} />
          </Section>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Item</DialogTitle></DialogHeader>
          <ItemForm
            mode="edit"
            initialData={item}
            onSubmit={(data) => updateMutation.mutate({ id: item.id, data }, { onSuccess: () => setIsEditDialogOpen(false) })}
            onCancel={() => setIsEditDialogOpen(false)}
            isSubmitting={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
