'use client';

import { useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Warehouse } from '@/features/inventory/types';
import { X } from 'lucide-react';

interface WarehouseFormProps {
  initialData?: Partial<Warehouse>;
  onSubmit: (data: Partial<Warehouse>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const WarehouseForm = memo(function WarehouseForm({ initialData, onSubmit, onCancel, isLoading }: WarehouseFormProps) {
  const [formData, setFormData] = useState<Partial<Warehouse>>({
    name: '',
    location: '',
    manager: '',
    contactNumber: '',
    capacity: 0,
    ...initialData,
  });

  const handleChange = (field: keyof Warehouse, value: any) => {
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
          <CardTitle className="text-base">Warehouse Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Warehouse Name *</label>
              <Input
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Main Warehouse"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location *</label>
              <Input
                value={formData.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g., MIDC Industrial Area, Pune"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Manager *</label>
              <Input
                value={formData.manager || ''}
                onChange={(e) => handleChange('manager', e.target.value)}
                placeholder="e.g., Rajesh Kumar"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Number *</label>
              <Input
                value={formData.contactNumber || ''}
                onChange={(e) => handleChange('contactNumber', e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Capacity (Sq. Ft.) *</label>
              <Input
                type="number"
                value={formData.capacity || ''}
                onChange={(e) => handleChange('capacity', Number(e.target.value))}
                placeholder="e.g., 10000"
                required
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
          {isLoading ? 'Saving...' : initialData?.id ? 'Update Warehouse' : 'Create Warehouse'}
        </Button>
      </div>
    </form>
  );
});

export { WarehouseForm };
