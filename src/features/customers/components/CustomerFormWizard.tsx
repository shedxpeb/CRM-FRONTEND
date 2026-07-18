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
import { createCustomerSchema } from '@/features/customers/validations';
import { AlertCircle, Info, X } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import { useLeads } from '@/features/leads/hooks/useLeads';
import { Lead } from '@/types/leads';
import { useCustomerConfiguration } from '@/features/customers/hooks/useCustomers';
import { CustomerCustomFields } from '@/features/customers/components/CustomerCustomFields';
import { FormWizard, WizardStep } from '@/components/wizard/FormWizard';

interface CustomerFormWizardProps {
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

export const CustomerFormWizard = memo(function CustomerFormWizard({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  error,
  isEditMode = false,
}: CustomerFormWizardProps) {
  const customerConfig = useCustomerConfiguration();
  const { data: leadsResponse } = useLeads(
    isEditMode ? undefined : { page: 1, pageSize: 50, sortBy: 'createdAt', sortOrder: 'desc' }
  );
  const leads = leadsResponse?.data?.rows || [];
  const availableLeads = leads.filter((lead: Lead) => lead.status !== 'Converted');

  const [selectedLeadId, setSelectedLeadId] = useState<string>(initialData?.leadId || '');
  const [showAutoFillNotice, setShowAutoFillNotice] = useState<boolean>(false);
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

  const handleClearLead = () => {
    setSelectedLeadId('');
    setShowAutoFillNotice(false);
    setFormData((prev) => ({ ...prev, leadId: undefined }));
  };

  const validateStep = (stepFields: string[]) => {
    const stepErrors: Record<string, string> = {};
    stepFields.forEach((field) => {
      if (!formData[field as keyof Partial<Customer>] || formData[field as keyof Partial<Customer>] === '') {
        stepErrors[field] = `${field} is required`;
      }
    });
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return { valid: false, errors: stepErrors };
    }
    return { valid: true };
  };

  const handleSubmit = async () => {
    try {
      createCustomerSchema.parse(formData);
      setErrors({});

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
    }
  };

  // Step 1: Basic Information
  const basicInfoStep: WizardStep = {
    id: 'basic',
    title: 'Basic Information',
    description: 'Customer contact details',
    content: (
      <div className="space-y-4">
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
                <Input
                  value={formData.customerName || ''}
                  onChange={(e) => handleChange('customerName', e.target.value)}
                  placeholder="Enter customer name"
                  className={errors.customerName ? 'border-red-500' : ''}
                />
                {errors.customerName && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.customerName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name *</label>
                <Input
                  value={formData.companyName || ''}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  placeholder="Enter company name"
                  className={errors.companyName ? 'border-red-500' : ''}
                />
                {errors.companyName && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.companyName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mobile *</label>
                <Input
                  value={formData.mobile || ''}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className={errors.mobile ? 'border-red-500' : ''}
                />
                {errors.mobile && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.mobile}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Alternate Mobile</label>
                <Input
                  value={formData.alternateMobile || ''}
                  onChange={(e) => handleChange('alternateMobile', e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className={errors.alternateMobile ? 'border-red-500' : ''}
                />
                {errors.alternateMobile && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.alternateMobile}
                  </p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Enter email address"
                  className={errors.email ? 'border-red-500' : ''}
                />
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
      </div>
    ),
    validate: () => validateStep(['customerName', 'companyName', 'mobile']),
  };

  // Step 2: Company Information
  const companyStep: WizardStep = {
    id: 'company',
    title: 'Company Information',
    description: 'Business and tax details',
    content: (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">GST Number</label>
              <Input
                value={formData.gstNumber || ''}
                onChange={(e) => handleChange('gstNumber', e.target.value)}
                placeholder="22AAAAA0000A1Z5"
                className={errors.gstNumber ? 'border-red-500' : ''}
              />
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
    ),
    validate: () => validateStep(['industry', 'businessType']),
  };

  // Step 3: Address Information
  const addressStep: WizardStep = {
    id: 'address',
    title: 'Address Information',
    description: 'Location details',
    content: (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Address Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Address *</label>
              <Input
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Enter full address"
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.address}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">City *</label>
              <Input
                value={formData.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Enter city"
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.city}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">State *</label>
              <Input
                value={formData.state || ''}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="Enter state"
                className={errors.state ? 'border-red-500' : ''}
              />
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
              <Input
                value={formData.pincode || ''}
                onChange={(e) => handleChange('pincode', e.target.value)}
                placeholder="6-digit pincode"
                className={errors.pincode ? 'border-red-500' : ''}
              />
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
    ),
    validate: () => validateStep(['address', 'city', 'state']),
  };

  // Step 4: Billing & Additional
  const billingStep: WizardStep = {
    id: 'billing',
    title: 'Billing & Additional',
    description: 'Source, status, and notes',
    content: (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Source *</label>
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

          <CustomerCustomFields
            mode="form"
            fields={customerConfig.customFields}
            values={formData.customFields}
            onChange={handleCustomFieldChange}
          />
        </CardContent>
      </Card>
    ),
    validate: () => validateStep(['source']),
  };

  // Step 5: Review
  const reviewContent = (
    <div className="space-y-4">
      {(error || errors._form) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error || errors._form}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Customer Name:</span>
          <p className="text-muted-foreground">{formData.customerName}</p>
        </div>
        <div>
          <span className="font-medium">Company Name:</span>
          <p className="text-muted-foreground">{formData.companyName}</p>
        </div>
        <div>
          <span className="font-medium">Mobile:</span>
          <p className="text-muted-foreground">{formData.mobile}</p>
        </div>
        <div>
          <span className="font-medium">Email:</span>
          <p className="text-muted-foreground">{formData.email}</p>
        </div>
        <div>
          <span className="font-medium">Industry:</span>
          <p className="text-muted-foreground">{formData.industry}</p>
        </div>
        <div>
          <span className="font-medium">Business Type:</span>
          <p className="text-muted-foreground">{formData.businessType}</p>
        </div>
        <div>
          <span className="font-medium">City:</span>
          <p className="text-muted-foreground">{formData.city}</p>
        </div>
        <div>
          <span className="font-medium">State:</span>
          <p className="text-muted-foreground">{formData.state}</p>
        </div>
        <div>
          <span className="font-medium">Source:</span>
          <p className="text-muted-foreground">{formData.source}</p>
        </div>
        <div>
          <span className="font-medium">Status:</span>
          <p className="text-muted-foreground">{formData.status}</p>
        </div>
      </div>
    </div>
  );

  const steps: WizardStep[] = [
    basicInfoStep,
    companyStep,
    addressStep,
    billingStep,
  ];

  return (
    <FormWizard
      steps={steps}
      onSubmit={handleSubmit}
      isSubmitting={isLoading}
      onCancel={onCancel}
      submitButtonText={isEditMode ? 'Update Customer' : 'Create Customer'}
      showReviewStep={true}
      reviewContent={reviewContent}
    />
  );
});
