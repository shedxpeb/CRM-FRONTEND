'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MainLayout } from '@/layouts/MainLayout';
import { DataTable, Column } from '@/components/data-table/DataTable';
import { KPICard } from '@/components/dashboard/KPICard';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { FilterConfig } from '@/components/layout/FilterBar';
import { getInventoryCustomFieldValue } from '@/features/inventory/components/InventoryCustomFields';

// Lazy load row actions to reduce initial bundle size
const InventoryRowActions = dynamic(
  () => import('@/features/inventory/components/InventoryRowActions').then((m) => ({ default: m.InventoryRowActions })),
  { loading: () => <div className="p-2">Loading...</div> }
);
import {
  useInventoryItems,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
  useInventoryConfiguration,
} from '@/features/inventory/hooks/useInventory';
import { InventoryItem, StockStatus, ItemTypeClass, CreateInventoryItemDto } from '@/features/inventory/types';
import { getStockStatusVariant } from '@/features/inventory/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ROUTES } from '@/core/routes';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { EmptyState } from '@/components/states/EmptyState';
import { Package, Plus, Download, Warehouse, AlertTriangle, DollarSign } from 'lucide-react';

const InventoryItemForm = dynamic(
  () => import('@/features/inventory/components/InventoryItemForm').then((m) => ({ default: m.InventoryItemForm })),
  { loading: () => <div className="p-8 text-center">Loading form...</div> }
);

const STOCK_STATUSES: StockStatus[] = ['In Stock', 'Low Stock', 'Out of Stock', 'Critical', 'On Order', 'Discontinued'];
const ITEM_TYPE_CLASSES: ItemTypeClass[] = ['Structural', 'Cladding', 'Accessory', 'Service', 'Other'];

function isLowStock(item: InventoryItem): boolean {
  return item.status === 'Low Stock' || item.status === 'Critical' || item.currentStock <= item.minimumStock;
}

function isReorderRequired(item: InventoryItem): boolean {
  return item.currentStock <= item.reorderLevel;
}

export default function InventoryPage() {
  const router = useRouter();
  const inventoryConfig = useInventoryConfiguration();

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StockStatus | 'all'>('all');
  const [itemTypeFilter, setItemTypeFilter] = useState<string>('all');
  const [lowStockFilter, setLowStockFilter] = useState<string>('all');
  const [reorderFilter, setReorderFilter] = useState<string>('all');

  const { data: itemsResponse, isLoading, error, refetch } = useInventoryItems({ page: 1, pageSize: 1000 });
  const createMutation = useCreateInventoryItem();
  const updateMutation = useUpdateInventoryItem();
  const deleteMutation = useDeleteInventoryItem();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  const allItems = itemsResponse?.data ?? [];

  const filterOptions = useMemo(() => {
    const categories = new Set<string>();
    const brands = new Set<string>();
    const warehouses = new Set<string>();
    for (const item of allItems) {
      if (item.category) categories.add(item.category);
      if (item.brand) brands.add(item.brand);
      if (item.warehouseName) warehouses.add(item.warehouseName);
    }
    return {
      categories: [...categories].sort(),
      brands: [...brands].sort(),
      warehouses: [...warehouses].sort(),
    };
  }, [allItems]);

  const filteredItems = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return allItems.filter((item) => {
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesBrand = brandFilter === 'all' || item.brand === brandFilter;
      const matchesWarehouse = warehouseFilter === 'all' || item.warehouseName === warehouseFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesType = itemTypeFilter === 'all' || item.itemTypeClass === itemTypeFilter;
      const matchesLowStock = lowStockFilter === 'all' || (lowStockFilter === 'yes' ? isLowStock(item) : !isLowStock(item));
      const matchesReorder = reorderFilter === 'all' || (reorderFilter === 'yes' ? isReorderRequired(item) : !isReorderRequired(item));
      const matchesSearch =
        !debouncedSearch ||
        item.itemCode.toLowerCase().includes(q) ||
        item.itemName.toLowerCase().includes(q) ||
        item.warehouseName?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.brand?.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        item.binLocation?.toLowerCase().includes(q);
      return matchesCategory && matchesBrand && matchesWarehouse && matchesStatus && matchesType && matchesLowStock && matchesReorder && matchesSearch;
    });
  }, [allItems, debouncedSearch, categoryFilter, brandFilter, warehouseFilter, statusFilter, itemTypeFilter, lowStockFilter, reorderFilter]);

  const selectedItem = useMemo(
    () => (selectedItemId ? allItems.find((i) => i.id === selectedItemId) ?? null : null),
    [allItems, selectedItemId]
  );

  // Combine stats and KPI data computation to reduce re-renders
  const { filteredStats, kpiData } = useMemo(() => {
    const warehouses = new Set<string>();
    let totalStock = 0;
    let lowStock = 0;
    let reorderRequired = 0;
    let stockValue = 0;
    for (const item of filteredItems) {
      totalStock += item.currentStock;
      stockValue += item.totalValue;
      if (item.warehouseName) warehouses.add(item.warehouseName);
      if (isLowStock(item)) lowStock++;
      if (isReorderRequired(item)) reorderRequired++;
    }
    const stats = {
      total: filteredItems.length,
      totalStock,
      lowStock,
      reorderRequired,
      warehouses: warehouses.size,
      stockValue,
    };
    
    const kpi = [
      { title: 'Total Items', value: String(stats.total), change: 0, icon: <Package className="h-5 w-5 text-blue-600" />, color: 'text-blue-600' },
      { title: 'Total Stock', value: stats.totalStock.toLocaleString(), change: 0, icon: <Package className="h-5 w-5 text-indigo-600" />, color: 'text-indigo-600' },
      { title: 'Low Stock Items', value: String(stats.lowStock), change: 0, icon: <AlertTriangle className="h-5 w-5 text-amber-600" />, color: 'text-amber-600' },
      { title: 'Reorder Required', value: String(stats.reorderRequired), change: 0, icon: <AlertTriangle className="h-5 w-5 text-orange-600" />, color: 'text-orange-600' },
      { title: 'Warehouses', value: String(stats.warehouses), change: 0, icon: <Warehouse className="h-5 w-5 text-purple-600" />, color: 'text-purple-600' },
      { title: 'Stock Value', value: `₹${(stats.stockValue / 100000).toFixed(1)}L`, change: 0, icon: <DollarSign className="h-5 w-5 text-green-600" />, color: 'text-green-600' },
    ];
    
    return { filteredStats: stats, kpiData: kpi };
  }, [filteredItems]);

  const tableFilterKey = useMemo(
    () => [debouncedSearch, categoryFilter, brandFilter, warehouseFilter, statusFilter, itemTypeFilter, lowStockFilter, reorderFilter].join('|'),
    [debouncedSearch, categoryFilter, brandFilter, warehouseFilter, statusFilter, itemTypeFilter, lowStockFilter, reorderFilter]
  );

  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        key: 'category',
        label: 'Category',
        value: categoryFilter,
        onChange: setCategoryFilter,
        options: [{ value: 'all', label: 'All Categories' }, ...filterOptions.categories.map((c) => ({ value: c, label: c }))],
      },
      {
        key: 'brand',
        label: 'Brand',
        value: brandFilter,
        onChange: setBrandFilter,
        options: [{ value: 'all', label: 'All Brands' }, ...filterOptions.brands.map((b) => ({ value: b, label: b }))],
      },
      {
        key: 'warehouse',
        label: 'Warehouse',
        value: warehouseFilter,
        onChange: setWarehouseFilter,
        options: [{ value: 'all', label: 'All Warehouses' }, ...filterOptions.warehouses.map((w) => ({ value: w, label: w }))],
      },
      {
        key: 'status',
        label: 'Stock Status',
        value: statusFilter,
        onChange: (v: string) => setStatusFilter(v as StockStatus | 'all'),
        options: [{ value: 'all', label: 'All Status' }, ...STOCK_STATUSES.map((s) => ({ value: s, label: s }))],
      },
      {
        key: 'itemType',
        label: 'Item Type',
        value: itemTypeFilter,
        onChange: setItemTypeFilter,
        options: [{ value: 'all', label: 'All Types' }, ...ITEM_TYPE_CLASSES.map((t) => ({ value: t, label: t }))],
      },
      {
        key: 'lowStock',
        label: 'Low Stock',
        value: lowStockFilter,
        onChange: setLowStockFilter,
        options: [
          { value: 'all', label: 'All' },
          { value: 'yes', label: 'Low Stock Only' },
          { value: 'no', label: 'Not Low Stock' },
        ],
      },
      {
        key: 'reorder',
        label: 'Reorder Required',
        value: reorderFilter,
        onChange: setReorderFilter,
        options: [
          { value: 'all', label: 'All' },
          { value: 'yes', label: 'Reorder Required' },
          { value: 'no', label: 'Not Required' },
        ],
      },
    ],
    [categoryFilter, brandFilter, warehouseFilter, statusFilter, itemTypeFilter, lowStockFilter, reorderFilter, filterOptions]
  );

  const handleClearFilters = useCallback(() => {
    setCategoryFilter('all');
    setBrandFilter('all');
    setWarehouseFilter('all');
    setStatusFilter('all');
    setItemTypeFilter('all');
    setLowStockFilter('all');
    setReorderFilter('all');
    setSearchQuery('');
  }, []);

  const baseColumns: Column<InventoryItem>[] = useMemo(
    () => [
      { key: 'itemCode', label: 'Code', sortable: true, className: 'w-[90px]', render: (v) => <span className="font-mono text-xs">{v}</span> },
      {
        key: 'itemName',
        label: 'Item',
        sortable: true,
        className: 'min-w-[140px] max-w-[200px]',
        render: (_, row) => (
          <div className="min-w-0">
            <p className="font-medium text-xs truncate">{row.itemName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{row.category || '-'}</p>
          </div>
        ),
      },
      { key: 'brand', label: 'Brand', sortable: true, className: 'hidden md:table-cell', headerClassName: 'hidden md:table-cell', render: (v) => <span className="text-xs">{v || '-'}</span> },
      { key: 'currentStock', label: 'Stock', sortable: true, render: (v, row) => <span className="text-xs font-medium">{Number(v).toLocaleString()} {row.unit}</span> },
      { key: 'availableStock', label: 'Available', sortable: true, className: 'hidden sm:table-cell', headerClassName: 'hidden sm:table-cell', render: (v, row) => <span className="text-xs text-green-700">{Number(v).toLocaleString()} {row.unit}</span> },
      { key: 'warehouseName', label: 'Warehouse', sortable: true, className: 'hidden lg:table-cell', headerClassName: 'hidden lg:table-cell', render: (v) => <span className="text-xs truncate">{v}</span> },
      { key: 'binLocation', label: 'Bin', sortable: true, className: 'hidden xl:table-cell', headerClassName: 'hidden xl:table-cell', render: (v) => <span className="text-xs font-mono">{v || '-'}</span> },
      {
        key: 'totalValue',
        label: 'Value',
        sortable: true,
        className: 'hidden lg:table-cell',
        headerClassName: 'hidden lg:table-cell',
        render: (v) => <span className="text-xs font-medium">₹{Number(v).toLocaleString()}</span>,
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (v) => (
          <Badge variant={getStockStatusVariant(v as StockStatus)} className="text-[10px]">
            {v}
          </Badge>
        ),
      },
    ],
    []
  );

  const settingsCustomColumnDefs = useMemo(
    () =>
      inventoryConfig.customFields.map((field) => ({
        key: field.key as keyof InventoryItem,
        label: field.label,
        sortable: true,
        className: 'hidden 2xl:table-cell',
        headerClassName: 'hidden 2xl:table-cell',
        render: (_: unknown, row: InventoryItem) => (
          <span className="text-xs truncate block">{getInventoryCustomFieldValue(row, field.key)?.toString() ?? '-'}</span>
        ),
      })),
    [inventoryConfig.customFields]
  );

  const columns = useMemo(() => [...baseColumns, ...settingsCustomColumnDefs], [baseColumns, settingsCustomColumnDefs]);

  const handleRowClick = useCallback((item: InventoryItem) => {
    router.push(ROUTES.inventoryDetail(item.id));
  }, [router]);

  const handleViewDetails = useCallback((item: InventoryItem) => {
    router.push(ROUTES.inventoryDetail(item.id));
  }, [router]);

  const handleEditFromRow = useCallback((item: InventoryItem) => {
    setSelectedItemId(item.id);
    setIsEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    (item: InventoryItem) => {
      if (confirm(`Delete inventory entry "${item.itemName}"?`)) {
        deleteMutation.mutate(item.id);
      }
    },
    [deleteMutation]
  );

  const handleCreate = useCallback(
    (data: Partial<InventoryItem>) => {
      createMutation.mutate(data as CreateInventoryItemDto, {
        onSuccess: (newItem) => {
          setIsCreateDialogOpen(false);
          refetch();
          router.push(ROUTES.inventoryDetail(newItem.id));
        },
      });
    },
    [createMutation, refetch, router]
  );

  const handleEdit = useCallback(
    (data: Partial<InventoryItem>) => {
      if (!selectedItem) return;
      updateMutation.mutate(
        { id: selectedItem.id, data },
        {
          onSuccess: () => {
            setIsEditDialogOpen(false);
            refetch();
          },
        }
      );
    },
    [selectedItem, updateMutation, refetch]
  );

  const handleExport = useCallback(() => {
    const headers = ['Item Code', 'Item Name', 'Category', 'Brand', 'Current Stock', 'Available', 'Warehouse', 'Bin', 'Status', 'Value'];
    const csv = [
      headers.join(','),
      ...filteredItems.map((i) =>
        [
          i.itemCode,
          `"${i.itemName}"`,
          i.category || '',
          i.brand || '',
          i.currentStock,
          i.availableStock,
          i.warehouseName,
          i.binLocation || '',
          i.status,
          i.totalValue,
        ].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [filteredItems]);

  if (isLoading && !allItems.length) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    const pending =
      (error as { code?: string; name?: string })?.code === 'BACKEND_PENDING' ||
      (error as { name?: string })?.name === 'BackendPendingError';
    return (
      <MainLayout>
        <EmptyState
          title={pending ? 'Inventory not available yet' : 'Failed to load inventory'}
          description={
            pending
              ? 'This module is intentionally incomplete. Stock APIs are not wired for production use yet.'
              : 'Something went wrong while loading inventory. Try again or return to the dashboard.'
          }
          actionLabel="Back to Dashboard"
          onAction={() => router.push(ROUTES.dashboard)}
          className="min-h-64"
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <StandardPageLayout
        title="Inventory"
        subtitle="Stock management — local demo data (no backend yet)"
        headerActions={
          <Button onClick={() => setIsCreateDialogOpen(true)} className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Inventory</span>
            <span className="sm:hidden">Add</span>
          </Button>
        }
        kpiCards={kpiData.map((kpi, i) => <KPICard key={i} data={kpi} />)}
        kpiGridClassName="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by code, name, warehouse, category, brand, status, or bin location..."
        filters={filterConfigs}
        onClearFilters={handleClearFilters}
        filterMode="popover"
        toolbarActions={
          <Button variant="outline" size="sm" onClick={handleExport} className="h-9 gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        }
        className="gap-4 sm:gap-6"
      >
        <div className="min-w-0">
          <DataTable
            key={tableFilterKey}
            columns={columns}
            data={filteredItems}
            showToolbar={false}
            compact
            onRowClick={handleRowClick}
            enableSelection
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            rowIdKey="id"
            emptyMessage="No inventory items found. Adjust your filters or add a new entry."
            rowActions={(row) => (
              <InventoryRowActions
                item={row as InventoryItem}
                onEdit={handleEditFromRow}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
              />
            )}
          />
        </div>
      </StandardPageLayout>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create Inventory Entry</DialogTitle></DialogHeader>
          <InventoryItemForm
            mode="create"
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Inventory Entry</DialogTitle></DialogHeader>
          {selectedItem && (
            <InventoryItemForm
              mode="edit"
              initialData={selectedItem}
              onSubmit={handleEdit}
              onCancel={() => setIsEditDialogOpen(false)}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
