'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { useState } from 'react';
import { ScopeConfiguration, CommercialItemConfig } from '../types/peb-commercial';

// Scope keys for type safety (only the service keys, not additionalServices)
type ServiceScopeKey = 'labour' | 'installation' | 'transportation' | 'crane' | 'civilWork' | 'accommodation' | 'erection' | 'freight';

// Scope labels for display
const SCOPE_LABELS: Record<ServiceScopeKey, string> = {
  labour: 'Labour',
  installation: 'Installation',
  transportation: 'Transportation',
  crane: 'Crane',
  civilWork: 'Civil Work',
  accommodation: 'Accommodation',
  erection: 'Erection',
  freight: 'Freight',
};

// Configuration options
const STATES = ['Included', 'Excluded'] as const;
const REQS = ['Required', 'Optional'] as const;
const CHARGE = ['Chargeable', 'Non-Chargeable'] as const;
const VIS = ['Visible', 'Hidden'] as const;

interface ScopeConfigurationEditorProps {
  value: ScopeConfiguration;
  onChange: (next: ScopeConfiguration) => void;
  readOnly?: boolean;
}

export function ScopeConfigurationEditor({
  value,
  onChange,
  readOnly = false,
}: ScopeConfigurationEditorProps) {
  const [newSvc, setNewSvc] = useState('');
  const keys = Object.keys(SCOPE_LABELS) as ServiceScopeKey[];

  const updateItem = (k: ServiceScopeKey, patch: Partial<CommercialItemConfig>) =>
    onChange({ ...value, [k]: { ...value[k], ...patch } as CommercialItemConfig });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Item</th>
              <th className="px-3 py-2">State</th>
              <th className="px-3 py-2">Requirement</th>
              <th className="px-3 py-2">Chargeability</th>
              <th className="px-3 py-2">Visibility</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k} className="border-t">
                <td className="px-3 py-2 font-medium">{SCOPE_LABELS[k]}</td>
                {[
                  { v: value[k].state, opts: STATES, key: 'state' as const },
                  { v: value[k].requirement, opts: REQS, key: 'requirement' as const },
                  { v: value[k].chargeability, opts: CHARGE, key: 'chargeability' as const },
                  { v: value[k].visibility, opts: VIS, key: 'visibility' as const },
                ].map((col) => (
                  <td key={col.key} className="px-3 py-2">
                    <Select
                      value={col.v}
                      onValueChange={(nv) =>
                        updateItem(k, { [col.key]: nv as any } as Partial<CommercialItemConfig>)
                      }
                      disabled={readOnly}
                    >
                      <SelectTrigger className="h-8 w-full min-w-[140px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {col.opts.map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <Label className="text-xs">Additional services</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {value.additionalServices.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs"
            >
              {s.serviceName}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...value,
                      additionalServices: value.additionalServices.filter((x) => x.id !== s.id),
                    })
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
        {!readOnly && (
          <div className="mt-2 flex gap-2">
            <Input
              value={newSvc}
              onChange={(e) => setNewSvc(e.target.value)}
              placeholder="Add a service…"
              className="h-9 text-xs"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                if (newSvc.trim()) {
                  onChange({
                    ...value,
                    additionalServices: [
                      ...value.additionalServices,
                      {
                        id: crypto.randomUUID(),
                        serviceName: newSvc.trim(),
                        config: {
                          state: 'Included',
                          requirement: 'Optional',
                          chargeability: 'Chargeable',
                          visibility: 'Visible',
                        },
                      },
                    ],
                  });
                  setNewSvc('');
                }
              }}
              className="text-xs"
            >
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
