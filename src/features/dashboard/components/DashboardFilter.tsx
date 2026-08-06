/**
 * Dashboard Filter Component
 * Production-ready with date range filter + custom range picker
 */

'use client';

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DateRange } from '../types';

interface DashboardFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (value: DateRange) => void;
  customFrom?: string;
  customTo?: string;
  onCustomRangeChange?: (from: string, to: string) => void;
}

const DATE_RANGE_OPTIONS = [
  { value: 'today' as DateRange, label: 'Today' },
  { value: 'yesterday' as DateRange, label: 'Yesterday' },
  { value: 'last_7_days' as DateRange, label: 'Last 7 Days' },
  { value: 'last_30_days' as DateRange, label: 'Last 30 Days' },
  { value: 'this_week' as DateRange, label: 'This Week' },
  { value: 'this_month' as DateRange, label: 'This Month' },
  { value: 'last_month' as DateRange, label: 'Last Month' },
  { value: 'this_quarter' as DateRange, label: 'This Quarter' },
  { value: 'last_quarter' as DateRange, label: 'Last Quarter' },
  { value: 'this_year' as DateRange, label: 'This Year' },
  { value: 'last_year' as DateRange, label: 'Last Year' },
  { value: 'all_time' as DateRange, label: 'All Time' },
  { value: 'custom' as DateRange, label: 'Custom Range' },
];

export const DashboardFilter = memo(function DashboardFilter({
  dateRange,
  onDateRangeChange,
  customFrom,
  customTo,
  onCustomRangeChange,
}: DashboardFilterProps) {
  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200/50">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="space-y-1.5 sm:space-y-2 flex-1 sm:max-w-xs">
            <Label htmlFor="date-range" className="text-[10px] sm:text-xs font-medium text-gray-700">
              Date Range
            </Label>
            <Select value={dateRange} onValueChange={onDateRangeChange}>
              <SelectTrigger id="date-range" className="h-8 sm:h-9 text-[10px] sm:text-xs w-full">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {dateRange === 'custom' && (
            <div className="flex flex-wrap items-end gap-2 sm:gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="custom-from" className="text-[10px] sm:text-xs font-medium text-gray-700">
                  From
                </Label>
                <input
                  id="custom-from"
                  type="date"
                  value={customFrom || ''}
                  onChange={(e) => onCustomRangeChange?.(e.target.value, customTo || '')}
                  className="h-8 sm:h-9 w-full sm:w-[150px] rounded-md border border-input bg-background px-2 text-[10px] sm:text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="custom-to" className="text-[10px] sm:text-xs font-medium text-gray-700">
                  To
                </Label>
                <input
                  id="custom-to"
                  type="date"
                  value={customTo || ''}
                  onChange={(e) => onCustomRangeChange?.(customFrom || '', e.target.value)}
                  className="h-8 sm:h-9 w-full sm:w-[150px] rounded-md border border-input bg-background px-2 text-[10px] sm:text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
