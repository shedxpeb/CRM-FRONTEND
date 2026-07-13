'use client';

import { useState, useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, ArrowLeft, Trash2, Plus, IndianRupee } from 'lucide-react';
import { 
  Quotation, 
  Proposal,
  CreateQuotationDto,
  MaterialSelection,
} from '../types/peb-commercial';
import { useCustomerAutofill } from '../hooks/useCustomerAutofill';
import { ItemPicker } from './ItemPicker';

interface QuotationBuilderProps {
  proposal?: Proposal | null;
  quotation?: Quotation;
  onSave: (quotation: CreateQuotationDto) => void;
  onCancel: () => void;
}

export const QuotationBuilder = memo(function QuotationBuilder({
  proposal,
  quotation,
  onSave,
  onCancel,
}: QuotationBuilderProps) {
  // Smart Autofill - fetch customer data and last quotation
  const autofillData = useCustomerAutofill(proposal?.customerId || '');

  const [materialSelections, setMaterialSelections] = useState<MaterialSelection[]>(
    quotation?.materialSelections || proposal?.materialSelections || []
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

  const handleSave = () => {
    const quotationDto: CreateQuotationDto = {
      proposalId: proposal?.id || '',
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
    
    onSave(quotationDto);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Quotation Builder</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            From Proposal: {proposal?.proposalNumber || 'N/A'} | Customer: {proposal?.customerName || 'N/A'}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={onCancel} className="flex-1 sm:flex-none h-8 sm:h-9 text-xs">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 sm:flex-none h-8 sm:h-9 text-xs">
            <Save className="h-3.5 w-3.5 mr-1.5" />
            <span className="hidden sm:inline">Save Quotation</span>
            <span className="sm:hidden">Save</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="products">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products" className="text-xs sm:text-sm">
            Products/Services
          </TabsTrigger>
          <TabsTrigger value="pricing" className="text-xs sm:text-sm">
            Pricing
          </TabsTrigger>
          <TabsTrigger value="payment" className="text-xs sm:text-sm">
            Payment Terms
          </TabsTrigger>
          <TabsTrigger value="notes" className="text-xs sm:text-sm">
            Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <ItemPicker
            value={materialSelections}
            onChange={setMaterialSelections}
          />
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          {/* Material Rates */}
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

          {/* Service Costs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Service Costs</CardTitle>
            </CardHeader>
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
                    />
                    <div className="text-xs sm:text-sm font-medium text-right">
                      <IndianRupee className="h-3 w-3 inline" /> {cost}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Discount */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Discount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <Label className="text-[10px] sm:text-xs">Discount Type</Label>
                  <Select value={discountType} onValueChange={(value: 'percentage' | 'fixed') => setDiscountType(value)}>
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
                  />
                </div>
                <div>
                  <Label className="text-[10px] sm:text-xs">GST %</Label>
                  <Input
                    type="number"
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium"><IndianRupee className="h-3 w-3 inline" /> {calculations.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Discount</span>
                  <span className="font-medium text-red-600">-<IndianRupee className="h-3 w-3 inline" /> {calculations.discountAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>GST ({gstRate}%)</span>
                  <span className="font-medium"><IndianRupee className="h-3 w-3 inline" /> {calculations.taxAmount.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-base font-bold">
                  <span>Grand Total</span>
                  <span><IndianRupee className="h-4 w-4 inline" /> {calculations.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label className="text-xs">Payment Terms</Label>
                <Textarea
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  rows={4}
                  className="text-xs"
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
              />
            </div>
            <div>
              <Label className="text-xs">Exclusions (one per line)</Label>
              <Textarea
                value={exclusions}
                onChange={(e) => setExclusions(e.target.value)}
                rows={3}
                className="text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Terms</Label>
              <Textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={3}
                className="text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Internal Notes</Label>
              <Textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={3}
                className="text-xs"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
});
