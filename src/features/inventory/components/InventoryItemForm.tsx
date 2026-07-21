'use client';

import { useState, memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InventoryItem, StockStatus } from '@/features/inventory/types';
import { useWarehouses, useInventoryConfiguration } from '@/features/inventory/hooks/useInventory';
import { useItemMasters } from '@/features/item-master/hooks/useItemMaster';
import { InventoryCustomFields } from './InventoryCustomFields';
import { X, Lock } from 'lucide-react';

interface InventoryItemFormProps {
  initialData?: Partial<InventoryItem>;
  onSubmit: (data: Partial<InventoryItem>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

function ReadOnlyField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
        <Lock className="h-3 w-3" />
        {label}
      </label>
      <div className="px-3 py-2 text-sm rounded-md border bg-muted/50">{value || '-'}</div>
    </div>
  );
}

const InventoryItemForm = memo(function InventoryItemForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  mode = initialData?.id ? 'edit' : 'create',
}: InventoryItemFormProps) {
  const { data: warehouses } = useWarehouses();
  const { data: itemMasters } = useItemMasters();
  const inventoryConfig = useInventoryConfiguration();
  const isEdit = mode === 'edit';

  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    itemCode: '',
    itemMasterId: '',
    itemName: '',
    unit: undefined,
    currentStock: 0,
    reservedStock: 0,
    issuedStock: 0,
    incomingStock: 0,
    outgoingStock: 0,
    minimumStock: 0,
    reorderLevel: 0,
    reorderQuantity: 0,
    safetyStock: 0,
    binLocation: '',
    purchaseRate: 0,
    warehouseId: '',
    status: 'In Stock',
    customFields: {},
    ...initialData,
  });

  const handleChange = useCallback((field: keyof InventoryItem, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCustomFieldChange = useCallback((key: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      customFields: { ...prev.customFields, [key]: value },
    }));
  }, []);

  const handleMasterSelect = useCallback(
    (masterId: string) => {
      const master = itemMasters?.find((m) => m.id === masterId);
      if (!master) return;
      setFormData((prev) => ({
        ...prev,
        itemMasterId: master.id,
        itemCode: master.itemCode,
        itemName: master.itemName,
        unit: prev.unit ?? (master.unit as InventoryItem['unit']),
        category: master.category,
        brand: master.brand,
        itemTypeClass: master.itemTypeClass,
        purchaseRate: master.defaultRate ?? prev.purchaseRate,
      }));
    },
    [itemMasters]
  );

  const handleWarehouseSelect = useCallback(
    (warehouseId: string) => {
      const wh = warehouses?.find((w) => w.id === warehouseId);
      setFormData((prev) => ({
        ...prev,
        warehouseId,
        warehouseName: wh?.name ?? prev.warehouseName,
      }));
    },
    [warehouses]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const availableStock =
      (formData.currentStock ?? 0) - (formData.reservedStock ?? 0) - (formData.issuedStock ?? 0);
    const totalValue = (formData.currentStock ?? 0) * (formData.purchaseRate ?? 0);
    onSubmit({
      ...formData,
      availableStock,
      totalValue,
      lastUpdated: new Date(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Item Reference</CardTitle>
          <p className="text-xs text-muted-foreground">Product data is owned by Item Master and cannot be edited here.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEdit ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Item Master *</label>
              <Select value={formData.itemMasterId || ''} onValueChange={handleMasterSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose item from catalog" />
                </SelectTrigger>
                <SelectContent>
                  {(itemMasters ?? []).map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.itemCode} — {m.itemName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReadOnlyField label="Item Code" value={formData.itemCode} />
            <ReadOnlyField label="Item Name" value={formData.itemName} />
            <ReadOnlyField label="Category" value={formData.category} />
            <ReadOnlyField label="Brand" value={formData.brand} />
            <ReadOnlyField label="Item Type" value={formData.itemTypeClass} />
            <ReadOnlyField label="Unit" value={formData.unit} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Stock Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Stock *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.currentStock ?? 0}
                onChange={(e) => handleChange('currentStock', Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reserved Stock</label>
              <Input
                type="number"
                step="0.01"
                value={formData.reservedStock ?? 0}
                onChange={(e) => handleChange('reservedStock', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Issued Stock</label>
              <Input
                type="number"
                step="0.01"
                value={formData.issuedStock ?? 0}
                onChange={(e) => handleChange('issuedStock', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Incoming Stock</label>
              <Input
                type="number"
                step="0.01"
                value={formData.incomingStock ?? 0}
                onChange={(e) => handleChange('incomingStock', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Outgoing Stock</label>
              <Input
                type="number"
                step="0.01"
                value={formData.outgoingStock ?? 0}
                onChange={(e) => handleChange('outgoingStock', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Purchase Rate (₹)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.purchaseRate ?? 0}
                onChange={(e) => handleChange('purchaseRate', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Stock Status</label>
              <Select
                value={formData.status}
                onValueChange={(v) => handleChange('status', v as StockStatus)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {inventoryConfig.stockStatuses.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Warehouse & Reorder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Warehouse *</label>
              <Select value={formData.warehouseId || ''} onValueChange={handleWarehouseSelect}>
                <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                <SelectContent>
                  {(warehouses ?? []).map((wh) => (
                    <SelectItem key={wh.id} value={wh.id}>
                      {wh.name} ({wh.warehouseCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bin Location</label>
              <Input
                value={formData.binLocation || ''}
                onChange={(e) => handleChange('binLocation', e.target.value)}
                placeholder="e.g., A-12-03"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Stock *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.minimumStock ?? 0}
                onChange={(e) => handleChange('minimumStock', Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reorder Level *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.reorderLevel ?? 0}
                onChange={(e) => handleChange('reorderLevel', Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reorder Quantity</label>
              <Input
                type="number"
                step="0.01"
                value={formData.reorderQuantity ?? 0}
                onChange={(e) => handleChange('reorderQuantity', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Safety Stock *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.safetyStock ?? 0}
                onChange={(e) => handleChange('safetyStock', Number(e.target.value))}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <InventoryCustomFields
        mode="form"
        fields={inventoryConfig.customFields}
        values={formData.customFields}
        onChange={handleCustomFieldChange}
      />

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !formData.itemMasterId || !formData.warehouseId}>
          {isLoading ? 'Saving...' : isEdit ? 'Update Inventory' : 'Create Inventory'}
        </Button>
      </div>
    </form>
  );
});

export { InventoryItemForm };
