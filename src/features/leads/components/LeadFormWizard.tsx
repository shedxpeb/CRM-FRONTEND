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
import { Badge } from '@/components/ui/badge';
import {
  Lead,
  ProjectType,
  StructureType,
  RoofType,
  WallType,
  MaterialPreference,
  LeadSource,
  LeadPriority,
  LeadStatus,
} from '@/types/leads';
import { Upload, AlertTriangle, AlertCircle, Check } from 'lucide-react';
import { DEFAULT_LEAD_CONFIGURATION, LeadModuleConfiguration } from '@/features/leads/hooks/useLeads';
import { LeadCustomFields } from '@/features/leads/components/LeadCustomFields';
import { createLeadSchema } from '@/features/leads/validations';
import { FormWizard, WizardStep } from '@/components/wizard/FormWizard';

interface LeadFormWizardProps {
  initialData?: Partial<Lead>;
  existingLeads?: Lead[];
  configuration?: LeadModuleConfiguration & { isLoading?: boolean };
  onSubmit: (data: Partial<Lead>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const LeadFormWizard = memo(function LeadFormWizard({
  initialData,
  existingLeads = [],
  configuration,
  onSubmit,
  onCancel,
  isLoading,
}: LeadFormWizardProps) {
  const config = configuration ?? DEFAULT_LEAD_CONFIGURATION;
  const [formData, setFormData] = useState<any>({
    customerName: initialData?.customerName ?? '',
    companyName: initialData?.companyName ?? '',
    designation: initialData?.designation ?? '',
    website: initialData?.website ?? '',
    mobile: initialData?.mobile ?? '',
    alternateMobile: initialData?.alternateMobile ?? '',
    email: initialData?.email ?? '',
    gstNumber: initialData?.gstNumber ?? '',
    panNumber: initialData?.panNumber ?? '',
    industry: initialData?.industry ?? '',
    businessType: initialData?.businessType ?? '',
    addressLine1: initialData?.addressLine1 ?? '',
    addressLine2: initialData?.addressLine2 ?? '',
    area: initialData?.area ?? '',
    city: initialData?.city ?? '',
    state: initialData?.state ?? '',
    country: initialData?.country ?? '',
    pincode: initialData?.pincode ?? '',
    companySize: initialData?.companySize ?? '',
    annualRevenue: initialData?.annualRevenue?.toString() ?? '',
    employeeCount: initialData?.employeeCount?.toString() ?? '',
    linkedin: initialData?.linkedin ?? '',
    facebook: initialData?.facebook ?? '',
    instagram: initialData?.instagram ?? '',
    tags: initialData?.tags ?? [],
    remarks: initialData?.remarks ?? '',
    projectTitle: initialData?.projectTitle ?? '',
    projectType: (initialData?.projectType ?? config.projectTypes[0] ?? 'Factory') as ProjectType,
    structureType: (initialData?.structureType ?? config.structureTypes[0] ?? 'PEB') as StructureType,
    width: initialData?.width?.toString() ?? '',
    length: initialData?.length?.toString() ?? '',
    height: initialData?.height?.toString() ?? '',
    baySpacing: initialData?.baySpacing?.toString() ?? '',
    roofType: initialData?.roofType ?? '',
    wallType: initialData?.wallType ?? '',
    materialPreference: initialData?.materialPreference ?? '',
    craneRequired: initialData?.craneRequired ?? false,
    craneCapacity: initialData?.craneCapacity?.toString() ?? '',
    mezzanine: initialData?.mezzanine ?? false,
    mezzanineArea: initialData?.mezzanineArea?.toString() ?? '',
    mezzanineLoad: initialData?.mezzanineLoad?.toString() ?? '',
    insulationRequired: initialData?.insulationRequired ?? false,
    insulationType: initialData?.insulationType ?? '',
    insulationThickness: initialData?.insulationThickness?.toString() ?? '',
    siteLocation: initialData?.siteLocation ?? '',
    siteAddress: initialData?.siteAddress ?? '',
    mapCoordinates: initialData?.mapCoordinates ?? '',
    soilNotes: initialData?.soilNotes ?? '',
    customerNotes: initialData?.customerNotes ?? '',
    specialRequirement: initialData?.specialRequirement ?? '',
    source: (initialData?.source ?? config.sources[0] ?? 'Website') as LeadSource,
    priority: (initialData?.priority ?? config.priorities[1] ?? 'Medium') as LeadPriority,
    status: (initialData?.status ?? config.statuses[0] ?? 'New') as LeadStatus,
    customFields: initialData?.customFields ?? {},
  });
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleCustomFieldChange = (key: string, value: string | number | boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      customFields: { ...prev.customFields, [key]: value },
    }));
  };

  const checkDuplicates = (data: Partial<Lead>) => {
    const duplicates = existingLeads.filter((lead) => {
      if (initialData?.id && lead.id === initialData.id) return false;
      const sameMobile = data.mobile && lead.mobile === data.mobile;
      const sameEmail = data.email && lead.email.toLowerCase() === data.email.toLowerCase();
      return sameMobile || sameEmail;
    });

    if (duplicates.length > 0) {
      const match = duplicates[0];
      setDuplicateWarning(
        `Possible duplicate: Lead #${match.leadNumber} (${match.customerName}) has the same ${data.mobile === match.mobile ? 'mobile' : 'email'}.`
      );
      return true;
    }
    setDuplicateWarning(null);
    return false;
  };

  const normalizeEnum = (value: string | undefined): string | undefined =>
    value?.replace(/\s+/g, '');

  const getSubmitData = () => {
    const projectType = normalizeEnum(formData.projectType) ?? formData.projectType;
    const structureType = normalizeEnum(formData.structureType) ?? formData.structureType;
    const source = normalizeEnum(formData.source) ?? formData.source;
    const status = normalizeEnum(formData.status) ?? formData.status;

    const raw: Record<string, any> = {
      customerName: formData.customerName,
      companyName: formData.companyName,
      designation: formData.designation || undefined,
      website: formData.website || undefined,
      mobile: formData.mobile,
      alternateMobile: formData.alternateMobile || undefined,
      email: formData.email || '',
      gstNumber: formData.gstNumber || undefined,
      panNumber: formData.panNumber || undefined,
      industry: formData.industry || undefined,
      businessType: formData.businessType || undefined,
      addressLine1: formData.addressLine1 || undefined,
      addressLine2: formData.addressLine2 || undefined,
      area: formData.area || undefined,
      city: formData.city || undefined,
      state: formData.state || undefined,
      country: formData.country || undefined,
      pincode: formData.pincode || undefined,
      companySize: formData.companySize || undefined,
      annualRevenue: formData.annualRevenue ? parseFloat(formData.annualRevenue as string) : undefined,
      employeeCount: formData.employeeCount ? parseInt(formData.employeeCount as string, 10) : undefined,
      linkedin: formData.linkedin || undefined,
      facebook: formData.facebook || undefined,
      instagram: formData.instagram || undefined,
      tags: formData.tags?.length ? formData.tags : undefined,
      projectTitle: formData.projectTitle,
      projectType,
      structureType,
      width: formData.width ? parseFloat(formData.width as string) : undefined,
      length: formData.length ? parseFloat(formData.length as string) : undefined,
      height: formData.height ? parseFloat(formData.height as string) : undefined,
      baySpacing: formData.baySpacing ? parseFloat(formData.baySpacing as string) : undefined,
      roofType: formData.roofType || undefined,
      wallType: formData.wallType || undefined,
      materialPreference: formData.materialPreference || undefined,
      craneRequired: formData.craneRequired ?? false,
      craneCapacity: formData.craneCapacity ? parseFloat(formData.craneCapacity as string) : undefined,
      mezzanine: formData.mezzanine ?? false,
      mezzanineArea: formData.mezzanineArea ? parseFloat(formData.mezzanineArea as string) : undefined,
      mezzanineLoad: formData.mezzanineLoad ? parseFloat(formData.mezzanineLoad as string) : undefined,
      insulationRequired: formData.insulationRequired ?? false,
      insulationType: formData.insulationType || undefined,
      insulationThickness: formData.insulationThickness ? parseFloat(formData.insulationThickness as string) : undefined,
      siteLocation: formData.siteLocation || undefined,
      siteAddress: formData.siteAddress || undefined,
      mapCoordinates: formData.mapCoordinates || undefined,
      soilNotes: formData.soilNotes || undefined,
      customerNotes: formData.customerNotes || undefined,
      specialRequirement: formData.specialRequirement || undefined,
      source,
      priority: formData.priority,
      status,
      remarks: formData.remarks || undefined,
      nextFollowUpDate: formData.nextFollowUpDate
        ? (formData.nextFollowUpDate instanceof Date
            ? formData.nextFollowUpDate.toISOString()
            : new Date(formData.nextFollowUpDate).toISOString())
        : undefined,
      assignedToId: formData.assignedToId || undefined,
      customFields: formData.customFields && Object.keys(formData.customFields).length > 0
        ? formData.customFields
        : undefined,
    };

    const fullPayload = Object.fromEntries(
      Object.entries(raw).filter(([_, v]) => v !== undefined)
    ) as Partial<Lead>;

    if (!initialData?.id) {
      return fullPayload;
    }

    const changed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fullPayload)) {
      const previous = (initialData as Record<string, unknown>)[key];
      let previousNormalized = previous;
      if (
        ['projectType', 'structureType', 'source', 'status'].includes(key) &&
        typeof previous === 'string'
      ) {
        previousNormalized = normalizeEnum(previous) ?? previous;
      }
      if (key === 'nextFollowUpDate') {
        const prevTime = previous
          ? new Date(previous as string | Date).getTime()
          : null;
        const nextTime = value
          ? new Date(value as string).getTime()
          : null;
        if (prevTime !== nextTime) changed[key] = value;
        continue;
      }
      if (key === 'tags' || key === 'customFields') {
        if (JSON.stringify(previous ?? null) !== JSON.stringify(value ?? null)) {
          changed[key] = value;
        }
        continue;
      }
      if (typeof value === 'number' || typeof previousNormalized === 'number') {
        const prevNum =
          previousNormalized === undefined || previousNormalized === null || previousNormalized === ''
            ? null
            : Number(previousNormalized);
        const nextNum = value === undefined || value === null || value === '' ? null : Number(value);
        if (prevNum !== nextNum) changed[key] = value;
        continue;
      }
      if (typeof value === 'boolean' || typeof previousNormalized === 'boolean') {
        if (Boolean(previousNormalized) !== Boolean(value)) changed[key] = value;
        continue;
      }
      if (String(previousNormalized ?? '') !== String(value ?? '')) {
        changed[key] = value;
      }
    }
    return changed as Partial<Lead>;
  };

  const validateStep = (stepFields: string[]) => {
    const stepErrors: Record<string, string> = {};
    stepFields.forEach((field) => {
      if (!formData[field] || formData[field] === '') {
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
      const dataToValidate = {
        ...formData,
        projectType: normalizeEnum(formData.projectType) ?? formData.projectType,
        structureType: normalizeEnum(formData.structureType) ?? formData.structureType,
        source: normalizeEnum(formData.source) ?? formData.source,
        status: normalizeEnum(formData.status) ?? formData.status,
      };
      createLeadSchema.parse(dataToValidate);
      setErrors({});

      if (checkDuplicates(formData)) {
        return;
      }

      const submitData = getSubmitData();
      onSubmit(submitData);
    } catch (err: any) {
      const fieldErrors: Record<string, string> = {};
      if (err.errors) {
        err.errors.forEach((e: any) => {
          const path = e.path[0];
          if (path) {
            fieldErrors[path] = e.message;
          }
        });
      }
      setErrors(fieldErrors);
    }
  };

  // Step 1: Basic Information
  const basicInfoStep: WizardStep = {
    id: 'basic',
    title: 'Basic Information',
    description: 'Customer and company details',
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Customer Name *</label>
            <Input
              placeholder="Enter customer name"
              value={formData.customerName ?? ''}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              className={errors.customerName ? 'border-red-500' : ''}
            />
            {errors.customerName && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.customerName}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Name *</label>
            <Input
              placeholder="Enter company name"
              value={formData.companyName ?? ''}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              className={errors.companyName ? 'border-red-500' : ''}
            />
            {errors.companyName && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.companyName}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Designation</label>
            <Input
              placeholder="Enter designation"
              value={formData.designation ?? ''}
              onChange={(e) => handleInputChange('designation', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Website</label>
            <Input
              placeholder="Enter website URL"
              value={formData.website ?? ''}
              onChange={(e) => handleInputChange('website', e.target.value)}
            />
          </div>
        </div>
      </div>
    ),
    validate: () => validateStep(['customerName', 'companyName']),
  };

  // Step 2: Contact Information
  const contactStep: WizardStep = {
    id: 'contact',
    title: 'Contact Information',
    description: 'Phone and email details',
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Mobile *</label>
            <Input
              placeholder="Enter mobile number"
              value={formData.mobile ?? ''}
              onChange={(e) => handleInputChange('mobile', e.target.value)}
              className={errors.mobile ? 'border-red-500' : ''}
            />
            {errors.mobile && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.mobile}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Alternate Mobile</label>
            <Input
              placeholder="Enter alternate mobile"
              value={formData.alternateMobile ?? ''}
              onChange={(e) => handleInputChange('alternateMobile', e.target.value)}
              className={errors.alternateMobile ? 'border-red-500' : ''}
            />
            {errors.alternateMobile && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.alternateMobile}
              </p>
            )}
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Email *</label>
            <Input
              type="email"
              placeholder="Enter email address"
              value={formData.email ?? ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>
        </div>
      </div>
    ),
    validate: () => validateStep(['mobile', 'email']),
  };

  // Step 3: Address Information
  const addressStep: WizardStep = {
    id: 'address',
    title: 'Address Information',
    description: 'Location and address details',
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Address Line 1</label>
            <Input
              placeholder="Enter address line 1"
              value={formData.addressLine1 ?? ''}
              onChange={(e) => handleInputChange('addressLine1', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Address Line 2</label>
            <Input
              placeholder="Enter address line 2"
              value={formData.addressLine2 ?? ''}
              onChange={(e) => handleInputChange('addressLine2', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Area</label>
            <Input
              placeholder="Enter area"
              value={formData.area ?? ''}
              onChange={(e) => handleInputChange('area', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">City *</label>
            <Input
              placeholder="Enter city"
              value={formData.city ?? ''}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className={errors.city ? 'border-red-500' : ''}
            />
            {errors.city && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.city}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">State *</label>
            <Input
              placeholder="Enter state"
              value={formData.state ?? ''}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className={errors.state ? 'border-red-500' : ''}
            />
            {errors.state && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.state}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Pincode</label>
            <Input
              placeholder="Enter pincode"
              value={formData.pincode ?? ''}
              onChange={(e) => handleInputChange('pincode', e.target.value)}
              className={errors.pincode ? 'border-red-500' : ''}
            />
            {errors.pincode && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.pincode}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Country</label>
            <Input
              placeholder="Enter country"
              value={formData.country ?? ''}
              onChange={(e) => handleInputChange('country', e.target.value)}
            />
          </div>
        </div>
      </div>
    ),
    validate: () => validateStep(['city', 'state']),
  };

  // Step 4: Business Information
  const businessStep: WizardStep = {
    id: 'business',
    title: 'Business Information',
    description: 'Company and tax details',
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">GST Number</label>
            <Input
              placeholder="Enter GST number"
              value={formData.gstNumber ?? ''}
              onChange={(e) => handleInputChange('gstNumber', e.target.value)}
              className={errors.gstNumber ? 'border-red-500' : ''}
            />
            {errors.gstNumber && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {errors.gstNumber}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">PAN Number</label>
            <Input
              placeholder="Enter PAN number"
              value={formData.panNumber ?? ''}
              onChange={(e) => handleInputChange('panNumber', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Industry</label>
            <Select
              value={formData.industry}
              onValueChange={(value) => handleInputChange('industry', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {[
                  'Construction', 'Manufacturing', 'Technology', 'Healthcare',
                  'Hospitality', 'Retail', 'Education', 'Finance', 'RealEstate',
                  'Infrastructure', 'Energy', 'Mining', 'Agriculture', 'Transportation', 'Other',
                ].map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Business Type</label>
            <Select
              value={formData.businessType}
              onValueChange={(value) => handleInputChange('businessType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                {[
                  'SoleProprietorship', 'Partnership', 'PrivateLimited',
                  'PublicLimited', 'LLP', 'Government', 'NonProfit', 'Other',
                ].map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Size</label>
            <Select
              value={formData.companySize}
              onValueChange={(value) => handleInputChange('companySize', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'].map((size) => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Annual Revenue (₹)</label>
            <Input
              type="number"
              placeholder="Enter annual revenue"
              value={formData.annualRevenue ?? ''}
              onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Employee Count</label>
            <Input
              type="number"
              placeholder="Enter employee count"
              value={formData.employeeCount ?? ''}
              onChange={(e) => handleInputChange('employeeCount', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Social Links</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="LinkedIn"
              value={formData.linkedin ?? ''}
              onChange={(e) => handleInputChange('linkedin', e.target.value)}
            />
            <Input
              placeholder="Facebook"
              value={formData.facebook ?? ''}
              onChange={(e) => handleInputChange('facebook', e.target.value)}
            />
            <Input
              placeholder="Instagram"
              value={formData.instagram ?? ''}
              onChange={(e) => handleInputChange('instagram', e.target.value)}
            />
          </div>
        </div>
      </div>
    ),
  };

  // Step 5: Project & Notes
  const projectNotesStep: WizardStep = {
    id: 'project-notes',
    title: 'Project & Notes',
    description: 'Project details and additional information',
    content: (
      <div className="space-y-4">
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Project Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Project Title *</label>
              <Input
                placeholder="Enter project title"
                value={formData.projectTitle ?? ''}
                onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                className={errors.projectTitle ? 'border-red-500' : ''}
              />
              {errors.projectTitle && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.projectTitle}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Type *</label>
              <Select
                value={formData.projectType || config.projectTypes[0]}
                onValueChange={(value) => handleInputChange('projectType', value as ProjectType)}
              >
                <SelectTrigger className={errors.projectType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  {config.projectTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.projectType && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.projectType}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Tags</h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags?.map((tag: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="gap-1">
                {tag}
                <button
                  type="button"
                  className="ml-1 hover:text-destructive"
                  onClick={() => {
                    const next = [...formData.tags];
                    next.splice(idx, 1);
                    handleInputChange('tags', next);
                  }}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag and press Enter"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val && !formData.tags.includes(val)) {
                    handleInputChange('tags', [...formData.tags, val]);
                  }
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Notes & Remarks</h4>
          <div className="space-y-2">
            <label className="text-sm font-medium">Customer Notes</label>
            <textarea
              className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Enter customer notes"
              value={formData.customerNotes ?? ''}
              onChange={(e) => handleInputChange('customerNotes', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Special Requirement</label>
            <textarea
              className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Enter special requirements"
              value={formData.specialRequirement ?? ''}
              onChange={(e) => handleInputChange('specialRequirement', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Remarks</label>
            <textarea
              className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Enter remarks"
              value={formData.remarks ?? ''}
              onChange={(e) => handleInputChange('remarks', e.target.value)}
            />
          </div>
        </div>

        <LeadCustomFields
          mode="form"
          fields={config.customFields ?? []}
          values={formData.customFields}
          onChange={handleCustomFieldChange}
        />
      </div>
    ),
    validate: () => validateStep(['projectTitle', 'projectType']),
  };

  // Step 6: Review
  const reviewContent = (
    <div className="space-y-4">
      {duplicateWarning && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{duplicateWarning}</span>
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
          <span className="font-medium">City:</span>
          <p className="text-muted-foreground">{formData.city}</p>
        </div>
        <div>
          <span className="font-medium">State:</span>
          <p className="text-muted-foreground">{formData.state}</p>
        </div>
        <div className="col-span-2">
          <span className="font-medium">Project Title:</span>
          <p className="text-muted-foreground">{formData.projectTitle}</p>
        </div>
        <div>
          <span className="font-medium">Project Type:</span>
          <p className="text-muted-foreground">{formData.projectType}</p>
        </div>
        <div>
          <span className="font-medium">Priority:</span>
          <p className="text-muted-foreground">{formData.priority}</p>
        </div>
      </div>
    </div>
  );

  const steps: WizardStep[] = [
    basicInfoStep,
    contactStep,
    addressStep,
    businessStep,
    projectNotesStep,
  ];

  return (
    <FormWizard
      steps={steps}
      onSubmit={handleSubmit}
      isSubmitting={isLoading}
      onCancel={onCancel}
      submitButtonText={initialData?.id ? 'Update Lead' : 'Create Lead'}
      showReviewStep={true}
      reviewContent={reviewContent}
    />
  );
});
