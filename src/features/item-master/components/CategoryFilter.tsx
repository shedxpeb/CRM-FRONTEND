'use client';

import { useState, memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategoryType } from '../types';
import { CategoryNode, getCategoriesByType, getSubcategories } from '../data/categoryMasterData';

interface CategoryFilterProps {
  onFilterChange?: (filter: { categoryType?: CategoryType; categoryId?: string; subcategoryId?: string }) => void;
}

const CategoryFilter = memo(function CategoryFilter({ onFilterChange }: CategoryFilterProps) {
  const [selectedType, setSelectedType] = useState<CategoryType | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>();

  const categories = selectedType ? getCategoriesByType(selectedType) : [];
  const subcategories = selectedCategory ? getSubcategories(selectedCategory) : [];

  const handleTypeChange = (type: CategoryType) => {
    setSelectedType(type);
    setSelectedCategory(undefined);
    setSelectedSubcategory(undefined);
    onFilterChange?.({ categoryType: type });
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(undefined);
    onFilterChange?.({ categoryType: selectedType, categoryId });
  };

  const handleSubcategoryChange = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    onFilterChange?.({ categoryType: selectedType, categoryId: selectedCategory, subcategoryId });
  };

  const clearFilters = () => {
    setSelectedType(undefined);
    setSelectedCategory(undefined);
    setSelectedSubcategory(undefined);
    onFilterChange?.({});
  };

  return (
    <div className="space-y-3">
      {/* Category Type Filter */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={!selectedType ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => handleTypeChange('PRODUCT' as CategoryType)}
        >
          Products
        </Badge>
        <Badge
          variant={selectedType === 'PROCESS' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => handleTypeChange('PROCESS')}
        >
          Process Items
        </Badge>
        <Badge
          variant={selectedType === 'SPECIALIZED' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => handleTypeChange('SPECIALIZED')}
        >
          Specialized
        </Badge>
      </div>

      {/* Category Dropdown */}
      {categories.length > 0 && (
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Subcategory Dropdown */}
      {subcategories.length > 0 && (
        <Select value={selectedSubcategory} onValueChange={handleSubcategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by subcategory" />
          </SelectTrigger>
          <SelectContent>
            {subcategories.map((sub) => (
              <SelectItem key={sub.id} value={sub.id}>
                {sub.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Clear Filters */}
      {(selectedType || selectedCategory || selectedSubcategory) && (
        <button
          onClick={clearFilters}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Clear filters
        </button>
      )}
    </div>
  );
});

export { CategoryFilter };
