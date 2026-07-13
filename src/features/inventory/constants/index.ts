/**
 * Inventory Module Constants
 * Centralized constants for stock statuses, movement types, units
 */

import type { StockStatus, MovementType, UnitType } from '@/features/inventory/types';

/**
 * Stock Status definitions with badge variants
 */
export const STOCK_STATUSES: {
  value: StockStatus;
  label: string;
  variant: 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'secondary';
}[] = [
  { value: 'In Stock', label: 'In Stock', variant: 'success' },
  { value: 'Low Stock', label: 'Low Stock', variant: 'warning' },
  { value: 'Out of Stock', label: 'Out of Stock', variant: 'destructive' },
  { value: 'Critical', label: 'Critical', variant: 'destructive' },
  { value: 'On Order', label: 'On Order', variant: 'info' },
  { value: 'Discontinued', label: 'Discontinued', variant: 'secondary' },
];

/**
 * Movement Type definitions with badge variants
 */
export const MOVEMENT_TYPES: {
  value: MovementType;
  label: string;
  variant: 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'secondary';
}[] = [
  { value: 'Stock In', label: 'Stock In', variant: 'success' },
  { value: 'Stock Out', label: 'Stock Out', variant: 'warning' },
  { value: 'Transfer', label: 'Transfer', variant: 'info' },
  { value: 'Adjustment', label: 'Adjustment', variant: 'secondary' },
  { value: 'Reservation', label: 'Reservation', variant: 'default' },
  { value: 'Release', label: 'Release', variant: 'default' },
  { value: 'Consumption', label: 'Consumption', variant: 'warning' },
];

/**
 * Unit options
 */
export const UNITS: { value: UnitType; label: string }[] = [
  { value: 'Kg', label: 'Kilogram (Kg)' },
  { value: 'Ton', label: 'Ton' },
  { value: 'Meter', label: 'Meter' },
  { value: 'SqMeter', label: 'Sq. Meter' },
  { value: 'CuMeter', label: 'Cu. Meter' },
  { value: 'Nos', label: 'Numbers (Nos)' },
  { value: 'Box', label: 'Box' },
  { value: 'Bundle', label: 'Bundle' },
  { value: 'Set', label: 'Set' },
  { value: 'Liter', label: 'Liter' },
  { value: 'Bag', label: 'Bag' },
  { value: 'Roll', label: 'Roll' },
];

/**
 * Get stock status badge variant
 */
export function getStockStatusVariant(status: StockStatus) {
  return STOCK_STATUSES.find((s) => s.value === status)?.variant ?? 'secondary';
}

/**
 * Get movement type badge variant
 */
export function getMovementTypeVariant(type: MovementType) {
  return MOVEMENT_TYPES.find((m) => m.value === type)?.variant ?? 'secondary';
}
