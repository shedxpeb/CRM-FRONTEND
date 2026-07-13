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
import { CardSkeleton } from '@/components/loading/CardSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { ItemCustomFields } from '@/features/item-master/components/ItemCustomFields';
import { useItemMaster, useUpdateItemMaster, useItemConfiguration } from '@/features/item-master/hooks/useItemMaster';
import { getCategoryPath } from '@/features/item-master/data/categoryMasterData';
import { ItemMaster } from '@/features/item-master/types';
import { ROUTES } from '@/core/routes';
import { ArrowLeft, Edit, Package, ExternalLink } from 'lucide-react';

const ItemForm = dynamic(
  () => import('@/features/item-master/components/ItemForm').then((m) => ({ default: m.ItemForm })),
  { loading: () => <CardSkeleton />, ssr: false }
);

function getItemCategoryLabel(item: ItemMaster): string {
  if (item.itemTypeId) return getCategoryPath(item.itemTypeId);
  if (item.categoryId) return getCategoryPath(item.categoryId);
  if (item.subCategory && item.category) return `${item.category} > ${item.subCategory}`;
  return item.category || '-';
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium break-words">{value ?? '-'}</p>
    </div>
  );
}

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;
  const { data: item, isLoading } = useItemMaster(itemId);
  const itemConfig = useItemConfiguration();
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

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.items)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Items
            </Button>
            <div className="h-4 w-px bg-border" />
            <div className="min-w-0">
              <h1 className="text-lg font-semibold truncate">{item.itemName}</h1>
              <p className="text-sm text-muted-foreground truncate">{item.itemCode} · {getItemCategoryLabel(item)}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Item
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>{item.status}</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground mb-1">Default Rate</p>
              <p className="text-base font-bold">{item.defaultRate != null ? `₹${item.defaultRate.toLocaleString()}` : '-'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground mb-1">GST</p>
              <p className="text-base font-bold">{item.gstRate != null ? `${item.gstRate}%` : '-'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground mb-1">Unit</p>
              <p className="text-base font-bold">{item.unit}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-2">
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

        <Tabs defaultValue="overview">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="specs" className="text-xs">Specifications</TabsTrigger>
            <TabsTrigger value="pricing" className="text-xs">Pricing & Tax</TabsTrigger>
            <TabsTrigger value="references" className="text-xs">References</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Item Information</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Item Code" value={item.itemCode} />
                <Field label="SKU" value={item.sku} />
                <Field label="Category" value={getItemCategoryLabel(item)} />
                <Field label="Brand" value={item.brand} />
                <Field label="Material Grade" value={item.materialGrade || item.grade} />
                <Field label="HSN Code" value={item.hsnCode} />
                <Field label="Item Type Class" value={item.itemTypeClass} />
                <Field label="Manufacturer" value={item.manufacturer} />
              </CardContent>
            </Card>
            {itemConfig.customFields.length > 0 && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Custom Fields</CardTitle></CardHeader>
                <CardContent>
                  <ItemCustomFields mode="view" fields={itemConfig.customFields} values={item.customFields ?? {}} />
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Description</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Field label="Description" value={item.description} />
                <Field label="Notes" value={item.notes} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specs" className="mt-4">
            <Card>
              <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Specification" value={item.specification} />
                <Field label="Technical Description" value={item.technicalDescription} />
                <Field label="Weight (per unit)" value={item.weight} />
                <Field label="Thickness" value={item.thickness ?? item.standardDimensions?.thickness} />
                <Field label="Length" value={item.length ?? item.standardDimensions?.length} />
                <Field label="Width" value={item.width ?? item.standardDimensions?.width} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="mt-4">
            <Card>
              <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Default Rate" value={item.defaultRate != null ? `₹${item.defaultRate.toLocaleString()}` : '-'} />
                <Field label="GST %" value={item.gstRate} />
                <Field label="Tax Type" value={item.taxType} />
                <Field label="Currency" value={item.currency || 'INR'} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="references" className="mt-4">
            <Card>
              <CardContent className="pt-6 space-y-3 text-sm text-muted-foreground">
                <p>Inventory, documents, and finance modules reference this item by ID. Links are read-only.</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.documents)}>
                    View Documents
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.finance)}>
                    View Finance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
