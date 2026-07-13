'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Quotation, PricingConfiguration, MaterialRate } from '../types/peb-commercial';

interface PricingConfigurationEditorProps {
  quotation: Quotation;
  onChange: (q: Quotation) => void;
}

// Utility function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export function PricingConfigurationEditor({
  quotation,
  onChange,
}: PricingConfigurationEditorProps) {
  const cfg = quotation.pricingConfiguration;

  const updateMat = (i: number, patch: Partial<MaterialRate>) => {
    const materialRates = cfg.materialRates.map((l, idx) =>
      idx === i ? { ...l, ...patch } : l,
    );
    onChange({
      ...quotation,
      pricingConfiguration: { ...cfg, materialRates },
    });
  };

  const updateServiceCost = (serviceName: string, value: number) => {
    const updatedCosts = cfg.additionalServiceCosts.map((cost) =>
      cost.serviceId === serviceName ? { ...cost, cost: value } : cost
    );
    onChange({
      ...quotation,
      pricingConfiguration: { ...cfg, additionalServiceCosts: updatedCosts },
    });
  };

  return (
    <div className="space-y-4">
      <section>
        <h4 className="mb-2 text-sm font-semibold">Material rates</h4>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Item</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Rate</th>
                <th className="px-3 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {cfg.materialRates.map((l, i) => (
                <tr key={l.materialSelectionId + i} className="border-t">
                  <td className="px-3 py-2">
                    <div className="font-medium">{quotation.materialSelections.find(m => m.id === l.materialSelectionId)?.itemName || 'Unknown'}</div>
                    <div className="text-xs text-muted-foreground">{quotation.materialSelections.find(m => m.id === l.materialSelectionId)?.itemCode || ''}</div>
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      value={l.quantity}
                      onChange={(e) => updateMat(i, { quantity: Number(e.target.value) })}
                      className="h-8 w-24 text-right text-xs"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      value={l.rate}
                      onChange={(e) => updateMat(i, { rate: Number(e.target.value) })}
                      className="h-8 w-32 text-right text-xs"
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-medium">
                    {formatCurrency(l.rate * l.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h4 className="mb-2 text-sm font-semibold">Service costs</h4>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Service</th>
                <th className="px-3 py-2 text-right">Rate</th>
                <th className="px-3 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-3 py-2">Labour</td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    value={cfg.labourCost}
                    onChange={(e) => onChange({ ...quotation, pricingConfiguration: { ...cfg, labourCost: Number(e.target.value) } })}
                    className="h-8 w-32 text-right text-xs"
                  />
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {formatCurrency(cfg.labourCost)}
                </td>
              </tr>
              <tr className="border-t">
                <td className="px-3 py-2">Installation</td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    value={cfg.installationCost}
                    onChange={(e) => onChange({ ...quotation, pricingConfiguration: { ...cfg, installationCost: Number(e.target.value) } })}
                    className="h-8 w-32 text-right text-xs"
                  />
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {formatCurrency(cfg.installationCost)}
                </td>
              </tr>
              <tr className="border-t">
                <td className="px-3 py-2">Transportation</td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    value={cfg.transportationCost}
                    onChange={(e) => onChange({ ...quotation, pricingConfiguration: { ...cfg, transportationCost: Number(e.target.value) } })}
                    className="h-8 w-32 text-right text-xs"
                  />
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {formatCurrency(cfg.transportationCost)}
                </td>
              </tr>
              <tr className="border-t">
                <td className="px-3 py-2">Crane</td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    value={cfg.craneCost}
                    onChange={(e) => onChange({ ...quotation, pricingConfiguration: { ...cfg, craneCost: Number(e.target.value) } })}
                    className="h-8 w-32 text-right text-xs"
                  />
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {formatCurrency(cfg.craneCost)}
                </td>
              </tr>
              <tr className="border-t">
                <td className="px-3 py-2">Civil Work</td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    value={cfg.civilCost}
                    onChange={(e) => onChange({ ...quotation, pricingConfiguration: { ...cfg, civilCost: Number(e.target.value) } })}
                    className="h-8 w-32 text-right text-xs"
                  />
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {formatCurrency(cfg.civilCost)}
                </td>
              </tr>
              <tr className="border-t">
                <td className="px-3 py-2">Accommodation</td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    value={cfg.accommodationCost}
                    onChange={(e) => onChange({ ...quotation, pricingConfiguration: { ...cfg, accommodationCost: Number(e.target.value) } })}
                    className="h-8 w-32 text-right text-xs"
                  />
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {formatCurrency(cfg.accommodationCost)}
                </td>
              </tr>
              <tr className="border-t">
                <td className="px-3 py-2">Erection</td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    value={cfg.erectionCost}
                    onChange={(e) => onChange({ ...quotation, pricingConfiguration: { ...cfg, erectionCost: Number(e.target.value) } })}
                    className="h-8 w-32 text-right text-xs"
                  />
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {formatCurrency(cfg.erectionCost)}
                </td>
              </tr>
              <tr className="border-t">
                <td className="px-3 py-2">Freight</td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    value={cfg.freightCost}
                    onChange={(e) => onChange({ ...quotation, pricingConfiguration: { ...cfg, freightCost: Number(e.target.value) } })}
                    className="h-8 w-32 text-right text-xs"
                  />
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {formatCurrency(cfg.freightCost)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label className="text-xs">Discount type</Label>
          <Select
            value={cfg.discountType}
            onValueChange={(v) =>
              onChange({
                ...quotation,
                pricingConfiguration: {
                  ...cfg,
                  discountType: v as 'percentage' | 'fixed' | 'none',
                },
              })
            }
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Discount value</Label>
          <Input
            type="number"
            value={cfg.discountValue ?? 0}
            onChange={(e) =>
              onChange({
                ...quotation,
                pricingConfiguration: {
                  ...cfg,
                  discountValue: Number(e.target.value),
                },
              })
            }
            className="text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">GST %</Label>
          <Input
            type="number"
            value={cfg.gstRate}
            onChange={(e) =>
              onChange({
                ...quotation,
                pricingConfiguration: {
                  ...cfg,
                  gstRate: Number(e.target.value),
                },
              })
            }
            className="text-xs"
          />
        </div>
      </section>

      <div className="rounded-md border bg-muted/30 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatCurrency(quotation.subtotal)}</span>
        </div>
        {cfg.discountType !== 'none' && cfg.discountValue && (
          <div className="mt-1 flex justify-between text-sm">
            <span className="text-muted-foreground">Discount ({cfg.discountType})</span>
            <span className="font-medium">-{formatCurrency(quotation.discountAmount)}</span>
          </div>
        )}
        <div className="mt-1 flex justify-between text-sm">
          <span className="text-muted-foreground">GST ({cfg.gstRate}%)</span>
          <span className="font-medium">{formatCurrency(quotation.taxAmount)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t pt-2 text-base font-semibold">
          <span>Grand total</span>
          <span>{formatCurrency(quotation.grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}
