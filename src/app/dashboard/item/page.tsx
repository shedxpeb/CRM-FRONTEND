'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/layouts/MainLayout';
import { DataTable, Column } from '@/components/data-table/DataTable';
import { KPICard } from '@/components/dashboard/KPICard';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { FilterConfig } from '@/components/layout/FilterBar';
import { ItemRowActions } from '@/features/item-master/components/ItemRowActions';
import { ItemForm } from '@/features/item-master/components/ItemForm';
import { getItemCustomFieldValue } from '@/features/item-master/components/ItemCustomFields';
import {
  useItemMasters,
  useCreateItemMaster,
  useUpdateItemMaster,
  useDeleteItemMaster,
  useItemConfiguration,
} from '@/features/item-master/hooks/useItemMaster';
import { ItemMaster, ItemStatus, ItemTypeClass, TaxType, UnitType, CreateItemMasterDto } from '@/features/item-master/types';
import { getCategoryPath } from '@/features/item-master/data/categoryMasterData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ROUTES } from '@/core/routes';
import { EmptyState } from '@/components/states/EmptyState';
import { Package, Plus, Download } from 'lucide-react';

const ITEM_STATUSES: ItemStatus[] = ['Active', 'Inactive', 'Discontinued'];
const ITEM_TYPE_CLASSES: ItemTypeClass[] = ['Structural', 'Cladding', 'Accessory', 'Service', 'Other'];
const TAX_TYPES: TaxType[] = ['CGST_SGST', 'IGST', 'Exempt'];
const UNITS: UnitType[] = ['KG', 'MT', 'PCS', 'NOS', 'SQM', 'SQFT', 'M', 'FT', 'LTR', 'SET', 'BUNDLE'];

function getItemCategoryLabel(item: ItemMaster): string {
  if (item.itemTypeId) return getCategoryPath(item.itemTypeId);
  if (item.categoryId) return getCategoryPath(item.categoryId);
  if (item.subCategory && item.category) return `${item.category} > ${item.subCategory}`;
  return item.category || '-';
}

export default function ItemPage() {
  const router = useRouter();
  const itemConfig = useItemConfiguration();

  // SearchBar already debounces before calling onSearchChange, so we use the
  // value directly here instead of debouncing a second time.
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [itemTypeFilter, setItemTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<ItemStatus | 'all'>('all');
  const [taxFilter, setTaxFilter] = useState<string>('all');

  const { data: allItems, isLoading, error } = useItemMasters();
  const createMutation = useCreateItemMaster();
  const updateMutation = useUpdateItemMaster();
  const deleteMutation = useDeleteItemMaster();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  const filterOptions = useMemo(() => {
    const categories = new Set<string>();
    const brands = new Set<string>();
    const units = new Set<string>();
    for (const item of allItems ?? []) {
      if (item.category) categories.add(item.category);
      if (item.brand) brands.add(item.brand);
      if (item.unit) units.add(item.unit);
    }
    return {
      categories: [...categories].sort(),
      brands: [...brands].sort(),
      units: [...units].sort(),
    };
  }, [allItems]);

  const filteredItems = useMemo(() => {
    if (!allItems) return [];
    const q = searchQuery.toLowerCase().trim();
    return allItems.filter((item) => {
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesBrand = brandFilter === 'all' || item.brand === brandFilter;
      const matchesUnit = unitFilter === 'all' || item.unit === unitFilter;
      const matchesType = itemTypeFilter === 'all' || item.itemTypeClass === itemTypeFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesTax = taxFilter === 'all' || item.taxType === taxFilter;
      const matchesSearch =
        !q ||
        item.itemCode.toLowerCase().includes(q) ||
        item.itemName.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.brand?.toLowerCase().includes(q) ||
        item.unit?.toLowerCase().includes(q) ||
        item.specification?.toLowerCase().includes(q) ||
        item.hsnCode?.toLowerCase().includes(q);
      return matchesCategory && matchesBrand && matchesUnit && matchesType && matchesStatus && matchesTax && matchesSearch;
    });
  }, [allItems, searchQuery, categoryFilter, brandFilter, unitFilter, itemTypeFilter, statusFilter, taxFilter]);

  const selectedItem = useMemo(
    () => (selectedItemId ? allItems?.find((i) => i.id === selectedItemId) ?? null : null),
    [allItems, selectedItemId]
  );

  const filteredStats = useMemo(() => {
    const categories = new Set<string>();
    const brands = new Set<string>();
    let active = 0;
    for (const item of filteredItems) {
      if (item.status === 'Active') active++;
      if (item.category) categories.add(item.category);
      if (item.brand) brands.add(item.brand);
    }
    return { total: filteredItems.length, active, categories: categories.size, brands: brands.size };
  }, [filteredItems]);

  const kpiData = useMemo(
    () => [
      { title: 'Total Items', value: String(filteredStats.total), change: 0, icon: <Package className="h-5 w-5 text-blue-600" />, color: 'text-blue-600' },
      { title: 'Active Items', value: String(filteredStats.active), change: 0, icon: <Package className="h-5 w-5 text-green-600" />, color: 'text-green-600' },
      { title: 'Categories', value: String(filteredStats.categories), change: 0, icon: <Package className="h-5 w-5 text-purple-600" />, color: 'text-purple-600' },
      { title: 'Brands', value: String(filteredStats.brands), change: 0, icon: <Package className="h-5 w-5 text-orange-600" />, color: 'text-orange-600' },
    ],
    [filteredStats]
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
        key: 'unit',
        label: 'Unit',
        value: unitFilter,
        onChange: setUnitFilter,
        options: [{ value: 'all', label: 'All Units' }, ...filterOptions.units.map((u) => ({ value: u, label: u }))],
      },
      {
        key: 'itemType',
        label: 'Item Type',
        value: itemTypeFilter,
        onChange: setItemTypeFilter,
        options: [{ value: 'all', label: 'All Types' }, ...ITEM_TYPE_CLASSES.map((t) => ({ value: t, label: t }))],
      },
      {
        key: 'status',
        label: 'Status',
        value: statusFilter,
        onChange: (v: string) => setStatusFilter(v as ItemStatus | 'all'),
        options: [{ value: 'all', label: 'All Status' }, ...ITEM_STATUSES.map((s) => ({ value: s, label: s }))],
      },
      {
        key: 'tax',
        label: 'Tax Type',
        value: taxFilter,
        onChange: setTaxFilter,
        options: [{ value: 'all', label: 'All Tax Types' }, ...TAX_TYPES.map((t) => ({ value: t, label: t.replace('_', '/') }))],
      },
    ],
    [categoryFilter, brandFilter, unitFilter, itemTypeFilter, statusFilter, taxFilter, filterOptions]
  );

  const handleClearFilters = useCallback(() => {
    setCategoryFilter('all');
    setBrandFilter('all');
    setUnitFilter('all');
    setItemTypeFilter('all');
    setStatusFilter('all');
    setTaxFilter('all');
    setSearchQuery('');
  }, []);

  const baseColumns: Column<ItemMaster>[] = useMemo(
    () => [
      { key: 'itemCode', label: 'Code', sortable: true, className: 'w-[100px]', render: (v) => <span className="font-mono text-xs">{v}</span> },
      {
        key: 'itemName',
        label: 'Item Name',
        sortable: true,
        className: 'min-w-[140px] max-w-[200px]',
        render: (_, row) => (
          <div className="min-w-0">
            <p className="font-medium text-xs truncate">{row.itemName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{getItemCategoryLabel(row)}</p>
          </div>
        ),
      },
      { key: 'brand', label: 'Brand', sortable: true, className: 'hidden md:table-cell', headerClassName: 'hidden md:table-cell', render: (v) => <span className="text-xs">{v || '-'}</span> },
      { key: 'unit', label: 'Unit', sortable: true, className: 'hidden sm:table-cell', headerClassName: 'hidden sm:table-cell' },
      {
        key: 'defaultRate',
        label: 'Rate',
        sortable: true,
        className: 'hidden lg:table-cell',
        headerClassName: 'hidden lg:table-cell',
        render: (v) => <span className="text-xs font-medium">{v != null ? `₹${Number(v).toLocaleString()}` : '-'}</span>,
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (v) => (
          <Badge variant={v === 'Active' ? 'default' : v === 'Inactive' ? 'secondary' : 'destructive'} className="text-[10px]">
            {v}
          </Badge>
        ),
      },
    ],
    []
  );

  const settingsCustomColumnDefs = useMemo(
    () =>
      itemConfig.customFields.map((field) => ({
        key: field.key as keyof ItemMaster,
        label: field.label,
        sortable: true,
        className: 'hidden 2xl:table-cell',
        headerClassName: 'hidden 2xl:table-cell',
        render: (_: unknown, row: ItemMaster) => (
          <span className="text-xs truncate block">{getItemCustomFieldValue(row, field.key)?.toString() ?? '-'}</span>
        ),
      })),
    [itemConfig.customFields]
  );

  const columns = useMemo(() => [...baseColumns, ...settingsCustomColumnDefs], [baseColumns, settingsCustomColumnDefs]);

  const handleRowClick = useCallback((item: ItemMaster) => {
    router.push(ROUTES.itemsDetail(item.id));
  }, [router]);

  const handleViewDetails = useCallback((item: ItemMaster) => {
    router.push(ROUTES.itemsDetail(item.id));
  }, [router]);

  const handleEditFromRow = useCallback((item: ItemMaster) => {
    setSelectedItemId(item.id);
    setIsEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    (item: ItemMaster) => {
      if (confirm(`Delete item "${item.itemName}"?`)) {
        deleteMutation.mutate(item.id);
      }
    },
    [deleteMutation]
  );

  const handleExport = useCallback(() => {
    const headers = ['Item Code', 'Item Name', 'Category', 'Brand', 'Unit', 'Rate', 'HSN', 'GST%', 'Status'];
    const csv = [headers.join(','), ...filteredItems.map((i) =>
      [i.itemCode, `"${i.itemName}"`, i.category, i.brand || '', i.unit, i.defaultRate ?? '', i.hsnCode || '', i.gstRate ?? '', i.status].join(',')
    )].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `items_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [filteredItems]);

  if (isLoading && !allItems) {
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
          title={pending ? 'Items not available yet' : 'Failed to load items'}
          description={
            pending
              ? 'This module is intentionally incomplete. Item Master APIs are not wired for production use yet.'
              : 'Something went wrong while loading items. Try again or return to the dashboard.'
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
        title="Items"
        subtitle="Product catalog — local demo data (no backend yet)"
        headerActions={
          <Button onClick={() => setIsCreateDialogOpen(true)} className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add Item</span>
            <span className="sm:hidden">Add</span>
          </Button>
        }
        kpiCards={kpiData.map((kpi, i) => <KPICard key={i} data={kpi} />)}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by code, name, category, brand, unit, specification, or HSN..."
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
            columns={columns}
            data={filteredItems}
            showToolbar={false}
            compact
            onRowClick={handleRowClick}
            enableSelection
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
            rowIdKey="id"
            emptyMessage="No items found. Adjust your filters or add a new item."
            rowActions={(row) => (
              <ItemRowActions
                item={row as ItemMaster}
                onView={handleViewDetails}
                onEdit={handleEditFromRow}
                onDelete={handleDelete}
              />
            )}
          />
        </div>
      </StandardPageLayout>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create New Item</DialogTitle></DialogHeader>
          <ItemForm
            mode="create"
            onSubmit={(data: Partial<ItemMaster>) =>
              createMutation.mutate(data as CreateItemMasterDto, {
                onSuccess: () => setIsCreateDialogOpen(false),
              })
            }
            onCancel={() => setIsCreateDialogOpen(false)}
            isSubmitting={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Item</DialogTitle></DialogHeader>
          {selectedItem && (
            <ItemForm
              mode="edit"
              initialData={selectedItem}
              onSubmit={(data: Partial<ItemMaster>) =>
                updateMutation.mutate(
                  { id: selectedItem.id, data },
                  { onSuccess: () => { setIsEditDialogOpen(false); setSelectedItemId(null); } }
                )
              }
              onCancel={() => { setIsEditDialogOpen(false); setSelectedItemId(null); }}
              isSubmitting={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
