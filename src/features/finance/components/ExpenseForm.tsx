'use client';

import { useState, useCallback, useEffect } from 'react';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateExpenseFormData } from '@/features/finance/validations';
import { useFinanceModuleConfiguration } from '@/features/finance/hooks/useFinanceConfiguration';
import { useVendors } from '@/features/finance/hooks/useFinance';
import { useProjects } from '@/features/projects/hooks/useProjects';

interface ExpenseFormProps {
  onSubmit: (data: CreateExpenseFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  initialData?: any;
}

export const ExpenseForm = memo(function ExpenseForm({ onSubmit, onCancel, isLoading, mode = 'create', initialData }: ExpenseFormProps) {
  const { expenseCategories } = useFinanceModuleConfiguration();
  const { data: vendors } = useVendors();
  const { data: projects } = useProjects();

  const [formData, setFormData] = useState<CreateExpenseFormData>({
    vendorId: '',
    category: 'Material Purchase',
    subCategory: '',
    projectId: '',
    amount: 0,
    taxAmount: 0,
    date: new Date(),
    description: '',
    receiptNumber: '',
    invoiceNumber: '',
    notes: '',
    attachments: [],
  });

  // Populate form with initial data when in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        vendorId: initialData.vendorId || '',
        category: initialData.category || 'Material Purchase',
        subCategory: initialData.subCategory || '',
        projectId: initialData.projectId || '',
        amount: initialData.amount || 0,
        taxAmount: initialData.taxAmount || 0,
        date: initialData.date ? new Date(initialData.date) : new Date(),
        description: initialData.description || '',
        receiptNumber: initialData.receiptNumber || '',
        invoiceNumber: initialData.invoiceNumber || '',
        notes: initialData.notes || '',
        attachments: initialData.attachments || [],
      });
    }
  }, [mode, initialData]);

  const handleChange = useCallback((field: keyof CreateExpenseFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  }, [formData, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Expense Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Vendor *</label>
            <Select value={formData.vendorId} onValueChange={(v) => handleChange('vendorId', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors?.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category *</label>
              <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sub Category</label>
              <Input
                placeholder="Enter sub category"
                value={formData.subCategory}
                onChange={(e) => handleChange('subCategory', e.target.value)}
              />
            </div>
          </div>

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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (₹) *</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => handleChange('amount', Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tax Amount (₹)</label>
              <Input
                type="number"
                placeholder="Enter tax amount"
                value={formData.taxAmount}
                onChange={(e) => handleChange('taxAmount', Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date *</label>
              <Input
                type="date"
                value={formData.date instanceof Date ? formData.date.toISOString().split('T')[0] : ''}
                onChange={(e) => handleChange('date', new Date(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Receipt Number</label>
              <Input
                placeholder="Enter receipt number"
                value={formData.receiptNumber}
                onChange={(e) => handleChange('receiptNumber', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Invoice Number</label>
              <Input
                placeholder="Enter invoice number"
                value={formData.invoiceNumber}
                onChange={(e) => handleChange('invoiceNumber', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description *</label>
            <Input
              placeholder="Enter description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Input
              placeholder="Enter notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Expense'}
        </Button>
      </div>
    </form>
  );
});
