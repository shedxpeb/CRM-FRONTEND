'use client';

import { useState, useEffect, memo, useMemo, useRef } from 'react';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { categoryMasterData, getCategoryById, getAllItemsFromAllCategories, ItemWithCategory } from '../data/categoryMasterData';

interface CategorySelectorProps {
  onCategoryChange?: (categoryId: string, itemTypeId?: string, itemName?: string, categoryPath?: string) => void;
  initialCategoryId?: string;
  initialItemTypeId?: string;
  initialItemName?: string;
  disabled?: boolean;
}

const CategorySelector = memo(function CategorySelector({
  onCategoryChange,
  initialCategoryId,
  initialItemTypeId,
  initialItemName,
  disabled = false,
}: CategorySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId || '');
  const [selectedItemType, setSelectedItemType] = useState<string>(initialItemTypeId || '');
  const [selectedItemName, setSelectedItemName] = useState<string>(() => {
    // Convert initialItemName to composite key format if initialItemTypeId is provided
    if (initialItemName && initialItemTypeId) {
      return `${initialItemTypeId}-${initialItemName}`;
    }
    return initialItemName || '';
  });
  const [allItems, setAllItems] = useState<ItemWithCategory[]>([]);

  const onCategoryChangeRef = useRef(onCategoryChange);
  onCategoryChangeRef.current = onCategoryChange;

  // Load all items on mount
  useEffect(() => {
    setAllItems(getAllItemsFromAllCategories());
  }, []);

  // Auto-fill category when item is selected
  useEffect(() => {
    if (!selectedItemName) return;
    // Composite key format: `${itemTypeId}-${itemName}` — itemName is the last
    // segment, everything before it is the itemTypeId.
    const parts = selectedItemName.split('-');
    const itemName = parts[parts.length - 1];
    const itemTypeId = parts.slice(0, parts.length - 1).join('-');

    const selectedItem =
      allItems.find((item) => item.itemName === itemName && item.itemTypeId === itemTypeId) ??
      allItems.find((item) => item.itemName === itemName);

    if (selectedItem) {
      const mainCategoryId = selectedItem.itemTypeId.split('-').slice(0, 2).join('-');
      setSelectedCategory(mainCategoryId);
      setSelectedItemType(selectedItem.itemTypeId);
    }
  }, [selectedItemName, allItems]);

  // Notify parent of changes
  useEffect(() => {
    let actualItemName = selectedItemName;
    if (selectedItemName && selectedItemName.includes('-')) {
      const parts = selectedItemName.split('-');
      actualItemName = parts[parts.length - 1];
    }

    let categoryPath = '';
    if (selectedCategory) {
      const category = getCategoryById(selectedCategory);
      if (category) {
        categoryPath = category.name;
        if (selectedItemType) {
          const itemType = getCategoryById(selectedItemType);
          if (itemType) categoryPath += ' > ' + itemType.name;
        }
      }
    }
    onCategoryChangeRef.current?.(selectedCategory, selectedItemType, actualItemName, categoryPath);
  }, [selectedCategory, selectedItemType, selectedItemName]);

  const categoryOptions: ComboboxOption[] = useMemo(
    () => categoryMasterData.map((cat) => ({ value: cat.id, label: cat.name })),
    []
  );

  const itemOptions: ComboboxOption[] = useMemo(
    () =>
      allItems
        .filter((item) => (selectedCategory ? item.itemTypeId.startsWith(selectedCategory) : true))
        .map((item) => ({
          value: `${item.itemTypeId}-${item.itemName}`,
          label: item.itemName,
        })),
    [allItems, selectedCategory]
  );

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);

    // Clear the selected item if it no longer belongs to the chosen category.
    if (selectedItemName) {
      const parts = selectedItemName.split('-');
      const itemName = parts[parts.length - 1];
      const itemTypeId = parts.slice(0, parts.length - 1).join('-');
      const stillValid = allItems.some(
        (item) =>
          item.itemName === itemName &&
          item.itemTypeId === itemTypeId &&
          item.itemTypeId.startsWith(categoryId)
      );
      if (!stillValid) {
        setSelectedItemName('');
        setSelectedItemType('');
      }
    }
  };

  const selectedPath = useMemo(() => {
    if (!selectedCategory) return '';
    const category = getCategoryById(selectedCategory);
    if (!category) return '';
    let path = category.name;
    if (selectedItemType) {
      const itemType = getCategoryById(selectedItemType);
      if (itemType) path += ` > ${itemType.name}`;
    }
    return path;
  }, [selectedCategory, selectedItemType]);

  return (
    <div className="space-y-3">
      {/* Category Selection */}
      <div className="space-y-1.5">
        <Label htmlFor="category">Category *</Label>
        <Combobox
          options={categoryOptions}
          value={selectedCategory}
          onValueChange={handleCategoryChange}
          placeholder="Search and select category"
          searchPlaceholder="Search categories..."
          emptyMessage="No categories found."
          disabled={disabled}
        />
        {selectedPath && (
          <p className="text-xs text-muted-foreground">{selectedPath}</p>
        )}
      </div>

      {/* Item Selection */}
      <div className="space-y-1.5">
        <Label htmlFor="item">Item *</Label>
        <Combobox
          options={itemOptions}
          value={selectedItemName}
          onValueChange={setSelectedItemName}
          placeholder="Search and select item"
          searchPlaceholder="Search items..."
          emptyMessage="No items found."
          disabled={disabled}
        />
      </div>
    </div>
  );
});

export { CategorySelector };
