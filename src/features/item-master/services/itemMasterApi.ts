/**
 * Item Master API Service
 * API calls for Item Master / Product Catalog
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
import { getCategoryById } from '../data/categoryMasterData';

// Mock data for development (replace with actual API calls)
const mockItemMasters: ItemMaster[] = [
  {
    id: '1',
    sku: 'SS-PLT-001',
    itemCode: 'SS-PLT-001',
    itemName: 'Steel Plate 6mm',
    category: 'Structural Steel',
    subCategory: 'Plates',
    brand: 'TATA Steel',
    manufacturer: 'TATA Steel',
    countryOfOrigin: 'India',
    description: 'Hot rolled steel plate for structural applications',
    specification: 'IS 2062 Grade A, 6mm thickness',
    technicalDescription: 'Yield Strength: 250 MPa, Tensile Strength: 410 MPa',
    weight: 47.1, // KG per SQM
    standardDimensions: {
      length: 6000,
      width: 1500,
      thickness: 6,
    },
    unit: 'SQM',
    defaultRate: 5500,
    currency: 'INR',
    gstRate: 18,
    hsnCode: '7208',
    status: 'Active',
    itemTypeClass: 'Structural',
    taxType: 'CGST_SGST',
    materialGrade: 'IS 2062 Grade A',
    isStructural: true,
    thickness: 6,
    length: 6000,
    width: 1500,
    customFields: { coatingType: 'Galvanized', fireRating: '2hr' },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    sku: 'SS-PLT-002',
    itemCode: 'SS-PLT-002',
    itemName: 'Steel Plate 8mm',
    category: 'Structural Steel',
    subCategory: 'Plates',
    brand: 'TATA Steel',
    manufacturer: 'TATA Steel',
    countryOfOrigin: 'India',
    description: 'Hot rolled steel plate for structural applications',
    specification: 'IS 2062 Grade A, 8mm thickness',
    technicalDescription: 'Yield Strength: 250 MPa, Tensile Strength: 410 MPa',
    weight: 62.8, // KG per SQM
    standardDimensions: {
      length: 6000,
      width: 1500,
      thickness: 8,
    },
    unit: 'SQM',
    defaultRate: 6200,
    currency: 'INR',
    gstRate: 18,
    hsnCode: '7208',
    status: 'Active',
    itemTypeClass: 'Structural',
    taxType: 'CGST_SGST',
    materialGrade: 'IS 2062 Grade A',
    isStructural: true,
    thickness: 8,
    length: 6000,
    width: 1500,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    sku: 'CLD-PPGL-001',
    itemCode: 'CLD-PPGL-001',
    itemName: 'PPGL Roofing Sheet 0.5mm',
    category: 'Cladding',
    subCategory: 'Roofing Sheets',
    brand: 'Tata Bluescope',
    manufacturer: 'Tata Bluescope',
    countryOfOrigin: 'India',
    description: 'Pre-painted galvalume roofing sheet',
    specification: '0.5mm thickness, 1000mm effective width',
    technicalDescription: 'Zinc coating: 150 GSM, Paint coating: 35 microns',
    weight: 5.5,
    standardDimensions: {
      length: 12000,
      width: 1000,
      thickness: 0.5,
    },
    unit: 'SQM',
    defaultRate: 380,
    currency: 'INR',
    gstRate: 18,
    hsnCode: '7210',
    status: 'Active',
    itemTypeClass: 'Cladding',
    taxType: 'CGST_SGST',
    isCladding: true,
    thickness: 0.5,
    length: 12000,
    width: 1000,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '4',
    sku: 'INS-WOOL-001',
    itemCode: 'INS-WOOL-001',
    itemName: 'Glass Wool Insulation 50mm',
    category: 'Insulation',
    subCategory: 'Thermal Insulation',
    brand: 'Knauf',
    manufacturer: 'Knauf',
    countryOfOrigin: 'India',
    description: 'Glass wool insulation blanket for thermal insulation',
    specification: '50mm thickness, 48kg/m3 density',
    technicalDescription: 'Thermal conductivity: 0.035 W/mK',
    weight: 2.4, // KG per SQM
    standardDimensions: {
      length: 12000,
      width: 1200,
      thickness: 50,
    },
    unit: 'SQM',
    defaultRate: 180,
    currency: 'INR',
    gstRate: 18,
    hsnCode: '7019',
    status: 'Active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '5',
    sku: 'ACC-FST-001',
    itemCode: 'ACC-FST-001',
    itemName: 'High Strength Bolt M16',
    category: 'Fasteners',
    subCategory: 'Bolts',
    brand: 'Unbrako',
    manufacturer: 'Unbrako',
    countryOfOrigin: 'India',
    description: 'High strength hex bolt grade 8.8',
    specification: 'M16 x 50mm, Grade 8.8',
    technicalDescription: 'Tensile strength: 800 MPa',
    weight: 0.15, // KG per PCS
    unit: 'PCS',
    defaultRate: 25,
    currency: 'INR',
    gstRate: 18,
    hsnCode: '7318',
    status: 'Active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

const mockItemMasterStats: ItemMasterStats = {
  totalItems: 5,
  activeItems: 5,
  inactiveItems: 0,
  discontinuedItems: 0,
  itemsByCategory: {
    'Structural Steel': 2,
    'Cladding': 1,
    'Roofing': 0,
    'Insulation': 1,
    'Fasteners': 1,
    'Accessories': 0,
    'Doors': 0,
    'Windows': 0,
    'Gutters': 0,
    'Downspouts': 0,
    'Ventilation': 0,
    'Foundation': 0,
    'Electrical': 0,
    'Plumbing': 0,
    'Other': 0,
    'Roofing Sheets': 1,
  },
  itemsByBrand: {
    'TATA Steel': 2,
    'Tata Bluescope': 1,
    'Knauf': 1,
    'Unbrako': 1,
  },
  totalVariants: 0,
  totalBundles: 0,
  recentlyAdded: 5,
  recentlyUpdated: 0,
};

export const itemMasterApi = {
  // Item Master CRUD
  async getAll(query?: ItemMasterQuery): Promise<ItemMaster[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let items = [...mockItemMasters];
    
    // Apply filters
    if (query?.filter) {
      const { category, categoryId, status, search, brand, unit, itemTypeClass, taxType } = query.filter;

      if (categoryId) {
        const masterCategory = getCategoryById(categoryId);
        items = items.filter(item =>
          item.itemTypeId?.startsWith(categoryId) ||
          item.categoryId === categoryId ||
          item.subcategoryId === categoryId ||
          (masterCategory ? item.category === masterCategory.name : false)
        );
      } else if (category) {
        items = items.filter(item => item.category === category);
      }

      if (status) {
        items = items.filter(item => item.status === status);
      }

      if (brand) {
        items = items.filter(item => item.brand === brand);
      }

      if (unit) {
        items = items.filter(item => item.unit === unit);
      }

      if (itemTypeClass) {
        items = items.filter(item => item.itemTypeClass === itemTypeClass);
      }

      if (taxType) {
        items = items.filter(item => item.taxType === taxType);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        items = items.filter(item =>
          item.itemName.toLowerCase().includes(searchLower) ||
          item.itemCode.toLowerCase().includes(searchLower) ||
          item.sku?.toLowerCase().includes(searchLower) ||
          item.brand?.toLowerCase().includes(searchLower) ||
          item.grade?.toLowerCase().includes(searchLower) ||
          item.hsnCode?.toLowerCase().includes(searchLower) ||
          item.specification?.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower) ||
          item.manufacturer?.toLowerCase().includes(searchLower)
        );
      }
    }
    
    // Apply pagination
    if (query?.page && query?.pageSize) {
      const start = (query.page - 1) * query.pageSize;
      const end = start + query.pageSize;
      items = items.slice(start, end);
    }
    
    return items;
  },

  async getById(id: string): Promise<ItemMaster> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const item = mockItemMasters.find(i => i.id === id);
    if (!item) throw new Error('Item not found');
    return item;
  },

  async create(data: CreateItemMasterDto): Promise<ItemMaster> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newItem: ItemMaster = {
      id: (mockItemMasters.length + 1).toString(),
      ...data,
      status: data.status || 'Active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockItemMasters.push(newItem);
    return newItem;
  },

  async update(id: string, data: UpdateItemMasterDto): Promise<ItemMaster> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockItemMasters.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Item not found');
    
    mockItemMasters[index] = {
      ...mockItemMasters[index],
      ...data,
      updatedAt: new Date(),
    };
    
    return mockItemMasters[index];
  },

  async delete(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = mockItemMasters.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Item not found');
    mockItemMasters.splice(index, 1);
  },

  // Stats
  async getStats(): Promise<ItemMasterStats> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockItemMasterStats;
  },

  // Item Variants
  async getVariants(itemMasterId: string): Promise<ItemVariant[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    // TODO: Implement variant fetching
    return [];
  },

  async createVariant(data: CreateItemVariantDto): Promise<ItemVariant> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // TODO: Implement variant creation
    return {} as ItemVariant;
  },

  async updateVariant(id: string, data: UpdateItemVariantDto): Promise<ItemVariant> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // TODO: Implement variant update
    return {} as ItemVariant;
  },

  async deleteVariant(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    // TODO: Implement variant deletion
  },

  // Item Bundles
  async getBundles(query?: ItemMasterQuery): Promise<ItemBundle[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    // TODO: Implement bundle fetching
    return [];
  },

  async getBundleById(id: string): Promise<ItemBundle> {
    await new Promise(resolve => setTimeout(resolve, 200));
    // TODO: Implement bundle fetching by ID
    return {} as ItemBundle;
  },

  async createBundle(data: CreateItemBundleDto): Promise<ItemBundle> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // TODO: Implement bundle creation
    return {} as ItemBundle;
  },

  async updateBundle(id: string, data: UpdateItemBundleDto): Promise<ItemBundle> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // TODO: Implement bundle update
    return {} as ItemBundle;
  },

  async deleteBundle(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    // TODO: Implement bundle deletion
  },
};
