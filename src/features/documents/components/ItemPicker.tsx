'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useItemMasters } from '@/features/item-master/hooks/useItemMaster';
import { ItemMaster } from '@/features/item-master/types';
import { MaterialSelection } from '../types/peb-commercial';

interface ItemPickerProps {
  value: MaterialSelection[];
  onChange: (next: MaterialSelection[]) => void;
}

// Item category labels matching the CRM's Item
const ITEM_CATEGORY_LABELS: Record<string, string> = {
  PrimaryStructure: 'Primary Structure',
  SecondaryStructure: 'Secondary Structure',
  Roofing: 'Roofing',
  WallCladding: 'Wall Cladding',
  Accessories: 'Accessories',
  Purlins: 'Purlins',
  Sheeting: 'Sheeting',
  Fasteners: 'Fasteners',
  Insulation: 'Insulation',
  Other: 'Other',
};

// Item category order
const ITEM_CATEGORY_ORDER: string[] = [
  'PrimaryStructure',
  'SecondaryStructure',
  'Roofing',
  'WallCladding',
  'Purlins',
  'Sheeting',
  'Fasteners',
  'Insulation',
  'Accessories',
  'Other',
];

export function ItemPicker({ value, onChange }: ItemPickerProps) {
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({
    [ITEM_CATEGORY_ORDER[0]]: true,
  });
  const [search, setSearch] = useState('');

  // Fetch items from Item using React Query
  const { data: itemMasters, isLoading: itemsLoading } = useItemMasters({
    filter: {
      search: search || undefined,
    },
  });

  const items = itemMasters || [];

  // Group items by category and subcategory
  const tree = useMemo(() => {
    const out: { category: string; subGroups: Record<string, ItemMaster[]> }[] = [];
    const needle = search.trim().toLowerCase();

    for (const cat of ITEM_CATEGORY_ORDER) {
      const groups: Record<string, ItemMaster[]> = {};
      
      // Filter items by category
      const categoryItems = items.filter((item: ItemMaster) => item.category === cat);
      
      // Group by subcategory
      for (const item of categoryItems) {
        const sub = item.subCategory || 'General';
        if (!groups[sub]) {
          groups[sub] = [];
        }
        groups[sub].push(item);
      }

      // Apply search filter
      if (needle) {
        const filtered: Record<string, ItemMaster[]> = {};
        for (const [sub, subItems] of Object.entries(groups)) {
          const matches = subItems.filter((it) =>
            [it.itemName, it.itemCode, it.specification, it.brand]
              .join(' ')
              .toLowerCase()
              .includes(needle),
          );
          if (matches.length) filtered[sub] = matches;
        }
        if (Object.keys(filtered).length) out.push({ category: cat, subGroups: filtered });
      } else {
        if (Object.keys(groups).length) out.push({ category: cat, subGroups: groups });
      }
    }
    return out;
  }, [items, search]);

  const selectedByCode = useMemo(
    () => new Set(value.map((m) => m.itemCode)),
    [value],
  );

  const addItem = (it: ItemMaster) => {
    if (selectedByCode.has(it.itemCode)) return;
    onChange([
      ...value,
      {
        id: crypto.randomUUID(),
        itemMasterId: it.id,
        itemCode: it.itemCode,
        itemName: it.itemName,
        specification: it.specification || '',
        quantity: 1,
        unit: it.unit,
        category: it.category,
        subCategory: it.subCategory,
        brand: it.brand,
        grade: it.grade,
        config: {
          state: 'Included',
          requirement: 'Required',
          chargeability: 'Chargeable',
          visibility: 'Visible',
        },
      },
    ]);
  };

  const patchRow = (idx: number, patch: Partial<MaterialSelection>) => {
    onChange(value.map((m, i) => (i === idx ? { ...m, ...patch } : m)));
  };

  const removeRow = (idx: number) => onChange(value.filter((_, i) => i !== idx));

  if (itemsLoading) {
    return (
      <div className="grid gap-3 lg:grid-cols-[320px_1fr]">
        <div className="rounded-md border bg-muted/20 p-4">
          <p className="text-xs text-muted-foreground">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[320px_1fr]">
      {/* LEFT: Item tree */}
      <div className="rounded-md border bg-muted/20">
        <div className="border-b p-2">
          <Input
            placeholder="Search item, brand, spec…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {tree.length === 0 && (
            <p className="p-3 text-xs text-muted-foreground">No matches.</p>
          )}
          {tree.map(({ category, subGroups }) => {
            const open = openCats[category] ?? Boolean(search);
            const totalCount = Object.values(subGroups).reduce((a, b) => a + b.length, 0);
            return (
              <div key={category} className="border-b last:border-b-0">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide hover:bg-muted/40"
                  onClick={() =>
                    setOpenCats((s) => ({ ...s, [category]: !open }))
                  }
                >
                  <span className="flex items-center gap-1">
                    {open ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                    {ITEM_CATEGORY_LABELS[category] || category}
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {totalCount}
                  </Badge>
                </button>
                {open && (
                  <div className="space-y-3 px-2 pb-2">
                    {Object.entries(subGroups).map(([sub, subItems]) => (
                      <div key={sub}>
                        <p className="px-1 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          {sub}
                        </p>
                        <ul className="space-y-0.5">
                          {subItems.map((it) => {
                            const picked = selectedByCode.has(it.itemCode);
                            return (
                              <li
                                key={it.id}
                                className="flex items-center justify-between gap-2 rounded px-2 py-1 text-xs hover:bg-muted/40"
                              >
                                <div className="min-w-0">
                                  <p className="truncate font-medium">{it.itemName}</p>
                                  <p className="truncate text-[10px] text-muted-foreground">
                                    {it.brand} · {it.specification} · {it.unit}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant={picked ? 'secondary' : 'outline'}
                                  className="h-6 w-6 shrink-0"
                                  disabled={picked}
                                  onClick={() => addItem(it)}
                                  aria-label="Add"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: selected materials */}
      <div className="rounded-md border">
        <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Selected items ({value.length})
          </p>
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {value.length === 0 && (
            <p className="p-6 text-center text-xs text-muted-foreground">
              Add items from the left to build the estimate.
            </p>
          )}
          {ITEM_CATEGORY_ORDER.map((cat) => {
            const rows = value
              .map((m, idx) => ({ m, idx }))
              .filter(({ m }) => m.category === cat);
            if (rows.length === 0) return null;
            return (
              <div key={cat} className="border-b last:border-b-0">
                <p className="bg-muted/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {ITEM_CATEGORY_LABELS[cat] || cat}
                </p>
                <table className="w-full text-xs">
                  <tbody>
                    {rows.map(({ m, idx }) => (
                      <tr key={m.id} className="border-t align-top">
                        <td className="px-3 py-2">
                          <p className="font-medium">{m.itemName}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {m.itemCode} · {m.specification}
                          </p>
                          <Input
                            value={m.notes ?? ''}
                            onChange={(e) => patchRow(idx, { notes: e.target.value })}
                            placeholder="Remarks (optional)"
                            className="mt-1 h-7 text-[11px]"
                          />
                        </td>
                        <td className="px-2 py-2 align-top">
                          <Input
                            type="number"
                            min={0}
                            step="any"
                            value={m.quantity}
                            onChange={(e) =>
                              patchRow(idx, { quantity: Number(e.target.value) })
                            }
                            className="h-7 w-20 text-right text-xs"
                          />
                        </td>
                        <td className="px-2 py-2 align-top text-muted-foreground">
                          {m.unit}
                        </td>
                        <td className="px-2 py-2 align-top text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => removeRow(idx)}
                            aria-label="Remove"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
