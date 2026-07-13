/**
 * Dynamic Chart Component
 * Based on remix-of-peb-insight-hub-main reference design
 * Supports multiple chart types: bar, line, area, pie, donut, radar, radial, composed
 */

'use client';

import { memo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ChartType } from './ChartCard';

const COLORS = [
  '#3b82f6', // blue-500
  '#60a5fa', // blue-400
  '#2563eb', // blue-600
  '#93c5fd', // blue-300
  '#1d4ed8', // blue-700
  '#3b82f6', // blue-500
  '#60a5fa', // blue-400
  '#2563eb', // blue-600
];

const axis = {
  stroke: 'hsl(var(--muted-foreground))',
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  contentStyle: {
    background: 'hsl(var(--card))',
    border: '5px solid hsl(var(--border))',
    borderRadius: 12,
    fontSize: 13,
    color: 'hsl(var(--foreground))',
    boxShadow: '0 8px 24px -12px rgb(0 0 0 / 0.25)',
    padding: '10px 14px',
  },
  labelStyle: { color: 'hsl(var(--foreground))', fontWeight: 600, fontSize: 13 },
  itemStyle: { color: 'hsl(var(--foreground))', fontSize: 13 },
};

interface SeriesProps {
  type: ChartType;
  data: Array<Record<string, any>>;
  /** key for value */
  dataKey?: string;
  /** secondary key for composed/multi */
  secondKey?: string;
  /** name key for category */
  nameKey?: string;
  /** kept for backwards-compat; no longer changes colors */
  categorical?: boolean;
}

export const DynamicChart = memo(function DynamicChart({
  type,
  data,
  dataKey = 'value',
  secondKey,
  nameKey = 'name',
}: SeriesProps) {
  // Prevent rendering if data is empty or invalid
  if (!data || data.length === 0) {
    return null;
  }

  switch (type) {
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={280} minWidth={0}>
          <BarChart data={data} margin={{ top: 12, right: 12, left: -10, bottom: 0 }} barCategoryGap="22%">
            <defs>
              <linearGradient id="barFillA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="barFillB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" strokeOpacity={0.6} vertical={false} />
            <XAxis dataKey={nameKey} {...axis} dy={4} />
            <YAxis {...axis} width={36} />
            <Tooltip
              {...tooltipStyle}
              cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1, radius: 8 }}
            />
            <Bar
              dataKey={dataKey}
              radius={[8, 8, 0, 0]}
              maxBarSize={44}
              fill="url(#barFillA)"
            />
            {secondKey && (
              <Bar
                dataKey={secondKey}
                radius={[8, 8, 0, 0]}
                maxBarSize={44}
                fill="url(#barFillB)"
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      );
    case 'line':
      return (
        <ResponsiveContainer width="100%" height={280} minWidth={0}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey={nameKey} {...axis} />
            <YAxis {...axis} />
            <Tooltip {...tooltipStyle} cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1, radius: 8 }} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#3b82f6' }}
              activeDot={{ r: 5 }}
            />
            {secondKey && (
              <Line
                type="monotone"
                dataKey={secondKey}
                stroke="#60a5fa"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      );
    case 'area':
      return (
        <ResponsiveContainer width="100%" height={280} minWidth={0}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="areaA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey={nameKey} {...axis} />
            <YAxis {...axis} />
            <Tooltip {...tooltipStyle} cursor={{ fill: 'hsl(var(--accent))', opacity: 0.15, radius: 8 }} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#areaA)"
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    case 'pie':
    case 'donut':
      return (
        <ResponsiveContainer width="100%" height={280} minWidth={0}>
          <PieChart>
            <Tooltip {...tooltipStyle} cursor={{ fill: 'hsl(var(--accent))', opacity: 0.15, radius: 8 }} />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}
            />
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              outerRadius={90}
              innerRadius={type === 'donut' ? 55 : 0}
              paddingAngle={2}
              stroke="hsl(var(--card))"
              strokeWidth={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );
    case 'radar':
      return (
        <ResponsiveContainer width="100%" height={280} minWidth={0}>
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey={nameKey} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip {...tooltipStyle} cursor={{ fill: 'hsl(var(--accent))', opacity: 0.15, radius: 8 }} />
            <Radar
              dataKey={dataKey}
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.35}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      );
    case 'radial':
      return (
        <ResponsiveContainer width="100%" height={280} minWidth={0}>
          <RadialBarChart
            data={data.map((d, i) => ({ ...d, fill: COLORS[i % COLORS.length] }))}
            innerRadius="25%"
            outerRadius="95%"
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar dataKey={dataKey} background cornerRadius={6} />
            <Tooltip {...tooltipStyle} cursor={{ fill: 'hsl(var(--accent))', opacity: 0.15, radius: 8 }} />
            <Legend
              iconType="circle"
              verticalAlign="bottom"
              wrapperStyle={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      );
    case 'composed':
      return (
        <ResponsiveContainer width="100%" height={280} minWidth={0}>
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey={nameKey} {...axis} />
            <YAxis {...axis} />
            <Tooltip {...tooltipStyle} cursor={{ fill: 'hsl(var(--accent))', opacity: 0.15, radius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey={dataKey} barSize={22} radius={[6, 6, 0, 0]} fill="#3b82f6" />
            {secondKey && (
              <Line
                type="monotone"
                dataKey={secondKey}
                stroke="#60a5fa"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      );
  }
});
