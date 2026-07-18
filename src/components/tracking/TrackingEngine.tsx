'use client';

import { memo, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useTrackingData, useChangeStatus } from '@/features/tracking/hooks/useTracking';
import { UniversalComments } from './UniversalComments';
import { ActivityAuditLog } from './ActivityAuditLog';
import {
  Loader2,
  Circle,
  CheckCircle2,
  XCircle,
  Paperclip,
  FileText,
  MessageSquare,
  GitBranch,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PipelineStage, StageDetails } from '@/features/tracking/types';

interface TrackingEngineProps {
  entityType: string;
  entityId: string;
  className?: string;
  onStageAction?: (stage: string) => void;
  /** @deprecated kept for compatibility — TrackingEngine is always full tracking now */
  variant?: 'pipeline' | 'full';
}

type TabId = 'pipeline' | 'activity' | 'comments' | 'files';

function StageIcon({ isCurrent, isPast, isFinal }: { isCurrent: boolean; isPast: boolean; isFinal: boolean }) {
  if (isFinal && isCurrent) return <XCircle className="w-4 h-4 text-red-500" />;
  if (isPast) return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  if (isCurrent) return <Circle className="w-4 h-4 fill-primary/20 text-primary" />;
  return <Circle className="w-4 h-4 text-muted-foreground/30" />;
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            value >= 80 ? 'bg-green-500' : value >= 50 ? 'bg-primary' : value >= 25 ? 'bg-amber-500' : 'bg-muted-foreground/40'
          )}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className="text-xs font-medium text-muted-foreground w-10 text-right">{value}%</span>
    </div>
  );
}

function StageDetailPanel({ details }: { details: StageDetails }) {
  const fieldRows = Object.entries(details.fields ?? {}).filter(([key, v]) => {
    if (v === null || v === undefined) return false;
    if (key === 'id' || key.endsWith('Id') || key.endsWith('Ids')) return false;
    if (['organizationId', 'customFields', 'deletedAt', 'isDeleted', 'password', 'token', 'attachments'].includes(key)) {
      return false;
    }
    if (typeof v === 'object' && !(v instanceof Date)) return false;
    return true;
  });

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)) && value.length > 8)) {
      try {
        return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      } catch {
        return String(value);
      }
    }
    if (typeof value === 'number') return value.toLocaleString('en-IN');
    return String(value);
  };

  const humanLabel = (key: string) =>
    key
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]/g, ' ')
      .trim()
      .replace(/^\w/, (c) => c.toUpperCase());

  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/30">
        <h4 className="text-sm font-semibold">{details.title || details.stage} — Record Snapshot</h4>
      </div>
      <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
        {fieldRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No details available</p>
        ) : (
          fieldRows.map(([key, value]) => (
            <div key={key} className="flex justify-between items-start gap-4">
              <span className="text-xs text-muted-foreground whitespace-nowrap">{humanLabel(key)}</span>
              <span className="text-sm text-right font-medium break-all max-w-[60%]">{formatValue(value)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function TrackingEngineComponent({ entityType, entityId, className, onStageAction }: TrackingEngineProps) {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useTrackingData(entityType, entityId);
  const changeStatus = useChangeStatus(entityType, entityId);
  const [tab, setTab] = useState<TabId>('pipeline');
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const tracking = data?.data;

  const transitions = useMemo(() => {
    if (!tracking) return [];
    const fromAllowed = tracking.allowedTransitions?.length
      ? tracking.allowedTransitions
      : tracking.currentStage?.allowedTransitions || [];
    if (fromAllowed.length) return fromAllowed;
    return (tracking.pipeline || []).filter((s) => !s.isCurrent).map((s) => s.status);
  }, [tracking]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Unable to load tracking data
      </div>
    );
  }

  const { pipeline, progress, currentStage, stageDetails, comments, attachments, currentStatus } = tracking;

  const handleMoveTo = async (status: string) => {
    setStatusError(null);
    try {
      await changeStatus.mutateAsync({ status });
      onStageAction?.(status);
      // Invalidate the entity type queries and the specific entity
      queryClient.invalidateQueries({ queryKey: [entityType, entityId] });
      if (entityType === 'lead') {
        queryClient.invalidateQueries({ queryKey: ['leads'] });
        queryClient.invalidateQueries({ queryKey: ['leads-kanban'] });
        queryClient.invalidateQueries({ queryKey: ['leads-calendar'] });
        queryClient.invalidateQueries({ queryKey: ['leads-stats'] });
        queryClient.invalidateQueries({ queryKey: ['lead', entityId] });
      } else if (entityType === 'customer') {
        queryClient.invalidateQueries({ queryKey: ['customers'] });
        queryClient.invalidateQueries({ queryKey: ['customers-kanban'] });
        queryClient.invalidateQueries({ queryKey: ['customers-calendar'] });
        queryClient.invalidateQueries({ queryKey: ['customers-stats'] });
        queryClient.invalidateQueries({ queryKey: ['customer', entityId] });
      } else if (entityType === 'project') {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        queryClient.invalidateQueries({ queryKey: ['projects-kanban'] });
        queryClient.invalidateQueries({ queryKey: ['projects-calendar'] });
        queryClient.invalidateQueries({ queryKey: ['projects-stats'] });
        queryClient.invalidateQueries({ queryKey: ['project', entityId] });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update status';
      setStatusError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'activity', label: 'Activity', count: tracking.timeline?.length },
    { id: 'comments', label: 'Comments', count: comments?.length || 0 },
    { id: 'files', label: 'Files', count: attachments?.length || 0 },
  ];

  const canMoveTo = (status: string) =>
    transitions.some((t) => t.replace(/[\s_-]/g, '').toLowerCase() === status.replace(/[\s_-]/g, '').toLowerCase());

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border bg-card">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: currentStage?.color || 'var(--primary)' }}
            />
            <span className="text-sm font-semibold truncate">
              {currentStage?.label || currentStatus || 'Status not set'}
            </span>
            {currentStage?.isFinal && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                FINAL
              </span>
            )}
            <span className="text-[11px] text-muted-foreground">
              Tracking via status history + live record
            </span>
          </div>
          <ProgressBar value={progress} />
        </div>
        {transitions.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {transitions.slice(0, 4).map((t) => {
              const label = pipeline.find((p) => p.status === t)?.label || t;
              return (
                <Button
                  key={t}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 gap-1"
                  onClick={() => handleMoveTo(t)}
                  disabled={changeStatus.isPending}
                >
                  <ArrowRight className="w-3 h-3" />
                  {label}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {statusError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {statusError}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
              tab === t.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
            {typeof t.count === 'number' && (
              <span className="ml-1.5 text-[11px] text-muted-foreground tabular-nums">({t.count})</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'pipeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={cn(selectedStage || stageDetails ? 'lg:col-span-1' : 'lg:col-span-3')}>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              <GitBranch className="w-3.5 h-3.5" /> Workflow Stages
            </div>
            <div className="space-y-0 relative">
              {pipeline.map((stage, idx) => {
                const isLast = idx === pipeline.length - 1;
                const movable = !stage.isCurrent && canMoveTo(stage.status);

                return (
                  <div key={stage.id} className="relative flex gap-3 pb-1 last:pb-0">
                    {!isLast && (
                      <div
                        className={cn(
                          'absolute left-[13px] top-6 bottom-0 w-0.5',
                          stage.isPast ? 'bg-green-400' : 'bg-border'
                        )}
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedStage(selectedStage?.id === stage.id ? null : stage)}
                      className={cn(
                        'relative z-10 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all',
                        selectedStage?.id === stage.id && 'ring-2 ring-primary ring-offset-2',
                        stage.isPast && 'bg-green-100 dark:bg-green-900/30',
                        stage.isCurrent && 'bg-primary/10',
                        !stage.isPast && !stage.isCurrent && 'bg-muted hover:bg-muted/80',
                      )}
                    >
                      <StageIcon isCurrent={stage.isCurrent} isPast={stage.isPast} isFinal={stage.isFinal} />
                    </button>

                    <div className="flex-1 min-w-0 py-1 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        className="text-left min-w-0"
                        onClick={() => setSelectedStage(selectedStage?.id === stage.id ? null : stage)}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'text-sm font-medium',
                              stage.isPast && 'text-green-600',
                              stage.isCurrent && 'text-primary font-semibold',
                              !stage.isPast && !stage.isCurrent && 'text-muted-foreground',
                            )}
                          >
                            {stage.label}
                          </span>
                          {stage.isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                              Current
                            </span>
                          )}
                        </div>
                      </button>
                      {movable && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          disabled={changeStatus.isPending}
                          onClick={() => handleMoveTo(stage.status)}
                        >
                          Move here
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {(selectedStage || stageDetails) && (
              <StageDetailPanel
                details={
                  stageDetails || {
                    stage: selectedStage?.status || currentStatus || '',
                    title: selectedStage?.label || currentStatus || 'Stage',
                    fields: {},
                  }
                }
              />
            )}
            <div className="rounded-lg border p-3 bg-muted/20 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground text-sm">How tracking works</p>
              <p>Status is synced from the live {entityType} record and status history.</p>
              <p>Use <strong>Move here</strong> or the arrows above to change status — updates the record, timeline, and audit log.</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <ActivityAuditLog entityType={entityType} entityId={entityId} />
      )}

      {tab === 'comments' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MessageSquare className="w-4 h-4" />
            Comments ({comments?.length || 0})
          </div>
          <UniversalComments entityType={entityType} entityId={entityId} />
        </div>
      )}

      {tab === 'files' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Paperclip className="w-4 h-4" />
            Attachments ({attachments?.length || 0})
          </div>
          {attachments && attachments.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {attachments.map((a) => (
                <div key={a.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate max-w-[200px]">{a.originalName || a.fileName}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-6 text-center">No attachments yet</p>
          )}
        </div>
      )}
    </div>
  );
}

export const TrackingEngine = memo(TrackingEngineComponent);
