'use client';

import { useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { DataTable, Column } from '@/components/data-table/DataTable';
import { CategoryForm } from '@/features/inventory/components/CategoryForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Category } from '@/features/inventory/types';
import { useCategories, useCreateCategory } from '@/features/inventory/hooks/useInventory';
import { Plus, Download, FolderTree, Package, FileText } from 'lucide-react';

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const createMutation = useCreateCategory();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  const columns: Column<Category>[] = [
    {
      key: 'name',
      label: 'Category Name',
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <div>
          <p className="font-medium text-sm">{row.name}</p>
          {row.parentId && <p className="text-xs text-muted-foreground">Parent: {row.parentId}</p>}
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (value) => (
        <div className="flex items-center gap-1">
          <FileText className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs truncate max-w-[200px]">{value || '-'}</span>
        </div>
      ),
    },
    {
      key: 'itemCount',
      label: 'Items',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Package className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-medium">{Number(value).toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      render: (value) => (
        <Badge variant={value === 'Active' ? 'success' : 'secondary'}>
          {value}
        </Badge>
      ),
    },
  ];

  const handleCreate = (data: Partial<Category>) => {
    createMutation.mutate(data as any, {
      onSuccess: () => setIsCreateDialogOpen(false),
    });
  };

  if (isLoading) {
    return (
      <MainLayout title="Category Management" subtitle="Manage material categories">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Loading categories...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const kpiCards = (
    <>
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 shrink-0">
            <FolderTree className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground truncate">Total Categories</p>
            <p className="text-2xl font-bold">{categories?.length || 0}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-100 shrink-0">
            <Package className="h-5 w-5 text-green-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground truncate">Total Items</p>
            <p className="text-2xl font-bold">
              {categories?.reduce((sum, cat) => sum + cat.itemCount, 0) || 0}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100 shrink-0">
            <FolderTree className="h-5 w-5 text-purple-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground truncate">Active Categories</p>
            <p className="text-2xl font-bold">
              {categories?.filter((c) => c.status === 'Active').length || 0}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <MainLayout title="Category Management" subtitle="Manage material categories">
      <StandardPageLayout
        title="Category Management"
        subtitle="Manage material categories"
        kpiCards={kpiCards}
        kpiGridClassName="grid-cols-1 sm:grid-cols-3"
        toolbarActions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">Export</span>
            </Button>
            <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Category</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        }
      >
        <DataTable
          columns={columns}
          data={categories || []}
          enableSelection={true}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          rowIdKey="id"
        />
      </StandardPageLayout>

      {/* Create Category Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <CategoryForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
