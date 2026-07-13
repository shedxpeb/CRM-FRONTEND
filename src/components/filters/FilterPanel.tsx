'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multi-select';
  options?: FilterOption[];
  placeholder?: string;
}

interface FilterPanelProps {
  filters: FilterConfig[];
  onFilterChange: (filters: Record<string, any>) => void;
  onReset?: () => void;
  persistKey?: string;
}

export function FilterPanel({ filters, onFilterChange, onReset, persistKey }: FilterPanelProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [isOpen, setIsOpen] = useState(false);

  // Load persisted filters on mount
  useEffect(() => {
    if (persistKey) {
      try {
        const saved = localStorage.getItem(`filters_${persistKey}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          setActiveFilters(parsed);
          onFilterChange(parsed);
        }
      } catch (error) {
        // Error loading persisted filters
      }
    }
  }, [persistKey, onFilterChange]);

  // Persist filters when they change
  useEffect(() => {
    if (persistKey && Object.keys(activeFilters).length > 0) {
      try {
        localStorage.setItem(`filters_${persistKey}`, JSON.stringify(activeFilters));
      } catch (error) {
        // Error persisting filters
      }
    }
  }, [activeFilters, persistKey]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key];
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setActiveFilters({});
    onFilterChange({});
    if (persistKey) {
      localStorage.removeItem(`filters_${persistKey}`);
    }
    onReset?.();
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className="space-y-3">
      {/* Filter Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex-1 sm:flex-none gap-1.5 px-2 sm:px-3 py-2 h-8 sm:h-9 text-xs"
      >
        <Filter className="h-3.5 w-3.5" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 bg-background">
          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(activeFilters).map(([key, value]) => {
                const filterConfig = filters.find(f => f.key === key);
                if (!filterConfig) return null;

                let displayValue = value;
                if (filterConfig.type === 'select' && filterConfig.options) {
                  const option = filterConfig.options.find(o => o.value === value);
                  displayValue = option?.label || value;
                }

                return (
                  <Badge key={key} variant="secondary" className="gap-1 pr-1">
                    <span>{filterConfig.label}: {displayValue}</span>
                    <button
                      onClick={() => handleRemoveFilter(key)}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {filters.map((filter) => (
              <div key={filter.key} className="min-w-0">
                <label className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-1 block">
                  {filter.label}
                </label>
                {filter.type === 'select' && (
                  <Select
                    value={activeFilters[filter.key] || ''}
                    onValueChange={(value) => handleFilterChange(filter.key, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={filter.placeholder || `Select ${filter.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {filter.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>

          {/* Reset Button */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs"
            >
              Reset All Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
