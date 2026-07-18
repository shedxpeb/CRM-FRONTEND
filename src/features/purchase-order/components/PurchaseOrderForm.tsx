'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, CreatePurchaseOrderItemDto } from '../types/purchase-order.types';
import { vendorApi } from '@/features/vendor';
import { Skeleton } from '@/components/ui/skeleton';

const poItemSchema = z.object({
  itemCode: z.string().min(1, 'Item code is required'),
  itemName: z.string().min(1, 'Item name is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  unit: z.string().min(1, 'Unit is required'),
  rate: z.number().min(0, 'Rate must be positive'),
  gstRate: z.number().min(0).max(100).optional(),
  discount: z.number().min(0).optional(),
  discountType: z.string().optional(),
  hsnCode: z.string().optional(),
});

const purchaseOrderSchema = z.object({
  vendorId: z.string().min(1, 'Vendor is required'),
  projectId: z.string().optional(),
  warehouseId: z.string().optional(),
  paymentTerms: z.string().optional(),
  expectedDeliveryDate: z.string().optional(),
  status: z.string().optional(),
  discount: z.number().min(0).optional(),
  discountType: z.string().optional(),
  freight: z.number().min(0).optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  internalNotes: z.string().optional(),
  items: z.array(poItemSchema).min(1, 'At least one item is required'),
}).refine((data) => {
  // Validate that if discount is provided, discountType is also provided
  if (data.discount && !data.discountType) {
    return false;
  }
  return true;
}, {
  message: 'Discount type is required when discount is specified',
  path: ['discountType'],
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

interface PurchaseOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePurchaseOrderDto | UpdatePurchaseOrderDto) => Promise<void>;
  initialData?: any;
  isSubmitting?: boolean;
}

export function PurchaseOrderForm({ open, onOpenChange, onSubmit, initialData, isSubmitting }: PurchaseOrderFormProps) {
  const { data: vendors } = useQuery({
    queryKey: ['vendor-combobox'],
    queryFn: () => vendorApi.getCombobox(),
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: initialData ? {
      ...initialData,
      items: initialData.items || [],
    } : {
      status: 'Draft',
      discountType: 'Amount',
      items: [{ itemCode: '', itemName: '', quantity: 1, unit: 'PCS', rate: 0, discountType: 'Amount' }],
    },
  });

  const items = watch('items') || [];

  const addItem = () => {
    setValue('items', [...items, { itemCode: '', itemName: '', quantity: 1, unit: 'PCS', rate: 0, discountType: 'Amount' }]);
  };

  const removeItem = (index: number) => {
    setValue('items', items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setValue('items', newItems);
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalTax = 0;

    items.forEach((item) => {
      const itemTotal = item.quantity * item.rate;
      const discountAmount = item.discountType === 'Percentage' 
        ? (itemTotal * (item.discount || 0)) / 100 
        : (item.discount || 0);
      const afterDiscount = itemTotal - discountAmount;
      const gstAmount = item.gstRate ? (afterDiscount * item.gstRate) / 100 : 0;
      
      subtotal += afterDiscount;
      totalTax += gstAmount;
    });

    const discount = watch('discount') || 0;
    const discountType = watch('discountType') || 'Amount';
    const discountAmount = discountType === 'Percentage' ? (subtotal * discount) / 100 : discount;
    const afterDiscount = subtotal - discountAmount;
    const freight = watch('freight') || 0;
    const grandTotal = afterDiscount + totalTax + freight;
    const roundOff = Math.round(grandTotal) - grandTotal;

    return {
      subtotal,
      totalTax,
      discountAmount,
      freight,
      roundOff,
      grandTotal: grandTotal + roundOff,
    };
  };

  const totals = calculateTotals();

  const onFormSubmit = async (data: PurchaseOrderFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Purchase Order' : 'Create New Purchase Order'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendorId">Vendor *</Label>
                {vendors ? (
                  <Select
                    value={watch('vendorId') || ''}
                    onValueChange={(value) => setValue('vendorId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Skeleton className="h-10 w-full" />
                )}
                {errors.vendorId && (
                  <p className="text-sm text-red-500">{errors.vendorId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={watch('status') || ''}
                  onValueChange={(value) => setValue('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="PendingApproval">Pending Approval</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-500">{errors.status.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Input id="paymentTerms" {...register('paymentTerms')} placeholder="e.g., Net 30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedDeliveryDate">Expected Delivery Date</Label>
                <Input id="expectedDeliveryDate" type="date" {...register('expectedDeliveryDate')} />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Items</h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                Add Item
              </Button>
            </div>
            
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium">Item {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      Remove
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Item Code *</Label>
                      <Input
                        value={item.itemCode}
                        onChange={(e) => updateItem(index, 'itemCode', e.target.value)}
                        placeholder="Item Code"
                      />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <Label className="text-xs">Item Name *</Label>
                      <Input
                        value={item.itemName}
                        onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                        placeholder="Item Name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Quantity *</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Unit *</Label>
                      <Input
                        value={item.unit}
                        onChange={(e) => updateItem(index, 'unit', e.target.value)}
                        placeholder="PCS"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Rate *</Label>
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">GST Rate %</Label>
                      <Input
                        type="number"
                        value={item.gstRate || ''}
                        onChange={(e) => updateItem(index, 'gstRate', parseFloat(e.target.value) || undefined)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Discount</Label>
                      <Input
                        type="number"
                        value={item.discount || ''}
                        onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || undefined)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Discount Type</Label>
                      <Select
                        value={item.discountType || 'Amount'}
                        onValueChange={(value) => updateItem(index, 'discountType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Amount">Amount</SelectItem>
                          <SelectItem value="Percentage">Percentage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">HSN Code</Label>
                      <Input
                        value={item.hsnCode || ''}
                        onChange={(e) => updateItem(index, 'hsnCode', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Totals</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount">Discount</Label>
                <Input id="discount" type="number" {...register('discount', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type</Label>
                <Select
                  value={watch('discountType') || ''}
                  onValueChange={(value) => setValue('discountType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Discount Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Amount">Amount</SelectItem>
                    <SelectItem value="Percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="freight">Freight</Label>
              <Input id="freight" type="number" {...register('freight', { valueAsNumber: true })} />
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-₹{totals.discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>₹{totals.totalTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Freight:</span>
                <span>₹{totals.freight.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Round Off:</span>
                <span>₹{totals.roundOff.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Grand Total:</span>
                <span>₹{totals.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notes & Terms</h3>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" {...register('notes')} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms">Terms</Label>
              <Textarea id="terms" {...register('terms')} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="internalNotes">Internal Notes</Label>
              <Textarea id="internalNotes" {...register('internalNotes')} rows={2} />
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={(e) => {
                e.preventDefault();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              onClick={(e) => {
                // Allow form submission to proceed
              }}
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update PO' : 'Create PO'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
