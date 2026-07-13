/**
 * Dashboard Filter Component
 * Production-ready with date range filter
 * Structured for future API integration
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
}

const DATE_RANGE_OPTIONS = [
  { value: 'today' as DateRange, label: 'Today' },
  { value: 'this_week' as DateRange, label: 'This Week' },
  { value: 'this_month' as DateRange, label: 'This Month' },
  { value: 'last_month' as DateRange, label: 'Last Month' },
  { value: 'this_quarter' as DateRange, label: 'This Quarter' },
  { value: 'last_quarter' as DateRange, label: 'Last Quarter' },
  { value: 'this_year' as DateRange, label: 'This Year' },
  { value: 'last_year' as DateRange, label: 'Last Year' },
  { value: 'all_time' as DateRange, label: 'All Time' },
];

export const DashboardFilter = memo(function DashboardFilter({
  dateRange,
  onDateRangeChange,
}: DashboardFilterProps) {
  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-200/50">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          {/* Date Range Filter */}
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
        </div>
      </CardContent>
    </Card>
  );
});
