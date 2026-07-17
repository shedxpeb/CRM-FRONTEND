'use client';

import { useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Customer } from '@/features/customers/types';
import { getStatusVariant } from '@/features/customers/constants';
import { createCustomerSchema } from '@/features/customers/validations';
import { X, AlertCircle, Info } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import { useLeads } from '@/features/leads/hooks/useLeads';
import { Lead } from '@/types/leads';
import { smartPrefill } from '@/lib/smartPrefill';
import { useCustomerConfiguration } from '@/features/customers/hooks/useCustomers';
import { CustomerCustomFields } from '@/features/customers/components/CustomerCustomFields';

interface CustomerFormProps {
  initialData?: Partial<Customer>;
  onSubmit: (data: Partial<Customer>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
  isEditMode?: boolean;
}

function mapLeadSourceToCustomerSource(leadSource: string): string {
  const sourceMap: Record<string, string> = {
    ColdCall: 'Cold Call',
    SocialMedia: 'Social Media',
    TradeShow: 'Trade Show',
  };
  return sourceMap[leadSource] || leadSource;
}

const VALID_CUSTOMER_INDUSTRIES = new Set([
  'Manufacturing', 'Construction', 'Infrastructure', 'Logistics',
  'Agriculture', 'Commercial', 'Healthcare', 'Education', 'Retail', 'Other',
]);

function mapLeadIndustryToCustomerIndustry(leadIndustry?: string): string {
  if (!leadIndustry) return 'Manufacturing';
  if (VALID_CUSTOMER_INDUSTRIES.has(leadIndustry)) return leadIndustry;
  return 'Other';
}

const VALID_CUSTOMER_BUSINESS_TYPES = new Set([
  'Pvt Ltd', 'LLP', 'Partnership', 'Proprietorship', 'Trust', 'Government', 'Other',
]);

function mapLeadBusinessTypeToCustomerBusinessType(leadBusinessType?: string): string {
  if (!leadBusinessType) return 'Pvt Ltd';
  if (VALID_CUSTOMER_BUSINESS_TYPES.has(leadBusinessType)) return leadBusinessType;
  const businessTypeMap: Record<string, string> = {
    SoleProprietorship: 'Proprietorship',
    PrivateLimited: 'Pvt Ltd',
    PublicLimited: 'Other',
    NonProfit: 'Other',
  };
  return businessTypeMap[leadBusinessType] || 'Other';
}

export const CustomerForm = memo(function CustomerForm({ initialData, onSubmit, onCancel, isLoading, error, isEditMode = false }: CustomerFormProps) {
  const customerConfig = useCustomerConfiguration();
  // Load leads only for create-mode lead picker (never on edit)
  const { data: leadsResponse } = useLeads(
    isEditMode ? undefined : { page: 1, pageSize: 50, sortBy: 'createdAt', sortOrder: 'desc' }
  );
  const leads = leadsResponse?.data?.rows || [];

  // Filter only non-converted leads
  const availableLeads = leads.filter((lead: Lead) => lead.status !== 'Converted');

  const [selectedLeadId, setSelectedLeadId] = useState<string>(initialData?.leadId || '');
  const [showAutoFillNotice, setShowAutoFillNotice] = useState<boolean>(false);
  const [editedFields, setEditedFields] = useState<Set<string>>(new Set());

  // Customer owns its data — lead link is reference-only (snapshot rule)
  const leadReferenceId = isEditMode ? initialData?.leadId : undefined;

  const [formData, setFormData] = useState<Partial<Customer>>({
    customerName: '',
    companyName: '',
    mobile: '',
    alternateMobile: '',
    email: '',
    gstNumber: '',
    panNumber: '',
    industry: 'Manufacturing',
    businessType: 'Pvt Ltd',
    website: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    source: 'Website',
    status: 'Prospect',
    notes: '',
    customFields: initialData?.customFields ?? {},
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof Customer, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCustomFieldChange = (key: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      customFields: { ...prev.customFields, [key]: value },
    }));
  };

  // Auto-fill customer fields from selected lead
  const handleLeadSelect = (leadId: string) => {
    setSelectedLeadId(leadId);
    const selectedLead = availableLeads.find((lead: Lead) => lead.id === leadId);

    if (selectedLead) {
      setFormData((prev) => ({
        ...prev,
        customerName: selectedLead.customerName || prev.customerName,
        companyName: selectedLead.companyName || prev.companyName,
        mobile: selectedLead.mobile || prev.mobile,
        alternateMobile: selectedLead.alternateMobile || prev.alternateMobile,
        email: selectedLead.email || prev.email,
        gstNumber: selectedLead.gstNumber || prev.gstNumber,
        panNumber: selectedLead.panNumber || prev.panNumber,
        website: selectedLead.website || prev.website,
        address: [selectedLead.addressLine1, selectedLead.addressLine2, selectedLead.area].filter(Boolean).join(', ') || prev.address,
        city: selectedLead.city || prev.city,
        state: selectedLead.state || prev.state,
        pincode: selectedLead.pincode || prev.pincode,
        source: mapLeadSourceToCustomerSource(selectedLead.source) as any,
        industry: mapLeadIndustryToCustomerIndustry(selectedLead.industry) as any,
        businessType: mapLeadBusinessTypeToCustomerBusinessType(selectedLead.businessType) as any,
        assignedEmployee: selectedLead.assignedTo || prev.assignedEmployee,
        assignedEmployeeId: selectedLead.assignedToId || prev.assignedEmployeeId,
        notes: selectedLead.remarks ? `${prev.notes || ''}\n\nLead Notes: ${selectedLead.remarks}` : prev.notes,
        leadId: selectedLead.id,
      }));
      setShowAutoFillNotice(true);
    }
  };

  // Clear lead selection
  const handleClearLead = () => {
    setSelectedLeadId('');
    setShowAutoFillNotice(false);
    setFormData((prev) => ({ ...prev, leadId: undefined }));
  };

  const validateForm = () => {
    try {
      createCustomerSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Record<string, string> = {};
      const issues = error?.issues ?? error?.errors ?? [];
      if (Array.isArray(issues)) {
        issues.forEach((err: any) => {
          const key = err?.path?.[0];
          if (key && !fieldErrors[key]) {
            fieldErrors[String(key)] = err.message || 'Invalid value';
          }
        });
      }
      if (!Object.keys(fieldErrors).length) {
        fieldErrors._form = error?.message || 'Please fix the highlighted fields and try again.';
      }
      setErrors(fieldErrors);
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll to first field error so users see why create is blocked
      requestAnimationFrame(() => {
        const firstError = document.querySelector('.border-red-500, .text-red-500, .bg-red-50');
        if (firstError instanceof HTMLElement) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      return;
    }
    const {
      id: _id, customerId: _customerId, customerSince: _customerSince,
      totalProjects: _tp, activeProjects: _ap, completedProjects: _cp,
      totalRevenue: _tr, pendingQuotations: _pq, pendingFollowups: _pf,
      projectIds: _pi, estimateIds: _ei, proposalIds: _proi, quotationIds: _qi,
      attachments: _att, assignedEmployee: _ae, createdAt: _ca, updatedAt: _ua,
      ...rawSubmitData
    } = formData;

    const submitData: Record<string, any> = {};
    for (const [key, value] of Object.entries(rawSubmitData)) {
      if (value === '' || value === undefined) {
        if (['email', 'alternateMobile', 'gstNumber', 'panNumber', 'website', 'notes', 'pincode', 'country'].includes(key)) {
          continue;
        }
      }
      if (value !== undefined) {
        submitData[key] = value;
      }
    }

    // Edit: PATCH only changed fields vs initialData
    if (isEditMode && initialData) {
      const changed: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(submitData)) {
        const previous = (initialData as Record<string, unknown>)[key];
        if (String(previous ?? '') !== String(value ?? '')) {
          changed[key] = value;
        }
      }
      onSubmit(changed);
      return;
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* API Error Display */}
      {(error || errors._form) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error || errors._form}</p>
        </div>
      )}

      {/* Lead Selection Section (Only in create mode) */}
      {!isEditMode && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Convert from Lead (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Lead</label>
              <Combobox
                options={availableLeads.map((lead: Lead) => ({
                  value: lead.id,
                  label: `${lead.customerName} - ${lead.companyName} (${lead.city})`
                }))}
                value={selectedLeadId}
                onValueChange={handleLeadSelect}
                placeholder="Select a lead to convert..."
                searchPlaceholder="Search leads..."
                emptyMessage="No available leads to convert"
              />
            </div>

            {selectedLeadId && (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Lead Selected</p>
                    <p className="text-xs text-blue-700">
                      {availableLeads.find((l: Lead) => l.id === selectedLeadId)?.customerName} - 
                      {availableLeads.find((l: Lead) => l.id === selectedLeadId)?.companyName}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearLead}
                  className="h-8 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
            )}

            {showAutoFillNotice && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-start gap-2">
                <Info className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-700">
                  Customer details have been pre-filled from the selected Lead. You can edit any field before saving.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Section 1: Customer Information */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Customer Information</CardTitle>
            {leadReferenceId && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                <Info className="h-3 w-3" />
                <span>Originated from Lead (reference only)</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer Name *</label>
              <div className="relative">
                <Input
                  value={formData.customerName || ''}
                  onChange={(e) => handleChange('customerName', e.target.value)}
                  placeholder="Enter customer name"
                 
                  className={errors.customerName ? 'border-red-500' : ''}
                />

              </div>
              {errors.customerName && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.customerName}
                </p>
              )}

            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name *</label>
              <div className="relative">
                <Input
                  value={formData.companyName || ''}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  placeholder="Enter company name"
                 
                  className={errors.companyName ? 'border-red-500' : ''}
                />

              </div>
              {errors.companyName && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.companyName}
                </p>
              )}

            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mobile *</label>
              <div className="relative">
                <Input
                  value={formData.mobile || ''}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                 
                  className={errors.mobile ? 'border-red-500' : ''}
                />

              </div>
              {errors.mobile && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.mobile}
                </p>
              )}

            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Alternate Mobile</label>
              <div className="relative">
                <Input
                  value={formData.alternateMobile || ''}
                  onChange={(e) => handleChange('alternateMobile', e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                 
                  className={errors.alternateMobile ? 'border-red-500' : ''}
                />

              </div>
              {errors.alternateMobile && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.alternateMobile}
                </p>
              )}

            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Enter email address"
                 
                  className={errors.email ? 'border-red-500' : ''}
                />

              </div>
              {errors.email && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}

            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Business Information */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">GST Number</label>
              <div className="relative">
                <Input
                  value={formData.gstNumber || ''}
                  onChange={(e) => handleChange('gstNumber', e.target.value)}
                  placeholder="22AAAAA0000A1Z5"
                 
                  className={errors.gstNumber ? 'border-red-500' : ''}
                />

              </div>
              {errors.gstNumber && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.gstNumber}
                </p>
              )}

            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">PAN Number</label>
              <Input
                value={formData.panNumber || ''}
                onChange={(e) => handleChange('panNumber', e.target.value)}
                placeholder="AAAAA0000A"
                className={errors.panNumber ? 'border-red-500' : ''}
              />
              {errors.panNumber && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.panNumber}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Industry *</label>
              <Select
                value={formData.industry}
                onValueChange={(v) => handleChange('industry', v)}
              >
                <SelectTrigger className={errors.industry ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {customerConfig.industries.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.industry && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.industry}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Type *</label>
              <Select
                value={formData.businessType}
                onValueChange={(v) => handleChange('businessType', v)}
              >
                <SelectTrigger className={errors.businessType ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {customerConfig.customerTypes.map((bt) => (
                    <SelectItem key={bt} value={bt}>
                      {bt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.businessType && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.businessType}
                </p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Website</label>
              <Input
                value={formData.website || ''}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://www.example.com"
                className={errors.website ? 'border-red-500' : ''}
              />
              {errors.website && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.website}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Address Information */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Address Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Address *</label>
              <div className="relative">
                <Input
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Enter full address"
                 
                  className={errors.address ? 'border-red-500' : ''}
                />

              </div>
              {errors.address && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.address}
                </p>
              )}

            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">City *</label>
              <div className="relative">
                <Input
                  value={formData.city || ''}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Enter city"
                 
                  className={errors.city ? 'border-red-500' : ''}
                />

              </div>
              {errors.city && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.city}
                </p>
              )}

            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">State *</label>
              <div className="relative">
                <Input
                  value={formData.state || ''}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="Enter state"
                 
                  className={errors.state ? 'border-red-500' : ''}
                />

              </div>
              {errors.state && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.state}
                </p>
              )}

            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Country</label>
              <Input
                value={formData.country || ''}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="Enter country"
                className={errors.country ? 'border-red-500' : ''}
              />
              {errors.country && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.country}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Pincode</label>
              <div className="relative">
                <Input
                  value={formData.pincode || ''}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  placeholder="6-digit pincode"
                 
                  className={errors.pincode ? 'border-red-500' : ''}
                />

              </div>
              {errors.pincode && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.pincode}
                </p>
              )}

            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Additional Information */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Source *</label>
              <div className="relative">
                <Select
                  value={formData.source}
                  onValueChange={(v) => handleChange('source', v)}
                  
                >
                  <SelectTrigger className={errors.source ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {customerConfig.sources.map((src) => (
                      <SelectItem key={src} value={src}>
                        {src}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

              </div>
              {errors.source && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.source}
                </p>
              )}

            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={formData.status}
                onValueChange={(v) => handleChange('status', v)}
              >
                <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {customerConfig.statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.status}
                </p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Additional notes about the customer..."
                className={`flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.notes ? 'border-red-500' : 'border-input'}`}
                rows={3}
              />
              {errors.notes && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.notes}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <CustomerCustomFields
        mode="form"
        fields={customerConfig.customFields}
        values={formData.customFields}
        onChange={handleCustomFieldChange}
      />

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEditMode ? 'Update Customer' : 'Create Customer'}
        </Button>
      </div>
    </form>
  );
});
