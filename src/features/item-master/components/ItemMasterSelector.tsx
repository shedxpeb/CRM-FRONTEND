/**
 * Item Selector Component
 * Allows browsing and selecting products from Item for Estimates
 */

'use client';

import { useState, useMemo, memo } from 'react';
import { useItemMasters } from '../hooks/useItemMaster';
import { ItemMaster, ItemCategory } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Package, Plus, Check } from 'lucide-react';

interface ItemMasterSelectorProps {
  onSelect: (item: ItemMaster) => void;
  selectedItems?: ItemMaster[];
  multiSelect?: boolean;
  categoryFilter?: ItemCategory;
}

export const ItemMasterSelector = memo(function ItemMasterSelector({
  onSelect,
  selectedItems = [],
  multiSelect = false,
  categoryFilter,
}: ItemMasterSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>(
    categoryFilter || 'all'
  );

  const { data: items, isLoading } = useItemMasters({
    filter: {
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      search: searchQuery || undefined,
    },
  });

  const categories: (ItemCategory | 'all')[] = [
    'all',
    'Structural Steel',
    'Cladding',
    'Roofing',
    'Insulation',
    'Fasteners',
    'Accessories',
    'Doors',
    'Windows',
    'Gutters',
    'Downspouts',
    'Ventilation',
    'Foundation',
    'Electrical',
    'Plumbing',
    'Other',
    'Roofing Sheets',
  ];

  const isSelected = (item: ItemMaster) =>
    selectedItems.some(selected => selected.id === item.id);

  const handleSelect = (item: ItemMaster) => {
    onSelect(item);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products by name, code, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category Filter */}
      {!categoryFilter && (
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      )}

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
        {isLoading ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            Loading products...
          </div>
        ) : items && items.length > 0 ? (
          items.map(item => (
            <Card
              key={item.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected(item) ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleSelect(item)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-sm truncate">
                        {item.itemName}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {item.itemCode}
                    </div>
                    <Badge variant="outline" className="text-[10px] mb-2">
                      {item.category}
                    </Badge>
                    {item.brand && (
                      <div className="text-xs text-muted-foreground">
                        {item.brand}
                      </div>
                    )}
                    {item.defaultRate && (
                      <div className="text-xs font-medium text-green-600 mt-1">
                        ₹{item.defaultRate.toLocaleString()}/{item.unit}
                      </div>
                    )}
                  </div>
                  {isSelected(item) && (
                    <Check className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No products found
          </div>
        )}
      </div>

      {/* Selected Items Summary */}
      {selectedItems.length > 0 && (
        <div className="border-t pt-3">
          <div className="text-sm font-medium mb-2">
            Selected: {selectedItems.length} item(s)
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedItems.map(item => (
              <Badge key={item.id} variant="secondary" className="text-xs">
                {item.itemName}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
