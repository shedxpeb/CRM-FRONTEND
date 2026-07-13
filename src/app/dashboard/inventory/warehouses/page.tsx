'use client';

import { useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { DataTable, Column } from '@/components/data-table/DataTable';
import { WarehouseForm } from '@/features/inventory/components/WarehouseForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Warehouse } from '@/features/inventory/types';
import { useWarehouses, useCreateWarehouse } from '@/features/inventory/hooks/useInventory';
import { Plus, Download, Building2, MapPin, User, Phone, Package } from 'lucide-react';

export default function WarehousesPage() {
  const { data: warehouses, isLoading } = useWarehouses();
  const createMutation = useCreateWarehouse();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  const columns: Column<Warehouse>[] = [
    {
      key: 'warehouseCode',
      label: 'Warehouse Code',
      sortable: true,
      render: (value) => <span className="font-mono text-xs">{value}</span>,
    },
    {
      key: 'name',
      label: 'Warehouse Name',
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <div>
          <p className="font-medium text-sm">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.warehouseCode}</p>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
      filterable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs">{value}</span>
        </div>
      ),
    },
    {
      key: 'manager',
      label: 'Manager',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <User className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs">{value}</span>
        </div>
      ),
    },
    {
      key: 'contactNumber',
      label: 'Contact',
      render: (value) => (
        <div className="flex items-center gap-1">
          <Phone className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-mono">{value}</span>
        </div>
      ),
    },
    {
      key: 'capacity',
      label: 'Capacity',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Package className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs">{Number(value).toLocaleString()} sq.ft</span>
        </div>
      ),
    },
    {
      key: 'currentOccupancy',
      label: 'Occupancy',
      sortable: true,
      render: (value, row) => {
        const percentage = (Number(value) / Number(row.capacity)) * 100;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <span className="text-xs">{percentage.toFixed(1)}%</span>
          </div>
        );
      },
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

  const handleCreate = (data: Partial<Warehouse>) => {
    createMutation.mutate(data as any, {
      onSuccess: () => setIsCreateDialogOpen(false),
    });
  };

  if (isLoading) {
    return (
      <MainLayout title="Warehouse Management" subtitle="Manage warehouse locations">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Loading warehouses...</p>
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
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground truncate">Total Warehouses</p>
            <p className="text-2xl font-bold">{warehouses?.length || 0}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-100 shrink-0">
            <Package className="h-5 w-5 text-green-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground truncate">Total Capacity</p>
            <p className="text-2xl font-bold">
              {((warehouses?.reduce((sum, wh) => sum + wh.capacity, 0) || 0) / 10000).toFixed(1)}L sq.ft
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100 shrink-0">
            <Package className="h-5 w-5 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground truncate">Total Occupancy</p>
            <p className="text-2xl font-bold">
              {((warehouses?.reduce((sum, wh) => sum + wh.currentOccupancy, 0) || 0) / 10000).toFixed(1)}L sq.ft
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100 shrink-0">
            <Building2 className="h-5 w-5 text-purple-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground truncate">Active Warehouses</p>
            <p className="text-2xl font-bold">
              {warehouses?.filter((wh) => wh.status === 'Active').length || 0}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <MainLayout title="Warehouse Management" subtitle="Manage warehouse locations">
      <StandardPageLayout
        title="Warehouse Management"
        subtitle="Manage warehouse locations"
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
              <span className="hidden sm:inline">Add Warehouse</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        }
      >
        <DataTable
          columns={columns}
          data={warehouses || []}
          enableSelection={true}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          rowIdKey="id"
        />
      </StandardPageLayout>

      {/* Create Warehouse Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Warehouse</DialogTitle>
          </DialogHeader>
          <WarehouseForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
