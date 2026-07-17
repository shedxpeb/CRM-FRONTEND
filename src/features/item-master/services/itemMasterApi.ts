/**
 * Item Master API — frontend-only (localStorage) until Nest module exists.
 */
import {
  ItemMaster,
  ItemVariant,
  ItemBundle,
  CreateItemMasterDto,
  UpdateItemMasterDto,
  CreateItemVariantDto,
  UpdateItemVariantDto,
  CreateItemBundleDto,
  UpdateItemBundleDto,
  ItemMasterQuery,
  ItemMasterStats,
} from '../types';
import { createLocalId, readLocalJson, writeLocalJson } from '@/lib/localStore';

const ITEMS_KEY = 'peb.frontend.item-masters';
const VARIANTS_KEY = 'peb.frontend.item-variants';
const BUNDLES_KEY = 'peb.frontend.item-bundles';

function seedItems(): ItemMaster[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'item_seed_1',
      sku: 'PEB-PLT-001',
      itemCode: 'PEB-PLT-001',
      itemName: 'Primary Frame Plate',
      category: 'Structural',
      brand: 'JSW',
      unit: 'KG',
      defaultRate: 72,
      gstRate: 18,
      status: 'Active',
      itemTypeClass: 'Structural',
      taxType: 'CGST_SGST',
      hsnCode: '7208',
      createdAt: now as unknown as Date,
      updatedAt: now as unknown as Date,
    },
    {
      id: 'item_seed_2',
      sku: 'PEB-SHT-001',
      itemCode: 'PEB-SHT-001',
      itemName: 'Roof Sheeting',
      category: 'Cladding',
      brand: 'Tata',
      unit: 'SQM',
      defaultRate: 450,
      gstRate: 18,
      status: 'Active',
      itemTypeClass: 'Cladding',
      taxType: 'CGST_SGST',
      hsnCode: '7210',
      createdAt: now as unknown as Date,
      updatedAt: now as unknown as Date,
    },
    {
      id: 'item_seed_3',
      sku: 'PEB-BLT-001',
      itemCode: 'PEB-BLT-001',
      itemName: 'High Strength Bolt Set',
      category: 'Accessory',
      brand: 'Unbrako',
      unit: 'SET',
      defaultRate: 85,
      gstRate: 18,
      status: 'Active',
      itemTypeClass: 'Accessory',
      taxType: 'CGST_SGST',
      createdAt: now as unknown as Date,
      updatedAt: now as unknown as Date,
    },
  ];
}

function loadItems(): ItemMaster[] {
  const existing = readLocalJson<ItemMaster[] | null>(ITEMS_KEY, null);
  if (existing && existing.length > 0) return existing;
  const seeded = seedItems();
  writeLocalJson(ITEMS_KEY, seeded);
  return seeded;
}

function saveItems(items: ItemMaster[]) {
  writeLocalJson(ITEMS_KEY, items);
}

function loadVariants(): ItemVariant[] {
  return readLocalJson<ItemVariant[]>(VARIANTS_KEY, []);
}

function saveVariants(rows: ItemVariant[]) {
  writeLocalJson(VARIANTS_KEY, rows);
}

function loadBundles(): ItemBundle[] {
  return readLocalJson<ItemBundle[]>(BUNDLES_KEY, []);
}

function saveBundles(rows: ItemBundle[]) {
  writeLocalJson(BUNDLES_KEY, rows);
}

function matchesQuery(item: ItemMaster, query?: ItemMasterQuery): boolean {
  if (!query?.filter) return true;
  const filter = query.filter;
  if (filter.search) {
    const q = filter.search.toLowerCase();
    const hay = [item.itemCode, item.itemName, item.category, item.brand, item.sku]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (filter.category && item.category !== filter.category) return false;
  if (filter.status && item.status !== filter.status) return false;
  if (filter.brand && item.brand !== filter.brand) return false;
  return true;
}

export const itemMasterApi = {
  async getAll(query?: ItemMasterQuery): Promise<ItemMaster[]> {
    return loadItems().filter((item) => matchesQuery(item, query));
  },

  async getById(id: string): Promise<ItemMaster> {
    const item = loadItems().find((row) => row.id === id);
    if (!item) throw new Error('Item not found');
    return item;
  },

  async create(data: CreateItemMasterDto): Promise<ItemMaster> {
    const items = loadItems();
    const now = new Date().toISOString();
    const code = data.itemCode || data.sku || `ITEM-${items.length + 1}`;
    const created: ItemMaster = {
      ...data,
      id: createLocalId('item'),
      sku: data.sku || code,
      itemCode: code,
      itemName: data.itemName,
      category: data.category,
      unit: data.unit,
      status: data.status || 'Active',
      createdAt: now as unknown as Date,
      updatedAt: now as unknown as Date,
    };
    items.unshift(created);
    saveItems(items);
    return created;
  },

  async update(id: string, data: UpdateItemMasterDto): Promise<ItemMaster> {
    const items = loadItems();
    const index = items.findIndex((row) => row.id === id);
    if (index < 0) throw new Error('Item not found');
    const updated: ItemMaster = {
      ...items[index],
      ...data,
      id,
      updatedAt: new Date().toISOString() as unknown as Date,
    };
    items[index] = updated;
    saveItems(items);
    return updated;
  },

  async delete(id: string): Promise<void> {
    saveItems(loadItems().filter((row) => row.id !== id));
    saveVariants(loadVariants().filter((row) => row.itemMasterId !== id));
  },

  async getStats(): Promise<ItemMasterStats> {
    const items = loadItems();
    const itemsByCategory: Record<string, number> = {};
    const itemsByBrand: Record<string, number> = {};
    for (const item of items) {
      itemsByCategory[item.category] = (itemsByCategory[item.category] || 0) + 1;
      if (item.brand) itemsByBrand[item.brand] = (itemsByBrand[item.brand] || 0) + 1;
    }
    return {
      totalItems: items.length,
      activeItems: items.filter((i) => i.status === 'Active').length,
      inactiveItems: items.filter((i) => i.status === 'Inactive').length,
      discontinuedItems: items.filter((i) => i.status === 'Discontinued').length,
      itemsByCategory,
      itemsByBrand,
      totalVariants: loadVariants().length,
      totalBundles: loadBundles().length,
      recentlyAdded: items.length,
      recentlyUpdated: items.length,
    };
  },

  async getVariants(itemMasterId: string): Promise<ItemVariant[]> {
    return loadVariants().filter((row) => row.itemMasterId === itemMasterId);
  },

  async createVariant(data: CreateItemVariantDto): Promise<ItemVariant> {
    const rows = loadVariants();
    const created: ItemVariant = {
      id: createLocalId('var'),
      itemMasterId: data.itemMasterId,
      variantName: data.variantName,
      variantCode: data.variantCode,
      specifications: data.specifications,
      standardWeight: data.standardWeight,
      dimensions: data.dimensions,
      defaultRate: data.defaultRate,
      status: data.status || 'Active',
      createdAt: new Date() as unknown as Date,
      updatedAt: new Date() as unknown as Date,
    };
    rows.push(created);
    saveVariants(rows);
    return created;
  },

  async updateVariant(id: string, data: UpdateItemVariantDto): Promise<ItemVariant> {
    const rows = loadVariants();
    const index = rows.findIndex((row) => row.id === id);
    if (index < 0) throw new Error('Variant not found');
    rows[index] = { ...rows[index], ...data, id, updatedAt: new Date() as unknown as Date };
    saveVariants(rows);
    return rows[index];
  },

  async deleteVariant(id: string): Promise<void> {
    saveVariants(loadVariants().filter((row) => row.id !== id));
  },

  async getBundles(_query?: ItemMasterQuery): Promise<ItemBundle[]> {
    return loadBundles();
  },

  async getBundleById(id: string): Promise<ItemBundle> {
    const bundle = loadBundles().find((row) => row.id === id);
    if (!bundle) throw new Error('Bundle not found');
    return bundle;
  },

  async createBundle(data: CreateItemBundleDto): Promise<ItemBundle> {
    const rows = loadBundles();
    const created: ItemBundle = {
      id: createLocalId('bundle'),
      bundleCode: data.bundleCode,
      bundleName: data.bundleName,
      description: data.description,
      items: (data.items || []).map((row) => ({
        ...row,
        itemName: '',
      })) as ItemBundle['items'],
      bundleRate: data.bundleRate,
      discountPercentage: data.discountPercentage,
      status: data.status || 'Active',
      createdAt: new Date() as unknown as Date,
      updatedAt: new Date() as unknown as Date,
    };
    rows.unshift(created);
    saveBundles(rows);
    return created;
  },

  async updateBundle(id: string, data: UpdateItemBundleDto): Promise<ItemBundle> {
    const rows = loadBundles();
    const index = rows.findIndex((row) => row.id === id);
    if (index < 0) throw new Error('Bundle not found');
    const nextItems = data.items
      ? (data.items.map((row) => ({ ...row, itemName: '' })) as ItemBundle['items'])
      : rows[index].items;
    rows[index] = {
      ...rows[index],
      ...data,
      items: nextItems,
      id,
      updatedAt: new Date() as unknown as Date,
    };
    saveBundles(rows);
    return rows[index];
  },

  async deleteBundle(id: string): Promise<void> {
    saveBundles(loadBundles().filter((row) => row.id !== id));
  },
};
