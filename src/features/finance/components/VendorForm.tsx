'use client';

import { useState, useCallback, useEffect } from 'react';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateVendorFormData } from '@/features/finance/validations';

interface VendorFormProps {
  onSubmit: (data: CreateVendorFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  initialData?: Partial<CreateVendorFormData> | null;
}

const emptyVendorForm: CreateVendorFormData = {
  name: '',
  gstNumber: '',
  panNumber: '',
  contactPerson: '',
  mobile: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  creditLimit: 0,
  creditPeriod: 30,
  paymentTerms: 'Net 30',
};

export const VendorForm = memo(function VendorForm({
  onSubmit,
  onCancel,
  isLoading,
  mode = 'create',
  initialData,
}: VendorFormProps) {
  const [formData, setFormData] = useState<CreateVendorFormData>({
    ...emptyVendorForm,
  });

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        ...emptyVendorForm,
        ...initialData,
      });
      return;
    }
    setFormData({ ...emptyVendorForm });
  }, [initialData, mode]);

  const handleChange = useCallback((field: keyof CreateVendorFormData, value: any) => {
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
          <CardTitle className="text-base">Vendor Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vendor Name *</label>
              <Input
                placeholder="Enter vendor name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">GST Number</label>
              <Input
                placeholder="Enter GST number"
                value={formData.gstNumber}
                onChange={(e) => handleChange('gstNumber', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">PAN Number</label>
              <Input
                placeholder="Enter PAN number"
                value={formData.panNumber}
                onChange={(e) => handleChange('panNumber', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Person *</label>
              <Input
                placeholder="Enter contact person"
                value={formData.contactPerson}
                onChange={(e) => handleChange('contactPerson', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mobile *</label>
              <Input
                placeholder="+91 XXXXX XXXXX"
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Address Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Address *</label>
            <Input
              placeholder="Enter address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">City *</label>
              <Input
                placeholder="Enter city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">State *</label>
              <Input
                placeholder="Enter state"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Pincode</label>
              <Input
                placeholder="Enter pincode"
                value={formData.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Financial Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Credit Limit (₹)</label>
              <Input
                type="number"
                placeholder="Enter credit limit"
                value={formData.creditLimit}
                onChange={(e) => handleChange('creditLimit', Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Credit Period (Days)</label>
              <Input
                type="number"
                placeholder="Enter credit period"
                value={formData.creditPeriod}
                onChange={(e) => handleChange('creditPeriod', Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Terms</label>
              <Input
                placeholder="Net 30"
                value={formData.paymentTerms}
                onChange={(e) => handleChange('paymentTerms', e.target.value)}
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
          {isLoading ? (mode === 'edit' ? 'Saving...' : 'Creating...') : mode === 'edit' ? 'Save Vendor' : 'Create Vendor'}
        </Button>
      </div>
    </form>
  );
});
