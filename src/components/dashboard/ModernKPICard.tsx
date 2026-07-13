/**
 * Modern KPI Card Component
 * Based on remix-of-peb-insight-hub-main reference design
 * Features M/Y toggle for monthly/yearly data, clickable, responsive
 */

'use client';

import { useState, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { componentTextSizes } from '@/lib/design-system';

export interface KpiPeriodData {
  value: string;
  delta?: string;
  trend?: 'up' | 'down';
  hint?: string;
}

interface ModernKPICardProps {
  label: string;
  icon: LucideIcon;
  accent?: 'blue' | 'emerald' | 'amber' | 'violet' | 'rose' | 'sky' | 'cyan' | 'indigo' | 'purple' | 'green';
  periods: { monthly: KpiPeriodData; yearly: KpiPeriodData };
  onClick?: () => void;
  navigateTo?: string;
}

const ACCENT: Record<NonNullable<ModernKPICardProps['accent']>, { bg: string; fg: string; ring: string; bar: string }> = {
  blue:    { bg: 'bg-blue-50',    fg: 'text-blue-600',    ring: 'ring-blue-100',    bar: 'bg-blue-500' },
  emerald: { bg: 'bg-emerald-50', fg: 'text-emerald-600', ring: 'ring-emerald-100', bar: 'bg-emerald-500' },
  amber:   { bg: 'bg-amber-50',   fg: 'text-amber-600',   ring: 'ring-amber-100',   bar: 'bg-amber-500' },
  violet:  { bg: 'bg-violet-50',  fg: 'text-violet-600',  ring: 'ring-violet-100',  bar: 'bg-violet-500' },
  rose:    { bg: 'bg-rose-50',    fg: 'text-rose-600',    ring: 'ring-rose-100',    bar: 'bg-rose-500' },
  sky:     { bg: 'bg-sky-50',     fg: 'text-sky-600',     ring: 'ring-sky-100',     bar: 'bg-sky-500' },
  cyan:    { bg: 'bg-cyan-50',    fg: 'text-cyan-600',    ring: 'ring-cyan-100',    bar: 'bg-cyan-500' },
  indigo:  { bg: 'bg-indigo-50',  fg: 'text-indigo-600',  ring: 'ring-indigo-100',  bar: 'bg-indigo-500' },
  purple:  { bg: 'bg-purple-50',  fg: 'text-purple-600',  ring: 'ring-purple-100',  bar: 'bg-purple-500' },
  green:   { bg: 'bg-green-50',   fg: 'text-green-600',   ring: 'ring-green-100',   bar: 'bg-green-500' },
};

export const ModernKPICard = memo(function ModernKPICard({ 
  label, 
  icon: Icon, 
  accent = 'blue', 
  periods, 
  onClick,
  navigateTo 
}: ModernKPICardProps) {
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const router = useRouter();
  const a = ACCENT[accent];
  const data = periods[period];
  const TrendIcon = data.trend === 'down' ? ArrowDownRight : ArrowUpRight;

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (navigateTo) {
      router.push(navigateTo);
    }
  };

  return (
    <Card
      onClick={handleClick}
      role={onClick || navigateTo ? 'button' : undefined}
      tabIndex={onClick || navigateTo ? 0 : undefined}
      onKeyDown={onClick || navigateTo ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } } : undefined}
      className={cn(
        'group relative overflow-hidden border-border/70 shadow-sm',
        (onClick || navigateTo) && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      <div className={cn('absolute inset-x-0 top-0 h-0.5', a.bar)} />
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl ring-1', a.bg, a.fg, a.ring)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className={cn('inline-flex rounded-full border border-border bg-muted/40 p-0.5', componentTextSizes.kpiCard.label, 'font-medium')}>
            {(['monthly', 'yearly'] as const).map((p) => (
              <button
                key={p}
                onClick={(e) => { e.stopPropagation(); setPeriod(p); }}
                className={cn(
                  'rounded-full px-2 py-0.5 transition-colors',
                  period === p
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {p === 'monthly' ? 'M' : 'Y'}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <div className={cn(componentTextSizes.kpiCard.label, 'font-medium uppercase tracking-wide text-muted-foreground')}>{label}</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <div className={cn(componentTextSizes.kpiCard.value, 'font-semibold tracking-tight text-foreground')}>{data.value}</div>
            {data.delta && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5',
                  componentTextSizes.kpiCard.change, 'font-medium',
                  data.trend === 'down'
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-emerald-50 text-emerald-700',
                )}
              >
                <TrendIcon className="h-3.5 w-3.5" />
                {data.delta}
              </span>
            )}
          </div>
          {data.hint && <div className={cn('mt-2', componentTextSizes.kpiCard.hint, 'text-muted-foreground')}>{data.hint}</div>}
        </div>
      </CardContent>
    </Card>
  );
});
