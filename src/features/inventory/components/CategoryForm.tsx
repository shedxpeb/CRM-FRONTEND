'use client';

import { useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Category } from '@/features/inventory/types';
import { X } from 'lucide-react';

interface CategoryFormProps {
  initialData?: Partial<Category>;
  onSubmit: (data: Partial<Category>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const CategoryForm = memo(function CategoryForm({ initialData, onSubmit, onCancel, isLoading }: CategoryFormProps) {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '',
    parentId: '',
    description: '',
    ...initialData,
  });

  const handleChange = (field: keyof Category, value: any) => {
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
          <CardTitle className="text-base">Category Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Category Name *</label>
              <Input
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Steel Products"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Parent Category ID</label>
              <Input
                value={formData.parentId || ''}
                onChange={(e) => handleChange('parentId', e.target.value)}
                placeholder="Parent category ID (optional)"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe this category..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows={3}
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
          {isLoading ? 'Saving...' : initialData?.id ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  );
});

export { CategoryForm };
