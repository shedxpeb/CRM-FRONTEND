'use client';

import { useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { DataTable, Column } from '@/components/data-table/DataTable';
import { StockMovementForm } from '@/features/inventory/components/StockMovementForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StockMovement } from '@/features/inventory/types';
import { getMovementTypeVariant } from '@/features/inventory/constants';
import { useStockMovements, useCreateStockMovement } from '@/features/inventory/hooks/useInventory';
import { Plus, Download, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

export default function StockMovementsPage() {
  const [params, setParams] = useState({ page: 1, pageSize: 20 });
  const { data: movementsResponse, isLoading } = useStockMovements(params);
  const createMutation = useCreateStockMovement();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  const movements = movementsResponse?.data ?? [];

  const columns: Column<StockMovement>[] = [
    {
      key: 'movementNumber',
      label: 'Movement #',
      sortable: true,
      render: (value) => <span className="font-mono text-xs">{value}</span>,
    },
    {
      key: 'itemName',
      label: 'Item',
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <div>
          <p className="font-medium text-sm">{row.itemName}</p>
          <p className="text-xs text-muted-foreground">{row.movementNumber}</p>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      filterable: true,
      render: (value) => (
        <Badge variant={getMovementTypeVariant(value as any)}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'quantity',
      label: 'Quantity',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          {row.type === 'Stock In' ? (
            <ArrowDownToLine className="h-3 w-3 text-green-600" />
          ) : (
            <ArrowUpFromLine className="h-3 w-3 text-orange-600" />
          )}
          <span className="text-xs font-medium">{Number(row.quantity).toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: 'warehouse',
      label: 'Warehouse',
      sortable: true,
      filterable: true,
    },
    {
      key: 'referenceNumber',
      label: 'Reference',
      render: (value) => (
        <span className="text-xs font-mono">{value || '-'}</span>
      ),
    },
    {
      key: 'performedBy',
      label: 'Performed By',
      render: (value) => <span className="text-xs">{value}</span>,
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value) => {
        if (!value) return <span className="text-xs text-muted-foreground">-</span>;
        const date = new Date(value);
        return (
          <span className="text-xs text-muted-foreground">
            {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        );
      },
    },
    {
      key: 'remarks',
      label: 'Remarks',
      render: (value) => (
        <span className="text-xs text-muted-foreground truncate max-w-[150px] block">
          {value || '-'}
        </span>
      ),
    },
  ];

  const handleCreate = (data: Partial<StockMovement>) => {
    createMutation.mutate(data as any, {
      onSuccess: () => setIsCreateDialogOpen(false),
    });
  };

  if (isLoading) {
    return (
      <MainLayout title="Stock Movements" subtitle="Track all inventory movements">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Loading movements...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const kpiCards = (
    <>
      <div className="bg-white rounded-lg border p-4">
        <p className="text-sm text-muted-foreground truncate">Total Movements</p>
        <p className="text-2xl font-bold">{movements.length}</p>
      </div>
      <div className="bg-white rounded-lg border p-4">
        <p className="text-sm text-muted-foreground truncate">Stock In</p>
        <p className="text-2xl font-bold text-green-600">
          {movements.filter((m) => m.type === 'Stock In').length}
        </p>
      </div>
      <div className="bg-white rounded-lg border p-4">
        <p className="text-sm text-muted-foreground truncate">Stock Out</p>
        <p className="text-2xl font-bold text-orange-600">
          {movements.filter((m) => m.type === 'Stock Out').length}
        </p>
      </div>
    </>
  );

  return (
    <MainLayout title="Stock Movements" subtitle="Track all inventory movements">
      <StandardPageLayout
        title="Stock Movements"
        subtitle="Track all inventory movements"
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
              <span className="hidden sm:inline">New Movement</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        }
      >
        <DataTable
          columns={columns}
          data={movements}
          enableSelection={true}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          rowIdKey="id"
        />
      </StandardPageLayout>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Stock Movement</DialogTitle>
          </DialogHeader>
          <StockMovementForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
