'use client';

import { useState, useCallback, useEffect } from 'react';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateBankAccountFormData } from '@/features/finance/validations';

interface BankAccountFormProps {
  onSubmit: (data: CreateBankAccountFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  initialData?: Partial<CreateBankAccountFormData> | null;
}

const emptyBankAccountForm: CreateBankAccountFormData = {
  accountName: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  branch: '',
  accountType: 'Current',
};

export const BankAccountForm = memo(function BankAccountForm({
  onSubmit,
  onCancel,
  isLoading,
  mode = 'create',
  initialData,
}: BankAccountFormProps) {
  const [formData, setFormData] = useState<CreateBankAccountFormData>({
    ...emptyBankAccountForm,
  });

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        ...emptyBankAccountForm,
        ...initialData,
      });
      return;
    }
    setFormData({ ...emptyBankAccountForm });
  }, [initialData, mode]);

  const handleChange = useCallback((field: keyof CreateBankAccountFormData, value: any) => {
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
          <CardTitle className="text-base">Bank Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Account Name *</label>
            <Input
              placeholder="Enter account name"
              value={formData.accountName}
              onChange={(e) => handleChange('accountName', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bank Name *</label>
            <Input
              placeholder="Enter bank name"
              value={formData.bankName}
              onChange={(e) => handleChange('bankName', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Account Number *</label>
              <Input
                placeholder="Enter account number"
                value={formData.accountNumber}
                onChange={(e) => handleChange('accountNumber', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Account Type *</label>
              <Select value={formData.accountType} onValueChange={(v) => handleChange('accountType', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Current">Current</SelectItem>
                  <SelectItem value="Savings">Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">IFSC Code *</label>
              <Input
                placeholder="Enter IFSC code"
                value={formData.ifscCode}
                onChange={(e) => handleChange('ifscCode', e.target.value.toUpperCase())}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Branch *</label>
              <Input
                placeholder="Enter branch name"
                value={formData.branch}
                onChange={(e) => handleChange('branch', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (mode === 'edit' ? 'Saving...' : 'Creating...') : mode === 'edit' ? 'Save Bank Account' : 'Create Bank Account'}
        </Button>
      </div>
    </form>
  );
});
