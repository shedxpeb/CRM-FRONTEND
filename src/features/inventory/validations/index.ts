/**
 * Inventory Validation Schemas
 * Using Zod for type-safe form validation
 */
import { z } from 'zod';

/**
 * Create Inventory Item Schema
 */
export const createInventoryItemSchema = z.object({
  itemName: z.string()
    .min(2, 'Item name must be at least 2 characters')
    .max(100, 'Item name must be less than 100 characters'),

  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().optional().or(z.literal('')),
  unit: z.string().min(1, 'Unit is required'),
  materialType: z.string().min(1, 'Material type is required'),

  // PEB Material Info
  grade: z.string().optional().or(z.literal('')),
  thickness: z.coerce.number().min(0, 'Thickness must be positive').optional(),
  weight: z.coerce.number().min(0, 'Weight must be positive').optional(),
  length: z.coerce.number().min(0, 'Length must be positive').optional(),
  width: z.coerce.number().min(0, 'Width must be positive').optional(),
  height: z.coerce.number().min(0, 'Height must be positive').optional(),
  color: z.string().optional().or(z.literal('')),
  coating: z.string().optional().or(z.literal('')),

  // Commercial
  purchaseRate: z.coerce.number().min(0.01, 'Purchase rate must be greater than 0'),
  sellingRate: z.coerce.number().min(0, 'Selling rate must be positive').optional(),
  taxPercentage: z.coerce.number().min(0, 'Tax must be 0 or more').max(100, 'Tax cannot exceed 100%').optional(),

  // Inventory Rules
  minimumStock: z.coerce.number().min(0, 'Minimum stock must be 0 or more'),
  reorderLevel: z.coerce.number().min(0, 'Reorder level must be 0 or more'),
  safetyStock: z.coerce.number().min(0, 'Safety stock must be 0 or more'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  preferredSupplierId: z.string().optional().or(z.literal('')),
});

export const updateInventoryItemSchema = createInventoryItemSchema.partial();

/**
 * Create Warehouse Schema
 */
export const createWarehouseSchema = z.object({
  name: z.string()
    .min(2, 'Warehouse name must be at least 2 characters')
    .max(100, 'Warehouse name must be less than 100 characters'),
  location: z.string().min(2, 'Location is required').max(200),
  manager: z.string().min(2, 'Manager name is required').max(100),
  contactNumber: z.string()
    .regex(/^\+91\s\d{5}\s\d{5}$/, 'Contact number must be in format: +91 XXXXX XXXXX'),
  capacity: z.coerce.number().min(1, 'Capacity must be greater than 0'),
});

/**
 * Create Supplier Schema
 */
export const createSupplierSchema = z.object({
  name: z.string()
    .min(2, 'Supplier name must be at least 2 characters')
    .max(100, 'Supplier name must be less than 100 characters'),
  gstNumber: z.string()
    .regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/, 'Invalid GST number format')
    .optional()
    .or(z.literal('')),
  contactPerson: z.string().min(2, 'Contact person is required').max(100),
  mobile: z.string()
    .regex(/^\+91\s\d{5}\s\d{5}$/, 'Mobile must be in format: +91 XXXXX XXXXX'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().min(2, 'Address is required').max(500),
  city: z.string().min(2, 'City is required').max(50),
  state: z.string().min(2, 'State is required').max(50),
});

/**
 * Create Category Schema
 */
export const createCategorySchema = z.object({
  name: z.string()
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name must be less than 50 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

/**
 * Create Stock Movement Schema
 */
export const createStockMovementSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  type: z.enum(['Stock In', 'Stock Out', 'Transfer', 'Adjustment', 'Reservation', 'Release', 'Consumption']),
  quantity: z.coerce.number().min(0.01, 'Quantity must be greater than 0'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  referenceNumber: z.string().optional().or(z.literal('')),
  referenceType: z.string().optional().or(z.literal('')),
  remarks: z.string().max(500, 'Remarks must be less than 500 characters').optional(),
});

// Form data types
export type CreateInventoryItemFormData = z.infer<typeof createInventoryItemSchema>;
export type UpdateInventoryItemFormData = z.infer<typeof updateInventoryItemSchema>;
export type CreateWarehouseFormData = z.infer<typeof createWarehouseSchema>;
export type CreateSupplierFormData = z.infer<typeof createSupplierSchema>;
export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
export type CreateStockMovementFormData = z.infer<typeof createStockMovementSchema>;
