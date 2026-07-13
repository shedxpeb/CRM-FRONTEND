/**
 * Task presentation config.
 *
 * Single source of truth for status / priority badge appearance so individual
 * screens no longer hand-roll their own `getStatusColor` / `getPriorityColor`
 * helpers. Built on top of the existing `Badge` variants (dark-mode safe,
 * alpha-based) — no separate badge system is introduced.
 */
import type { BadgeProps } from '@/components/ui/badge';
import type { TaskStatus, TaskPriority } from '../types';

type BadgeVariant = NonNullable<BadgeProps['variant']>;

export interface BadgeConfig {
  label: string;
  variant: BadgeVariant;
  /** Optional override for tones the base Badge variants don't cover. */
  className?: string;
}

// Orange tone follows the same alpha pattern as the built-in Badge variants so
// it renders correctly in both light and dark mode.
const ORANGE_TONE = 'bg-orange-500/15 text-orange-400 border-orange-500/25';

export const STATUS_CONFIG: Record<TaskStatus, BadgeConfig> = {
  Pending: { label: 'Pending', variant: 'secondary' },
  'In Progress': { label: 'In Progress', variant: 'info' },
  Blocked: { label: 'Blocked', variant: 'destructive' },
  Review: { label: 'Review', variant: 'warning' },
  Completed: { label: 'Completed', variant: 'success' },
  Cancelled: { label: 'Cancelled', variant: 'outline' },
  Reopened: { label: 'Reopened', variant: 'outline', className: ORANGE_TONE },
};

// Priority colours follow the frozen architecture: Critical=red, High=orange,
// Medium=yellow/amber, Low=green.
export const PRIORITY_CONFIG: Record<TaskPriority, BadgeConfig> = {
  Critical: { label: 'Critical', variant: 'destructive' },
  High: { label: 'High', variant: 'outline', className: ORANGE_TONE },
  Medium: { label: 'Medium', variant: 'warning' },
  Low: { label: 'Low', variant: 'success' },
};

export const RELATIONSHIP_LABELS: Record<string, string> = {
  'Depends On': 'Depends On',
  'Blocked By': 'Blocked By',
  Blocking: 'Blocking',
  'Related To': 'Related To',
  'Duplicate Of': 'Duplicate Of',
};
