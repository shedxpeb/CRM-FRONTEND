'use client';

import { useState, useEffect, memo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Badge } from '@/components/ui/badge';
import { createProjectSchema, CreateProjectInput } from '@/features/projects/validations';
import { customersApi } from '@/features/customers/services/customersApi';
import { useCustomer } from '@/features/customers/hooks/useCustomers';
import { useLeads } from '@/features/leads/hooks/useLeads';
import { useUsers } from '@/features/settings/hooks/useSettings';
import { Lead } from '@/types/leads';
import { smartPrefill } from '@/lib/smartPrefill';
import { useProjectConfiguration } from '@/features/projects/hooks/useProjects';
import { ProjectCustomFields } from '@/features/projects/components/ProjectCustomFields';
import { ProjectCustomFieldValues } from '@/features/projects/types';
import { Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface ProjectFormProps {
  onSubmit: (data: Partial<CreateProjectInput> & { customFields?: ProjectCustomFieldValues }) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<CreateProjectInput> & { customFields?: ProjectCustomFieldValues };
  prefillCustomerId?: string;
  isEditMode?: boolean;
}

export const ProjectForm = memo(function ProjectForm({
  onSubmit,
  onCancel,
  isLoading,
  initialData,
  prefillCustomerId,
  isEditMode = false,
}: ProjectFormProps) {
  // Lightweight combobox (≤50) — not full customer list
  const { data: customersCombobox } = useQuery({
    queryKey: ['customers', 'combobox', { page: 1, pageSize: 50 }],
    queryFn: () => customersApi.getCombobox({ page: 1, pageSize: 50 }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  // Lead picker only on create
  const { data: leads } = useLeads(
    isEditMode ? undefined : { page: 1, pageSize: 50, sortBy: 'createdAt', sortOrder: 'desc' }
  );
  const { data: users } = useUsers();
  const projectConfig = useProjectConfiguration();
  const customers = customersCombobox;
  const [showAutoFillNotice, setShowAutoFillNotice] = useState(false);
  const [customFields, setCustomFields] = useState<ProjectCustomFieldValues>(
    initialData?.customFields ?? {}
  );
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [editedFields, setEditedFields] = useState<Set<string>>(new Set());
  const customerReferenceId = isEditMode ? initialData?.customerId : undefined;

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

  // Resolve selected customer for label + create-mode location autofill
  const { data: selectedCustomerDetail } = useCustomer(customerId || '');

  const customerOptions = (() => {
    const options = (customers?.data?.rows ?? []).map((customer) => ({
      value: customer.id,
      label: `${customer.customerName} (${customer.companyName})`,
    }));
    if (customerId && !options.some((o) => o.value === customerId)) {
      const detail = selectedCustomerDetail?.data;
      options.unshift({
        value: customerId,
        label: detail
          ? `${detail.customerName} (${detail.companyName})`
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
    // Keep current manager selectable even if users API is unavailable or filtered out
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

  // Auto-fill location from customer detail on create only (one-time snapshot)
  useEffect(() => {
    if (isEditMode) return;
    const selectedCustomer = selectedCustomerDetail?.data;
    if (!customerId || !selectedCustomer || selectedCustomer.id !== customerId) return;

    setValue('location', selectedCustomer.address || '');
    setValue('city', selectedCustomer.city || '');
    setValue('state', selectedCustomer.state || '');
    setValue('pincode', selectedCustomer.pincode || '');
    setShowAutoFillNotice(true);

    const timer = setTimeout(() => {
      setShowAutoFillNotice(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [customerId, selectedCustomerDetail?.data, setValue, isEditMode]);

  const handleCustomFieldChange = (key: string, value: string | number | boolean) => {
    setCustomFields((prev) => ({ ...prev, [key]: value }));
  };

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

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Auto-fill Notice */}
      {showAutoFillNotice && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-start gap-2">
          <Info className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-700">
            Location details have been auto-filled from the selected Customer. You can edit any field before saving.
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
              <label className="text-sm font-medium">Lead *</label>
              <Combobox
                options={leads?.data?.rows?.map((lead: Lead) => ({
                  value: lead.id,
                  label: `${lead.customerName} - ${lead.companyName} (${lead.city})`,
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
                    const mapping: Record<string, string> = {
                      address: 'location',
                      city: 'city',
                      state: 'state',
                      pincode: 'pincode',
                    };
                    const newData = smartPrefill(watch(), selectedLead, mapping, editedFields);
                    Object.entries(newData).forEach(([key, value]) => {
                      setValue(key as any, value);
                    });
                    setShowAutoFillNotice(true);
                  }
                }}
                placeholder="Select lead"
                searchPlaceholder="Search leads..."
                emptyMessage="No leads found"
              />
            </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name *</label>
              <Input {...register('projectName')} placeholder="Enter project name" />
              {errors.projectName && <p className="text-sm text-red-500">{errors.projectName.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer *</label>
              <Combobox
                options={customerOptions}
                value={watch('customerId') || ''}
                onValueChange={(value) => setValue('customerId', value, { shouldValidate: true })}
                placeholder="Select customer"
                searchPlaceholder="Search customers..."
                emptyMessage="No customer found"
              />
              {errors.customerId && <p className="text-sm text-red-500">{errors.customerId.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Type *</label>
              <Select onValueChange={(value) => setValue('projectType', value as any)} defaultValue={initialData?.projectType}>
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
              <Select onValueChange={(value) => setValue('priority', value as any)} defaultValue={initialData?.priority}>
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
              <Input type="number" {...register('value', { valueAsNumber: true })} placeholder="Enter project value" />
              {errors.value && <p className="text-sm text-red-500">{errors.value.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Budget (₹) *</label>
              <Input type="number" {...register('budget', { valueAsNumber: true })} placeholder="Enter budget" />
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
            <Input {...register('location')} placeholder="Enter project location" />
            {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">City *</label>
              <Input {...register('city')} placeholder="City" />
              {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">State *</label>
              <Input {...register('state')} placeholder="State" />
              {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Pincode</label>
              <Input {...register('pincode')} placeholder="Pincode" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Project Manager *</label>
            <Combobox
              options={managerOptions}
              value={projectManagerId || ''}
              onValueChange={(value) => {
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
              <Select onValueChange={(value) => setValue('structureType', value as any)} defaultValue={initialData?.structureType}>
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
              <Select onValueChange={(value) => setValue('roofType', value as any)} defaultValue={initialData?.roofType}>
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
              <Input type="number" {...register('width', { valueAsNumber: true })} placeholder="Width" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Length (m)</label>
              <Input type="number" {...register('length', { valueAsNumber: true })} placeholder="Length" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Height (m)</label>
              <Input type="number" {...register('height', { valueAsNumber: true })} placeholder="Height" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bay Spacing (m)</label>
              <Input type="number" {...register('baySpacing', { valueAsNumber: true })} placeholder="Bay spacing" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Crane System *</label>
              <Select onValueChange={(value) => setValue('craneSystem', value as any)} defaultValue={initialData?.craneSystem}>
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
              <Select onValueChange={(value) => setValue('wallType', value as any)} defaultValue={initialData?.wallType}>
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
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
});
