'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CustomerHealthScoreProps {
  score: number;
  trend?: 'up' | 'down' | 'stable';
  lastUpdated?: Date;
}

export const CustomerHealthScore = memo(function CustomerHealthScore({
  score,
  trend = 'stable',
  lastUpdated,
}: CustomerHealthScoreProps) {
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthStatus = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'At Risk';
    return 'Critical';
  };

  const getHealthVariant = (score: number): 'success' | 'warning' | 'destructive' | 'secondary' => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    if (score >= 40) return 'destructive';
    return 'destructive';
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Customer Health Score
          </span>
          {getTrendIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Circular Progress */}
          <div className="relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke={score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444'}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${getHealthColor(score)}`}>
                {score}
              </span>
            </div>
          </div>

          {/* Health Details */}
          <div className="flex-1 space-y-2">
            <Badge variant={getHealthVariant(score)} className="text-xs">
              {getHealthStatus(score)}
            </Badge>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Based on revenue, projects, and engagement</p>
              {lastUpdated && (
                <p>Last updated: {lastUpdated.toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
