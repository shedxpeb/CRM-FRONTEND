'use client';

import { useState, useCallback } from 'react';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateIncomeFormData } from '@/features/finance/validations';
import { useFinanceModuleConfiguration } from '@/features/finance/hooks/useFinanceConfiguration';
import { useCustomers } from '@/features/customers/hooks/useCustomers';
import { useProjects } from '@/features/projects/hooks/useProjects';

interface IncomeFormProps {
  onSubmit: (data: CreateIncomeFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const IncomeForm = memo(function IncomeForm({ onSubmit, onCancel, isLoading }: IncomeFormProps) {
  const { paymentMethods, transactionCategories } = useFinanceModuleConfiguration();
  const { data: customers } = useCustomers();
  const { data: projects } = useProjects();

  const [formData, setFormData] = useState<CreateIncomeFormData>({
    customerId: '',
    projectId: '',
    invoiceId: '',
    amount: 0,
    taxAmount: 0,
    paymentDate: new Date(),
    paymentMethod: 'Bank Transfer',
    referenceNumber: '',
    transactionId: '',
    notes: '',
    category: 'Project Revenue',
  });

  const handleChange = useCallback((field: keyof CreateIncomeFormData, value: any) => {
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
          <CardTitle className="text-base">Income Details</CardTitle>
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
            <label className="text-sm font-medium">Income Category *</label>
            <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {transactionCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
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
              <label className="text-sm font-medium">Payment Date *</label>
              <Input
                type="date"
                value={formData.paymentDate instanceof Date ? formData.paymentDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleChange('paymentDate', new Date(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method *</label>
              <Select value={formData.paymentMethod} onValueChange={(v) => handleChange('paymentMethod', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reference Number</label>
              <Input
                placeholder="Enter reference number"
                value={formData.referenceNumber}
                onChange={(e) => handleChange('referenceNumber', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Transaction ID</label>
              <Input
                placeholder="Enter transaction ID"
                value={formData.transactionId}
                onChange={(e) => handleChange('transactionId', e.target.value)}
              />
            </div>
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
          {isLoading ? 'Creating...' : 'Create Income'}
        </Button>
      </div>
    </form>
  );
});
