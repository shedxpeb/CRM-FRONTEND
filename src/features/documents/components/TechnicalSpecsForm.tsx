'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TechnicalSpecifications } from '../types/peb-commercial';

interface TechnicalSpecsFormProps {
  value: TechnicalSpecifications;
  onChange: (next: TechnicalSpecifications) => void;
  readOnly?: boolean;
}

export function TechnicalSpecsForm({
  value,
  onChange,
  readOnly = false,
}: TechnicalSpecsFormProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field label="Building Length (m)">
        <Input
          type="number"
          value={value.buildingLength ?? ''}
          readOnly={readOnly}
          onChange={(e) => onChange({ ...value, buildingLength: Number(e.target.value) })}
          className="text-xs"
        />
      </Field>
      <Field label="Building Width (m)">
        <Input
          type="number"
          value={value.buildingWidth ?? ''}
          readOnly={readOnly}
          onChange={(e) => onChange({ ...value, buildingWidth: Number(e.target.value) })}
          className="text-xs"
        />
      </Field>
      <Field label="Building Height (m)">
        <Input
          type="number"
          value={value.buildingHeight ?? ''}
          readOnly={readOnly}
          onChange={(e) => onChange({ ...value, buildingHeight: Number(e.target.value) })}
          className="text-xs"
        />
      </Field>
      <Field label="Building Area (m²)">
        <Input
          type="number"
          value={value.buildingArea ?? ''}
          readOnly={readOnly}
          onChange={(e) => onChange({ ...value, buildingArea: Number(e.target.value) })}
          className="text-xs"
        />
      </Field>
      <Field label="Bay Spacing (m)">
        <Input
          type="number"
          value={value.baySpacing ?? ''}
          readOnly={readOnly}
          onChange={(e) => onChange({ ...value, baySpacing: Number(e.target.value) })}
          className="text-xs"
        />
      </Field>
      <Field label="Roof Slope">
        <Input
          type="number"
          value={value.roofSlope ?? ''}
          readOnly={readOnly}
          onChange={(e) => onChange({ ...value, roofSlope: Number(e.target.value) })}
          className="text-xs"
        />
      </Field>
      <Field label="Wind Load">
        <Input
          type="number"
          value={value.windLoad ?? ''}
          readOnly={readOnly}
          onChange={(e) => onChange({ ...value, windLoad: Number(e.target.value) })}
          className="text-xs"
        />
      </Field>
      <Field label="Seismic Zone">
        <Input
          value={value.seismicZone ?? ''}
          readOnly={readOnly}
          onChange={(e) => onChange({ ...value, seismicZone: e.target.value })}
          className="text-xs"
        />
      </Field>
      <Field label="Roof Cladding">
        <Input
          value={value.roofCladding ?? ''}
          readOnly={readOnly}
          onChange={(e) => onChange({ ...value, roofCladding: e.target.value })}
          className="text-xs"
        />
      </Field>
      <Field label="Wall Cladding">
        <Input
          value={value.wallCladding ?? ''}
          readOnly={readOnly}
          onChange={(e) => onChange({ ...value, wallCladding: e.target.value })}
          className="text-xs"
        />
      </Field>
      <Field label="Insulation Type">
        <Input
          value={value.insulationType ?? ''}
          readOnly={readOnly}
          onChange={(e) => onChange({ ...value, insulationType: e.target.value })}
          className="text-xs"
        />
      </Field>
      <Field label="Insulation Thickness (mm)">
        <Input
          type="number"
          value={value.insulationThickness ?? ''}
          readOnly={readOnly}
          onChange={(e) => onChange({ ...value, insulationThickness: Number(e.target.value) })}
          className="text-xs"
        />
      </Field>
      <Field label="Overhead Doors">
        <Input
          type="number"
          value={value.overheadDoors ?? ''}
          readOnly={readOnly}
          onChange={(e) => onChange({ ...value, overheadDoors: Number(e.target.value) })}
          className="text-xs"
        />
      </Field>
      <Field label="Walk Doors">
        <Input
          type="number"
          value={value.walkDoors ?? ''}
          readOnly={readOnly}
          onChange={(e) => onChange({ ...value, walkDoors: Number(e.target.value) })}
          className="text-xs"
        />
      </Field>
      <Field label="Windows">
        <Input
          type="number"
          value={value.windows ?? ''}
          readOnly={readOnly}
          onChange={(e) => onChange({ ...value, windows: Number(e.target.value) })}
          className="text-xs"
        />
      </Field>
      <Field label="Foundation Type">
        <Input
          value={value.foundationType ?? ''}
          readOnly={readOnly}
          onChange={(e) => onChange({ ...value, foundationType: e.target.value })}
          className="text-xs"
        />
      </Field>
      <Field label="Notes" className="sm:col-span-2">
        <Input
          value={value.notes ?? ''}
          readOnly={readOnly}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
          className="text-xs"
        />
      </Field>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1 ${className || ''}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
