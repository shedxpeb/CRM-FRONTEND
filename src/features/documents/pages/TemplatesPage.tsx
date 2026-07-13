'use client';

import { useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { DataTable } from '@/components/data-table/DataTable';
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate } from '@/features/documents/hooks/useDocuments';
import { DocumentTemplate, CreateTemplateDto, UpdateTemplateDto } from '@/features/documents/types';
import { TEMPLATE_TYPES, TEMPLATE_LAYOUTS, NUMBERING_PATTERNS } from '@/features/documents/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutTemplate, Plus, Edit, Trash2, Star } from 'lucide-react';

export function TemplatesPage() {
  const { data: templatesResponse, isLoading, refetch } = useTemplates({ page: 1, pageSize: 50 });
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
  const [formData, setFormData] = useState<Partial<CreateTemplateDto>>({
    templateType: 'Estimate',
    name: '',
    description: '',
    header: '',
    footer: '',
    termsAndConditions: '',
    layout: 'Standard',
    numberingPattern: 'Sequential',
    numberingPrefix: '',
    numberingStart: 1,
    defaultPaymentTerms: '',
    defaultDeliveryTerms: '',
    defaultValidDays: 30,
    isDefault: false,
  });

  const templates = (templatesResponse as any)?.data || [];

  const handleEditTemplate = (template: DocumentTemplate) => {
    setEditingTemplate(template);
    setFormData({
      templateType: template.templateType,
      name: template.name,
      description: template.description,
      header: template.header,
      footer: template.footer,
      termsAndConditions: template.termsAndConditions,
      layout: template.layout,
      numberingPattern: template.numberingPattern,
      numberingPrefix: template.numberingPrefix,
      numberingStart: template.numberingStart,
      defaultPaymentTerms: template.defaultPaymentTerms,
      defaultDeliveryTerms: template.defaultDeliveryTerms,
      defaultValidDays: template.defaultValidDays,
      isDefault: template.isDefault,
    });
    setIsFormDialogOpen(true);
  };

  const handleDeleteTemplate = async (template: DocumentTemplate) => {
    if (confirm(`Are you sure you want to delete ${template.name}?`)) {
      await deleteTemplate.mutateAsync(template.id);
      refetch();
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      await updateTemplate.mutateAsync({ id: editingTemplate.id, data: formData as UpdateTemplateDto });
    } else {
      await createTemplate.mutateAsync(formData as CreateTemplateDto);
    }
    setIsFormDialogOpen(false);
    setEditingTemplate(null);
    setFormData({
      templateType: 'Estimate',
      name: '',
      description: '',
      header: '',
      footer: '',
      termsAndConditions: '',
      layout: 'Standard',
      numberingPattern: 'Sequential',
      numberingPrefix: '',
      numberingStart: 1,
      defaultPaymentTerms: '',
      defaultDeliveryTerms: '',
      defaultValidDays: 30,
      isDefault: false,
    });
    refetch();
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setFormData({
      templateType: 'Estimate',
      name: '',
      description: '',
      header: '',
      footer: '',
      termsAndConditions: '',
      layout: 'Standard',
      numberingPattern: 'Sequential',
      numberingPrefix: '',
      numberingStart: 1,
      defaultPaymentTerms: '',
      defaultDeliveryTerms: '',
      defaultValidDays: 30,
      isDefault: false,
    });
    setIsFormDialogOpen(true);
  };

  const columns = [
    {
      key: 'templateCode',
      label: 'Template Code',
      sortable: true,
    },
    {
      key: 'name',
      label: 'Template Name',
      sortable: true,
    },
    {
      key: 'templateType',
      label: 'Type',
      sortable: true,
      render: (value: string) => (
        <Badge variant="secondary">{value}</Badge>
      ),
    },
    {
      key: 'layout',
      label: 'Layout',
      sortable: true,
    },
    {
      key: 'numberingPattern',
      label: 'Numbering',
      sortable: true,
    },
    {
      key: 'isDefault',
      label: 'Default',
      sortable: true,
      render: (value: boolean) => (
        value ? <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> : null
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'usageCount',
      label: 'Usage',
      sortable: true,
      render: (value: number) => `${value} times`,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: DocumentTemplate) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleEditTemplate(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => handleDeleteTemplate(row)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout title="Templates" subtitle="Manage document templates">
      <StandardPageLayout
        title="Templates"
        subtitle="Manage document templates"
        kpiCards={
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 shrink-0">
                  <LayoutTemplate className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground truncate">Total Templates</p>
                  <p className="text-2xl font-bold">{templates.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        }
        kpiGridClassName="grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
        toolbarActions={
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Template</span>
            <span className="sm:hidden">New</span>
          </Button>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5" />
              All Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={templates}
              columns={columns as any}
              loading={isLoading}
              emptyMessage="No templates found"
            />
          </CardContent>
        </Card>
      </StandardPageLayout>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Template Type *</label>
                <Select
                  value={formData.templateType}
                  onValueChange={(value) => setFormData({ ...formData, templateType: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Template Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter template name"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter template description"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Layout *</label>
                <Select
                  value={formData.layout}
                  onValueChange={(value) => setFormData({ ...formData, layout: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_LAYOUTS.map((layout) => (
                      <SelectItem key={layout.value} value={layout.value}>
                        {layout.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Numbering Pattern *</label>
                <Select
                  value={formData.numberingPattern}
                  onValueChange={(value) => setFormData({ ...formData, numberingPattern: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NUMBERING_PATTERNS.map((pattern) => (
                      <SelectItem key={pattern.value} value={pattern.value}>
                        {pattern.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Numbering Prefix</label>
                <Input
                  value={formData.numberingPrefix}
                  onChange={(e) => setFormData({ ...formData, numberingPrefix: e.target.value })}
                  placeholder="e.g., EST, PRO, QUO"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Numbering Start</label>
                <Input
                  type="number"
                  value={formData.numberingStart}
                  onChange={(e) => setFormData({ ...formData, numberingStart: parseInt(e.target.value) })}
                  placeholder="1"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Valid Days</label>
                <Input
                  type="number"
                  value={formData.defaultValidDays}
                  onChange={(e) => setFormData({ ...formData, defaultValidDays: parseInt(e.target.value) })}
                  placeholder="30"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Header</label>
                <textarea
                  className="w-full min-h-[60px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                  placeholder="Enter header content"
                  value={formData.header}
                  onChange={(e) => setFormData({ ...formData, header: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Footer</label>
                <textarea
                  className="w-full min-h-[60px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                  placeholder="Enter footer content"
                  value={formData.footer}
                  onChange={(e) => setFormData({ ...formData, footer: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Terms and Conditions</label>
                <textarea
                  className="w-full min-h-[120px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                  placeholder="Enter terms and conditions"
                  value={formData.termsAndConditions}
                  onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTemplate.isPending || updateTemplate.isPending}>
                {createTemplate.isPending || updateTemplate.isPending ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
