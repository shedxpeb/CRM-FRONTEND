/**
 * PEB Inventory Master Types
 * Single Source of Truth for PEB material categories, brands, grades, specifications
 * 
 * Architecture:
 * - Item Master (separate module: features/item-master/) → Product definition (Brand, Grade, Spec, HSN, Dimensions, Weight, Technical Files, Default Pricing)
 * - Inventory (this module) → Stock operations only (Current Stock, Reserved, Issued, Available, Warehouse, Stock Movement)
 * 
 * This file contains PEB-specific material categories, brands, grades, specifications
 * that are used across the ERP system for Pre-Engineered Building business.
 * 
 * Item Master is a separate module - see features/item-master/types/index.ts
 */

// ─── PEB Material Categories ─────────────────────────────────────────────────────

/**
 * PEB Material Categories
 * Hierarchical structure for organizing PEB materials
 */
export type PEBMaterialCategory =
  | 'Primary Structural Steel'
  | 'Secondary Structural Steel'
  | 'Roofing Sheets'
  | 'Wall Sheets'
  | 'Insulation'
  | 'Fasteners'
  | 'Paint'
  | 'Accessories'
  | 'Gutters'
  | 'Downspouts'
  | 'Skylights'
  | 'Ridge Ventilators'
  | 'Flashings'
  | 'Doors'
  | 'Windows'
  | 'Hardware'
  | 'Electrical'
  | 'Civil Material'
  | 'Fabrication Material'
  | 'Services';

/**
 * PEB Sub-Categories
 * More specific categorization within main categories
 */
export type PEBSubCategory =
  // Primary Steel
  | 'Built-Up Sections'
  | 'Hot Rolled Sections'
  | 'Plates'
  | 'Angles'
  | 'Channels'
  | 'Beams'
  | 'Columns'
  // Secondary Steel
  | 'Purlins'
  | 'Girts'
  | 'Eave Struts'
  | 'Sag Rods'
  | 'Bracing'
  // Roofing Sheets
  | 'Standing Seam'
  | 'Corrugated'
  | 'Trapezoidal'
  | 'Profile Sheets'
  // Wall Sheets
  | 'Single Skin'
  | 'Double Skin'
  | 'Sandwich Panels'
  // Insulation
  | 'Rockwool'
  | 'Glass Wool'
  | 'PUF'
  | 'Thermocol'
  // Fasteners
  | 'Self Drilling'
  | 'Self Tapping'
  | 'Bolts'
  | 'Nuts'
  | 'Washers'
  // Paint
  | 'Primer'
  | 'Topcoat'
  | 'Enamel'
  | 'Epoxy'
  // Accessories
  | 'Ridge Caps'
  | 'Valleys'
  | 'Closures'
  | 'Trim'
  // Doors
  | 'Overhead Doors'
  | 'Rolling Shutters'
  | 'Walk Doors'
  // Windows
  | 'Louvers'
  | 'Glass Windows'
  | 'Ventilators'
  // Services
  | 'Fabrication'
  | 'Erection'
  | 'Transportation'
  | 'Design'
  | 'Consultation';

// ─── Brand Management ─────────────────────────────────────────────────────────────

/**
 * PEB Brand
 * Manufacturer/Supplier brand for materials
 */
export interface PEBBrand {
  id: string;
  brandCode: string;
  brandName: string;
  category: PEBMaterialCategory;
  subCategories?: PEBSubCategory[];
  
  // Brand Details
  logo?: string;
  website?: string;
  description?: string;
  
  // Contact
  manufacturer?: string;
  supplier?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  
  // Status
  isPreferred: boolean;
  isActive: boolean;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Common PEB Brands by Category
 */
export const PEB_BRAND_CATALOG: Record<PEBMaterialCategory, string[]> = {
  'Primary Structural Steel': ['Tata Steel', 'JSW Steel', 'Jindal Steel', 'SAIL', 'ArcelorMittal'],
  'Secondary Structural Steel': ['Tata Steel', 'JSW Steel', 'Jindal Steel', 'SAIL'],
  'Roofing Sheets': ['Tata Bluescope', 'JSW Colouron+', 'Everest', 'Tata Durashine', 'Birla'],
  'Wall Sheets': ['Tata Bluescope', 'JSW Colouron+', 'Everest', 'Tata Durashine', 'Birla'],
  'Insulation': ['Rockwool', 'Owens Corning', 'Knauf', 'Saint-Gobain', 'Asian Insulation'],
  'Fasteners': ['Hilti', 'ITW Buildex', 'Ramset', 'Simpson Strong-Tie', 'Hilti India'],
  'Paint': ['Asian Paints', 'Berger', 'Dulux', 'Nippon', 'Jotun'],
  'Accessories': ['Various', 'Custom', 'Generic'],
  'Gutters': ['Tata Bluescope', 'JSW', 'Everest', 'Custom'],
  'Downspouts': ['Tata Bluescope', 'JSW', 'Everest', 'Custom'],
  'Skylights': ['Fakro', 'Velux', 'Custom', 'Generic'],
  'Ridge Ventilators': ['Greenheck', 'Custom', 'Generic'],
  'Flashings': ['Custom', 'Generic', 'Tata Bluescope'],
  'Doors': ['Assa Abloy', 'Hormann', 'Custom', 'Generic'],
  'Windows': ['Fakro', 'Velux', 'Custom', 'Generic'],
  'Hardware': ['Hilti', 'Generic', 'Custom'],
  'Electrical': ['Schneider', 'ABB', 'Siemens', 'Havells', 'Generic'],
  'Civil Material': ['Various', 'Local', 'Branded'],
  'Fabrication Material': ['Various', 'Local', 'Branded'],
  'Services': ['In-House', 'Outsourced', 'Partner'],
};

// ─── Grade & Specification Management ────────────────────────────────────────────

/**
 * Material Grade
 * Quality/grade specification for materials
 */
export interface MaterialGrade {
  id: string;
  gradeCode: string;
  gradeName: string;
  category: PEBMaterialCategory;
  subCategory?: PEBSubCategory;
  
  // Grade Details
  standard?: string; // IS, ASTM, JIS, etc.
  description?: string;
  specifications?: Record<string, any>;
  
  // Status
  isActive: boolean;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Common Material Grades by Category
 */
export const MATERIAL_GRADES: Record<PEBMaterialCategory, string[]> = {
  'Primary Structural Steel': ['Fe 410', 'Fe 500', 'Fe 540', 'A36', 'A572', 'S355'],
  'Secondary Structural Steel': ['Fe 410', 'Fe 500', 'A36', 'S355'],
  'Roofing Sheets': ['TCT 0.35', 'TCT 0.45', 'TCT 0.50', 'TCT 0.60', 'TCT 0.80'],
  'Wall Sheets': ['TCT 0.35', 'TCT 0.45', 'TCT 0.50', 'TCT 0.60'],
  'Insulation': ['48 kg/m3', '64 kg/m3', '96 kg/m3', '128 kg/m3'],
  'Fasteners': ['4.8', '8.8', '10.9', '12.9', 'Stainless 304', 'Stainless 316'],
  'Paint': ['Epoxy', 'Polyurethane', 'Enamel', 'Primer'],
  'Accessories': ['Standard', 'Heavy Duty', 'Custom'],
  'Gutters': ['Standard', 'Heavy Duty'],
  'Downspouts': ['Standard', 'Heavy Duty'],
  'Skylights': ['Polycarbonate', 'Glass', 'Fiberglass'],
  'Ridge Ventilators': ['Aluminum', 'Galvanized', 'Stainless'],
  'Flashings': ['Standard', 'Custom'],
  'Doors': ['Standard', 'Heavy Duty', 'Fire Rated'],
  'Windows': ['Standard', 'Insulated', 'Double Glazed'],
  'Hardware': ['Standard', 'Heavy Duty'],
  'Electrical': ['Standard', 'Industrial', 'Heavy Duty'],
  'Civil Material': ['Standard', 'Premium'],
  'Fabrication Material': ['Standard', 'Premium'],
  'Services': ['Standard', 'Premium'],
};

/**
 * Material Specification
 * Detailed technical specifications for materials
 */
export interface MaterialSpecification {
  id: string;
  specCode: string;
  specName: string;
  category: PEBMaterialCategory;
  subCategory?: PEBSubCategory;
  grade?: string;
  
  // Technical Specifications
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    thickness?: number;
    diameter?: number;
  };
  
  physicalProperties?: {
    weight?: number;
    density?: number;
    tensileStrength?: number;
    yieldStrength?: number;
    elongation?: number;
  };
  
  chemicalProperties?: Record<string, any>;
  
  // Coating/Finish
  coating?: string;
  finish?: string;
  color?: string;
  
  // Standards
  standards?: string[];
  certifications?: string[];
  
  // Description
  description?: string;
  
  // Status
  isActive: boolean;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Material Variant
 * Specific variant of a material (color, size, etc.)
 */
export interface MaterialVariant {
  id: string;
  variantCode: string;
  variantName: string;
  materialId: string;
  category: PEBMaterialCategory;
  subCategory?: PEBSubCategory;
  
  // Variant Attributes
  attributes: Record<string, string>;
  
  // Pricing
  priceAdjustment?: number;
  priceAdjustmentType?: 'fixed' | 'percentage';
  
  // Availability
  isAvailable: boolean;
  stockStatus?: 'In Stock' | 'Low Stock' | 'Out of Stock';
  
  // Status
  isActive: boolean;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── PEB Inventory Item (Enhanced) ───────────────────────────────────────────────

/**
 * PEB Inventory Item
 * Enhanced inventory item with PEB-specific attributes
 * This is the master record used by all commercial documents
 */
export interface PEBInventoryItem {
  id: string;
  itemCode: string;
  
  // Basic Information
  itemName: string;
  category: PEBMaterialCategory;
  subCategory?: PEBSubCategory;
  unit: string;
  
  // PEB Material Hierarchy
  brand?: string;
  brandId?: string;
  grade?: string;
  gradeId?: string;
  specification?: string;
  specificationId?: string;
  variant?: string;
  variantId?: string;
  
  // Material Type
  materialType: 'Raw Material' | 'Finished Goods' | 'Semi Finished' | 'Consumable' | 'Accessory' | 'Hardware' | 'Fastener' | 'Roofing Sheet' | 'Wall Sheet' | 'Structural Steel' | 'Electrical' | 'Civil Material' | 'Service';
  
  // Technical Specifications
  thickness?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  color?: string;
  coating?: string;
  
  // Additional Technical Details
  gauge?: string;
  profile?: string;
  finish?: string;
  standard?: string;
  
  // Commercial Information
  purchaseRate: number;
  sellingRate?: number;
  taxPercentage?: number;
  hsnCode?: string;
  
  // Inventory Rules
  minimumStock: number;
  reorderLevel: number;
  safetyStock: number;
  warehouseId: string;
  warehouseName: string;
  
  // Supplier
  preferredSupplierId?: string;
  preferredSupplier?: string;
  
  // Stock Levels (computed)
  currentStock: number;
  reservedStock: number;
  consumedStock: number;
  availableStock: number;
  totalValue: number;
  
  // Cross-module relationships
  reservedByProjects?: string[]; // Array of project IDs that reserved this item
  consumedByProjects?: string[]; // Array of project IDs that consumed this item
  
  // Status
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Critical' | 'On Order' | 'Discontinued';
  
  // PEB-Specific Flags
  isStructural: boolean;
  isCladding: boolean;
  isAccessory: boolean;
  isService: boolean;
  
  // Usage Tracking
  usedInEstimates: number;
  usedInProposals: number;
  usedInQuotations: number;
  
  // Timestamps
  lastUpdated: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Material Selection Helper Types ─────────────────────────────────────────────

/**
 * Material Selection Options
 * Available options for a material category
 */
export interface MaterialSelectionOptions {
  category: PEBMaterialCategory;
  subCategories: PEBSubCategory[];
  brands: PEBBrand[];
  grades: MaterialGrade[];
  specifications: MaterialSpecification[];
  variants: MaterialVariant[];
}

/**
 * Material Selection Filter
 * Filter for querying available materials
 */
export interface MaterialSelectionFilter {
  category?: PEBMaterialCategory;
  subCategory?: PEBSubCategory;
  brand?: string;
  grade?: string;
  specification?: string;
  variant?: string;
  thickness?: number;
  color?: string;
  coating?: string;
  inStock?: boolean;
  search?: string;
}

/**
 * Material Selection Result
 * Result of material selection query
 */
export interface MaterialSelectionResult {
  item: PEBInventoryItem;
  availableOptions: {
    brands: string[];
    grades: string[];
    specifications: string[];
    variants: string[];
    colors: string[];
    thicknesses: number[];
  };
  stockStatus: string;
  leadTime?: number;
}

// ─── DTOs ───────────────────────────────────────────────────────────────────────

export interface CreatePEBInventoryItemDto {
  itemCode: string;
  itemName: string;
  category: PEBMaterialCategory;
  subCategory?: PEBSubCategory;
  unit: string;
  brand?: string;
  brandId?: string;
  grade?: string;
  gradeId?: string;
  specification?: string;
  specificationId?: string;
  variant?: string;
  variantId?: string;
  materialType: string;
  thickness?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  color?: string;
  coating?: string;
  gauge?: string;
  profile?: string;
  finish?: string;
  standard?: string;
  purchaseRate: number;
  sellingRate?: number;
  taxPercentage?: number;
  hsnCode?: string;
  minimumStock: number;
  reorderLevel: number;
  safetyStock: number;
  warehouseId: string;
  preferredSupplierId?: string;
  isStructural?: boolean;
  isCladding?: boolean;
  isAccessory?: boolean;
  isService?: boolean;
}

export interface UpdatePEBInventoryItemDto {
  itemName?: string;
  category?: PEBMaterialCategory;
  subCategory?: PEBSubCategory;
  unit?: string;
  brand?: string;
  brandId?: string;
  grade?: string;
  gradeId?: string;
  specification?: string;
  specificationId?: string;
  variant?: string;
  variantId?: string;
  materialType?: string;
  thickness?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  color?: string;
  coating?: string;
  gauge?: string;
  profile?: string;
  finish?: string;
  standard?: string;
  purchaseRate?: number;
  sellingRate?: number;
  taxPercentage?: number;
  hsnCode?: string;
  minimumStock?: number;
  reorderLevel?: number;
  safetyStock?: number;
  warehouseId?: string;
  preferredSupplierId?: string;
  isStructural?: boolean;
  isCladding?: boolean;
  isAccessory?: boolean;
  isService?: boolean;
  status?: string;
}

export interface CreatePEBBrandDto {
  brandCode: string;
  brandName: string;
  category: PEBMaterialCategory;
  subCategories?: PEBSubCategory[];
  logo?: string;
  website?: string;
  description?: string;
  manufacturer?: string;
  supplier?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  isPreferred?: boolean;
}

export interface CreateMaterialGradeDto {
  gradeCode: string;
  gradeName: string;
  category: PEBMaterialCategory;
  subCategory?: PEBSubCategory;
  standard?: string;
  description?: string;
  specifications?: Record<string, any>;
}

export interface CreateMaterialSpecificationDto {
  specCode: string;
  specName: string;
  category: PEBMaterialCategory;
  subCategory?: PEBSubCategory;
  grade?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    thickness?: number;
    diameter?: number;
  };
  physicalProperties?: {
    weight?: number;
    density?: number;
    tensileStrength?: number;
    yieldStrength?: number;
    elongation?: number;
  };
  chemicalProperties?: Record<string, any>;
  coating?: string;
  finish?: string;
  color?: string;
  standards?: string[];
  certifications?: string[];
  description?: string;
}

export interface CreateMaterialVariantDto {
  variantCode: string;
  variantName: string;
  materialId: string;
  category: PEBMaterialCategory;
  subCategory?: PEBSubCategory;
  attributes: Record<string, string>;
  priceAdjustment?: number;
  priceAdjustmentType?: 'fixed' | 'percentage';
}

// ─── Query Types ───────────────────────────────────────────────────────────────

export interface GetMaterialSelectionOptionsDto {
  category: PEBMaterialCategory;
  subCategory?: PEBSubCategory;
}

export interface QueryMaterialsDto {
  filter: MaterialSelectionFilter;
  page?: number;
  pageSize?: number;
}

// ─── Stock Management Types ─────────────────────────────────────────────────────────

/**
 * Stock Reservation
 * Tracks stock reserved for projects
 */
export interface StockReservation {
  id: string;
  reservationNumber: string;

  // Source
  projectId: string;
  projectName: string;
  quotationId?: string;
  quotationNumber?: string;

  // Item
  inventoryItemId: string;
  itemCode: string;
  itemName: string;

  // Quantity
  reservedQuantity: number;
  consumedQuantity: number;
  releasedQuantity: number;

  // Status
  status: 'Reserved' | 'Partially Consumed' | 'Fully Consumed' | 'Released' | 'Cancelled';

  // Dates
  reservedAt: Date;
  consumedAt?: Date;
  releasedAt?: Date;
  cancelledAt?: Date;

  // Notes
  notes?: string;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Stock Movement
 * Audit trail for all stock movements
 */
export interface StockMovement {
  id: string;
  movementNumber: string;
  
  // Type
  type: 'Reservation' | 'Consumption' | 'Release' | 'Adjustment' | 'Purchase' | 'Return';
  
  // Item
  inventoryItemId: string;
  itemCode: string;
  itemName: string;
  
  // Quantity
  quantity: number;
  previousStock: number;
  newStock: number;
  
  // Reference
  referenceType: 'Project' | 'Purchase Order' | 'Manual' | 'Adjustment';
  referenceId?: string;
  referenceNumber?: string;
  
  // Location
  warehouseId?: string;
  warehouseName?: string;
  
  // Performed By
  performedBy: string;
  performedByRole?: string;
  
  // Notes
  notes?: string;
  
  // Date
  movementDate: Date;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Create Stock Reservation DTO
 */
export interface CreateStockReservationDto {
  projectId: string;
  projectName: string;
  quotationId?: string;
  quotationNumber?: string;
  items: {
    inventoryItemId: string;
    itemCode: string;
    itemName: string;
    reservedQuantity: number;
  }[];
  notes?: string;
}

/**
 * Create Stock Movement DTO
 */
export interface CreateStockMovementDto {
  type: 'Reservation' | 'Consumption' | 'Release' | 'Adjustment' | 'Purchase' | 'Return';
  inventoryItemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  referenceType: 'Quotation' | 'Project' | 'Purchase Order' | 'Manual' | 'Adjustment';
  referenceId?: string;
  referenceNumber?: string;
  warehouseId?: string;
  notes?: string;
}
