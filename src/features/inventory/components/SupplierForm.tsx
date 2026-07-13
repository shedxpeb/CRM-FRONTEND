'use client';

import { useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Supplier } from '@/features/inventory/types';
import { X } from 'lucide-react';

interface SupplierFormProps {
  initialData?: Partial<Supplier>;
  onSubmit: (data: Partial<Supplier>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const SupplierForm = memo(function SupplierForm({ initialData, onSubmit, onCancel, isLoading }: SupplierFormProps) {
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    gstNumber: '',
    contactPerson: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    state: '',
    ...initialData,
  });

  const handleChange = (field: keyof Supplier, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section 1: Basic Information */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Supplier Name *</label>
              <Input
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Tata Steel Ltd"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">GST Number</label>
              <Input
                value={formData.gstNumber || ''}
                onChange={(e) => handleChange('gstNumber', e.target.value)}
                placeholder="e.g., 27AAACT1234A1Z5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Person *</label>
              <Input
                value={formData.contactPerson || ''}
                onChange={(e) => handleChange('contactPerson', e.target.value)}
                placeholder="e.g., Anil Mehta"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mobile Number *</label>
              <Input
                value={formData.mobile || ''}
                onChange={(e) => handleChange('mobile', e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="e.g., sales@supplier.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Address Information */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Address Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Address *</label>
              <textarea
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Street address, building, etc."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">City *</label>
              <Input
                value={formData.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="e.g., Mumbai"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">State *</label>
              <Input
                value={formData.state || ''}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="e.g., Maharashtra"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData?.id ? 'Update Supplier' : 'Create Supplier'}
        </Button>
      </div>
    </form>
  );
});

export { SupplierForm };
