'use client';

import { useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { DataTable, Column } from '@/components/data-table/DataTable';
import { SupplierForm } from '@/features/inventory/components/SupplierForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Supplier } from '@/features/inventory/types';
import { useSuppliers, useCreateSupplier } from '@/features/inventory/hooks/useInventory';
import { Plus, Download, Truck, Building2, Phone, Mail, MapPin, Package } from 'lucide-react';

export default function SuppliersPage() {
  const { data: suppliers, isLoading } = useSuppliers();
  const createMutation = useCreateSupplier();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  const columns: Column<Supplier>[] = [
    {
      key: 'name',
      label: 'Supplier Name',
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <div>
          <p className="font-medium text-sm">{row.name}</p>
          {row.gstNumber && <p className="text-xs text-muted-foreground font-mono">{row.gstNumber}</p>}
        </div>
      ),
    },
    {
      key: 'contactPerson',
      label: 'Contact Person',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Building2 className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs">{value}</span>
        </div>
      ),
    },
    {
      key: 'mobile',
      label: 'Mobile',
      render: (value) => (
        <div className="flex items-center gap-1">
          <Phone className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-mono">{value}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (value) => (
        <div className="flex items-center gap-1">
          <Mail className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs">{value || '-'}</span>
        </div>
      ),
    },
    {
      key: 'city',
      label: 'Location',
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs">{row.city}, {row.state}</span>
        </div>
      ),
    },
    {
      key: 'suppliedMaterials',
      label: 'Materials',
      render: (value) => (
        <div className="flex items-center gap-1">
          <Package className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs">{value?.length || 0} items</span>
        </div>
      ),
    },
    {
      key: 'leadTime',
      label: 'Lead Time',
      sortable: true,
      render: (value) => (
        <span className="text-xs">{value ? `${value} days` : '-'}</span>
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

  const handleCreate = (data: Partial<Supplier>) => {
    createMutation.mutate(data as any, {
      onSuccess: () => setIsCreateDialogOpen(false),
    });
  };

  if (isLoading) {
    return (
      <MainLayout title="Supplier Management" subtitle="Manage material suppliers">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Loading suppliers...</p>
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
            <Truck className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground truncate">Total Suppliers</p>
            <p className="text-2xl font-bold">{suppliers?.length || 0}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-100 shrink-0">
            <Package className="h-5 w-5 text-green-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground truncate">Active Suppliers</p>
            <p className="text-2xl font-bold">
              {suppliers?.filter((s) => s.status === 'Active').length || 0}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 shrink-0">
            <Building2 className="h-5 w-5 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground truncate">Total Materials</p>
            <p className="text-2xl font-bold">
              {suppliers?.reduce((sum, s) => sum + (s.suppliedMaterials?.length || 0), 0) || 0}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100 shrink-0">
            <Phone className="h-5 w-5 text-purple-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground truncate">Avg Lead Time</p>
            <p className="text-2xl font-bold">
              {suppliers && suppliers.length > 0
                ? Math.round(
                    suppliers
                      .filter((s) => s.leadTime)
                      .reduce((sum, s) => sum + (s.leadTime || 0), 0) /
                      suppliers.filter((s) => s.leadTime).length
                  )
                : 0}
              {' '}
              days
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <MainLayout title="Supplier Management" subtitle="Manage material suppliers">
      <StandardPageLayout
        title="Supplier Management"
        subtitle="Manage material suppliers"
        kpiCards={kpiCards}
        kpiGridClassName="grid-cols-2 sm:grid-cols-4"
        toolbarActions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">Export</span>
            </Button>
            <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Supplier</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        }
      >
        <DataTable
          columns={columns}
          data={suppliers || []}
          enableSelection={true}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          rowIdKey="id"
        />
      </StandardPageLayout>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Supplier</DialogTitle>
          </DialogHeader>
          <SupplierForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
