'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { createProjectSchema, CreateProjectInput } from '@/features/projects/validations';
import { customersApi } from '@/features/customers/services/customersApi';
import { useCustomerProjectData } from '@/features/customers/hooks/useCustomers';
import { useLeads } from '@/features/leads/hooks/useLeads';
import { useUsers } from '@/features/settings/hooks/useSettings';
import { Lead } from '@/types/leads';
import { useProjectConfiguration } from '@/features/projects/hooks/useProjects';
import { ProjectCustomFields } from '@/features/projects/components/ProjectCustomFields';
import { ProjectCustomFieldValues } from '@/features/projects/types';
import { formatLeadLabel } from '@/lib/utils';
import { Info, ArrowRight, AlertTriangle, Building2, Mail, Phone, MapPin, CreditCard, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface ProjectFormProps {
  onSubmit: (data: Partial<CreateProjectInput> & { customFields?: ProjectCustomFieldValues }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<CreateProjectInput> & { customFields?: ProjectCustomFieldValues };
  prefillCustomerId?: string;
  isEditMode?: boolean;
}

const PROJECT_TYPE_MAP: Record<string, string> = {
  Factory: 'Factory',
  Warehouse: 'Warehouse',
  IndustrialShed: 'Industrial Shed',
  Commercial: 'Commercial Building',
  Residential: 'Commercial Building',
  ColdStorage: 'Cold Storage',
  Other: 'Other',
};

const STRUCTURE_TYPE_MAP: Record<string, string> = {
  PEB: 'PEB Building',
  SteelStructure: 'Conventional Steel',
  Hybrid: 'Hybrid',
  Other: 'Other',
};

const ROOF_TYPE_MAP: Record<string, string> = {
  MetalSheet: 'Standing Seam',
  DeckSheet: 'Ribbed',
  SandwichPanel: 'Insulated Panel',
  Other: 'Other',
};

const WALL_TYPE_MAP: Record<string, string> = {
  MetalSheet: 'Single Skin',
  BrickWall: 'Brick Wall',
  SandwichPanel: 'Sandwich Panel',
  Other: 'Other',
};

function mapLeadProjectType(v?: string | null): string {
  return (v && PROJECT_TYPE_MAP[v]) || 'Industrial Shed';
}
function mapLeadStructureType(v?: string | null): string {
  return (v && STRUCTURE_TYPE_MAP[v]) || 'PEB Building';
}
function mapLeadRoofType(v?: string | null): string {
  return (v && ROOF_TYPE_MAP[v]) || 'Standing Seam';
}
function mapLeadWallType(v?: string | null): string {
  return (v && WALL_TYPE_MAP[v]) || 'Single Skin';
}
function mapLeadCraneSystem(lead: Record<string, unknown>): string {
  if (lead.craneRequired === false) return 'None';
  if (lead.craneCapacity) {
    const cap = Number(lead.craneCapacity);
    if (cap > 20) return 'Double Girder';
    if (cap > 0) return 'Single Girder';
  }
  return lead.craneRequired ? 'Single Girder' : 'None';
}
function toNum(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

const CUSTOMER_AUTO_FILL_FIELDS = ['location', 'city', 'state', 'pincode'] as const;

function CustomerSummaryCard({ data, isLoading }: { data: ReturnType<typeof useCustomerProjectData>['data']; isLoading: boolean }) {
  if (isLoading) {
    return (
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const customer = data?.data;
  if (!customer) return null;

  const statusVariant = customer.status === 'Active' ? 'default'
    : customer.status === 'Inactive' ? 'destructive'
    : 'secondary';

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-sm">{customer.customerName}</span>
            <span className="text-muted-foreground text-xs">|</span>
            <span className="text-muted-foreground text-xs">{customer.companyName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">CUST-{String(customer.customerId).padStart(4, '0')}</Badge>
            <Badge variant={statusVariant as any} className="text-[10px]">{customer.status}</Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 text-xs">
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span>{customer.mobile}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span className="truncate">{customer.email}</span>
          </div>
          {customer.gstNumber && (
            <div className="flex items-center gap-1.5">
              <CreditCard className="h-3 w-3 text-muted-foreground" />
              <span>GST: {customer.gstNumber}</span>
            </div>
          )}
          {customer.panNumber && (
            <div className="flex items-center gap-1.5">
              <CreditCard className="h-3 w-3 text-muted-foreground" />
              <span>PAN: {customer.panNumber}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 col-span-2">
            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{customer.address}, {customer.city}, {customer.state} {customer.pincode ? `- ${customer.pincode}` : ''}</span>
          </div>
          {customer.assignedEmployee && (
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Assigned:</span>
              <span>{customer.assignedEmployee}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export const ProjectForm = memo(function ProjectForm({
  onSubmit,
  onCancel,
  isLoading,
  initialData,
  prefillCustomerId,
  isEditMode = false,
}: ProjectFormProps) {
  const { data: customersCombobox } = useQuery({
    queryKey: ['customers', 'combobox', { page: 1, pageSize: 50 }],
    queryFn: () => customersApi.getCombobox({ page: 1, pageSize: 50 }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const { data: leads } = useLeads(
    isEditMode ? undefined : { page: 1, pageSize: 50, sortBy: 'createdAt', sortOrder: 'desc' }
  );
  const { data: users } = useUsers();
  const projectConfig = useProjectConfiguration();
  const customers = customersCombobox;
  const [showAutoFillNotice, setShowAutoFillNotice] = useState(false);
  const [autoFillSource, setAutoFillSource] = useState<'customer' | 'lead' | null>(null);
  const [customFields, setCustomFields] = useState<ProjectCustomFieldValues>(
    initialData?.customFields ?? {}
  );
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [editedFields, setEditedFields] = useState<Set<string>>(new Set());
  const customerReferenceId = isEditMode ? initialData?.customerId : undefined;
  const lastAutoFilledCustomerId = useRef<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      ...initialData,
      projectType: 'Industrial Shed',
      priority: 'Medium',
      structureType: 'PEB Building',
      roofType: 'Standing Seam',
      craneSystem: 'None',
      wallType: 'Single Skin',
      mezzanine: false,
      insulation: false,
      ...(prefillCustomerId && { customerId: prefillCustomerId }),
    },
  });

  const customerId = watch('customerId');
  const projectManagerId = watch('projectManagerId');

  const { data: customerProjectData, isLoading: customerDataLoading } = useCustomerProjectData(
    (customerId && !isEditMode) ? customerId : ''
  );

  const customerOptions = (() => {
    const options = (customers?.data?.rows ?? []).map((customer) => ({
      value: customer.id,
      label: `${customer.customerName} (${customer.companyName})`,
    }));
    if (customerId && !options.some((o) => o.value === customerId)) {
      options.unshift({
        value: customerId,
        label: customerProjectData?.data
          ? `${customerProjectData.data.customerName} (${customerProjectData.data.companyName})`
          : 'Current customer',
      });
    }
    return options;
  })();

  const managerOptions = (() => {
    const options = (users ?? [])
      .filter((u) => u.isActive && !u.isLocked)
      .map((u) => ({
        value: u.id,
        label: `${u.name}${u.email ? ` (${u.email})` : ''}`,
      }));
    if (
      projectManagerId &&
      !options.some((o) => o.value === projectManagerId)
    ) {
      options.unshift({
        value: projectManagerId,
        label: `Current manager (${projectManagerId.slice(0, 8)}…)`,
      });
    }
    return options;
  })();

  // Auto-fill from customer when customer changes (create mode only)
  useEffect(() => {
    if (isEditMode) return;
    if (!customerId || !customerProjectData?.data) return;
    const customer = customerProjectData.data;
    if (customer.id !== customerId) return;
    if (lastAutoFilledCustomerId.current === customerId) return;
    lastAutoFilledCustomerId.current = customerId;

    const fieldMap: [string, string][] = [
      ['address', 'location'],
      ['city', 'city'],
      ['state', 'state'],
      ['pincode', 'pincode'],
    ];

    fieldMap.forEach(([src, dest]) => {
      if (!editedFields.has(dest)) {
        const val = (customer as Record<string, unknown>)[src];
        if (val !== undefined && val !== null && val !== '') {
          setValue(dest as any, val);
        }
      }
    });

    setAutoFillSource('customer');
    setShowAutoFillNotice(true);
    const timer = setTimeout(() => setShowAutoFillNotice(false), 5000);
    return () => clearTimeout(timer);
  }, [customerId, customerProjectData?.data, setValue, isEditMode, editedFields]);

  // Clear auto-fill state when customer changes
  useEffect(() => {
    if (!isEditMode && customerId && lastAutoFilledCustomerId.current && lastAutoFilledCustomerId.current !== customerId) {
      lastAutoFilledCustomerId.current = '';
    }
  }, [customerId, isEditMode]);

  const handleCustomFieldChange = (key: string, value: string | number | boolean) => {
    setCustomFields((prev) => ({ ...prev, [key]: value }));
  };

  const markFieldEdited = useCallback((fieldName: string) => {
    setEditedFields((prev) => {
      if (prev.has(fieldName)) return prev;
      const next = new Set(prev);
      next.add(fieldName);
      return next;
    });
  }, []);

  const handleFormSubmit = (data: CreateProjectInput) => {
    if (isEditMode && initialData) {
      const changed: Partial<CreateProjectInput> & { customFields?: ProjectCustomFieldValues } = {};
      (Object.keys(data) as (keyof CreateProjectInput)[]).forEach((key) => {
        const nextVal = data[key];
        const prevVal = initialData[key];
        if (String(nextVal ?? '') !== String(prevVal ?? '')) {
          (changed as Record<string, unknown>)[key] = nextVal;
        }
      });
      const prevCustom = JSON.stringify(initialData.customFields ?? {});
      const nextCustom = JSON.stringify(customFields ?? {});
      if (prevCustom !== nextCustom) {
        changed.customFields = customFields;
      }
      onSubmit(changed);
      return;
    }
    onSubmit({ ...data, customFields });
  };

  const customerStatus = customerProjectData?.data?.status;
  const isCustomerInactive = customerStatus === 'Inactive' || customerStatus === 'Churned';

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Auto-fill Notice */}
      {showAutoFillNotice && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-start gap-2">
          <Info className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-700">
            {autoFillSource === 'customer'
              ? 'Project location has been auto-filled from the selected Customer. You can edit any field before saving.'
              : 'Project details have been auto-filled from the selected Lead. You can edit any field before saving.'}
          </p>
        </div>
      )}

      {/* Customer Warning */}
      {isCustomerInactive && customerId && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            This customer is <strong>{customerStatus}</strong>. You can still create a project, but review the customer status first.
          </p>
        </div>
      )}

      {/* General Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">General Information</CardTitle>
            {customerReferenceId && (
              <Badge variant="secondary" className="text-xs">
                Customer reference only
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
            {/* Lead Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Lead</label>
              <Combobox
                options={leads?.data?.rows?.map((lead: Lead) => ({
                  value: lead.id,
                  label: formatLeadLabel(lead),
                })) || []}
                value={selectedLeadId}
                onValueChange={(value) => {
                  if (editedFields.size > 0) {
                    const confirmChange = window.confirm('Changing the Lead will replace values you have manually edited. Continue?');
                    if (!confirmChange) return;
                  }
                  setSelectedLeadId(value);
                  const selectedLead = leads?.data?.rows?.find((lead: Lead) => lead.id === value);
                  if (selectedLead) {
                    const fieldMap: [string, string, ((v: any) => any)?][] = [
                      ['projectTitle', 'projectName'],
                      ['customerId', 'customerId'],
                      ['city', 'city'],
                      ['state', 'state'],
                      ['pincode', 'pincode'],
                      ['addressLine1', 'location', (v: string) => [selectedLead.addressLine1, selectedLead.addressLine2, selectedLead.siteAddress].filter(Boolean).join(', ') || v],
                    ];
                    fieldMap.forEach(([src, dest, transform]) => {
                      if (!editedFields.has(dest)) {
                        const val = transform ? transform((selectedLead as any)[src]) : (selectedLead as any)[src];
                        if (val !== undefined && val !== null && val !== '') {
                          setValue(dest as any, val);
                        }
                      }
                    });
                    if (!editedFields.has('projectType')) {
                      setValue('projectType', mapLeadProjectType(selectedLead.projectType) as any);
                    }
                    if (!editedFields.has('structureType')) {
                      setValue('structureType', mapLeadStructureType(selectedLead.structureType) as any);
                    }
                    if (!editedFields.has('roofType') && selectedLead.roofType) {
                      setValue('roofType', mapLeadRoofType(selectedLead.roofType) as any);
                    }
                    if (!editedFields.has('wallType') && selectedLead.wallType) {
                      setValue('wallType', mapLeadWallType(selectedLead.wallType) as any);
                    }
                    if (!editedFields.has('craneSystem')) {
                      setValue('craneSystem', mapLeadCraneSystem(selectedLead as any) as any);
                    }
                    if (!editedFields.has('width') && selectedLead.width) {
                      setValue('width', toNum(selectedLead.width) as any);
                    }
                    if (!editedFields.has('length') && selectedLead.length) {
                      setValue('length', toNum(selectedLead.length) as any);
                    }
                    if (!editedFields.has('height') && selectedLead.height) {
                      setValue('height', toNum(selectedLead.height) as any);
                    }
                    if (!editedFields.has('baySpacing') && selectedLead.baySpacing) {
                      setValue('baySpacing', toNum(selectedLead.baySpacing) as any);
                    }
                    if (!editedFields.has('mezzanine')) {
                      setValue('mezzanine', !!selectedLead.mezzanine);
                    }
                    if (!editedFields.has('insulation')) {
                      setValue('insulation', !!selectedLead.insulationRequired);
                    }
                    setAutoFillSource('lead');
                    setShowAutoFillNotice(true);
                    setTimeout(() => setShowAutoFillNotice(false), 5000);
                  }
                }}
                placeholder="Select lead to auto-fill project details"
                searchPlaceholder="Search leads..."
                emptyMessage="No leads found"
              />
              {selectedLeadId && (() => {
                const lead = leads?.data?.rows?.find((l: Lead) => l.id === selectedLeadId);
                if (!lead) return null;
                return (
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded p-2">
                    <ArrowRight className="h-3 w-3" />
                    <span className="font-medium">{lead.customerName}</span>
                    <span>|</span>
                    <span>{lead.companyName}</span>
                    <span>|</span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1">{lead.status}</Badge>
                  </div>
                );
              })()}
            </div>

          {/* Customer Selection + Summary */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Customer *</label>
              {customerDataLoading && customerId && (
                <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
              )}
            </div>
            <Combobox
              options={customerOptions}
              value={watch('customerId') || ''}
              onValueChange={(value) => {
                markFieldEdited('customerId');
                lastAutoFilledCustomerId.current = '';
                setValue('customerId', value, { shouldValidate: true });
              }}
              placeholder="Select customer"
              searchPlaceholder="Search customers..."
              emptyMessage="No customer found"
            />
            {errors.customerId && <p className="text-sm text-red-500">{errors.customerId.message}</p>}
          </div>

          {/* Customer Summary Card */}
          {customerId && !isEditMode && (
            <CustomerSummaryCard data={customerProjectData} isLoading={customerDataLoading} />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name *</label>
              <Input {...register('projectName')} onBlur={() => markFieldEdited('projectName')} placeholder="Enter project name" />
              {errors.projectName && <p className="text-sm text-red-500">{errors.projectName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Type *</label>
              <Select onValueChange={(value) => { markFieldEdited('projectType'); setValue('projectType', value as any); }} defaultValue={initialData?.projectType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  {projectConfig.projectTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.projectType && <p className="text-sm text-red-500">{errors.projectType.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority *</label>
              <Select onValueChange={(value) => { markFieldEdited('priority'); setValue('priority', value as any); }} defaultValue={initialData?.priority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {projectConfig.priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      <Badge variant={priority === 'Urgent' ? 'destructive' : priority === 'High' ? 'warning' : 'default'}>
                        {priority}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority && <p className="text-sm text-red-500">{errors.priority.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Value (₹) *</label>
              <Input type="number" {...register('value', { valueAsNumber: true })} onBlur={() => markFieldEdited('value')} placeholder="Enter project value" />
              {errors.value && <p className="text-sm text-red-500">{errors.value.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Budget (₹) *</label>
              <Input type="number" {...register('budget', { valueAsNumber: true })} onBlur={() => markFieldEdited('budget')} placeholder="Enter budget" />
              {errors.budget && <p className="text-sm text-red-500">{errors.budget.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date *</label>
              <Input type="date" {...register('startDate')} />
              {errors.startDate && <p className="text-sm text-red-500">{errors.startDate.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date *</label>
              <Input type="date" {...register('endDate')} />
              {errors.endDate && <p className="text-sm text-red-500">{errors.endDate.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Location *</label>
            <Input {...register('location')} onBlur={() => markFieldEdited('location')} placeholder="Enter project location" />
            {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">City *</label>
              <Input {...register('city')} onBlur={() => markFieldEdited('city')} placeholder="City" />
              {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">State *</label>
              <Input {...register('state')} onBlur={() => markFieldEdited('state')} placeholder="State" />
              {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Pincode</label>
              <Input {...register('pincode')} onBlur={() => markFieldEdited('pincode')} placeholder="Pincode" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Project Manager *</label>
            <Combobox
              options={managerOptions}
              value={projectManagerId || ''}
              onValueChange={(value) => {
                markFieldEdited('projectManagerId');
                setValue('projectManagerId', value, { shouldValidate: true });
              }}
              placeholder="Select project manager"
              searchPlaceholder="Search users..."
              emptyMessage="No active users found"
            />
            {errors.projectManagerId && (
              <p className="text-sm text-red-500">{errors.projectManagerId.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PEB Specific Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">PEB Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Structure Type *</label>
              <Select onValueChange={(value) => { markFieldEdited('structureType'); setValue('structureType', value as any); }} defaultValue={initialData?.structureType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select structure type" />
                </SelectTrigger>
                <SelectContent>
                  {projectConfig.structureTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.structureType && <p className="text-sm text-red-500">{errors.structureType.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Roof Type *</label>
              <Select onValueChange={(value) => { markFieldEdited('roofType'); setValue('roofType', value as any); }} defaultValue={initialData?.roofType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select roof type" />
                </SelectTrigger>
                <SelectContent>
                  {projectConfig.roofTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roofType && <p className="text-sm text-red-500">{errors.roofType.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Width (m)</label>
              <Input type="number" {...register('width', { valueAsNumber: true })} onBlur={() => markFieldEdited('width')} placeholder="Width" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Length (m)</label>
              <Input type="number" {...register('length', { valueAsNumber: true })} onBlur={() => markFieldEdited('length')} placeholder="Length" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Height (m)</label>
              <Input type="number" {...register('height', { valueAsNumber: true })} onBlur={() => markFieldEdited('height')} placeholder="Height" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bay Spacing (m)</label>
              <Input type="number" {...register('baySpacing', { valueAsNumber: true })} onBlur={() => markFieldEdited('baySpacing')} placeholder="Bay spacing" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Crane System *</label>
              <Select onValueChange={(value) => { markFieldEdited('craneSystem'); setValue('craneSystem', value as any); }} defaultValue={initialData?.craneSystem}>
                <SelectTrigger>
                  <SelectValue placeholder="Select crane system" />
                </SelectTrigger>
                <SelectContent>
                  {projectConfig.craneSystems.map((system) => (
                    <SelectItem key={system} value={system}>
                      {system}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.craneSystem && <p className="text-sm text-red-500">{errors.craneSystem.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Wall Type *</label>
              <Select onValueChange={(value) => { markFieldEdited('wallType'); setValue('wallType', value as any); }} defaultValue={initialData?.wallType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select wall type" />
                </SelectTrigger>
                <SelectContent>
                  {projectConfig.wallTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.wallType && <p className="text-sm text-red-500">{errors.wallType.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Covered Area (sq.m)</label>
              <Input type="number" {...register('coveredArea', { valueAsNumber: true })} placeholder="Covered area" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Weight (tons)</label>
              <Input type="number" {...register('totalWeight', { valueAsNumber: true })} placeholder="Total weight" />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <input type="checkbox" {...register('mezzanine')} className="h-4 w-4" />
              <label className="text-sm font-medium">Mezzanine</label>
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <input type="checkbox" {...register('insulation')} className="h-4 w-4" />
              <label className="text-sm font-medium">Insulation</label>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProjectCustomFields
        mode="form"
        fields={projectConfig.customFields}
        values={customFields}
        onChange={handleCustomFieldChange}
      />

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || customerDataLoading}>
          {isLoading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
});
