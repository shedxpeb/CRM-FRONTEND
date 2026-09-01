'use client';

import { useState, useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, ArrowLeft, Trash2, Plus, IndianRupee, AlertCircle, Loader2 } from 'lucide-react';
import {
  Quotation,
  Proposal,
  CreateQuotationDto,
  MaterialSelection,
} from '../types/peb-commercial';
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
  onSave: (quotation: CreateQuotationDto) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

type SaveState = 'idle' | 'saving' | 'success' | 'error';

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

  const [serviceCosts, setServiceCosts] = useState({
    labour: 0,
    installation: 0,
    transportation: 0,
    crane: 0,
    civilWork: 0,
    accommodation: 0,
    erection: 0,
    freight: 0,
  });

  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [gstRate, setGstRate] = useState(18);

  const [paymentTerms, setPaymentTerms] = useState(
    quotation?.paymentTerms || '30% advance, 60% before dispatch, 10% on erection.'
  );

  const [inclusions, setInclusions] = useState('');
  const [exclusions, setExclusions] = useState('');
  const [terms, setTerms] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  // ── Save state management ──────────────────────────────────────────────
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isSaving = saveState === 'saving';

  // Calculate totals
  const calculations = useMemo(() => {
    const materialTotal = materialSelections.reduce((sum, m) => sum + ((m.rate || 0) * (m.quantity || 0)), 0);
    const serviceTotal = Object.values(serviceCosts).reduce((sum, val) => sum + val, 0);
    const subtotal = materialTotal + serviceTotal;

    const discountAmount = discountType === 'percentage'
      ? (subtotal * discountValue) / 100
      : discountValue;

    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * gstRate) / 100;
    const grandTotal = afterDiscount + taxAmount;

    return {
      materialTotal,
      serviceTotal,
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal,
    };
  }, [materialSelections, serviceCosts, discountType, discountValue, gstRate]);

  // ── Frontend validation ────────────────────────────────────────────────
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    const customerName = proposal?.customerName || autofillData?.companyName || '';
    if (!customerName.trim()) {
      errors.customerName = 'Customer name is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Extract backend error message ──────────────────────────────────────
  const extractErrorMessage = (err: unknown): string => {
    if (err && typeof err === 'object') {
      // Axios error with response
      const axiosErr = err as { response?: { status?: number; data?: { message?: string; error?: string; statusCode?: number } } };
      if (axiosErr.response) {
        const status = axiosErr.response.status;
        const data = axiosErr.response.data;

        if (status === 401) return 'Your session has expired. Please sign in again.';
        if (status === 403) return 'You do not have permission to create quotations.';
        if (status === 404) return 'The requested resource was not found.';
        if (status === 409) return 'A conflict occurred. This quotation may already exist.';
        if (status === 429) return 'Too many requests. Please wait a moment and try again.';
        if (status === 500) return 'The server encountered an error. Please try again later.';
        if (status === 502 || status === 503) return 'The server is temporarily unavailable. Please try again.';

        // Use backend message if available
        if (data?.message) return data.message;
        if (data?.error) return data.error;
      }

      // Network error
      if (err instanceof Error) {
        if (err.message?.includes('timeout')) return 'Request timed out. Please check your connection and try again.';
        if (err.message?.includes('Network Error') || err.message?.includes('ECONNREFUSED'))
          return 'Unable to reach the server. Please check your connection.';
      }

      // Generic fallback
      const msg = (err as { message?: string })?.message;
      if (msg) return msg;
    }

    return 'An unexpected error occurred. Please try again.';
  };

  // ── Handle save ────────────────────────────────────────────────────────
  const handleSave = async () => {
    // Validate before sending
    if (!validate()) {
      setSaveState('error');
      setErrorMessage('Please correct the highlighted fields.');
      return;
    }

    // Prevent double save
    if (isSaving) return;

    setSaveState('saving');
    setErrorMessage(null);
    setFieldErrors({});

    const customerName = proposal?.customerName || autofillData?.companyName || 'Customer';

    const quotationDto: CreateQuotationDto = {
      proposalId: proposal?.id || undefined,
      customerName,
      customerId: proposal?.customerId || undefined,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paymentTerms,
      deliveryTerms: '4-6 weeks from order confirmation',
      pricingConfiguration: {
        materialRates: materialSelections.map(m => ({
          materialSelectionId: m.id,
          rate: m.rate || 0,
          quantity: m.quantity || 0,
          amount: (m.rate || 0) * (m.quantity || 0),
        })),
        labourCost: serviceCosts.labour,
        installationCost: serviceCosts.installation,
        transportationCost: serviceCosts.transportation,
        craneCost: serviceCosts.crane,
        civilCost: serviceCosts.civilWork,
        accommodationCost: serviceCosts.accommodation,
        erectionCost: serviceCosts.erection,
        freightCost: serviceCosts.freight,
        additionalServiceCosts: [],
        discountType,
        discountValue,
        gstRate,
        gstType: 'CGST',
        cessRate: 0,
        markupPercentage: 0,
        roundingMethod: 'nearest',
      },
      termsAndConditions: terms,
      notes: inclusions,
      internalNotes,
    };

    try {
      await onSave(quotationDto);
      // onSuccess: the parent (QuotationsPage) closes the dialog
      setSaveState('success');
    } catch (err) {
      // On error: keep form open, preserve data, show error
      setSaveState('error');
      setErrorMessage(extractErrorMessage(err));
    }
  };

  // ── Dismiss error banner ──────────────────────────────────────────────
  const dismissError = () => {
    setErrorMessage(null);
    setFieldErrors({});
    setSaveState('idle');
  };

  return (
    <div className="space-y-6">
      {/* ── Error Banner ──────────────────────────────────────────────── */}
      {errorMessage && (
        <div className="flex items-start gap-3 p-3 sm:p-4 rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="font-medium">Quotation could not be saved.</p>
            <p className="mt-1 text-red-700">{errorMessage}</p>
          </div>
          <button
            onClick={dismissError}
            className="text-red-400 hover:text-red-600 shrink-0"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Customer Name Field Error ─────────────────────────────────── */}
      {fieldErrors.customerName && (
        <div className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {fieldErrors.customerName}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Quotation Builder</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {proposal
              ? `From Proposal: ${proposal.proposalNumber || 'N/A'} | Customer: ${proposal.customerName || 'N/A'}`
              : `Standalone Quotation | Customer: ${autofillData?.companyName || 'Not selected'}`
            }
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 sm:flex-none h-8 sm:h-9 text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-none h-8 sm:h-9 text-xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
                <span className="sm:hidden">Saving</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5 mr-1.5" />
                <span className="hidden sm:inline">Save Quotation</span>
                <span className="sm:hidden">Save</span>
              </>
            )}
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
            <CardHeader>
              <CardTitle className="text-lg">Material Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {materialSelections.map((material, index) => (
                  <div key={material.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-3 items-center p-2 sm:p-3 border rounded-md">
                    <div className="col-span-1 sm:col-span-2">
                      <Label className="text-[10px] sm:text-xs">Item</Label>
                      <p className="text-xs sm:text-sm font-medium">{material.itemName}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{material.specification}</p>
                    </div>
                    <div>
                      <Label className="text-[10px] sm:text-xs">Qty</Label>
                      <Input
                        type="number"
                        value={material.quantity || 0}
                        onChange={(e) => {
                          const updated = [...materialSelections];
                          updated[index] = { ...material, quantity: Number(e.target.value) };
                          setMaterialSelections(updated);
                        }}
                        className="h-8 text-xs"
                        disabled={isSaving}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] sm:text-xs">Rate (₹)</Label>
                      <Input
                        type="number"
                        value={material.rate || 0}
                        onChange={(e) => {
                          const updated = [...materialSelections];
                          updated[index] = { ...material, rate: Number(e.target.value) };
                          setMaterialSelections(updated);
                        }}
                        className="h-8 text-xs"
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                ))}
                {materialSelections.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No materials selected. Add items from Products/Services tab.
                  </p>
                )}
              </div>
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
              <div className="space-y-2">
                {Object.entries(serviceCosts).map(([service, cost]) => (
                  <div key={service} className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 items-center">
                    <Label className="text-xs sm:text-sm capitalize">{service}</Label>
                    <Input
                      type="number"
                      value={cost}
                      onChange={(e) => setServiceCosts({ ...serviceCosts, [service]: Number(e.target.value) })}
                      className="h-8 text-xs"
                      placeholder="Rate"
                      disabled={isSaving}
                    />
                    <div className="text-xs sm:text-sm font-medium text-right">
                      <IndianRupee className="h-3 w-3 inline" /> {cost}
                    </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <Label className="text-[10px] sm:text-xs">Discount Type</Label>
                  <Select value={discountType} onValueChange={(value: 'percentage' | 'fixed') => setDiscountType(value)} disabled={isSaving}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percent</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px] sm:text-xs">Discount Value</Label>
                  <Input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="h-8 text-xs"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <Label className="text-[10px] sm:text-xs">GST %</Label>
                  <Input
                    type="number"
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="h-8 text-xs"
                    disabled={isSaving}
                  />
                </div>
              </div>
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
              <div className="space-y-2">
                <Label className="text-xs">Payment Terms</Label>
                <Textarea
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  rows={4}
                  className="text-xs"
                  disabled={isSaving}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Inclusions (one per line)</Label>
              <Textarea
                value={inclusions}
                onChange={(e) => setInclusions(e.target.value)}
                rows={3}
                className="text-xs"
                disabled={isSaving}
              />
            </div>
            <div>
              <Label className="text-xs">Exclusions (one per line)</Label>
              <Textarea
                value={exclusions}
                onChange={(e) => setExclusions(e.target.value)}
                rows={3}
                className="text-xs"
                disabled={isSaving}
              />
            </div>
            <div>
              <Label className="text-xs">Terms</Label>
              <Textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={3}
                className="text-xs"
                disabled={isSaving}
              />
            </div>
            <div>
              <Label className="text-xs">Internal Notes</Label>
              <Textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={3}
                className="text-xs"
                disabled={isSaving}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
});
