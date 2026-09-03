'use client';

import { useState, useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, ArrowLeft, Trash2, Plus, IndianRupee, AlertCircle, Loader2, Search } from 'lucide-react';
import {
  Quotation,
  Proposal,
  CreateQuotationDto,
  MaterialSelection,
} from '../types/peb-commercial';
import { QuotationTemplateDefaults } from '../types/quotation-template-defaults';
import { useCustomerAutofill } from '../hooks/useCustomerAutofill';
import { useOrganization, useQuotationTemplateDefaults } from '@/features/settings/hooks/useSettings';
import { useCustomers } from '@/features/customers/hooks/useCustomers';
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
  const [customerId, setCustomerId] = useState(quotation?.customerId || proposal?.customerId || '');
  const [customerName, setCustomerName] = useState(quotation?.customerName || proposal?.customerName || autofillData?.companyName || '');
  const [customerAddress, setCustomerAddress] = useState(quotation?.customerAddress || proposal?.customerAddress || autofillData?.siteAddress || '');
  const [customerGST, setCustomerGST] = useState(quotation?.customerGST || proposal?.customerGST || autofillData?.gstNumber || '');

  // Load organization data for Prepared By section
  const { data: organization } = useOrganization();
  const { data: customersData } = useCustomers({ page: 1, pageSize: 100 });
  const { data: templateDefaults } = useQuotationTemplateDefaults((organization as any)?.id || '') as { data: QuotationTemplateDefaults };

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
    ((quotation as any)?.wallAccessories as AccessoryRow[]) || []
  );
  const [materialSpecs, setMaterialSpecs] = useState<MaterialSpecRow[]>(
    ((quotation as any)?.materialSpecs as MaterialSpecRow[]) || []
  );
  const [materialSelections, setMaterialSelections] = useState<MaterialSelection[]>(
    ((quotation as any)?.materialSelections as MaterialSelection[]) || []
  );

  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [gstRate, setGstRate] = useState(18);

  const [paymentTerms, setPaymentTerms] = useState(
    (quotation as any)?.paymentTerms || '30% advance, 60% before dispatch, 10% on erection.'
  );

  const [bankName, setBankName] = useState((quotation as any)?.bankName || (organization as any)?.bankName || 'HDFC BANK');
  const [accountNumber, setAccountNumber] = useState((quotation as any)?.accountNumber || (organization as any)?.accountNumber || '99909725390073');
  const [ifscCode, setIfscCode] = useState((quotation as any)?.ifscCode || (organization as any)?.ifscCode || 'HDFC0006476');
  const [bankAddress, setBankAddress] = useState((quotation as any)?.address || (organization as any)?.bankAddress || 'Nikol, Ahmedabad');

  const [finalSignatureName, setFinalSignatureName] = useState((quotation as any)?.finalSignatureName || (organization as any)?.finalSignatureName || 'VIKAS GONDALIYA');
  const [finalSignatureMobile, setFinalSignatureMobile] = useState((quotation as any)?.finalSignatureMobile || (organization as any)?.finalSignatureMobile || '+91 6359998111');
  const [finalSignatureCompany, setFinalSignatureCompany] = useState((quotation as any)?.finalSignatureCompany || (organization as any)?.finalSignatureCompany || 'Shedx Peb LLP');

  const [inclusions, setInclusions] = useState('');
  const [exclusions, setExclusions] = useState('');
  const [terms, setTerms] = useState((quotation as any)?.termsAndConditions || '');
  const [internalNotes, setInternalNotes] = useState('');

  // ── PAGE 2 EDITABLE FIELDS ──
  const [preparedByCompany, setPreparedByCompany] = useState((quotation as any)?.preparedByCompany || (organization as any)?.name || 'SHEDX PEB LLP.');
  const [preparedByAddress, setPreparedByAddress] = useState((quotation as any)?.preparedByAddress || (organization as any)?.address || '438, Vishala Supreme, Sardar Patel Ring Rd,\nOpp Nikol Torrent Power Station, Nikol,\nAhmedabad, Gujarat 380049');
  const [preparedByGstin, setPreparedByGstin] = useState((quotation as any)?.preparedByGstin || (organization as any)?.gstNumber || '24AFYFS3586G1Z9');
  const [preparedByName, setPreparedByName] = useState((quotation as any)?.preparedByName || 'VIKAS GONDALIYA');
  const [preparedByDesignation, setPreparedByDesignation] = useState((quotation as any)?.preparedByDesignation || 'Director');
  const [preparedByMobile, setPreparedByMobile] = useState((quotation as any)?.preparedByMobile || '6359998111');
  const [preparedByEmail, setPreparedByEmail] = useState((quotation as any)?.preparedByEmail || 'Sales@shedxpeb.com');
  const [subject, setSubject] = useState((quotation as any)?.subject || templateDefaults?.subject || 'Techno Commercial Offer for Design Supply of PEB Building.');
  const [introduction, setIntroduction] = useState((quotation as any)?.introduction || templateDefaults?.introduction || 'We Thank you for valued enquiry for Pre engineering building Steel Structure and giving us opportunity to submit a Proposal to your valuable project in a cost-effective manner.\n\nThis Proposal to you is based on steels standard design criteria and specifications. However, the overall dimensions and layout are in General accordance with your enquiry or Drawings Given by you.\n\nKindly note that we have tried our utmost to assure that this proposal meets all your project requirements and specifications. However, in some case we had to make some assumptions, suggest certain deviations and exclude some items that you may have requested.\n\nWe hope you will find the same in order, awaiting your kind reply & esteemed order.');

  // ── Save state management ──────────────────────────────────────────────
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isSavingInternal = saveState === 'saving';

  // Calculate totals
  const calculations = useMemo(() => {
    const materialTotal = materialSelections.reduce((sum: number, m: MaterialSelection) => sum + ((m.rate || 0) * (m.quantity || 0)), 0);
    const subtotal = materialTotal;

    const discountAmount = discountType === 'percentage'
      ? (subtotal * discountValue) / 100
      : discountValue;

    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * gstRate) / 100;
    const grandTotal = afterDiscount + taxAmount;

    return {
      materialTotal,
      subtotal,
      discountAmount,
      afterDiscount,
      taxAmount,
      grandTotal,
    };
  }, [materialSelections, discountType, discountValue, gstRate]);

  // ── Handler functions ─────────────────────────────────────────────────────
  const updateDesignCode = (key: string, value: string) => {
    setDesignCode((prev: any) => ({ ...prev, [key]: value }));
  };

  const updateDesignLoad = (key: string, value: string) => {
    setDesignLoad((prev: any) => ({ ...prev, [key]: value }));
  };

  const addAccessory = (type: 'roof' | 'wall') => {
    if (type === 'roof') {
      setRoofAccessories((prev: AccessoryRow[]) => [...prev, emptyAccessory()]);
    } else {
      setWallAccessories((prev: AccessoryRow[]) => [...prev, emptyAccessory()]);
    }
  };

  const updateAccessory = (type: 'roof' | 'wall', index: number, updates: Partial<AccessoryRow>) => {
    if (type === 'roof') {
      setRoofAccessories((prev: AccessoryRow[]) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...updates };
        return updated;
      });
    } else {
      setWallAccessories((prev: AccessoryRow[]) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...updates };
        return updated;
      });
    }
  };

  const removeAccessory = (type: 'roof' | 'wall', index: number) => {
    if (type === 'roof') {
      setRoofAccessories((prev: AccessoryRow[]) => prev.filter((_: AccessoryRow, i: number) => i !== index));
    } else {
      setWallAccessories((prev: AccessoryRow[]) => prev.filter((_: AccessoryRow, i: number) => i !== index));
    }
  };

  // ── Frontend validation ────────────────────────────────────────────────
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

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
    if (isSavingInternal) return;

    setSaveState('saving');
    setErrorMessage(null);
    setFieldErrors({});

    const quotationDto: CreateQuotationDto = {
      proposalId: proposal?.id || undefined,
      customerName: customerName?.trim() || proposal?.customerName || autofillData?.companyName || 'Customer',
      customerId: customerId || undefined,
      customerEmail: undefined,
      customerPhone: undefined,
      customerAddress,
      customerGST,
      projectId: undefined,
      projectName: undefined,
      paymentTerms,
      deliveryTerms: '4-6 weeks from order confirmation',
      bankName,
      accountNumber,
      ifscCode,
      address: bankAddress,
      finalSignatureName,
      finalSignatureMobile,
      finalSignatureCompany,
      pricingConfiguration: {
        materialRates: materialSelections.map((m: MaterialSelection) => ({
          materialSelectionId: m.id,
          rate: m.rate || 0,
          quantity: m.quantity || 0,
          amount: (m.rate || 0) * (m.quantity || 0),
        })),
        labourCost: 0,
        installationCost: 0,
        transportationCost: 0,
        craneCost: 0,
        civilCost: 0,
        accommodationCost: 0,
        erectionCost: 0,
        freightCost: 0,
        additionalServiceCosts: [],
        discountType: discountType || 'percentage',
        discountValue: discountValue || 0,
        gstRate: gstRate || 18,
        gstType: 'CGST',
        cessRate: 0,
        markupPercentage: 0,
        roundingMethod: 'nearest',
      },
      termsAndConditions: terms,
      notes: inclusions,
      internalNotes,
      // Include all structured data
      buildingSpec,
      designCode,
      designLoad,
      mezzanineLoad,
      craneDetail,
      roofAccessories,
      wallAccessories,
      materialSpecs,
      // Add inquiry number and date
      inquiryNumber,
      date: date ? new Date(date).toISOString() : undefined,
      // Add Page 2 fields
      preparedByCompany,
      preparedByAddress,
      preparedByGstin,
      subject,
      introduction,
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
            disabled={isSavingInternal}
            className="flex-1 sm:flex-none h-8 sm:h-9 text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSavingInternal}
            className="flex-1 sm:flex-none h-8 sm:h-9 text-xs"
          >
            {isSavingInternal ? (
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
        <TabsList className="grid w-full grid-cols-7 h-8">
          <TabsTrigger value="general" className="text-[10px]">General</TabsTrigger>
          <TabsTrigger value="building" className="text-[10px]">Building</TabsTrigger>
          <TabsTrigger value="design" className="text-[10px]">Design</TabsTrigger>
          <TabsTrigger value="crane" className="text-[10px]">Crane</TabsTrigger>
          <TabsTrigger value="accessories" className="text-[10px]">Accessories</TabsTrigger>
          <TabsTrigger value="materials" className="text-[10px]">Materials</TabsTrigger>
          <TabsTrigger value="pricing" className="text-[10px]">Pricing</TabsTrigger>
        </TabsList>

        {/* ── TAB: GENERAL ── */}
        <TabsContent value="general" className="space-y-4">
          {/* SECTION 1 — QUOTATION INFORMATION */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Quotation Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Date</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Inquiry Number</Label>
                <Input value={inquiryNumber} onChange={e => setInquiryNumber(e.target.value)} placeholder="e.g. SHX-26-025" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2 — PREPARED FOR */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Prepared For</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Customer / Company</Label>
                <div className="flex gap-2">
                  <Input 
                    value={customerName} 
                    onChange={e => {
                      setCustomerName(e.target.value);
                      // Try to find matching customer by name
                      const customersList = Array.isArray((customersData as any)?.data) ? (customersData as any).data : 
                                           Array.isArray((customersData as any)?.items) ? (customersData as any).items : [];
                      const matchedCustomer = customersList?.find((c: any) => 
                        (c.companyName || c.customerName || '').toLowerCase() === e.target.value.toLowerCase()
                      );
                      if (matchedCustomer) {
                        setCustomerId(matchedCustomer.id);
                        setCustomerAddress(matchedCustomer.address || '');
                        setCustomerGST(matchedCustomer.gstNumber || '');
                      }
                    }} 
                    placeholder="Enter customer name" 
                    className="h-8 text-xs flex-1" 
                    disabled={isSavingInternal} 
                  />
                  <Button size="sm" variant="outline" className="h-8 text-xs" disabled={isSavingInternal}>
                    <Search className="h-3 w-3 mr-1" /> Search
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-xs">Address</Label>
                <Textarea value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} rows={2} className="text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">GST</Label>
                <Input value={customerGST} onChange={e => setCustomerGST(e.target.value)} className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3 — PREPARED BY */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Prepared By</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Company</Label>
                <Input value={preparedByCompany} onChange={e => setPreparedByCompany(e.target.value)} className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Address</Label>
                <Textarea value={preparedByAddress} onChange={e => setPreparedByAddress(e.target.value)} rows={3} className="text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">GSTIN</Label>
                <Input value={preparedByGstin} onChange={e => setPreparedByGstin(e.target.value)} className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
            </CardContent>
          </Card>

          {/* SECTION 4 — STANDARD DOCUMENT CONTENT */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Standard Document Content</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Subject</Label>
                <Input 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)}
                  className="h-8 text-xs" 
                  disabled={isSavingInternal} 
                />
              </div>
              <div>
                <Label className="text-xs">Introduction</Label>
                <Textarea 
                  value={introduction} 
                  onChange={e => setIntroduction(e.target.value)}
                  rows={6} 
                  className="text-xs" 
                  disabled={isSavingInternal} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: BUILDING SPECIFICATION ── */}
        <TabsContent value="building" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Building Specification</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs">Frame Type</Label>
                <Input value={buildingSpec.frameType} onChange={(e) => setBuildingSpec({...buildingSpec, frameType: e.target.value})} placeholder="PEB Frame" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">End Frame Condition</Label>
                <Input value={buildingSpec.endFrameCondition} onChange={(e) => setBuildingSpec({...buildingSpec, endFrameCondition: e.target.value})} placeholder="Non-Expandable" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Width</Label>
                <Input value={buildingSpec.width} onChange={(e) => setBuildingSpec({...buildingSpec, width: e.target.value})} placeholder="80 Feet O/O" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Length</Label>
                <Input value={buildingSpec.length} onChange={(e) => setBuildingSpec({...buildingSpec, length: e.target.value})} placeholder="160 Feet O/O" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Clear Height</Label>
                <Input value={buildingSpec.clearHeight} onChange={(e) => setBuildingSpec({...buildingSpec, clearHeight: e.target.value})} placeholder="09.00 M" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Width Module</Label>
                <Input value={buildingSpec.widthModule} onChange={(e) => setBuildingSpec({...buildingSpec, widthModule: e.target.value})} placeholder="AS PER DESIGN" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Roof Slope</Label>
                <Input value={buildingSpec.roofSlope} onChange={(e) => setBuildingSpec({...buildingSpec, roofSlope: e.target.value})} placeholder="1:10" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Opening</Label>
                <Input value={buildingSpec.opening} onChange={(e) => setBuildingSpec({...buildingSpec, opening: e.target.value})} placeholder="AS PER DESIGN" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Sidewall Bay Spacing</Label>
                <Input value={buildingSpec.sidewallBaySpacing} onChange={(e) => setBuildingSpec({...buildingSpec, sidewallBaySpacing: e.target.value})} placeholder="AS PER DESIGN" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Endwall Bay Spacing</Label>
                <Input value={buildingSpec.endwallBaySpacing} onChange={(e) => setBuildingSpec({...buildingSpec, endwallBaySpacing: e.target.value})} placeholder="AS PER DESIGN" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Brickwall Condition</Label>
                <Textarea value={buildingSpec.brickwallCondition} onChange={(e) => setBuildingSpec({...buildingSpec, brickwallCondition: e.target.value})} rows={2} className="text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Canopy</Label>
                <Textarea value={buildingSpec.canopy} onChange={(e) => setBuildingSpec({...buildingSpec, canopy: e.target.value})} rows={2} className="text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Roof Sheeting</Label>
                <Input value={buildingSpec.roofSheeting} onChange={(e) => setBuildingSpec({...buildingSpec, roofSheeting: e.target.value})} placeholder="0.5 mm Bare PPGL" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Wall Sheeting</Label>
                <Input value={buildingSpec.wallSheeting} onChange={(e) => setBuildingSpec({...buildingSpec, wallSheeting: e.target.value})} placeholder="0.5 mm Color PPGL" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Gutter</Label>
                <Input value={buildingSpec.gutter} onChange={(e) => setBuildingSpec({...buildingSpec, gutter: e.target.value})} placeholder="Standard Eave Gutter" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Down Take Pipe</Label>
                <Input value={buildingSpec.downTakePipe} onChange={(e) => setBuildingSpec({...buildingSpec, downTakePipe: e.target.value})} placeholder="PVC" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Bracing Type</Label>
                <Input value={buildingSpec.bracingType} onChange={(e) => setBuildingSpec({...buildingSpec, bracingType: e.target.value})} placeholder="X Bracing" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Fascia</Label>
                <Input value={buildingSpec.fascia} onChange={(e) => setBuildingSpec({...buildingSpec, fascia: e.target.value})} placeholder="N/A" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <Label className="text-xs">Future Expansion</Label>
                <Input value={buildingSpec.futureExpansion} onChange={(e) => setBuildingSpec({...buildingSpec, futureExpansion: e.target.value})} className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: CRANE ── */}
        <TabsContent value="crane" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Crane Detail</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Crane Capacity</Label>
                    <Input value={craneDetail?.craneCapacity || ''} onChange={e => setCraneDetail({...craneDetail, craneCapacity: e.target.value})} placeholder="N/A" className="h-8 text-xs" disabled={isSavingInternal} />
                  </div>
                  <div>
                    <Label className="text-xs">No. of Cranes</Label>
                    <Input value={craneDetail?.numberOfCranes || ''} onChange={e => setCraneDetail({...craneDetail, numberOfCranes: e.target.value})} placeholder="N/A" className="h-8 text-xs" disabled={isSavingInternal} />
                  </div>
                  <div>
                    <Label className="text-xs">Crane Span</Label>
                    <Input value={craneDetail?.craneSpan || ''} onChange={e => setCraneDetail({...craneDetail, craneSpan: e.target.value})} placeholder="N/A" className="h-8 text-xs" disabled={isSavingInternal} />
                  </div>
                  <div>
                    <Label className="text-xs">Trolley / Hoist Weight</Label>
                    <Input value={craneDetail?.trolleyHoistWeight || ''} onChange={e => setCraneDetail({...craneDetail, trolleyHoistWeight: e.target.value})} placeholder="-" className="h-8 text-xs" disabled={isSavingInternal} />
                  </div>
                  <div>
                    <Label className="text-xs">Crane Weight</Label>
                    <Input value={craneDetail?.craneWeight || ''} onChange={e => setCraneDetail({...craneDetail, craneWeight: e.target.value})} placeholder="-" className="h-8 text-xs" disabled={isSavingInternal} />
                  </div>
                  <div>
                    <Label className="text-xs">Wheel Load</Label>
                    <Input value={craneDetail?.wheelLoad || ''} onChange={e => setCraneDetail({...craneDetail, wheelLoad: e.target.value})} placeholder="-" className="h-8 text-xs" disabled={isSavingInternal} />
                  </div>
                  <div>
                    <Label className="text-xs">Wheel Base</Label>
                    <Input value={craneDetail?.wheelBase || ''} onChange={e => setCraneDetail({...craneDetail, wheelBase: e.target.value})} placeholder="-" className="h-8 text-xs" disabled={isSavingInternal} />
                  </div>
                  <div>
                    <Label className="text-xs">Run Length</Label>
                    <Input value={craneDetail?.runLength || ''} onChange={e => setCraneDetail({...craneDetail, runLength: e.target.value})} placeholder="-" className="h-8 text-xs" disabled={isSavingInternal} />
                  </div>
                  <div>
                    <Label className="text-xs">Top of Crane Beam</Label>
                    <Input value={craneDetail?.topOfCraneBeam || ''} onChange={e => setCraneDetail({...craneDetail, topOfCraneBeam: e.target.value})} placeholder="L/600" className="h-8 text-xs" disabled={isSavingInternal} />
                  </div>
                  <div>
                    <Label className="text-xs">Tandem Operation</Label>
                    <Input value={craneDetail?.tandemOperation || ''} onChange={e => setCraneDetail({...craneDetail, tandemOperation: e.target.value})} placeholder="-" className="h-8 text-xs" disabled={isSavingInternal} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: DESIGN CODE + LOAD + MEZZANINE ── */}
        <TabsContent value="design" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Design Code</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Design and Wind Load Application</Label>
                <Textarea 
                  value={(designCode as any)?.windLoadApplication || ''} 
                  onChange={e => updateDesignCode('windLoadApplication', e.target.value)} 
                  rows={3} 
                  placeholder="Wind Load application, Serviceability and Load combinations according to MBMA -2012, Design According to AISC -2010." 
                  className="text-xs" 
                  disabled={isSavingInternal} 
                />
              </div>
              <div>
                <Label className="text-xs">Seismic</Label>
                <Textarea 
                  value={(designCode as any)?.seismicCode || ''} 
                  onChange={e => updateDesignCode('seismicCode', e.target.value)} 
                  rows={2} 
                  placeholder="IS 1893:2005 (Part-I), RF:4, I:1, Z-III, Seismic Coefficient: 0.16" 
                  className="text-xs" 
                  disabled={isSavingInternal} 
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Design Load</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Dead Load</Label>
                <Input value={(designLoad as any)?.deadLoad || ''} onChange={e => updateDesignLoad('deadLoad', e.target.value)} placeholder="0.1 KN/M2" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Column Load</Label>
                <Input value={(designLoad as any)?.columnLoad || ''} onChange={e => updateDesignLoad('columnLoad', e.target.value)} placeholder="N/A" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Wind Speed</Label>
                <Input value={(designLoad as any)?.windSpeed || ''} onChange={e => updateDesignLoad('windSpeed', e.target.value)} placeholder="39 M/SEC" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Live Load</Label>
                <Input value={(designLoad as any)?.liveLoad || ''} onChange={e => updateDesignLoad('liveLoad', e.target.value)} placeholder="0.57 KN/M2" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Mezzanine Load</Label>
                <Input value={(designLoad as any)?.mezzanineLoad || ''} onChange={e => updateDesignLoad('mezzanineLoad', e.target.value)} placeholder="N/A" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Collateral Load</Label>
                <Input value={(designLoad as any)?.collateralLoad || ''} onChange={e => updateDesignLoad('collateralLoad', e.target.value)} placeholder="0.2" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Seismic Zone</Label>
                <Input value={(designCode as any)?.seismicZone || ''} onChange={e => updateDesignCode('seismicZone', e.target.value)} placeholder="III" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Mezzanine Load</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Mezz Area</Label>
                <Input value={(mezzanineLoad as any)?.area || ''} onChange={e => setMezzanineLoad({...mezzanineLoad, area: e.target.value})} placeholder="N/A" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Thickness Of Slab</Label>
                <Input value={(mezzanineLoad as any)?.thicknessOfSlab || ''} onChange={e => setMezzanineLoad({...mezzanineLoad, thicknessOfSlab: e.target.value})} placeholder="N/A" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Mezz. Live Load</Label>
                <Input value={(mezzanineLoad as any)?.liveLoad || ''} onChange={e => setMezzanineLoad({...mezzanineLoad, liveLoad: e.target.value})} placeholder="N/A" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Mezz. Additional Load</Label>
                <Input value={(mezzanineLoad as any)?.additionalLoad || ''} onChange={e => setMezzanineLoad({...mezzanineLoad, additionalLoad: e.target.value})} placeholder="N/A" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Stair case</Label>
                <Input value={(mezzanineLoad as any)?.stairCase || ''} onChange={e => setMezzanineLoad({...mezzanineLoad, stairCase: e.target.value})} placeholder="N/A" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Deflection</Label>
                <Input value={(mezzanineLoad as any)?.deflection || ''} onChange={e => setMezzanineLoad({...mezzanineLoad, deflection: e.target.value})} placeholder="N/A" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">TOP OF MEZZANINE SLAB</Label>
                <Input value={(mezzanineLoad as any)?.topOfSlab || ''} onChange={e => setMezzanineLoad({...mezzanineLoad, topOfSlab: e.target.value})} placeholder="N/A" className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Shear Stud</Label>
                <Input value={(mezzanineLoad as any)?.shearStud || ''} onChange={e => setMezzanineLoad({...mezzanineLoad, shearStud: e.target.value})} placeholder="N/A" className="h-8 text-xs" disabled={isSavingInternal} />
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
                <thead><tr className="border-b"><th className="text-left py-1">No.</th><th className="text-left py-1">Description</th><th className="text-left py-1">Size</th><th className="text-left py-1">Quantity/Nos.</th><th className="text-left py-1">Location</th><th /></tr></thead>
                <tbody>
                  {roofAccessories.map((row, i) => (
                    <tr key={row.id} className="border-t">
                      <td className="py-1 text-center">{i + 1}</td>
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
                <thead><tr className="border-b"><th className="text-left py-1">Sr. No.</th><th className="text-left py-1">Description</th><th className="text-left py-1">Size</th><th className="text-left py-1">Quantity</th><th className="text-left py-1">Location</th><th /></tr></thead>
                <tbody>
                  {wallAccessories.map((row, i) => (
                    <tr key={row.id} className="border-t">
                      <td className="py-1 text-center">{i + 1}</td>
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

        {/* ── TAB: PRICING ── */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Inventory Items</CardTitle>
              <div className="text-xs text-muted-foreground">Add items from Materials tab</div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {materialSelections.map((material: MaterialSelection, index: number) => (
                  <div key={material.id} className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-3 items-center p-2 sm:p-3 border rounded-md">
                    <div className="col-span-1 sm:col-span-2">
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
                        disabled={isSavingInternal}
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
                        disabled={isSavingInternal}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] sm:text-xs">Amount</Label>
                      <div className="text-xs sm:text-sm font-medium text-right">
                        <IndianRupee className="h-3 w-3 inline" /> {((material.rate || 0) * (material.quantity || 0)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
                {materialSelections.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No materials selected. Add items from Materials tab.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Pricing Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Discount Type</Label>
                  <Select value={discountType} onValueChange={(value: 'percentage' | 'fixed') => setDiscountType(value)} disabled={isSavingInternal}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Discount Value</Label>
                  <Input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="h-8 text-xs"
                    disabled={isSavingInternal}
                  />
                </div>
                <div>
                  <Label className="text-xs">GST Rate (%)</Label>
                  <Input
                    type="number"
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="h-8 text-xs"
                    disabled={isSavingInternal}
                  />
                </div>
              </div>
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-xs"><span>Material Total:</span><span className="font-medium">₹{calculations.materialTotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs"><span>Subtotal:</span><span className="font-medium">₹{calculations.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs"><span>Discount:</span><span className="font-medium text-red-600">-₹{calculations.discountAmount.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs"><span>After Discount:</span><span className="font-medium">₹{calculations.afterDiscount.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs"><span>Tax ({gstRate}%):</span><span className="font-medium">₹{calculations.taxAmount.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm font-bold border-t pt-2"><span>Grand Total:</span><span className="text-green-600">₹{calculations.grandTotal.toFixed(2)}</span></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Bank Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Bank Name</Label>
                <Input value={bankName} onChange={e => setBankName(e.target.value)} className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">CC Account No.</Label>
                <Input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">IFSC Code</Label>
                <Input value={ifscCode} onChange={e => setIfscCode(e.target.value)} className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Address</Label>
                <Input value={bankAddress} onChange={e => setBankAddress(e.target.value)} className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Final Signature</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Name</Label>
                <Input value={finalSignatureName} onChange={e => setFinalSignatureName(e.target.value)} className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Mobile</Label>
                <Input value={finalSignatureMobile} onChange={e => setFinalSignatureMobile(e.target.value)} className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
              <div>
                <Label className="text-xs">Company</Label>
                <Input value={finalSignatureCompany} onChange={e => setFinalSignatureCompany(e.target.value)} className="h-8 text-xs" disabled={isSavingInternal} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: MATERIALS ── */}
        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Select Inventory Items</CardTitle></CardHeader>
            <CardContent>
              <ItemPicker value={materialSelections} onChange={setMaterialSelections} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Material Specifications</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setMaterialSpecs(prev => [...prev, emptyMaterialSpec()])} className="h-7 text-xs"><Plus className="h-3 w-3 mr-1" /> Add Row</Button>
            </CardHeader>
            <CardContent>
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left py-1">S. No.</th><th className="text-left py-1">Component</th><th className="text-left py-1">Specification</th><th className="text-left py-1">Make</th><th className="text-left py-1">Yield Strength</th><th /></tr></thead>
                <tbody>
                  {materialSpecs.map((row, i) => (
                    <tr key={row.id} className="border-t">
                      <td className="py-1 text-center">{i + 1}</td>
                      <td className="py-1"><Input value={row.component} onChange={e => {
                        const updated = [...materialSpecs];
                        updated[i] = { ...row, component: e.target.value };
                        setMaterialSpecs(updated);
                      }} className="h-7 text-xs" /></td>
                      <td className="py-1"><Input value={row.specification} onChange={e => {
                        const updated = [...materialSpecs];
                        updated[i] = { ...row, specification: e.target.value };
                        setMaterialSpecs(updated);
                      }} className="h-7 text-xs" /></td>
                      <td className="py-1"><Input value={row.make} onChange={e => {
                        const updated = [...materialSpecs];
                        updated[i] = { ...row, make: e.target.value };
                        setMaterialSpecs(updated);
                      }} className="h-7 text-xs" /></td>
                      <td className="py-1"><Input value={row.yieldStrength} onChange={e => {
                        const updated = [...materialSpecs];
                        updated[i] = { ...row, yieldStrength: e.target.value };
                        setMaterialSpecs(updated);
                      }} className="h-7 text-xs" /></td>
                      <td className="py-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMaterialSpecs(prev => prev.filter((_, idx) => idx !== i))}><Trash2 className="h-3 w-3" /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
