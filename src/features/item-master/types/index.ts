/**
 * Item Master / Product Catalog Types
 * 
 * This is the single source of truth for all products/items in the system.
 * Inventory module only manages stock quantities, not product definitions.
 * 
 * Architecture:
 * - Item Master (this module) → Product definition (Brand, Grade, Spec, HSN, Dimensions, Weight, Technical Files, Default Pricing)
 * - Inventory → Stock operations only (Current Stock, Reserved, Issued, Available, Warehouse, Stock Movement)
 * 
 * Estimate, Proposal, and Quotation should store snapshots of item data, not itemMasterId directly.
 * This ensures that if Item Master price changes later, old documents remain unchanged.
 */

// ─── Item Categories ─────────────────────────────────────────────────────────────

// Dynamic category from master data (no longer hardcoded)
export type ItemCategory = string;

// Category hierarchy types
export interface CategoryNode {
  id: string;
  name: string;
  code: string;
  level: number; // 1 = main category, 2 = subcategory, 3 = item type
  categoryType: 'PRODUCT' | 'PROCESS' | 'SPECIALIZED';
  description?: string;
  icon?: string;
  children?: CategoryNode[];
  items?: string[];
}

export type CategoryType = 'PRODUCT' | 'PROCESS' | 'SPECIALIZED';

// ─── Item Status ────────────────────────────────────────────────────────────────

export type ItemStatus = 'Active' | 'Inactive' | 'Discontinued';

// ─── Unit Types ─────────────────────────────────────────────────────────────────

export type UnitType =
  | 'KG'
  | 'MT'
  | 'PCS'
  | 'NOS'
  | 'SQM'
  | 'SQFT'
  | 'M'
  | 'FT'
  | 'LTR'
  | 'SET'
  | 'BUNDLE';

export type ItemTypeClass = 'Structural' | 'Cladding' | 'Accessory' | 'Service' | 'Other';

export type TaxType = 'CGST_SGST' | 'IGST' | 'Exempt';

export type ItemCustomFieldType = 'text' | 'number' | 'boolean' | 'select' | 'textarea';

export interface ItemCustomFieldDefinition {
  key: string;
  label: string;
  type: ItemCustomFieldType;
  required?: boolean;
  options?: string[];
}

export type ItemCustomFieldValues = Record<string, string | number | boolean | undefined>;

// ─── Item Master Entity ─────────────────────────────────────────────────────────

export interface ItemMaster {
  // Compulsory Fields
  id: string;
  sku: string; // SKU / Item Code (unique identifier)
  itemCode: string; // Item Code (for display)
  itemName: string; // Product name
  category: ItemCategory; // Category
  subCategory?: string; // Subcategory
  categoryId?: string; // Reference to category ID
  subcategoryId?: string; // Reference to subcategory ID
  itemTypeId?: string; // Reference to item type ID
  brand?: string; // Brand
  grade?: string; // Grade
  specification?: string; // Specification
  hsnCode?: string; // HSN Code
  unit: UnitType; // Unit
  weight?: number; // Weight
  defaultRate?: number; // Default Rate
  gstRate?: number; // GST %
  technicalDescription?: string; // Technical Description
  datasheetUrl?: string; // Datasheet
  productImageUrl?: string; // Product Image
  status: ItemStatus; // Active/Inactive

  // Additional Fields
  tags?: string[];
  manufacturer?: string;
  countryOfOrigin?: string;
  description?: string;
  standardDimensions?: {
    length?: number;
    width?: number;
    height?: number;
    thickness?: number;
    diameter?: number;
  };
  currency?: string; // Default: 'INR'
  images?: string[];
  preferredSupplierId?: string;
  preferredSupplier?: string;

  // Stock Reference (links to Inventory module)
  inventoryItemId?: string; // Reference to inventory stock record

  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;

  // Notes
  notes?: string;
  internalNotes?: string;

  // PEB classification
  itemTypeClass?: ItemTypeClass;
  taxType?: TaxType;
  materialGrade?: string;
  isStructural?: boolean;
  isCladding?: boolean;
  isAccessory?: boolean;
  isService?: boolean;
  thickness?: number;
  length?: number;
  width?: number;

  // Settings-driven custom fields
  customFields?: ItemCustomFieldValues;
}

// ─── Item Variant (for products with multiple variants) ───────────────────────

export interface ItemVariant {
  id: string;
  itemMasterId: string;
  variantName: string; // e.g., "6mm", "8mm", "10mm"
  variantCode: string; // e.g., "SS-PLT-001-6MM"
  
  // Variant-specific properties
  specifications?: string;
  standardWeight?: number;
  dimensions?: {
    thickness?: number;
    width?: number;
    length?: number;
  };
  
  // Variant-specific pricing
  defaultRate?: number;
  
  // Status
  status: ItemStatus;
  
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Item Bundle (for pre-configured product bundles) ───────────────────────────

export interface ItemBundle {
  id: string;
  bundleCode: string;
  bundleName: string;
  description?: string;
  
  // Bundle items
  items: BundleItem[];
  
  // Bundle pricing
  bundleRate?: number;
  discountPercentage?: number;
  
  // Status
  status: ItemStatus;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BundleItem {
  itemMasterId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unit: UnitType;
  rate?: number;
}

// ─── DTOs ───────────────────────────────────────────────────────────────────────

export interface CreateItemMasterDto {
  // Compulsory Fields
  sku: string;
  itemCode: string;
  itemName: string;
  category: ItemCategory;
  subCategory?: string;
  brand?: string;
  grade?: string;
  specification?: string;
  hsnCode?: string;
  unit: UnitType;
  weight?: number;
  defaultRate?: number;
  gstRate?: number;
  technicalDescription?: string;
  datasheetUrl?: string;
  productImageUrl?: string;
  status?: ItemStatus;

  // Additional Fields
  tags?: string[];
  manufacturer?: string;
  countryOfOrigin?: string;
  description?: string;
  standardDimensions?: {
    length?: number;
    width?: number;
    height?: number;
    thickness?: number;
    diameter?: number;
  };
  currency?: string;
  images?: string[];
  preferredSupplierId?: string;
  preferredSupplier?: string;
  inventoryItemId?: string;
  notes?: string;
  internalNotes?: string;
}

export interface UpdateItemMasterDto {
  itemName?: string;
  category?: ItemCategory;
  subCategory?: string;
  tags?: string[];
  brand?: string;
  manufacturer?: string;
  countryOfOrigin?: string;
  description?: string;
  specifications?: string;
  technicalData?: string;
  standardWeight?: number;
  standardDimensions?: {
    length?: number;
    width?: number;
    height?: number;
    thickness?: number;
    diameter?: number;
  };
  unit?: UnitType;
  defaultRate?: number;
  currency?: string;
  gstRate?: number;
  hsnCode?: string;
  images?: string[];
  datasheetUrl?: string;
  status?: ItemStatus;
  inventoryItemId?: string;
  notes?: string;
  internalNotes?: string;
  itemTypeClass?: ItemTypeClass;
  taxType?: TaxType;
  materialGrade?: string;
  isStructural?: boolean;
  isCladding?: boolean;
  isAccessory?: boolean;
  isService?: boolean;
  thickness?: number;
  length?: number;
  width?: number;
  customFields?: ItemCustomFieldValues;
}

export interface CreateItemVariantDto {
  itemMasterId: string;
  variantName: string;
  variantCode: string;
  specifications?: string;
  standardWeight?: number;
  dimensions?: {
    thickness?: number;
    width?: number;
    length?: number;
  };
  defaultRate?: number;
  status?: ItemStatus;
}

export interface UpdateItemVariantDto {
  variantName?: string;
  specifications?: string;
  standardWeight?: number;
  dimensions?: {
    thickness?: number;
    width?: number;
    length?: number;
  };
  defaultRate?: number;
  status?: ItemStatus;
}

export interface CreateItemBundleDto {
  bundleCode: string;
  bundleName: string;
  description?: string;
  items: Omit<BundleItem, 'itemName'>[];
  bundleRate?: number;
  discountPercentage?: number;
  status?: ItemStatus;
}

export interface UpdateItemBundleDto {
  bundleName?: string;
  description?: string;
  items?: Omit<BundleItem, 'itemName'>[];
  bundleRate?: number;
  discountPercentage?: number;
  status?: ItemStatus;
}

// ─── Filter & Query Types ───────────────────────────────────────────────────────

export interface ItemMasterFilter {
  category?: ItemCategory;
  categoryId?: string;
  subCategory?: string;
  brand?: string;
  status?: ItemStatus;
  itemTypeClass?: ItemTypeClass;
  taxType?: TaxType;
  unit?: UnitType;
  search?: string;
  tags?: string[];
  hsnCode?: string;
}

export interface ItemMasterQuery {
  page?: number;
  pageSize?: number;
  filter?: ItemMasterFilter;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Stats Types ────────────────────────────────────────────────────────────────

export interface ItemMasterStats {
  totalItems: number;
  activeItems: number;
  inactiveItems: number;
  discontinuedItems: number;
  
  itemsByCategory: Record<ItemCategory, number>;
  itemsByBrand: Record<string, number>;
  
  totalVariants: number;
  totalBundles: number;
  
  recentlyAdded: number;
  recentlyUpdated: number;
}
