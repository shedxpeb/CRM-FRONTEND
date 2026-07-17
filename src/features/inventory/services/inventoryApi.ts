/**
 * Inventory API — frontend-only (localStorage) until Nest module exists.
 */
import {
  InventoryItem,
  Warehouse,
  Supplier,
  Category,
  StockMovement,
  InventoryActivity,
  InventoryAlert,
  InventoryStats,
  InventoryFilters,
  CreateInventoryItemDto,
  CreateStockMovementDto,
  CreateWarehouseDto,
  CreateSupplierDto,
  CreateCategoryDto,
} from '@/features/inventory/types';
import { PaginatedData, PaginationParams } from '@/shared/types/pagination';
import { createLocalId, readLocalJson, writeLocalJson } from '@/lib/localStore';

const ITEMS_KEY = 'peb.frontend.inventory-items';
const WAREHOUSES_KEY = 'peb.frontend.inventory-warehouses';
const SUPPLIERS_KEY = 'peb.frontend.inventory-suppliers';
const CATEGORIES_KEY = 'peb.frontend.inventory-categories';
const MOVEMENTS_KEY = 'peb.frontend.inventory-movements';

function seedWarehouses(): Warehouse[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'wh_main',
      warehouseCode: 'WH-MAIN',
      name: 'Main Warehouse',
      location: 'Plant A',
      manager: 'Store Manager',
      contactNumber: '9000000001',
      capacity: 100000,
      currentOccupancy: 25000,
      status: 'Active',
      createdAt: now as unknown as Date,
      updatedAt: now as unknown as Date,
    },
    {
      id: 'wh_site',
      warehouseCode: 'WH-SITE',
      name: 'Site Store',
      location: 'Project Site',
      manager: 'Site Incharge',
      contactNumber: '9000000002',
      capacity: 20000,
      currentOccupancy: 4000,
      status: 'Active',
      createdAt: now as unknown as Date,
      updatedAt: now as unknown as Date,
    },
  ];
}

function loadWarehouses(): Warehouse[] {
  const existing = readLocalJson<Warehouse[] | null>(WAREHOUSES_KEY, null);
  if (existing && existing.length > 0 && existing.every((row) => row.warehouseCode && row.name)) {
    return existing;
  }
  const seeded = seedWarehouses();
  writeLocalJson(WAREHOUSES_KEY, seeded);
  return seeded;
}

function deriveStatus(current: number, minimum: number, reorder: number): InventoryItem['status'] {
  if (current <= 0) return 'Out of Stock';
  if (current <= minimum * 0.5) return 'Critical';
  if (current <= minimum || current <= reorder) return 'Low Stock';
  return 'In Stock';
}

function seedItems(): InventoryItem[] {
  const now = new Date().toISOString();
  const rows: Array<Omit<InventoryItem, 'availableStock' | 'status' | 'totalValue'> & { purchaseRate: number }> = [
    {
      id: 'inv_seed_1',
      itemCode: 'PEB-PLT-001',
      itemMasterId: 'item_seed_1',
      itemName: 'Primary Frame Plate',
      unit: 'Kg',
      currentStock: 12000,
      reservedStock: 1500,
      issuedStock: 800,
      minimumStock: 2000,
      reorderLevel: 3000,
      safetyStock: 1000,
      warehouseId: 'wh_main',
      warehouseName: 'Main Warehouse',
      category: 'Structural',
      brand: 'JSW',
      itemTypeClass: 'Structural',
      purchaseRate: 72,
      lastUpdated: now as unknown as Date,
      createdAt: now as unknown as Date,
      updatedAt: now as unknown as Date,
    },
    {
      id: 'inv_seed_2',
      itemCode: 'PEB-SHT-001',
      itemMasterId: 'item_seed_2',
      itemName: 'Roof Sheeting',
      unit: 'SqMeter',
      currentStock: 850,
      reservedStock: 100,
      issuedStock: 50,
      minimumStock: 200,
      reorderLevel: 300,
      safetyStock: 100,
      warehouseId: 'wh_main',
      warehouseName: 'Main Warehouse',
      category: 'Cladding',
      brand: 'Tata',
      itemTypeClass: 'Cladding',
      purchaseRate: 450,
      lastUpdated: now as unknown as Date,
      createdAt: now as unknown as Date,
      updatedAt: now as unknown as Date,
    },
    {
      id: 'inv_seed_3',
      itemCode: 'PEB-BLT-001',
      itemMasterId: 'item_seed_3',
      itemName: 'High Strength Bolt Set',
      unit: 'Set',
      currentStock: 40,
      reservedStock: 10,
      issuedStock: 5,
      minimumStock: 50,
      reorderLevel: 80,
      safetyStock: 20,
      warehouseId: 'wh_site',
      warehouseName: 'Site Store',
      category: 'Accessory',
      brand: 'Unbrako',
      itemTypeClass: 'Accessory',
      purchaseRate: 85,
      lastUpdated: now as unknown as Date,
      createdAt: now as unknown as Date,
      updatedAt: now as unknown as Date,
    },
  ];

  return rows.map((row) => {
    const availableStock = Math.max(0, row.currentStock - row.reservedStock);
    return {
      ...row,
      availableStock,
      totalValue: row.currentStock * row.purchaseRate,
      status: deriveStatus(row.currentStock, row.minimumStock, row.reorderLevel),
    };
  });
}

function loadItems(): InventoryItem[] {
  const existing = readLocalJson<InventoryItem[] | null>(ITEMS_KEY, null);
  if (existing && existing.length > 0) return existing;
  const seeded = seedItems();
  writeLocalJson(ITEMS_KEY, seeded);
  return seeded;
}

function saveItems(items: InventoryItem[]) {
  writeLocalJson(ITEMS_KEY, items);
}

function paginate<T>(rows: T[], params?: PaginationParams): PaginatedData<T> {
  const page = Math.max(1, params?.page || 1);
  const pageSize = Math.max(1, params?.pageSize || 25);
  const start = (page - 1) * pageSize;
  const data = rows.slice(start, start + pageSize);
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    data,
    meta: {
      page,
      pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    },
  };
}

function filterItems(rows: InventoryItem[], params?: PaginationParams & InventoryFilters): InventoryItem[] {
  if (!params) return rows;
  const q = params.search?.toLowerCase().trim();
  return rows.filter((item) => {
    if (params.warehouse && item.warehouseName !== params.warehouse && item.warehouseId !== params.warehouse) {
      return false;
    }
    if (params.stockStatus && item.status !== params.stockStatus) return false;
    if (params.category && item.category !== params.category) return false;
    if (params.brand && item.brand !== params.brand) return false;
    if (params.itemTypeClass && item.itemTypeClass !== params.itemTypeClass) return false;
    if (params.lowStock && !(item.status === 'Low Stock' || item.status === 'Critical')) return false;
    if (
      q &&
      ![item.itemCode, item.itemName, item.category, item.brand, item.warehouseName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    ) {
      return false;
    }
    return true;
  });
}

function normalizeItem(
  data: CreateInventoryItemDto | Partial<CreateInventoryItemDto>,
  existing?: InventoryItem,
): InventoryItem {
  const warehouses = loadWarehouses();
  const warehouse =
    warehouses.find((w) => w.id === data.warehouseId) ||
    warehouses.find((w) => w.id === existing?.warehouseId) ||
    warehouses[0];

  const currentStock = data.currentStock ?? existing?.currentStock ?? 0;
  const reservedStock = existing?.reservedStock ?? 0;
  const issuedStock = existing?.issuedStock ?? 0;
  const minimumStock = data.minimumStock ?? existing?.minimumStock ?? 0;
  const reorderLevel = data.reorderLevel ?? existing?.reorderLevel ?? 0;
  const safetyStock = data.safetyStock ?? existing?.safetyStock ?? 0;
  const purchaseRate = data.purchaseRate ?? existing?.purchaseRate ?? 0;
  const availableStock = Math.max(0, currentStock - reservedStock);
  const now = new Date().toISOString();

  return {
    id: existing?.id || createLocalId('inv'),
    itemMasterId: data.itemMasterId || existing?.itemMasterId || '',
    itemCode: data.itemCode || existing?.itemCode || '',
    itemName: data.itemName || existing?.itemName || '',
    unit: (data.unit || existing?.unit || 'Nos') as InventoryItem['unit'],
    currentStock,
    reservedStock,
    issuedStock,
    availableStock,
    totalValue: currentStock * purchaseRate,
    minimumStock,
    reorderLevel,
    safetyStock,
    warehouseId: warehouse?.id || 'wh_main',
    warehouseName: warehouse?.name || 'Main Warehouse',
    status: data.status || deriveStatus(currentStock, minimumStock, reorderLevel),
    lastUpdated: now as unknown as Date,
    createdAt: existing?.createdAt || (now as unknown as Date),
    updatedAt: now as unknown as Date,
    category: existing?.category,
    brand: existing?.brand,
    itemTypeClass: existing?.itemTypeClass,
    binLocation: data.binLocation ?? existing?.binLocation,
    reorderQuantity: data.reorderQuantity ?? existing?.reorderQuantity,
    purchaseRate,
    customFields: data.customFields ?? existing?.customFields,
  };
}

export const inventoryApi = {
  getAll: async (params?: PaginationParams & InventoryFilters): Promise<PaginatedData<InventoryItem>> => {
    return paginate(filterItems(loadItems(), params), params);
  },

  getById: async (id: string): Promise<InventoryItem> => {
    const item = loadItems().find((row) => row.id === id);
    if (!item) throw new Error('Inventory item not found');
    return item;
  },

  create: async (data: CreateInventoryItemDto): Promise<InventoryItem> => {
    const items = loadItems();
    const created = normalizeItem(data);
    items.unshift(created);
    saveItems(items);
    return created;
  },

  update: async (id: string, data: Partial<CreateInventoryItemDto>): Promise<InventoryItem> => {
    const items = loadItems();
    const index = items.findIndex((row) => row.id === id);
    if (index < 0) throw new Error('Inventory item not found');
    const updated = normalizeItem(data, items[index]);
    items[index] = updated;
    saveItems(items);
    return updated;
  },

  delete: async (id: string): Promise<void> => {
    saveItems(loadItems().filter((row) => row.id !== id));
  },

  getStats: async (): Promise<InventoryStats> => {
    const items = loadItems();
    return {
      totalItems: items.length,
      totalValue: items.reduce((sum, i) => sum + (i.totalValue || 0), 0),
      lowStockItems: items.filter((i) => i.status === 'Low Stock' || i.status === 'Critical').length,
      outOfStockItems: items.filter((i) => i.status === 'Out of Stock').length,
      incomingStock: items.reduce((sum, i) => sum + (i.incomingStock || 0), 0),
      outgoingStock: items.reduce((sum, i) => sum + (i.outgoingStock || 0), 0),
      reservedStock: items.reduce((sum, i) => sum + (i.reservedStock || 0), 0),
      activeSuppliers: readLocalJson<Supplier[]>(SUPPLIERS_KEY, []).length,
      pendingPurchaseRequests: 0,
      materialShortages: items.filter((i) => i.status === 'Critical' || i.status === 'Out of Stock').length,
    };
  },

  getActivities: async (_id: string): Promise<InventoryActivity[]> => [],

  getWarehouses: async (): Promise<Warehouse[]> => loadWarehouses(),

  createWarehouse: async (data: CreateWarehouseDto): Promise<Warehouse> => {
    const rows = loadWarehouses();
    const now = new Date().toISOString();
    const created: Warehouse = {
      ...data,
      id: createLocalId('wh'),
      createdAt: now as unknown as Date,
      updatedAt: now as unknown as Date,
    };
    rows.push(created);
    writeLocalJson(WAREHOUSES_KEY, rows);
    return created;
  },

  updateWarehouse: async (id: string, data: Partial<Warehouse>): Promise<Warehouse> => {
    const rows = loadWarehouses();
    const index = rows.findIndex((row) => row.id === id);
    if (index < 0) throw new Error('Warehouse not found');
    rows[index] = {
      ...rows[index],
      ...data,
      id,
      updatedAt: new Date().toISOString() as unknown as Date,
    };
    writeLocalJson(WAREHOUSES_KEY, rows);
    return rows[index];
  },

  getSuppliers: async (): Promise<Supplier[]> => readLocalJson(SUPPLIERS_KEY, []),

  createSupplier: async (data: CreateSupplierDto): Promise<Supplier> => {
    const rows = readLocalJson<Supplier[]>(SUPPLIERS_KEY, []);
    const now = new Date().toISOString();
    const created: Supplier = {
      ...data,
      id: createLocalId('sup'),
      suppliedMaterials: [],
      status: 'Active',
      createdAt: now as unknown as Date,
      updatedAt: now as unknown as Date,
    };
    rows.push(created);
    writeLocalJson(SUPPLIERS_KEY, rows);
    return created;
  },

  updateSupplier: async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
    const rows = readLocalJson<Supplier[]>(SUPPLIERS_KEY, []);
    const index = rows.findIndex((row) => row.id === id);
    if (index < 0) throw new Error('Supplier not found');
    rows[index] = {
      ...rows[index],
      ...data,
      id,
      updatedAt: new Date().toISOString() as unknown as Date,
    };
    writeLocalJson(SUPPLIERS_KEY, rows);
    return rows[index];
  },

  getCategories: async (): Promise<Category[]> => readLocalJson(CATEGORIES_KEY, []),

  createCategory: async (data: CreateCategoryDto): Promise<Category> => {
    const rows = readLocalJson<Category[]>(CATEGORIES_KEY, []);
    const created: Category = {
      id: createLocalId('cat'),
      name: data.name,
      parentId: data.parentId,
      description: data.description,
      itemCount: 0,
      status: 'Active',
    };
    rows.push(created);
    writeLocalJson(CATEGORIES_KEY, rows);
    return created;
  },

  getMovements: async (params?: PaginationParams): Promise<PaginatedData<StockMovement>> => {
    return paginate(readLocalJson<StockMovement[]>(MOVEMENTS_KEY, []), params);
  },

  createMovement: async (data: Omit<StockMovement, 'id'> | CreateStockMovementDto): Promise<StockMovement> => {
    const rows = readLocalJson<StockMovement[]>(MOVEMENTS_KEY, []);
    const created = { ...(data as object), id: createLocalId('mov') } as StockMovement;
    rows.unshift(created);
    writeLocalJson(MOVEMENTS_KEY, rows);
    return created;
  },

  getMovementHistory: async (itemId: string): Promise<StockMovement[]> => {
    return readLocalJson<StockMovement[]>(MOVEMENTS_KEY, []).filter(
      (row) => (row as { itemId?: string }).itemId === itemId,
    );
  },

  getAlerts: async (): Promise<InventoryAlert[]> => {
    return loadItems()
      .filter((item) => ['Low Stock', 'Critical', 'Out of Stock'].includes(item.status))
      .map((item) => ({
        id: `alert_${item.id}`,
        itemId: item.id,
        itemName: item.itemName,
        itemCode: item.itemCode,
        type:
          item.status === 'Out of Stock'
            ? 'Out of Stock'
            : item.status === 'Critical'
              ? 'Critical Stock'
              : 'Low Stock',
        currentStock: item.currentStock,
        threshold: item.minimumStock,
        severity: item.status === 'Out of Stock' || item.status === 'Critical' ? 'critical' : 'warning',
        createdAt: new Date(),
      }));
  },
};
