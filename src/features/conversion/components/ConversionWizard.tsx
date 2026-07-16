'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Layers,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import type {
  ConversionPairId,
  ConversionProfile,
  ConversionResultSummary,
  CustomFieldMapping,
  CustomFieldMappingAction,
  FieldGroupDefinition,
  FieldGroupId,
} from '../types';
import { getConversionProfiles, getLastSelectedProfileId, setLastSelectedProfileId, saveUserConversionProfile } from '../profiles';

interface ConversionWizardProps {
  pairId: ConversionPairId;
  title: string;
  sourceLabel: string;
  sourceCode?: string | null;
  groups: FieldGroupDefinition[];
  customFieldMappings: CustomFieldMapping[];
  isSubmitting?: boolean;
  error?: string | null;
  result?: ConversionResultSummary | null;
  onCustomMappingsChange: (mappings: CustomFieldMapping[]) => void;
  onConvert: (selectedGroups: FieldGroupId[], mappings: CustomFieldMapping[], profileId?: string) => void;
  onCancel: () => void;
  onDone?: () => void;
  /** Optional destination field defs for "map to existing" */
  destinationFieldOptions?: { key: string; label: string }[];
}

export function ConversionWizard({
  pairId,
  title,
  sourceLabel,
  sourceCode,
  groups,
  customFieldMappings,
  isSubmitting,
  error,
  result,
  onCustomMappingsChange,
  onConvert,
  onCancel,
  onDone,
  destinationFieldOptions = [],
}: ConversionWizardProps) {
  const [profiles, setProfiles] = useState<ConversionProfile[]>(() => getConversionProfiles(pairId));
  const [profileId, setProfileId] = useState<string>(() => {
    const list = getConversionProfiles(pairId);
    return getLastSelectedProfileId(pairId) || list[0]?.id || '';
  });
  const [selected, setSelected] = useState<Set<FieldGroupId>>(() => {
    const list = getConversionProfiles(pairId);
    const p = list.find((x) => x.id === profileId) || list[0];
    return new Set(p?.selectedGroups.filter((g) => groups.find((x) => x.id === g)?.enabled) || []);
  });
  const [showCustom, setShowCustom] = useState(true);
  const [saveName, setSaveName] = useState('');

  useEffect(() => {
    setProfiles(getConversionProfiles(pairId));
  }, [pairId]);

  useEffect(() => {
    const p = profiles.find((x) => x.id === profileId);
    if (!p) return;
    setSelected(new Set(p.selectedGroups.filter((g) => groups.find((x) => x.id === g)?.enabled !== false)));
    setLastSelectedProfileId(pairId, profileId);
  }, [profileId]); // eslint-disable-line react-hooks/exhaustive-deps

  const enabledGroups = groups.filter((g) => g.enabled || g.count > 0 || g.id === 'custom_fields');
  const allSelected = enabledGroups.length > 0 && enabledGroups.every((g) => selected.has(g.id));

  const selectAll = () => setSelected(new Set(enabledGroups.map((g) => g.id)));
  const deselectAll = () => setSelected(new Set());
  const restoreDefault = () => {
    const p = profiles.find((x) => x.id === `${pairId}:default`) || profiles[0];
    if (p) {
      setProfileId(p.id);
      setSelected(new Set(p.selectedGroups.filter((g) => groups.find((x) => x.id === g)?.enabled !== false)));
    }
  };

  const saveCurrentAsProfile = () => {
    const name = saveName.trim() || `Custom ${new Date().toLocaleDateString()}`;
    const id = `${pairId}:user:${Date.now()}`;
    const profile: ConversionProfile = {
      id,
      name,
      description: 'Saved from current selection',
      pairId,
      selectedGroups: [...selected],
      isSystem: false,
    };
    saveUserConversionProfile(profile);
    setProfiles(getConversionProfiles(pairId));
    setProfileId(id);
    setSaveName('');
  };

  const toggleGroup = (id: FieldGroupId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateMapping = (sourceKey: string, patch: Partial<CustomFieldMapping>) => {
    onCustomMappingsChange(
      customFieldMappings.map((m) => (m.sourceKey === sourceKey ? { ...m, ...patch } : m)),
    );
  };

  if (result) {
    return (
      <div className="py-6 space-y-5 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Conversion Complete</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {result.destinationName}
            {result.destinationCode ? ` · ${result.destinationCode}` : ''}
          </p>
        </div>
        <div className="text-left rounded-lg border bg-muted/20 p-4 space-y-1.5 text-sm">
          <p className="font-medium mb-2">Transferred</p>
          <p>✔ {result.transferred.standardFields} standard fields</p>
          <p>✔ {result.transferred.customFields} custom fields</p>
          <p>✔ {result.transferred.documents} documents</p>
          <p>✔ {result.transferred.attachments} attachments</p>
          <p>✔ {result.transferred.activities} activities</p>
          <p>✔ {result.transferred.comments} comments</p>
          {result.transferred.notes && <p>✔ Notes</p>}
          {result.transferred.tags > 0 && <p>✔ {result.transferred.tags} tags</p>}
        </div>
        <Button onClick={onDone || onCancel}>Done</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border bg-muted/20 px-4 py-3">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Source: {sourceLabel}
          {sourceCode ? ` · ${sourceCode}` : ''}
        </p>
      </div>

      {/* Profiles */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> Conversion Profile
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {profiles.map((p: ConversionProfile) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setProfileId(p.id)}
              className={cn(
                'text-left rounded-lg border px-3 py-2 transition-colors',
                profileId === p.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/40'
              )}
            >
              <p className="text-sm font-medium">{p.name}</p>
              {p.description && <p className="text-[11px] text-muted-foreground mt-0.5">{p.description}</p>}
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Save current selection as profile…"
            className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-xs"
          />
          <Button type="button" variant="outline" size="sm" onClick={saveCurrentAsProfile}>
            Save Profile
          </Button>
        </div>
      </div>

      {/* Bulk actions */}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={selectAll}>Select All</Button>
        <Button type="button" variant="outline" size="sm" onClick={deselectAll}>Deselect All</Button>
        <Button type="button" variant="ghost" size="sm" onClick={restoreDefault} className="gap-1">
          <RotateCcw className="w-3.5 h-3.5" /> Restore Default
        </Button>
      </div>

      {/* Groups */}
      <div className="space-y-1 rounded-lg border divide-y max-h-[40vh] overflow-y-auto">
        {groups.map((g) => {
          const disabled = !g.enabled && g.count === 0 && g.id !== 'custom_fields';
          return (
            <label
              key={g.id}
              className={cn(
                'flex items-start gap-3 px-3 py-2.5 cursor-pointer',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Checkbox
                checked={selected.has(g.id)}
                disabled={disabled}
                onCheckedChange={() => !disabled && toggleGroup(g.id)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{g.label}</p>
                  <span className="text-[11px] text-muted-foreground tabular-nums">{g.count}</span>
                </div>
                {g.description && <p className="text-[11px] text-muted-foreground mt-0.5">{g.description}</p>}
              </div>
            </label>
          );
        })}
      </div>

      {/* Custom field mapping */}
      {selected.has('custom_fields') && customFieldMappings.length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2.5 bg-muted/30 text-sm font-medium"
            onClick={() => setShowCustom(!showCustom)}
          >
            Custom Field Mapping ({customFieldMappings.length})
            {showCustom ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {showCustom && (
            <div className="divide-y">
              {customFieldMappings.map((m) => (
                <div key={m.sourceKey} className="px-3 py-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{m.sourceLabel}</p>
                      <p className="text-xs text-muted-foreground">
                        Value: {String(m.sourceValue)}
                        {m.autoMapped && m.targetKey ? ` · Auto-mapped → ${m.targetKey}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={m.action !== 'ignore'}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateMapping(m.sourceKey, {
                            action: m.autoMapped ? 'auto' : (m.targetKey ? 'map' : 'create'),
                            createKey: m.createKey || m.sourceKey,
                          });
                        } else {
                          updateMapping(m.sourceKey, { action: 'ignore' });
                        }
                      }}
                    />
                    <span className="text-xs text-muted-foreground">Include this field</span>
                  </div>
                  {m.action !== 'ignore' && !m.autoMapped && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      {(['create', 'map'] as CustomFieldMappingAction[]).map((action) => (
                        <label key={action} className="flex items-center gap-2 text-xs border rounded-md px-2 py-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name={`map-${m.sourceKey}`}
                            checked={m.action === action}
                            onChange={() =>
                              updateMapping(m.sourceKey, {
                                action,
                                targetKey: action === 'map' ? m.targetKey || destinationFieldOptions[0]?.key : m.targetKey,
                                createKey: action === 'create' ? m.createKey || m.sourceKey : m.createKey,
                              })
                            }
                          />
                          {action === 'create' && 'Create New Field'}
                          {action === 'map' && 'Map to Existing'}
                        </label>
                      ))}
                    </div>
                  )}
                  {m.action === 'map' && !m.autoMapped && (
                    <select
                      className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                      value={m.targetKey || ''}
                      onChange={(e) => updateMapping(m.sourceKey, { targetKey: e.target.value, action: 'map' })}
                    >
                      <option value="">Select destination field…</option>
                      {destinationFieldOptions.map((o) => (
                        <option key={o.key} value={o.key}>{o.label}</option>
                      ))}
                    </select>
                  )}
                  {m.action === 'auto' && (
                    <p className="text-[11px] text-emerald-700">Automatically mapped to matching field</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-xs text-muted-foreground">
          {selected.size} packages selected{allSelected ? ' (all)' : ''}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || selected.size === 0}
            onClick={() => onConvert([...selected], customFieldMappings, profileId)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Converting…
              </>
            ) : (
              'Convert'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
