/**
 * KPI Card Component
 * Production-ready with loading, empty, error states
 * Structured for future API integration
 */

'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KPICardData } from '../types';

// Valid routes that exist in the application
const VALID_ROUTES = [
  '/dashboard',
  '/dashboard/finance',
  '/dashboard/projects',
  '/dashboard/leads',
  '/dashboard/customers',
  '/dashboard/inventory',
  '/dashboard/documents',
  '/dashboard/documents/quotations',
  '/dashboard/documents/proposals',
  '/dashboard/documents/estimates',
  '/dashboard/documents/library',
  '/dashboard/documents/templates',
  '/dashboard/documents/approvals',
  '/dashboard/documents/activity-logs',
  '/dashboard/documents/version-history',
  '/dashboard/documents/analytics',
  '/dashboard/inventory/alerts',
  '/dashboard/inventory/categories',
  '/dashboard/inventory/reports',
  '/dashboard/inventory/stock-movements',
  '/dashboard/inventory/suppliers',
  '/dashboard/inventory/warehouses',
  '/dashboard/projects/reports',
  '/settings',
  '/settings/users',
  '/settings/roles',
  '/settings/permissions',
  '/settings/company',
  '/settings/branches',
  '/settings/preferences',
  '/settings/modules',
  '/login',
];

// Color to gradient mapping (subtle gradients)
const colorToGradient: Record<string, string> = {
  'text-emerald-600': 'from-emerald-50/50 to-white',
  'text-blue-600': 'from-blue-50/50 to-white',
  'text-green-600': 'from-green-50/50 to-white',
  'text-purple-600': 'from-purple-50/50 to-white',
  'text-orange-600': 'from-orange-50/50 to-white',
  'text-cyan-600': 'from-cyan-50/50 to-white',
  'text-indigo-600': 'from-indigo-50/50 to-white',
  'text-red-600': 'from-red-50/50 to-white',
};

interface KPICardProps extends KPICardData {
  onClick?: () => void;
}

// Calculate text size based on value length
const getValueTextSize = (val: string | number) => {
  const valueStr = String(val);
  if (valueStr.length <= 6) return 'text-lg sm:text-xl'; // Small values
  if (valueStr.length <= 9) return 'text-base sm:text-lg'; // Medium values
  if (valueStr.length <= 12) return 'text-sm sm:text-base'; // Large values
  return 'text-xs sm:text-sm'; // Very large values
};

export const KPICard = memo(function KPICard({
  title,
  value,
  description,
  icon,
  navigateTo,
  color,
  change,
  changeType,
  loading = false,
  error = null,
  onClick,
}: KPICardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    if (navigateTo && VALID_ROUTES.includes(navigateTo)) {
      router.push(navigateTo);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card className="h-full bg-gradient-to-br from-gray-50 to-white border border-gray-200/50">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="h-full bg-gradient-to-br from-red-50/50 to-white border border-red-200/50">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium">{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (value === null || value === undefined || value === '') {
    return (
      <Card className="h-full bg-gradient-to-br from-gray-50 to-white border border-gray-200/50">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 text-gray-500">
            <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="text-xs sm:text-sm">No data available</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isClickable = navigateTo && VALID_ROUTES.includes(navigateTo);
  const gradient = colorToGradient[color] || 'from-gray-50/50 to-white';

  return (
    <Card
      className={cn(
        'h-full bg-gradient-to-br border border-gray-200/50 transition-all duration-200',
        gradient,
        isClickable && 'cursor-pointer hover:shadow-md hover:border-gray-300/70 active:scale-[0.98]'
      )}
      onClick={handleClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`${title} ${isClickable ? '- Click to view details' : ''}`}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs font-medium text-gray-600 uppercase tracking-wide">{title}</p>
            <p className={cn('font-bold text-gray-900 mt-1 truncate', getValueTextSize(value))}>{value}</p>
            {change !== undefined && (
              <p className={cn(
                'text-[10px] sm:text-xs mt-1',
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              )}>
                {changeType === 'increase' ? '+' : ''}{change}%
              </p>
            )}
          </div>
          <div className={cn('h-8 w-8 sm:h-9 sm:w-9 rounded-lg flex items-center justify-center flex-shrink-0', color.replace('text-', 'bg-').replace('-600', '-100'))}>
            <div className={cn(color, 'h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center')}>
              <div className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 flex items-center justify-center">
                {icon}
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-[10px] sm:text-xs text-gray-500 truncate mt-1">{description}</p>
      </CardContent>
    </Card>
  );
});
