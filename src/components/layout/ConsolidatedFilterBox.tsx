"use client"

import * as React from "react"
import { Search, Filter, X, Download, FileText, Settings, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { componentTextSizes, iconSizes } from "@/lib/design-system"
import { useDebounce } from "@/shared/hooks/useDebounce"

export interface FilterOption {
  value: string
  label: string
}

export interface FilterConfig {
  key: string
  label: string
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
}

interface ConsolidatedFilterBoxProps {
  // Search
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string

  // Filters
  filters?: FilterConfig[]
  onClearFilters?: () => void

  // Date Range
  dateRange?: { from?: Date | null; to?: Date | null }
  onDateRangeChange?: (range: { from?: Date | null; to?: Date | null }) => void

  // Actions
  onExport?: () => void
  onImport?: () => void
  onColumns?: () => void

  // Layout
  className?: string
}

export function ConsolidatedFilterBox({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  onClearFilters,
  dateRange,
  onDateRangeChange,
  onExport,
  onImport,
  onColumns,
  className,
}: ConsolidatedFilterBoxProps) {
  const [localSearchValue, setLocalSearchValue] = React.useState(searchValue)
  const debouncedSearchValue = useDebounce(localSearchValue, 300)

  React.useEffect(() => {
    if (onSearchChange) {
      onSearchChange(debouncedSearchValue)
    }
  }, [debouncedSearchValue, onSearchChange])

  React.useEffect(() => {
    setLocalSearchValue(searchValue)
  }, [searchValue])

  const hasActiveFilters = React.useMemo(() => {
    const hasFilterValues = filters.some(f => f.value !== 'all' && f.value !== '')
    const hasDateRange = dateRange?.from || dateRange?.to
    const hasSearch = localSearchValue.trim() !== ''
    return hasFilterValues || hasDateRange || hasSearch
  }, [filters, dateRange, localSearchValue])

  const handleClearAll = () => {
    setLocalSearchValue('')
    filters.forEach(f => f.onChange('all'))
    if (onDateRangeChange) {
      onDateRangeChange({ from: null, to: null })
    }
    if (onClearFilters) {
      onClearFilters()
    }
  }

  const formatDateForInput = (date: Date | null) => {
    return date ? date.toISOString().split('T')[0] : ''
  }

  return (
    <div className={cn("border rounded-lg bg-card p-3 space-y-3", className)}>
      {/* Main Row: Search + Filters + Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
        {/* Search - Left Side */}
        {onSearchChange && (
          <div className="relative w-full lg:w-80 flex-shrink-0">
            <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground", iconSizes.sm)} />
            <Input
              value={localSearchValue}
              onChange={(e) => setLocalSearchValue(e.target.value)}
              placeholder={searchPlaceholder}
              className={cn("pl-9", componentTextSizes.form.input)}
            />
          </div>
        )}

        {/* Filters - Right Side */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {filters.map((filter) => (
            <div key={filter.key} className="flex items-center gap-2">
              <label className={cn(componentTextSizes.form.label, "whitespace-nowrap text-muted-foreground")}>
                {filter.label}
              </label>
              <Select value={filter.value} onValueChange={filter.onChange}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {/* Date Range Filter */}
          {onDateRangeChange && (
            <div className="flex items-center gap-2">
              <label className={cn(componentTextSizes.form.label, "whitespace-nowrap text-muted-foreground")}>
                Date Range
              </label>
              <div className="flex items-center gap-1.5">
                <Input
                  type="date"
                  value={formatDateForInput(dateRange?.from || null)}
                  onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value ? new Date(e.target.value) : null })}
                  className={cn("w-32", componentTextSizes.form.input)}
                />
                <span className={cn(componentTextSizes.form.label, "text-muted-foreground")}>to</span>
                <Input
                  type="date"
                  value={formatDateForInput(dateRange?.to || null)}
                  onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value ? new Date(e.target.value) : null })}
                  className={cn("w-32", componentTextSizes.form.input)}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport} className="gap-1.5">
                <Download className={iconSizes.xs} />
                Export
              </Button>
            )}
            {onImport && (
              <Button variant="outline" size="sm" onClick={onImport} className="gap-1.5">
                <FileText className={iconSizes.xs} />
                Import
              </Button>
            )}
            {onColumns && (
              <Button variant="outline" size="sm" onClick={onColumns} className="gap-1.5">
                <Settings className={iconSizes.xs} />
                Columns
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Clear All Button */}
      {hasActiveFilters && (
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <X className={iconSizes.xs} />
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  )
}
