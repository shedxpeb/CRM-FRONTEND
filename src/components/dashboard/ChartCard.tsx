/**
 * Chart Card Component
 * Based on remix-of-peb-insight-hub-main reference design
 * Features chart type selector and period selector (monthly/yearly)
 */

'use client';

import { useState, type ReactNode, memo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BarChart3,
  LineChart as LineIcon,
  AreaChart as AreaIcon,
  PieChart as PieIcon,
  Donut,
  Radar as RadarIcon,
  CircleDot,
  Layers,
  ChevronDown,
  Calendar,
} from 'lucide-react';

export type ChartType =
  | 'bar'
  | 'line'
  | 'area'
  | 'pie'
  | 'donut'
  | 'radar'
  | 'radial'
  | 'composed';

export type ChartPeriod = 'monthly' | 'yearly';

const META: Record<ChartType, { label: string; Icon: typeof BarChart3 }> = {
  bar: { label: 'Bar', Icon: BarChart3 },
  line: { label: 'Line', Icon: LineIcon },
  area: { label: 'Area', Icon: AreaIcon },
  pie: { label: 'Pie', Icon: PieIcon },
  donut: { label: 'Donut', Icon: Donut },
  radar: { label: 'Radar', Icon: RadarIcon },
  radial: { label: 'Radial', Icon: CircleDot },
  composed: { label: 'Composed', Icon: Layers },
};

interface ChartCardProps {
  title: string;
  description?: string;
  types: ChartType[];
  initial?: ChartType;
  /** Show monthly/yearly period dropdown */
  showPeriod?: boolean;
  initialPeriod?: ChartPeriod;
  children: (type: ChartType, period: ChartPeriod) => ReactNode;
}

export const ChartCard = memo(function ChartCard({
  title,
  description,
  types,
  initial,
  showPeriod = false,
  initialPeriod = 'monthly',
  children,
}: ChartCardProps) {
  const [type, setType] = useState<ChartType>(initial ?? types[0]);
  const [period, setPeriod] = useState<ChartPeriod>(initialPeriod);
  const current = META[type];
  const CurrentIcon = current.Icon;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-col gap-3 space-y-0 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <CardTitle className="text-sm sm:text-base">{title}</CardTitle>
          {description && <CardDescription className="text-xs">{description}</CardDescription>}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {showPeriod && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 h-7 sm:h-8 px-2 sm:px-3">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline capitalize">{period}</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuLabel>Period</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(['monthly', 'yearly'] as const).map((p) => (
                  <DropdownMenuItem
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={p === period ? 'bg-accent' : ''}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    <span className="capitalize">{p}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 h-7 sm:h-8 px-2 sm:px-3">
                <CurrentIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{current.label}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Chart type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {types.map((t) => {
                const Item = META[t].Icon;
                return (
                  <DropdownMenuItem
                    key={t}
                    onClick={() => setType(t)}
                    className={t === type ? 'bg-accent' : ''}
                  >
                    <Item className="mr-2 h-4 w-4" />
                    {META[t].label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        <div className="h-[250px] sm:h-[280px] w-full">{children(type, period)}</div>
      </CardContent>
    </Card>
  );
});
