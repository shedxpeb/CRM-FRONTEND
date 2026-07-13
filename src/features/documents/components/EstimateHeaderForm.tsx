'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EstimateHeader {
  projectName: string;
  contactPersonName: string;
  salesExecutive: string;
  validTill: string;
  version: number;
}

interface EstimateHeaderFormProps {
  value: EstimateHeader;
  onChange: (next: EstimateHeader) => void;
  customerName?: string;
  leadNumber?: string;
}

export function EstimateHeaderForm({ value, onChange, customerName, leadNumber }: EstimateHeaderFormProps) {
  const set = (patch: Partial<EstimateHeader>) => onChange({ ...value, ...patch });
  return (
    <div className="space-y-3 rounded-md border bg-muted/20 p-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label className="text-xs">Customer</Label>
          <Input value={customerName ?? "—"} readOnly className="h-8 bg-muted/40" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Lead</Label>
          <Input value={leadNumber ?? "—"} readOnly className="h-8 bg-muted/40" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Version</Label>
          <Input
            type="number"
            min={1}
            value={value.version}
            onChange={(e) => set({ version: Math.max(1, Number(e.target.value) || 1) })}
            className="h-8"
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Project name *</Label>
          <Input
            value={value.projectName}
            onChange={(e) => set({ projectName: e.target.value })}
            placeholder="e.g. Pune Warehouse Phase-1"
            className="h-8"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Contact person</Label>
          <Input
            value={value.contactPersonName}
            onChange={(e) => set({ contactPersonName: e.target.value })}
            placeholder="On customer side"
            className="h-8"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Sales executive</Label>
          <Input
            value={value.salesExecutive}
            onChange={(e) => set({ salesExecutive: e.target.value })}
            placeholder="Internal owner"
            className="h-8"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Valid till</Label>
          <Input
            type="date"
            value={value.validTill ? value.validTill.slice(0, 10) : ''}
            onChange={(e) =>
              set({ validTill: new Date(e.target.value).toISOString() })
            }
            className="h-8"
          />
        </div>
      </div>
    </div>
  );
}
