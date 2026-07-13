'use client';

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface ClickableKPICardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const ClickableKPICard = memo(function ClickableKPICard({
  title,
  value,
  change,
  icon,
  color,
  onClick,
  disabled = false,
}: ClickableKPICardProps) {
  const getChangeColor = (change?: number) => {
    if (change === undefined) return 'text-muted-foreground';
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getChangeIcon = (change?: number) => {
    if (change === undefined) return <Minus className="h-3 w-3" />;
    if (change > 0) return <ArrowUp className="h-3 w-3" />;
    if (change < 0) return <ArrowDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={!disabled ? onClick : undefined}
      role={onClick && !disabled ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick && !disabled) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${title}: ${value}${change !== undefined ? `, ${change > 0 ? '+' : ''}${change}%` : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 mt-1 text-xs ${getChangeColor(change)}`}>
                {getChangeIcon(change)}
                <span>{change > 0 ? '+' : ''}{change}%</span>
                <span className="text-muted-foreground ml-1">vs last period</span>
              </div>
            )}
          </div>
          <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-').replace('600', '100')}`}>
            <div className={`${color} h-4 w-4 flex items-center justify-center`}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
