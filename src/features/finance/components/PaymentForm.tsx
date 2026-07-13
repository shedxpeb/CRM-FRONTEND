'use client';

import { useState, useCallback, useEffect } from 'react';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreatePaymentFormData } from '@/features/finance/validations';
import { useFinanceModuleConfiguration } from '@/features/finance/hooks/useFinanceConfiguration';
import { useCustomers } from '@/features/customers/hooks/useCustomers';
import { useProjects } from '@/features/projects/hooks/useProjects';

interface PaymentFormProps {
  onSubmit: (data: CreatePaymentFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  initialData?: any;
}

export const PaymentForm = memo(function PaymentForm({ onSubmit, onCancel, isLoading, mode = 'create', initialData }: PaymentFormProps) {
  const { paymentMethods } = useFinanceModuleConfiguration();
  const { data: customers } = useCustomers();
  const { data: projects } = useProjects();

  const [formData, setFormData] = useState<CreatePaymentFormData>({
    type: 'Stage',
    invoiceId: '',
    customerId: '',
    projectId: '',
    amount: 0,
    taxAmount: 0,
    paymentDate: new Date(),
    paymentMethod: 'Bank Transfer',
    referenceNumber: '',
    transactionId: '',
    notes: '',
    attachments: [],
  });

  // Populate form with initial data when in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        type: initialData.type || 'Stage',
        invoiceId: initialData.invoiceId || '',
        customerId: initialData.customerId || '',
        projectId: initialData.projectId || '',
        amount: initialData.amount || 0,
        taxAmount: initialData.taxAmount || 0,
        paymentDate: initialData.paymentDate ? new Date(initialData.paymentDate) : new Date(),
        paymentMethod: initialData.paymentMethod || 'Bank Transfer',
        referenceNumber: initialData.referenceNumber || '',
        transactionId: initialData.transactionId || '',
        notes: initialData.notes || '',
        attachments: initialData.attachments || [],
      });
    }
  }, [mode, initialData]);

  const handleChange = useCallback((field: keyof CreatePaymentFormData, value: any) => {
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
          <CardTitle className="text-base">Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Type *</label>
              <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Advance">Advance</SelectItem>
                  <SelectItem value="Stage">Stage</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                  <SelectItem value="Full">Full</SelectItem>
                  <SelectItem value="Refund">Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Customer *</label>
              <Select value={formData.customerId} onValueChange={(v) => handleChange('customerId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.data?.rows?.map((customer, index) => (
                    <SelectItem key={`${customer.id}-${index}`} value={customer.id}>
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
                  {projects?.data?.rows?.map((project, index) => (
                    <SelectItem key={`${project.id}-${index}`} value={project.id}>
                      {project.projectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Invoice (Optional)</label>
              <Input
                placeholder="Enter invoice ID"
                value={formData.invoiceId}
                onChange={(e) => handleChange('invoiceId', e.target.value)}
              />
            </div>
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
                  {paymentMethods.map((method, index) => (
                    <SelectItem key={`${method}-${index}`} value={method}>
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
          {isLoading ? 'Creating...' : 'Create Payment'}
        </Button>
      </div>
    </form>
  );
});
