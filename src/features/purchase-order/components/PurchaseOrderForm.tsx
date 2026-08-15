'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { CreatePurchaseOrderDto, UpdatePurchaseOrderDto, PurchaseOrder } from '../types/purchase-order.types';
import { vendorApi } from '@/features/vendor';
import { Skeleton } from '@/components/ui/skeleton';
import { PO_UNITS } from '../constants';
import { formatCurrency } from '../utils/format';
import { Plus, Trash2 } from 'lucide-react';

const shipToSchema = z.object({
  name: z.string().optional(),
  companyName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  gstNumber: z.string().optional(),
});

const supplierSchema = z.object({
  name: z.string().optional(),
  companyName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  gstNumber: z.string().optional(),
});

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
  currency: z.string().optional(),
  discount: z.number().min(0).optional(),
  discountType: z.string().optional(),
  freight: z.number().min(0).optional(),
  packingCharges: z.number().min(0).optional(),
  shippingCharges: z.number().min(0).optional(),
  otherCharges: z.number().min(0).optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  internalNotes: z.string().optional(),
  shipTo: shipToSchema.optional(),
  supplier: supplierSchema.optional(),
  items: z.array(poItemSchema).min(1, 'At least one item is required'),
}).refine((data) => {
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
  initialData?: PurchaseOrder;
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
    reset,
    getValues,
  } = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      status: 'Draft',
      discountType: 'Amount',
      items: [{ itemCode: '', itemName: '', quantity: 1, unit: 'PCS', rate: 0, discountType: 'Amount' }],
    },
  });

  const { fields: itemFields, append: addItem, remove: removeItem } = useFieldArray({
    control,
    name: 'items',
  });

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      const mappedItems = (initialData.items || []).map((item: any) => ({
        itemCode: item.itemCode || '',
        itemName: item.itemName || '',
        quantity: item.quantity || 1,
        unit: item.unit || 'PCS',
        rate: item.rate || 0,
        gstRate: item.gstRate,
        discount: item.discount,
        discountType: item.discountType || 'Amount',
        hsnCode: item.hsnCode,
      }));

      const formData = {
        vendorId: initialData.vendorId || '',
        projectId: initialData.projectId || '',
        warehouseId: initialData.warehouseId || '',
        paymentTerms: initialData.paymentTerms || '',
        expectedDeliveryDate: initialData.expectedDeliveryDate || '',
        status: initialData.status || 'Draft',
        currency: initialData.currency || 'INR',
        discount: initialData.discount || 0,
        discountType: initialData.discountType || 'Amount',
        freight: initialData.freight || 0,
        packingCharges: initialData.packingCharges || 0,
        shippingCharges: initialData.shippingCharges || 0,
        otherCharges: initialData.otherCharges || 0,
        notes: initialData.notes || '',
        terms: initialData.terms || '',
        internalNotes: initialData.internalNotes || '',
        items: mappedItems,
        shipTo: initialData.shipToName ? {
          name: initialData.shipToName,
          companyName: initialData.shipToCompanyName,
          address: initialData.shipToAddress,
          city: initialData.shipToCity,
          state: initialData.shipToState,
          pincode: initialData.shipToPincode,
          country: initialData.shipToCountry,
          phone: initialData.shipToPhone,
          email: initialData.shipToEmail,
          gstNumber: initialData.shipToGstNumber,
        } : undefined,
        supplier: initialData.supplierName ? {
          name: initialData.supplierName,
          companyName: initialData.supplierCompanyName,
          address: initialData.supplierAddress,
          city: initialData.supplierCity,
          state: initialData.supplierState,
          pincode: initialData.supplierPincode,
          country: initialData.supplierCountry,
          phone: initialData.supplierPhone,
          email: initialData.supplierEmail,
          gstNumber: initialData.supplierGstNumber,
        } : undefined,
      };

      reset(formData);
    } else {
      reset({
        status: 'Draft',
        discountType: 'Amount',
        items: [{ itemCode: '', itemName: '', quantity: 1, unit: 'PCS', rate: 0, discountType: 'Amount' }],
      });
    }
  }, [initialData, reset]);

  const handleAddItem = () => {
    addItem({ itemCode: '', itemName: '', quantity: 1, unit: 'PCS', rate: 0, discountType: 'Amount' });
  };

  const vendorId = watch('vendorId');
  
  // Fetch vendor details for auto-fill
  const { data: selectedVendor } = useQuery({
    queryKey: ['vendor-detail', vendorId],
    queryFn: () => vendorApi.getById(vendorId),
    enabled: !!vendorId && open,
  });

  // Auto-fill supplier fields when vendor changes
  useEffect(() => {
    if (selectedVendor && !initialData) {
      setValue('supplier.name', selectedVendor.contactPerson || '');
      setValue('supplier.companyName', selectedVendor.companyName || '');
      setValue('supplier.address', selectedVendor.address || '');
      setValue('supplier.city', selectedVendor.city || '');
      setValue('supplier.state', selectedVendor.state || '');
      setValue('supplier.pincode', selectedVendor.pincode || '');
      setValue('supplier.country', selectedVendor.country || 'India');
      setValue('supplier.phone', selectedVendor.phone || '');
      setValue('supplier.email', selectedVendor.email || '');
      setValue('supplier.gstNumber', selectedVendor.gstNumber || '');
    }
  }, [selectedVendor, initialData, setValue]);

  // Note: Ship To auto-fill from Organization is handled by the backend service
  // The backend defaults Ship To fields from Organization data when creating a PO

  const items = watch('items') || [];
  const discount = watch('discount') || 0;
  const discountType = watch('discountType') || 'Amount';
  const freight = watch('freight') || 0;
  const packingCharges = watch('packingCharges') || 0;
  const shippingCharges = watch('shippingCharges') || 0;
  const otherCharges = watch('otherCharges') || 0;

  const calculateTotals = () => {
    // Helper function to round to 2 decimal places for currency calculations
    const roundTo2 = (value: number) => Math.round(value * 100) / 100;

    let subtotal = 0;
    let totalTax = 0;

    items.forEach((item: any) => {
      const quantity = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      const itemTotal = roundTo2(quantity * rate);
      
      const discountValue = Number(item.discount) || 0;
      const discountAmount = item.discountType === 'Percentage'
        ? roundTo2((itemTotal * discountValue) / 100)
        : discountValue;
      const afterDiscount = roundTo2(itemTotal - discountAmount);
      
      const gstRate = Number(item.gstRate) || 0;
      const gstAmount = gstRate ? roundTo2((afterDiscount * gstRate) / 100) : 0;

      subtotal = roundTo2(subtotal + afterDiscount);
      totalTax = roundTo2(totalTax + gstAmount);
    });

    const discountValue = Number(discount) || 0;
    const discountAmount = discountType === 'Percentage' 
      ? roundTo2((subtotal * discountValue) / 100) 
      : discountValue;
    const afterDiscount = roundTo2(subtotal - discountAmount);
    
    const freightValue = Number(freight) || 0;
    const packingValue = Number(packingCharges) || 0;
    const shippingValue = Number(shippingCharges) || 0;
    const otherValue = Number(otherCharges) || 0;
    
    const grandTotal = roundTo2(
      afterDiscount + totalTax + freightValue + packingValue + shippingValue + otherValue
    );
    const roundOff = roundTo2(Math.round(grandTotal) - grandTotal);

    return {
      subtotal,
      totalTax,
      discountAmount,
      freight: freightValue,
      packingCharges: packingValue,
      shippingCharges: shippingValue,
      otherCharges: otherValue,
      roundOff,
      grandTotal: roundTo2(grandTotal + roundOff),
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

          {/* Ship To & Supplier */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ship To & Supplier</h3>
            <div className="grid grid-cols-2 gap-6">
              {/* Ship To */}
              <div className="space-y-3 border rounded-lg p-4">
                <h4 className="font-semibold text-sm">SHIP TO</h4>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input {...register('shipTo.name')} placeholder="Contact Name" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Company Name</Label>
                    <Input {...register('shipTo.companyName')} placeholder="Company Name" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Address</Label>
                    <Input {...register('shipTo.address')} placeholder="Street Address" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">City</Label>
                      <Input {...register('shipTo.city')} placeholder="City" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">State</Label>
                      <Input {...register('shipTo.state')} placeholder="State" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Pincode</Label>
                      <Input {...register('shipTo.pincode')} placeholder="Pincode" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Country</Label>
                      <Input {...register('shipTo.country')} placeholder="Country" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Phone</Label>
                      <Input {...register('shipTo.phone')} placeholder="Phone" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Email</Label>
                      <Input {...register('shipTo.email')} placeholder="Email" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">GST Number</Label>
                    <Input {...register('shipTo.gstNumber')} placeholder="GST Number" />
                  </div>
                </div>
              </div>

              {/* Supplier */}
              <div className="space-y-3 border rounded-lg p-4">
                <h4 className="font-semibold text-sm">SUPPLIER</h4>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input {...register('supplier.name')} placeholder="Contact Person" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Company Name</Label>
                    <Input {...register('supplier.companyName')} placeholder="Company Name" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Address</Label>
                    <Input {...register('supplier.address')} placeholder="Street Address" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">City</Label>
                      <Input {...register('supplier.city')} placeholder="City" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">State</Label>
                      <Input {...register('supplier.state')} placeholder="State" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Pincode</Label>
                      <Input {...register('supplier.pincode')} placeholder="Pincode" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Country</Label>
                      <Input {...register('supplier.country')} placeholder="Country" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Phone</Label>
                      <Input {...register('supplier.phone')} placeholder="Phone" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Email</Label>
                      <Input {...register('supplier.email')} placeholder="Email" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">GST Number</Label>
                    <Input {...register('supplier.gstNumber')} placeholder="GST Number" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Items</h3>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {itemFields.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium">Item {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Item Code *</Label>
                      <Input
                        {...register(`items.${index}.itemCode`)}
                        placeholder="Item Code"
                      />
                      {errors.items?.[index]?.itemCode && (
                        <p className="text-sm text-red-500">{errors.items[index]?.itemCode?.message}</p>
                      )}
                    </div>
                    <div className="space-y-1 col-span-2">
                      <Label className="text-xs">Item Name *</Label>
                      <Input
                        {...register(`items.${index}.itemName`)}
                        placeholder="Item Name"
                      />
                      {errors.items?.[index]?.itemName && (
                        <p className="text-sm text-red-500">{errors.items[index]?.itemName?.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Quantity *</Label>
                      <Input
                        type="number"
                        step="0.001"
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      />
                      {errors.items?.[index]?.quantity && (
                        <p className="text-sm text-red-500">{errors.items[index]?.quantity?.message}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Unit *</Label>
                      <Select
                        value={watch(`items.${index}.unit`) || 'PCS'}
                        onValueChange={(value) => setValue(`items.${index}.unit`, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PO_UNITS.map((u) => (
                            <SelectItem key={u} value={u}>{u}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Rate *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.rate`, { valueAsNumber: true })}
                      />
                      {errors.items?.[index]?.rate && (
                        <p className="text-sm text-red-500">{errors.items[index]?.rate?.message}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">GST Rate %</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.gstRate`, { valueAsNumber: true })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Discount</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.discount`, { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Discount Type</Label>
                      <Select
                        value={watch(`items.${index}.discountType`) || 'Amount'}
                        onValueChange={(value) => setValue(`items.${index}.discountType`, value)}
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
                        {...register(`items.${index}.hsnCode`)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Financial Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount">Header Discount</Label>
                <Input id="discount" type="number" step="0.01" {...register('discount', { valueAsNumber: true })} />
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="freight">Freight</Label>
                <Input id="freight" type="number" step="0.01" {...register('freight', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="packingCharges">Packing Charges</Label>
                <Input id="packingCharges" type="number" step="0.01" {...register('packingCharges', { valueAsNumber: true })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shippingCharges">Shipping Charges</Label>
                <Input id="shippingCharges" type="number" step="0.01" {...register('shippingCharges', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherCharges">Other Charges</Label>
                <Input id="otherCharges" type="number" step="0.01" {...register('otherCharges', { valueAsNumber: true })} />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-{formatCurrency(totals.discountAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatCurrency(totals.totalTax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Freight:</span>
                <span>{formatCurrency(totals.freight)}</span>
              </div>
              <div className="flex justify-between">
                <span>Packing Charges:</span>
                <span>{formatCurrency(totals.packingCharges)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Charges:</span>
                <span>{formatCurrency(totals.shippingCharges)}</span>
              </div>
              <div className="flex justify-between">
                <span>Other Charges:</span>
                <span>{formatCurrency(totals.otherCharges)}</span>
              </div>
              <div className="flex justify-between">
                <span>Round Off:</span>
                <span>{formatCurrency(totals.roundOff)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Grand Total:</span>
                <span>{formatCurrency(totals.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notes & Terms</h3>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" {...register('notes')} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms">Terms</Label>
              <Textarea id="terms" {...register('terms')} rows={3} />
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialData ? 'Update PO' : 'Create PO'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
