'use client';

import { useState, useEffect, memo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getItemsByCategory } from '../data/categoryMasterData';

interface ItemSuggestionProps {
  categoryId?: string;
  subcategoryId?: string;
  itemTypeId?: string;
  onItemSelect?: (itemName: string) => void;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const ItemSuggestion = memo(function ItemSuggestion({
  categoryId,
  subcategoryId,
  itemTypeId,
  onItemSelect,
  value,
  onChange,
  disabled = false,
}: ItemSuggestionProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // Get suggestions based on selected category hierarchy
    const targetId = itemTypeId || subcategoryId || categoryId;
    if (targetId) {
      const items = getItemsByCategory(targetId);
      setSuggestions(items);
    } else {
      setSuggestions([]);
    }
  }, [categoryId, subcategoryId, itemTypeId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange?.(inputValue);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange?.(suggestion);
    onItemSelect?.(suggestion);
    setShowSuggestions(false);
  };

  const filteredSuggestions = value
    ? [...new Set(suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase())))]
    : [...new Set(suggestions)];

  return (
    <div className="relative">
      <Label htmlFor="itemName">Item Name *</Label>
      <Input
        id="itemName"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder="e.g., Anchor bolts"
        disabled={disabled}
      />
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={`${suggestion}-${index}`}
              className="px-3 py-2 cursor-pointer hover:bg-muted"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export { ItemSuggestion };
