'use client';

import { useState, memo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
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
  const { data: itemMasters, isLoading: isLoadingItemMasters, error: itemMastersError } = useItemMasters();
  const inventoryConfig = useInventoryConfiguration();
  const isEdit = mode === 'edit';

  const { register, handleSubmit, setValue, watch, formState: { errors, isValid, isDirty } } = useForm<Partial<InventoryItem>>({
    defaultValues: {
      itemCode: '',
      itemMasterId: '',
      itemName: '',
      unit: 'Nos',
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
    },
    mode: 'all',
  });

  const itemMasterId = watch('itemMasterId');

  const handleMasterSelect = useCallback(
    (masterId: string) => {
      const master = itemMasters?.find((m) => m.id === masterId);
      if (!master) return;
      setValue('itemMasterId', master.id);
      setValue('itemCode', master.itemCode);
      setValue('itemName', master.itemName);
      
      // Map Item Master unit to Inventory unit type
      const unitMapping: Record<string, any> = {
        'KG': 'Kg',
        'MT': 'Ton',
        'PCS': 'Nos',
        'NOS': 'Nos',
        'SQM': 'SqMeter',
        'SQFT': 'SqMeter',
        'M': 'Meter',
        'FT': 'Meter',
        'LTR': 'Liter',
        'SET': 'Set',
        'BUNDLE': 'Bundle',
      };
      const mappedUnit = unitMapping[master.unit] || 'Nos';
      
      setValue('unit', watch('unit') ?? mappedUnit);
      setValue('category', master.category);
      setValue('brand', master.brand);
      setValue('itemTypeClass', master.itemTypeClass);
      setValue('purchaseRate', master.defaultRate ?? watch('purchaseRate'));
    },
    [itemMasters, setValue, watch]
  );

  const handleCustomFieldChange = useCallback((key: string, value: string | number | boolean) => {
    const currentCustomFields = watch('customFields') || {};
    setValue('customFields', { ...currentCustomFields, [key]: value });
  }, [setValue, watch]);

  const onFormSubmit = (data: Partial<InventoryItem>) => {
    // Map Item Master unit to Inventory unit type
    const unitMapping: Record<string, any> = {
      'KG': 'Kg',
      'MT': 'Ton',
      'PCS': 'Nos',
      'NOS': 'Nos',
      'SQM': 'SqMeter',
      'SQFT': 'SqMeter',
      'M': 'Meter',
      'FT': 'Meter',
      'LTR': 'Liter',
      'SET': 'Set',
      'BUNDLE': 'Bundle',
    };
    const mappedUnit = unitMapping[data.unit || ''] || 'Nos';
    
    // Only send fields that match CreateInventoryItemDto (backend doesn't accept reservedStock, issuedStock, incomingStock, outgoingStock)
    const submitData = {
      itemMasterId: data.itemMasterId || '',
      itemCode: data.itemCode || '',
      itemName: data.itemName || '',
      unit: mappedUnit,
      minimumStock: data.minimumStock ?? 0,
      reorderLevel: data.reorderLevel ?? 0,
      safetyStock: data.safetyStock ?? 0,
      warehouseId: data.warehouseId || undefined,
      warehouseName: data.warehouseName || '',
      status: data.status || 'In Stock',
      currentStock: data.currentStock ?? 0,
      binLocation: data.binLocation,
      reorderQuantity: data.reorderQuantity,
      purchaseRate: data.purchaseRate,
      customFields: data.customFields,
    };
    
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Item Reference</CardTitle>
          <p className="text-xs text-muted-foreground">Product data is owned by Item Master and cannot be edited here.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEdit ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Item Master *</label>
              {isLoadingItemMasters ? (
                <div className="px-3 py-2 text-sm text-muted-foreground rounded-md border bg-muted/50">Loading items...</div>
              ) : itemMastersError ? (
                <div className="px-3 py-2 text-sm text-red-600 rounded-md border bg-red-50">Failed to load items</div>
              ) : !itemMasters || itemMasters.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground rounded-md border bg-muted/50">No items available. Please create items in Item Master first.</div>
              ) : (
                <Select value={itemMasterId || ''} onValueChange={handleMasterSelect}>
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
              )}
            </div>
          ) : null}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReadOnlyField label="Item Code" value={watch('itemCode')} />
            <ReadOnlyField label="Item Name" value={watch('itemName')} />
            <ReadOnlyField label="Category" value={watch('category')} />
            <ReadOnlyField label="Brand" value={watch('brand')} />
            <ReadOnlyField label="Item Type" value={watch('itemTypeClass')} />
            <ReadOnlyField label="Unit" value={watch('unit')} />
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
                {...register('currentStock', { required: true, valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reserved Stock</label>
              <Input
                type="number"
                step="0.01"
                {...register('reservedStock', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Issued Stock</label>
              <Input
                type="number"
                step="0.01"
                {...register('issuedStock', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Incoming Stock</label>
              <Input
                type="number"
                step="0.01"
                {...register('incomingStock', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Outgoing Stock</label>
              <Input
                type="number"
                step="0.01"
                {...register('outgoingStock', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Purchase Rate (₹)</label>
              <Input
                type="number"
                step="0.01"
                {...register('purchaseRate', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Stock Status</label>
              <Select
                value={watch('status')}
                onValueChange={(v) => setValue('status', v as StockStatus)}
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
              <Input
                {...register('warehouseName', { required: true })}
                placeholder="Enter warehouse name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bin Location</label>
              <Input
                {...register('binLocation')}
                placeholder="e.g., A-12-03"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Stock *</label>
              <Input
                type="number"
                step="0.01"
                {...register('minimumStock', { required: true, valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reorder Level *</label>
              <Input
                type="number"
                step="0.01"
                {...register('reorderLevel', { required: true, valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reorder Quantity</label>
              <Input
                type="number"
                step="0.01"
                {...register('reorderQuantity', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Safety Stock *</label>
              <Input
                type="number"
                step="0.01"
                {...register('safetyStock', { required: true, valueAsNumber: true })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <InventoryCustomFields
        mode="form"
        fields={inventoryConfig.customFields}
        values={watch('customFields')}
        onChange={handleCustomFieldChange}
      />

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || !itemMasterId || !watch('warehouseName')}
        >
          {isLoading ? 'Saving...' : isEdit ? 'Update Inventory' : 'Create Inventory'}
        </Button>
      </div>
    </form>
  );
});

export { InventoryItemForm };
