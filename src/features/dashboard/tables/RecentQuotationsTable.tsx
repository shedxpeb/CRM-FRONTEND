/**
 * Recent Quotations Table Component
 * Production-ready with loading, empty, error states
 * Structured for future API integration
 * Pagination, sorting, filtering, search ready
 */

'use client';

import { memo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, RefreshCw, Search, ArrowUpDown } from 'lucide-react';
import { RecentQuotation } from '../types';

interface RecentQuotationsTableProps {
  quotations: RecentQuotation[];
  loading?: boolean;
  error?: string | null;
}

const STATUS_COLORS = {
  Draft: 'bg-gray-100 text-gray-700',
  Sent: 'bg-blue-100 text-blue-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

export const RecentQuotationsTable = memo(function RecentQuotationsTable({
  quotations,
  loading = false,
  error = null,
}: RecentQuotationsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'createdAt' | 'amount'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter and sort logic (ready for API integration)
  const filteredAndSortedQuotations = quotations
    .filter(q => 
      q.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

  const handleSort = (field: 'createdAt' | 'amount') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Recent Quotations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Recent Quotations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-red-600 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!quotations || quotations.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Recent Quotations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span>No quotations available</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Recent Quotations</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 w-32 sm:w-40 text-xs"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-4 gap-3 px-3 py-2 bg-gray-50 rounded-t-lg text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
            <div>Quotation #</div>
            <div>Customer</div>
            <div 
              className="flex items-center gap-1 cursor-pointer hover:text-gray-900" 
              onClick={() => handleSort('amount')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSort('amount');
                }
              }}
              aria-label={`Sort by amount ${sortField === 'amount' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : ''}`}
            >
              Amount <ArrowUpDown className="h-3 w-3" />
            </div>
            <div>Status</div>
          </div>

          {/* Table Body */}
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {filteredAndSortedQuotations.map((quotation) => (
              <div
                key={quotation.id}
                className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-3 px-3 py-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors items-start sm:items-center"
              >
                <div className="text-xs font-mono text-gray-900">{quotation.quotationNumber}</div>
                <div className="text-xs text-gray-600 truncate">{quotation.customerName}</div>
                <div className="text-xs font-semibold text-gray-900">${quotation.amount.toLocaleString()}</div>
                <Badge variant="secondary" className={STATUS_COLORS[quotation.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-700'}>
                  {quotation.status}
                </Badge>
              </div>
            ))}
          </div>

          {/* Pagination Placeholder (ready for API integration) */}
          <div className="flex items-center justify-between pt-3 border-t">
            <span className="text-[10px] text-gray-500">
              Showing {filteredAndSortedQuotations.length} of {quotations.length} quotations
            </span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
