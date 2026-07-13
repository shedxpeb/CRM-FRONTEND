'use client';

import { useState, memo } from 'react';
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
import { StockMovement } from '@/features/inventory/types';
import { useInventoryItems, useWarehouses, useInventoryConfiguration } from '@/features/inventory/hooks/useInventory';
import { X } from 'lucide-react';

interface StockMovementFormProps {
  initialData?: Partial<StockMovement>;
  onSubmit: (data: Partial<StockMovement>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const StockMovementForm = memo(function StockMovementForm({ initialData, onSubmit, onCancel, isLoading }: StockMovementFormProps) {
  const { movementTypes } = useInventoryConfiguration();
  const { data: itemsResponse } = useInventoryItems();
  const { data: warehouses } = useWarehouses();
  const items = itemsResponse?.data ?? [];

  const [formData, setFormData] = useState<Partial<StockMovement>>({
    itemId: '',
    type: 'Stock In',
    quantity: 0,
    warehouseId: '',
    referenceNumber: '',
    remarks: '',
    ...initialData,
  });

  const handleChange = (field: keyof StockMovement, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Stock Movement Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Item *</label>
              <Select
                value={formData.itemId}
                onValueChange={(v) => handleChange('itemId', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.itemName} ({item.itemCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Movement Type *</label>
              <Select
                value={formData.type}
                onValueChange={(v) => handleChange('type', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {movementTypes.map((mt) => (
                    <SelectItem key={mt} value={mt}>
                      {mt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity *</label>
              <Input
                type="number"
                step="0.01"
                value={formData.quantity || ''}
                onChange={(e) => handleChange('quantity', Number(e.target.value))}
                placeholder="e.g., 100"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Warehouse *</label>
              <Select
                value={formData.warehouseId}
                onValueChange={(v) => handleChange('warehouseId', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
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
              <label className="text-sm font-medium">Reference Number</label>
              <Input
                value={formData.referenceNumber || ''}
                onChange={(e) => handleChange('referenceNumber', e.target.value)}
                placeholder="e.g., PO-2024-001"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Remarks</label>
              <textarea
                value={formData.remarks || ''}
                onChange={(e) => handleChange('remarks', e.target.value)}
                placeholder="Additional notes about this movement..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Create Movement'}
        </Button>
      </div>
    </form>
  );
});

export { StockMovementForm };
