'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Combobox } from '@/components/ui/combobox';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Save,
  X,
  Info,
  CheckCircle2,
  XCircle,
  Building2,
  User,
} from 'lucide-react';
import { 
  Estimate, 
  MaterialSelection, 
  ScopeConfiguration, 
  TechnicalSpecifications,
  CommercialItemConfig,
  DEFAULT_COMMERICAL_CONFIGS,
  CreateEstimateDto,
} from '../types/peb-commercial';
import { 
  PEBMaterialCategory, 
} from '../../inventory/types/peb-inventory';
import { useCustomers } from '@/features/customers/hooks/useCustomers';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useItemMasters } from '@/features/item-master/hooks/useItemMaster';
import { useCustomerAutofill } from '../hooks/useCustomerAutofill';
import { ItemMaster, ItemCategory } from '@/features/item-master/types';
import { ItemPicker } from './ItemPicker';
import { ScopeConfigurationEditor } from './ScopeConfigurationEditor';
import { TechnicalSpecsForm } from './TechnicalSpecsForm';
import { EstimateHeaderForm } from './EstimateHeaderForm';

interface EstimateBuilderProps {
  estimate?: Estimate;
  lead?: {
    id: string;
    leadId: string;
    customerId?: string;
    customerName: string;
    companyName: string;
  };
  onSave: (estimate: CreateEstimateDto) => void;
  onCancel: () => void;
}

export function EstimateBuilder({
  estimate,
  lead,
  onSave,
  onCancel,
}: EstimateBuilderProps) {
  // Customer and Project Selection
  const { data: customersData, isLoading: customersLoading } = useCustomers({ page: 1, pageSize: 100 });
  const { data: projectsData, isLoading: projectsLoading } = useProjects({ page: 1, pageSize: 100 });
  const customers = customersData?.data?.rows || [];
  const projects = projectsData?.data?.rows || [];
  const [selectedCustomerId, setSelectedCustomerId] = useState(estimate?.customerId || lead?.customerId || '');
  const [selectedCustomerName, setSelectedCustomerName] = useState(estimate?.customerName || lead?.companyName || lead?.customerName || '');
  const [selectedProjectId, setSelectedProjectId] = useState(estimate?.projectId || '');

  // Smart Autofill - fetch customer data and last quotation
  const autofillData = useCustomerAutofill(selectedCustomerId);

  // Material Selection State
  const [materialSelections, setMaterialSelections] = useState<MaterialSelection[]>(
    estimate?.materialSelections || []
  );
  
  // Scope Configuration State
  const [scopeConfiguration, setScopeConfiguration] = useState<ScopeConfiguration>(
    estimate?.scopeConfiguration || {
      labour: DEFAULT_COMMERICAL_CONFIGS.labour,
      installation: DEFAULT_COMMERICAL_CONFIGS.installation,
      transportation: DEFAULT_COMMERICAL_CONFIGS.transportation,
      crane: DEFAULT_COMMERICAL_CONFIGS.crane,
      civilWork: DEFAULT_COMMERICAL_CONFIGS.civil_work,
      accommodation: DEFAULT_COMMERICAL_CONFIGS.accommodation,
      erection: DEFAULT_COMMERICAL_CONFIGS.erection,
      freight: DEFAULT_COMMERICAL_CONFIGS.freight,
      additionalServices: [],
    }
  );
  
  // Technical Specifications State
  const [technicalSpecs, setTechnicalSpecs] = useState<TechnicalSpecifications>(
    estimate?.technicalSpecifications || {}
  );
  
  // Inclusions/Exclusions State (simplified to textarea like Lovable)
  const [inclusions, setInclusions] = useState(estimate?.inclusions.join('\n') || '');
  const [exclusions, setExclusions] = useState(estimate?.exclusions.join('\n') || '');
  
  // Options
  const [includePricing, setIncludePricing] = useState(estimate?.includePricing || false);
  const [notes, setNotes] = useState(estimate?.notes || '');
  const [internalNotes, setInternalNotes] = useState(estimate?.internalNotes || '');

  // UI State
  const [activeTab, setActiveTab] = useState('materials');
  
  // Validation State
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Error State
  const [error, setError] = useState<string | null>(null);
  
  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Customer is required
    if (!selectedCustomerId) {
      errors.customer = 'Customer is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  
  const updateScopeConfig = (key: keyof ScopeConfiguration, config: CommercialItemConfig) => {
    setScopeConfiguration({ ...scopeConfiguration, [key]: config });
  };
  
  const handleSave = () => {
    try {
      // Clear previous errors
      setError(null);
      
      // Validate form before saving
      if (!validateForm()) {
        return;
      }

      const estimateDto: CreateEstimateDto = {
        customerId: selectedCustomerId,
        leadId: estimate?.leadId,
        projectId: selectedProjectId,
        includePricing,
        materialSelections,
        scopeConfiguration,
        technicalSpecifications: technicalSpecs,
        inclusions: inclusions.split('\n').map(s => s.trim()).filter(Boolean),
        exclusions: exclusions.split('\n').map(s => s.trim()).filter(Boolean),
        notes,
        internalNotes,
      };

      onSave(estimateDto);
    } catch (err) {
      setError('Failed to save estimate. Please try again.');
    }
  };
  
  const calculateTotal = () => {
    if (!includePricing) return 0;
    return materialSelections.reduce((sum, m) => sum + (m.amount || 0), 0);
  };
  
  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <XCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Estimate Builder</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Customer: {selectedCustomerName || 'Not selected'} | {includePricing ? 'With Pricing' : 'Material Selection Only'}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={onCancel} className="flex-1 sm:flex-none h-8 sm:h-9 text-xs">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!selectedCustomerId} className="flex-1 sm:flex-none h-8 sm:h-9 text-xs">
            <Save className="h-3.5 w-3.5 mr-1.5" />
            <span className="hidden sm:inline">Save Estimate</span>
            <span className="sm:hidden">Save</span>
          </Button>
        </div>
      </div>

      {/* Customer and Project Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer & Project</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <div>
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer *
              </Label>
              {customersLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground h-9">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Loading customers...
                </div>
              ) : customers.length === 0 ? (
                <div className="text-sm text-muted-foreground h-9 flex items-center">
                  No customers available. Please add customers first.
                </div>
              ) : (
              <Combobox
                options={customers.map((c: any) => ({
                  value: c.id,
                  label: `${c.customerName}${c.companyName ? ` (${c.companyName})` : ''}`,
                }))}
                value={selectedCustomerId}
                onValueChange={(value) => {
                  setSelectedCustomerId(value);
                  const customer = customers?.find((c: any) => c.id === value);
                  setSelectedCustomerName(customer?.customerName || '');
                  if (value) {
                    setValidationErrors(prev => {
                      const { customer, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                placeholder="Select customer"
                searchPlaceholder="Search customers..."
                emptyMessage="No customer found"
              />
              )}
              {validationErrors.customer && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.customer}</p>
              )}
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Project (Optional)
              </Label>
              {projectsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground h-9">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Loading projects...
                </div>
              ) : projects.length === 0 ? (
                <div className="text-sm text-muted-foreground h-9 flex items-center">
                  No projects available.
                </div>
              ) : (
              <Combobox
                options={[
                  { value: '', label: 'None' },
                  ...projects.map((p: any) => ({
                    value: p.id,
                    label: `${p.projectName}${p.customerName ? ` - ${p.customerName}` : ''}`,
                  }))
                ]}
                value={selectedProjectId}
                onValueChange={setSelectedProjectId}
                placeholder="Select project (optional)"
                searchPlaceholder="Search projects..."
                emptyMessage="No project found"
              />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Estimate Header Form */}
      <EstimateHeaderForm
        value={{
          projectName: estimate?.projectName || '',
          contactPersonName: estimate?.contactPersonName || '',
          salesExecutive: estimate?.salesExecutive || '',
          validTill: estimate?.validTill || new Date(Date.now() + 30 * 86400000).toISOString(),
          version: estimate?.version || 1,
        }}
        onChange={(header) => {
          // Header changes would be handled in a real implementation
        }}
        customerName={selectedCustomerName}
        leadNumber={estimate?.leadNumber}
      />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="materials" className="text-xs sm:text-sm">
            Items {materialSelections.length > 0 && (
              <span className="ml-1 text-[10px] text-muted-foreground">({materialSelections.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="scope" className="text-xs sm:text-sm">Scope</TabsTrigger>
          <TabsTrigger value="technical" className="text-xs sm:text-sm">Tech specs</TabsTrigger>
          <TabsTrigger value="notes" className="text-xs sm:text-sm">Notes</TabsTrigger>
        </TabsList>
        
        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-3">
          <ItemPicker
            value={materialSelections}
            onChange={setMaterialSelections}
          />
        </TabsContent>
        
        {/* Scope Tab */}
        <TabsContent value="scope" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scope Configuration</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure commercial properties for scope items (Labour, Installation, etc.). Use State to include/exclude items and Requirement to mark them as required or optional.
              </p>
            </CardHeader>
            <CardContent>
              <ScopeConfigurationEditor
                value={scopeConfiguration}
                onChange={setScopeConfiguration}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Technical Tab */}
        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <TechnicalSpecsForm
                value={technicalSpecs}
                onChange={setTechnicalSpecs}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-3">
          <div>
            <Label className="text-xs">Inclusions (one per line)</Label>
            <Textarea value={inclusions} onChange={(e) => setInclusions(e.target.value)} rows={3} />
          </div>
          <div>
            <Label className="text-xs">Exclusions (one per line)</Label>
            <Textarea value={exclusions} onChange={(e) => setExclusions(e.target.value)} rows={3} />
          </div>
          <div>
            <Label className="text-xs">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
