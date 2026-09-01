'use client';

import { useState, useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Plus, Trash2, IndianRupee } from 'lucide-react';
import { Quotation, Proposal } from '../types/peb-commercial';
import { useCustomerAutofill } from '../hooks/useCustomerAutofill';
import { ItemPicker } from './ItemPicker';
import { apiClient } from '@/core/api';

// ── Types for structured sections ──────────────────────────────────

interface LineItem {
  id: string;
  itemMasterId?: string;
  itemCode: string;
  itemName: string;
  description?: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface AccessoryRow {
  id: string;
  description: string;
  size: string;
  quantity: string;
  location: string;
}

interface MaterialSpecRow {
  id: string;
  component: string;
  specification: string;
  make: string;
  yieldStrength: string;
}

interface WeightRow {
  id: string;
  description: string;
  weight: string;
  unit: string;
  remarks: string;
}

// ── Defaults ───────────────────────────────────────────────────────

const defaultBuildingSpec = {
  frameType: 'PEB Frame',
  endFrameCondition: 'Non-Expandable',
  width: '',
  length: '',
  clearHeight: '',
  widthModule: 'AS PER DESIGN',
  roofSlope: '1:10',
  opening: 'AS PER DESIGN',
  sidewallBaySpacing: 'AS PER DESIGN',
  endwallBaySpacing: 'AS PER DESIGN',
  brickwallCondition: '',
  canopy: 'AS PER DESIGN',
  roofSheeting: '0.5 mm Bare PPGL',
  wallSheeting: '0.5 mm Color PPGL',
  gutter: 'Standard Eave Gutter',
  downTakePipe: 'PVC',
  bracingType: 'X Bracing',
  fascia: '',
  futureExpansion: '',
};

const defaultDesignCode = {
  windLoadApplication: 'MBMA-2012, Design According to AISC-2010',
  seismicCode: 'IS 1893:2005 (Part-I)',
  responseFactor: '4',
  importanceFactor: '1',
  seismicZone: 'Z-III',
  seismicCoefficient: '0.16',
};

const defaultDesignLoad = {
  deadLoad: '',
  columnLoad: '',
  windSpeed: '',
  liveLoad: '',
  mezzanineLoad: '',
  collateralLoad: '',
  seismicZone: '',
};

const emptyLineItem: LineItem = {
  id: crypto.randomUUID(),
  itemCode: '',
  itemName: '',
  unit: 'Nos',
  quantity: 1,
  rate: 0,
  amount: 0,
};

const emptyAccessory = (): AccessoryRow => ({
  id: crypto.randomUUID(),
  description: '',
  size: '',
  quantity: '',
  location: '',
});

const emptyMaterialSpec = (): MaterialSpecRow => ({
  id: crypto.randomUUID(),
  component: '',
  specification: '',
  make: '',
  yieldStrength: '',
});

const emptyWeightRow = (): WeightRow => ({
  id: crypto.randomUUID(),
  description: '',
  weight: '',
  unit: 'MT',
  remarks: '',
});

// ── Component ──────────────────────────────────────────────────────

interface QuotationBuilderProps {
  proposal?: Proposal | null;
  quotation?: Quotation;
  onSave: (data: any) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export const QuotationBuilder = memo(function QuotationBuilder({
  proposal,
  quotation,
  onSave,
  onCancel,
  isSaving = false,
}: QuotationBuilderProps) {
  // ── GENERAL ──
  const autofillData = useCustomerAutofill(proposal?.customerId || quotation?.customerId || '');
  const [date, setDate] = useState(() => {
    if (quotation?.date) return new Date(quotation.date).toISOString().split('T')[0];
    return new Date().toISOString().split('T')[0];
  });
  const [inquiryNumber, setInquiryNumber] = useState(quotation?.inquiryNumber || '');
  const [customerName, setCustomerName] = useState(quotation?.customerName || proposal?.customerName || autofillData?.contactPerson || '');
  const [customerAddress, setCustomerAddress] = useState(quotation?.customerAddress || proposal?.customerAddress || autofillData?.siteAddress || '');
  const [customerGST, setCustomerGST] = useState(quotation?.customerGST || proposal?.customerGST || autofillData?.gstNumber || '');
  const [validUntil, setValidUntil] = useState(() => {
    if (quotation?.validUntil) return new Date(quotation.validUntil).toISOString().split('T')[0];
    const d = new Date(); d.setDate(d.getDate() + 20); return d.toISOString().split('T')[0];
  });

  // ── STRUCTURED SECTIONS ──
  const [buildingSpec, setBuildingSpec] = useState(quotation?.buildingSpec || defaultBuildingSpec);
  const [designCode, setDesignCode] = useState(quotation?.designCode || defaultDesignCode);
  const [designLoad, setDesignLoad] = useState(quotation?.designLoad || defaultDesignLoad);
  const [mezzanineLoad, setMezzanineLoad] = useState(quotation?.mezzanineLoad || null);
  const [craneDetail, setCraneDetail] = useState(quotation?.craneDetail || null);

  // ── ACCESSORIES TABLES ──
  const [roofAccessories, setRoofAccessories] = useState<AccessoryRow[]>(
    (quotation?.roofAccessories as AccessoryRow[]) || []
  );
  const [wallAccessories, setWallAccessories] = useState<AccessoryRow[]>(
    (quotation?.wallAccessories as AccessoryRow[]) || []
  );

  // ── MATERIAL SPEC + WEIGHT ──
  const [materialSpecs, setMaterialSpecs] = useState<MaterialSpecRow[]>(
    (quotation?.materialSpecifications as MaterialSpecRow[]) || []
  );
  const [weightSummary, setWeightSummary] = useState<WeightRow[]>(
    (quotation?.designWeightSummary as WeightRow[]) || []
  );

  // ── LINE ITEMS ──
  const [lineItems, setLineItems] = useState<LineItem[]>(
    (quotation?.lineItems as LineItem[]) || []
  );

  // ── PRICING ──
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(quotation?.discountAmount || 0);
  const [gstRate, setGstRate] = useState(quotation?.gstRate ?? 18);

  // ── OVERRIDES (optional) ──
  const [specialNotes, setSpecialNotes] = useState(quotation?.specialNotes || '');

  // ── PRICING CALCULATION ──
  const calculations = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const discountAmount = discountType === 'percentage' ? (subtotal * discountValue) / 100 : discountValue;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * gstRate) / 100;
    const grandTotal = afterDiscount + taxAmount;
    return { subtotal, discountAmount, taxAmount, grandTotal };
  }, [lineItems, discountType, discountValue, gstRate]);

  // ── LINE ITEM HELPERS ──
  const addLineItemFromPicker = (items: any[]) => {
    const newItems = items.map((it: any) => ({
      id: crypto.randomUUID(),
      itemMasterId: it.id,
      itemCode: it.itemCode,
      itemName: it.itemName,
      description: it.specification || it.description || '',
      unit: it.unit || 'Nos',
      quantity: 1,
      rate: it.defaultRate || 0,
      amount: it.defaultRate || 0,
    }));
    setLineItems(prev => [...prev, ...newItems.filter(ni => !prev.some(p => p.itemCode === ni.itemCode))]);
  };

  const updateLineItem = (idx: number, patch: Partial<LineItem>) => {
    setLineItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, ...patch };
      updated.amount = (updated.quantity || 0) * (updated.rate || 0);
      return updated;
    }));
  };

  const removeLineItem = (idx: number) => setLineItems(prev => prev.filter((_, i) => i !== idx));

  // ── ACCESSORY HELPERS ──
  const updateAccessory = (type: 'roof' | 'wall', idx: number, patch: Partial<AccessoryRow>) => {
    const setter = type === 'roof' ? setRoofAccessories : setWallAccessories;
    setter(prev => prev.map((row, i) => i === idx ? { ...row, ...patch } : row));
  };
  const addAccessory = (type: 'roof' | 'wall') => {
    const setter = type === 'roof' ? setRoofAccessories : setWallAccessories;
    setter(prev => [...prev, emptyAccessory()]);
  };
  const removeAccessory = (type: 'roof' | 'wall', idx: number) => {
    const setter = type === 'roof' ? setRoofAccessories : setWallAccessories;
    setter(prev => prev.filter((_, i) => i !== idx));
  };

  // ── STRUCTURED SECTION UPDATERS ──
  const updateBuildingSpec = (key: string, value: string) => setBuildingSpec((prev: any) => ({ ...prev, [key]: value }));
  const updateDesignCode = (key: string, value: string) => setDesignCode((prev: any) => ({ ...prev, [key]: value }));
  const updateDesignLoad = (key: string, value: string) => setDesignLoad((prev: any) => ({ ...prev, [key]: value }));

  // ── SAVE ──
  const handleSave = () => {
    const payload = {
      date,
      inquiryNumber: inquiryNumber || undefined,
      customerName: customerName || 'Customer',
      customerAddress: customerAddress || undefined,
      customerGST: customerGST || undefined,
      validUntil,
      buildingSpec,
      designCode,
      designLoad,
      mezzanineLoad: mezzanineLoad || undefined,
      craneDetail: craneDetail || undefined,
      roofAccessories,
      wallAccessories,
      materialSpecifications: materialSpecs,
      designWeightSummary: weightSummary,
      lineItems,
      subtotal: calculations.subtotal,
      discountAmount: calculations.discountAmount,
      discountPercentage: discountType === 'percentage' ? discountValue : undefined,
      gstRate,
      grandTotal: calculations.grandTotal,
      specialNotes: specialNotes || undefined,
    };
    onSave(payload);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{quotation ? `Edit ${quotation.quotationNumber}` : 'New Quotation'}</h2>
          <p className="text-xs text-muted-foreground">
            {proposal ? `From Proposal: ${proposal.proposalNumber}` : 'Standalone Quotation'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="h-8 text-xs">Cancel</Button>
          <Button onClick={handleSave} className="h-8 text-xs" disabled={isSaving}>
            <Save className="h-3.5 w-3.5 mr-1.5" /> {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-6 h-8">
          <TabsTrigger value="general" className="text-[10px]">General</TabsTrigger>
          <TabsTrigger value="building" className="text-[10px]">Building</TabsTrigger>
          <TabsTrigger value="design" className="text-[10px]">Design</TabsTrigger>
          <TabsTrigger value="accessories" className="text-[10px]">Accessories</TabsTrigger>
          <TabsTrigger value="materials" className="text-[10px]">Materials</TabsTrigger>
          <TabsTrigger value="pricing" className="text-[10px]">Pricing</TabsTrigger>
        </TabsList>

        {/* ── TAB: GENERAL ── */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">General Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Date</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-8 text-xs" /></div>
              <div><Label className="text-xs">Inquiry Number</Label><Input value={inquiryNumber} onChange={e => setInquiryNumber(e.target.value)} placeholder="e.g. SHX-26-025" className="h-8 text-xs" /></div>
              <div><Label className="text-xs">Customer / Company *</Label><Input value={customerName} onChange={e => setCustomerName(e.target.value)} className="h-8 text-xs" /></div>
              <div><Label className="text-xs">Address</Label><Input value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="h-8 text-xs" /></div>
              <div><Label className="text-xs">GST</Label><Input value={customerGST} onChange={e => setCustomerGST(e.target.value)} className="h-8 text-xs" /></div>
              <div><Label className="text-xs">Valid Until</Label><Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="h-8 text-xs" /></div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: BUILDING SPECIFICATION ── */}
        <TabsContent value="building" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Building Specification</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {Object.entries(defaultBuildingSpec).map(([key, defaultVal]) => (
                <div key={key}>
                  <Label className="text-xs">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</Label>
                  <Input
                    value={(buildingSpec as any)[key] || ''}
                    onChange={e => updateBuildingSpec(key, e.target.value)}
                    placeholder={defaultVal}
                    className="h-8 text-xs"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: DESIGN CODE + LOAD + CRANE + MEZZ ── */}
        <TabsContent value="design" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Design Code</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {Object.entries(defaultDesignCode).map(([key, defaultVal]) => (
                <div key={key}>
                  <Label className="text-xs">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</Label>
                  <Input value={(designCode as any)[key] || ''} onChange={e => updateDesignCode(key, e.target.value)} placeholder={defaultVal} className="h-8 text-xs" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Design Load</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {Object.entries(defaultDesignLoad).map(([key]) => (
                <div key={key}>
                  <Label className="text-xs">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</Label>
                  <Input value={(designLoad as any)[key] || ''} onChange={e => updateDesignLoad(key, e.target.value)} placeholder="N/A" className="h-8 text-xs" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Crane Detail</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">Fill only if crane is required. Leave empty for N/A.</p>
              <div className="grid grid-cols-2 gap-3">
                {['capacity', 'numberOfCranes', 'span', 'trolleyWeight', 'craneWeight', 'wheelLoad', 'wheelBase', 'runLength', 'topOfCraneBeam', 'tandemOperation'].map(key => (
                  <div key={key}>
                    <Label className="text-xs">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</Label>
                    <Input value={(craneDetail as any)?.[key] || ''} onChange={e => setCraneDetail((prev: any) => ({ ...prev, [key]: e.target.value }))} placeholder="N/A" className="h-8 text-xs" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: ACCESSORIES ── */}
        <TabsContent value="accessories" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Roof Accessories</CardTitle>
              <Button size="sm" variant="outline" onClick={() => addAccessory('roof')} className="h-7 text-xs"><Plus className="h-3 w-3 mr-1" /> Add Row</Button>
            </CardHeader>
            <CardContent>
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left py-1">Description</th><th className="text-left py-1">Size</th><th className="text-left py-1">Qty</th><th className="text-left py-1">Location</th><th /></tr></thead>
                <tbody>
                  {roofAccessories.map((row, i) => (
                    <tr key={row.id} className="border-t">
                      <td className="py-1"><Input value={row.description} onChange={e => updateAccessory('roof', i, { description: e.target.value })} className="h-7 text-xs" /></td>
                      <td className="py-1"><Input value={row.size} onChange={e => updateAccessory('roof', i, { size: e.target.value })} className="h-7 text-xs" /></td>
                      <td className="py-1"><Input value={row.quantity} onChange={e => updateAccessory('roof', i, { quantity: e.target.value })} className="h-7 text-xs w-16" /></td>
                      <td className="py-1"><Input value={row.location} onChange={e => updateAccessory('roof', i, { location: e.target.value })} className="h-7 text-xs" /></td>
                      <td className="py-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeAccessory('roof', i)}><Trash2 className="h-3 w-3" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Wall Accessories</CardTitle>
              <Button size="sm" variant="outline" onClick={() => addAccessory('wall')} className="h-7 text-xs"><Plus className="h-3 w-3 mr-1" /> Add Row</Button>
            </CardHeader>
            <CardContent>
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left py-1">Description</th><th className="text-left py-1">Size</th><th className="text-left py-1">Qty</th><th className="text-left py-1">Location</th><th /></tr></thead>
                <tbody>
                  {wallAccessories.map((row, i) => (
                    <tr key={row.id} className="border-t">
                      <td className="py-1"><Input value={row.description} onChange={e => updateAccessory('wall', i, { description: e.target.value })} className="h-7 text-xs" /></td>
                      <td className="py-1"><Input value={row.size} onChange={e => updateAccessory('wall', i, { size: e.target.value })} className="h-7 text-xs" /></td>
                      <td className="py-1"><Input value={row.quantity} onChange={e => updateAccessory('wall', i, { quantity: e.target.value })} className="h-7 text-xs w-16" /></td>
                      <td className="py-1"><Input value={row.location} onChange={e => updateAccessory('wall', i, { location: e.target.value })} className="h-7 text-xs" /></td>
                      <td className="py-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeAccessory('wall', i)}><Trash2 className="h-3 w-3" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: MATERIALS + WEIGHT ── */}
        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Material Specification</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setMaterialSpecs(prev => [...prev, emptyMaterialSpec()])} className="h-7 text-xs"><Plus className="h-3 w-3 mr-1" /> Add Row</Button>
            </CardHeader>
            <CardContent>
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left py-1">Component</th><th className="text-left py-1">Specification</th><th className="text-left py-1">Make</th><th className="text-left py-1">Yield</th><th /></tr></thead>
                <tbody>
                  {materialSpecs.map((row, i) => (
                    <tr key={row.id} className="border-t">
                      <td className="py-1"><Input value={row.component} onChange={e => setMaterialSpecs(prev => prev.map((r, j) => j === i ? { ...r, component: e.target.value } : r))} className="h-7 text-xs" /></td>
                      <td className="py-1"><Input value={row.specification} onChange={e => setMaterialSpecs(prev => prev.map((r, j) => j === i ? { ...r, specification: e.target.value } : r))} className="h-7 text-xs" /></td>
                      <td className="py-1"><Input value={row.make} onChange={e => setMaterialSpecs(prev => prev.map((r, j) => j === i ? { ...r, make: e.target.value } : r))} className="h-7 text-xs" /></td>
                      <td className="py-1"><Input value={row.yieldStrength} onChange={e => setMaterialSpecs(prev => prev.map((r, j) => j === i ? { ...r, yieldStrength: e.target.value } : r))} className="h-7 text-xs w-20" /></td>
                      <td className="py-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMaterialSpecs(prev => prev.filter((_, j) => j !== i))}><Trash2 className="h-3 w-3" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Design Weight Summary</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setWeightSummary(prev => [...prev, emptyWeightRow()])} className="h-7 text-xs"><Plus className="h-3 w-3 mr-1" /> Add Row</Button>
            </CardHeader>
            <CardContent>
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left py-1">Description</th><th className="text-left py-1">Weight</th><th className="text-left py-1">Unit</th><th className="text-left py-1">Remarks</th><th /></tr></thead>
                <tbody>
                  {weightSummary.map((row, i) => (
                    <tr key={row.id} className="border-t">
                      <td className="py-1"><Input value={row.description} onChange={e => setWeightSummary(prev => prev.map((r, j) => j === i ? { ...r, description: e.target.value } : r))} className="h-7 text-xs" /></td>
                      <td className="py-1"><Input value={row.weight} onChange={e => setWeightSummary(prev => prev.map((r, j) => j === i ? { ...r, weight: e.target.value } : r))} className="h-7 text-xs w-20" /></td>
                      <td className="py-1"><Input value={row.unit} onChange={e => setWeightSummary(prev => prev.map((r, j) => j === i ? { ...r, unit: e.target.value } : r))} className="h-7 text-xs w-16" /></td>
                      <td className="py-1"><Input value={row.remarks} onChange={e => setWeightSummary(prev => prev.map((r, j) => j === i ? { ...r, remarks: e.target.value } : r))} className="h-7 text-xs" /></td>
                      <td className="py-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWeightSummary(prev => prev.filter((_, j) => j !== i))}><Trash2 className="h-3 w-3" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: PRICING ── */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Contract Price / Line Items</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <ItemPicker value={lineItems as any} onChange={addLineItemFromPicker} />
              {lineItems.length > 0 && (
                <table className="w-full text-xs mt-3">
                  <thead><tr className="border-b"><th className="text-left py-1">#</th><th className="text-left py-1">Item</th><th className="text-right py-1">Qty</th><th className="text-left py-1">Unit</th><th className="text-right py-1">Rate</th><th className="text-right py-1">Amount</th><th /></tr></thead>
                  <tbody>
                    {lineItems.map((item, i) => (
                      <tr key={item.id} className="border-t">
                        <td className="py-1 text-muted-foreground">{i + 1}</td>
                        <td className="py-1"><p className="font-medium">{item.itemName}</p><p className="text-[10px] text-muted-foreground">{item.itemCode}</p></td>
                        <td className="py-1 text-right"><Input type="number" value={item.quantity} onChange={e => updateLineItem(i, { quantity: Number(e.target.value) })} className="h-7 text-xs w-20 text-right" /></td>
                        <td className="py-1 text-muted-foreground">{item.unit}</td>
                        <td className="py-1 text-right"><Input type="number" value={item.rate} onChange={e => updateLineItem(i, { rate: Number(e.target.value) })} className="h-7 text-xs w-24 text-right" /></td>
                        <td className="py-1 text-right font-medium">₹{item.amount.toLocaleString()}</td>
                        <td className="py-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeLineItem(i)}><Trash2 className="h-3 w-3" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Pricing Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-xs"><span>Subtotal</span><span className="font-medium">₹{calculations.subtotal.toLocaleString()}</span></div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label className="text-[10px]">Discount Type</Label>
                  <select value={discountType} onChange={e => setDiscountType(e.target.value as any)} className="w-full border rounded h-7 text-xs px-2">
                    <option value="percentage">Percent</option><option value="fixed">Fixed</option>
                  </select>
                </div>
                <div><Label className="text-[10px]">Discount</Label><Input type="number" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} className="h-7 text-xs" /></div>
                <div><Label className="text-[10px]">GST %</Label><Input type="number" value={gstRate} onChange={e => setGstRate(Number(e.target.value))} className="h-7 text-xs" /></div>
              </div>
              <div className="flex justify-between text-xs"><span>Discount</span><span className="text-red-600">-₹{calculations.discountAmount.toLocaleString()}</span></div>
              <div className="flex justify-between text-xs"><span>GST ({gstRate}%)</span><span>₹{calculations.taxAmount.toLocaleString()}</span></div>
              <div className="border-t pt-2 flex justify-between text-sm font-bold"><span>Grand Total</span><span>₹{calculations.grandTotal.toLocaleString()}</span></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Special Notes (optional override)</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={specialNotes} onChange={e => setSpecialNotes(e.target.value)} placeholder="Only if you need to add quotation-specific notes beyond the standard template..." rows={3} className="text-xs" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});
