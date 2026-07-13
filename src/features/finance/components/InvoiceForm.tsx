'use client';

import { useState, useCallback, useEffect } from 'react';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateInvoiceDto, InvoiceLineItem } from '@/features/finance/types';
import { useFinanceModuleConfiguration } from '@/features/finance/hooks/useFinanceConfiguration';
import { useCustomers } from '@/features/customers/hooks/useCustomers';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { Plus, Trash2 } from 'lucide-react';

interface InvoiceFormProps {
  onSubmit: (data: CreateInvoiceDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  initialData?: any;
}

export const InvoiceForm = memo(function InvoiceForm({ onSubmit, onCancel, isLoading, mode = 'create', initialData }: InvoiceFormProps) {
  const { gstTypes } = useFinanceModuleConfiguration();
  const { data: customers } = useCustomers();
  const { data: projects } = useProjects();

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { id: '1', description: '', quantity: 1, unit: 'Nos', rate: 0, amount: 0, taxRate: 18, taxAmount: 0 },
  ]);

  const [formData, setFormData] = useState<CreateInvoiceDto>({
    customerId: '',
    projectId: '',
    sourceType: 'Manual',
    sourceId: '',
    subtotal: 0,
    taxAmount: 0,
    totalAmount: 0,
    gstType: 'CGST',
    dueDate: new Date(),
    paymentTerms: 'Net 30',
    lineItems,
  });

  // Populate form with initial data when in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        customerId: initialData.customerId || '',
        projectId: initialData.projectId || '',
        sourceType: initialData.sourceType || 'Manual',
        sourceId: initialData.sourceId || '',
        subtotal: initialData.subtotal || 0,
        taxAmount: initialData.taxAmount || 0,
        totalAmount: initialData.totalAmount || 0,
        gstType: initialData.gstType || 'CGST',
        dueDate: initialData.dueDate ? new Date(initialData.dueDate) : new Date(),
        paymentTerms: initialData.paymentTerms || 'Net 30',
        lineItems: initialData.lineItems || lineItems,
      });
      if (initialData.lineItems && initialData.lineItems.length > 0) {
        setLineItems(initialData.lineItems);
      }
    }
  }, [mode, initialData]);

  const handleChange = useCallback((field: keyof CreateInvoiceDto, value: any) => {
    setFormData((prev: CreateInvoiceDto) => ({ ...prev, [field]: value }));
  }, []);

  const handleLineItemChange = useCallback((index: number, field: keyof InvoiceLineItem, value: any) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate amount and tax
    const item = updatedItems[index];
    item.amount = item.quantity * item.rate;
    if (item.taxRate) {
      item.taxAmount = (item.amount * item.taxRate) / 100;
    }
    
    setLineItems(updatedItems);
    calculateTotals(updatedItems);
  }, [lineItems]);

  const addLineItem = useCallback(() => {
    const newItem: InvoiceLineItem = {
      id: String(lineItems.length + 1),
      description: '',
      quantity: 1,
      unit: 'Nos',
      rate: 0,
      amount: 0,
      taxRate: 18,
      taxAmount: 0,
    };
    const updatedItems = [...lineItems, newItem];
    setLineItems(updatedItems);
    calculateTotals(updatedItems);
  }, [lineItems]);

  const removeLineItem = useCallback((index: number) => {
    const updatedItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedItems);
    calculateTotals(updatedItems);
  }, [lineItems]);

  const calculateTotals = useCallback((items: InvoiceLineItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
    const totalAmount = subtotal + taxAmount;
    setFormData((prev: CreateInvoiceDto) => ({ ...prev, subtotal, taxAmount, totalAmount, lineItems: items }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  }, [formData, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Customer *</label>
            <Select value={formData.customerId} onValueChange={(v) => handleChange('customerId', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers?.data?.rows?.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.customerName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project (Optional)</label>
              <Select value={formData.projectId || ''} onValueChange={(v) => handleChange('projectId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.data?.rows?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.projectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Source Type *</label>
              <Select value={formData.sourceType} onValueChange={(v) => handleChange('sourceType', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Estimate">Estimate</SelectItem>
                  <SelectItem value="Proposal">Proposal</SelectItem>
                  <SelectItem value="Quotation">Quotation</SelectItem>
                  <SelectItem value="Project">Project</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Line Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {lineItems.map((item, index) => (
            <div key={item.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium">Item {index + 1}</span>
                {lineItems.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeLineItem(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium">Description *</label>
                  <Input
                    placeholder="Enter description"
                    value={item.description}
                    onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity *</label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={item.quantity}
                    onChange={(e) => handleLineItemChange(index, 'quantity', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit *</label>
                  <Input
                    placeholder="Nos"
                    value={item.unit}
                    onChange={(e) => handleLineItemChange(index, 'unit', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rate (₹) *</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={item.rate}
                    onChange={(e) => handleLineItemChange(index, 'rate', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tax Rate (%)</label>
                  <Input
                    type="number"
                    placeholder="18"
                    value={item.taxRate}
                    onChange={(e) => handleLineItemChange(index, 'taxRate', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (₹)</label>
                  <Input type="number" value={item.amount} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tax Amount (₹)</label>
                  <Input type="number" value={item.taxAmount} readOnly className="bg-gray-50" />
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addLineItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Line Item
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">GST Type *</label>
              <Select value={formData.gstType} onValueChange={(v) => handleChange('gstType', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select GST type" />
                </SelectTrigger>
                <SelectContent>
                  {gstTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date *</label>
              <Input
                type="date"
                value={formData.dueDate instanceof Date ? formData.dueDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleChange('dueDate', new Date(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Terms *</label>
              <Input
                placeholder="Net 30"
                value={formData.paymentTerms}
                onChange={(e) => handleChange('paymentTerms', e.target.value)}
              />
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-medium">₹{formData.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax Amount:</span>
              <span className="font-medium">₹{formData.taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>Total:</span>
              <span>₹{formData.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
});
