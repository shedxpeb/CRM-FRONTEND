import { getCategoryById } from '@/features/item-master/data/categoryMasterData';
import type { ItemMaster } from '@/features/item-master/types';

function sanitizeCodeSegment(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generates a category-prefixed item code (e.g. FAST-ANCHOR-001).
 * Item codes are system-managed; manual override is reserved for admin flows.
 */
export function generateItemCode(
  categoryId: string,
  existingItems: ItemMaster[] = []
): string {
  const category = getCategoryById(categoryId);
  const prefix =
    sanitizeCodeSegment(category?.code || category?.name || 'ITEM') || 'ITEM';

  const prefixPattern = new RegExp(`^${prefix}-(\\d+)$`, 'i');
  const maxSequence = existingItems.reduce((max, item) => {
    const match = item.itemCode?.match(prefixPattern);
    if (!match) return max;
    return Math.max(max, Number.parseInt(match[1], 10));
  }, 0);

  return `${prefix}-${String(maxSequence + 1).padStart(3, '0')}`;
}
