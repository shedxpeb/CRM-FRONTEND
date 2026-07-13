'use client';

import { memo, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CategorySelector } from '@/features/item-master/components/CategorySelector';
import { ItemCustomFields } from '@/features/item-master/components/ItemCustomFields';
import { getCategoryById } from '@/features/item-master/data/categoryMasterData';
import {
  useCreateItemMaster,
  useItemConfiguration,
  useItemMasters,
} from '@/features/item-master/hooks/useItemMaster';
import { generateItemCode } from '@/features/item-master/utils/generateItemCode';
import {
  CreateItemMasterDto,
  ItemCustomFieldValues,
  ItemMaster,
  ItemStatus,
  ItemTypeClass,
  TaxType,
  UnitType,
} from '@/features/item-master/types';

type FormErrors = Record<string, string>;

const ITEM_TYPE_CLASSES: ItemTypeClass[] = [
  'Structural',
  'Cladding',
  'Accessory',
  'Service',
  'Other',
];

const TAX_TYPE_OPTIONS: { value: TaxType; label: string }[] = [
  { value: 'CGST_SGST', label: 'CGST + SGST' },
  { value: 'IGST', label: 'IGST' },
  { value: 'Exempt', label: 'Exempt' },
];

const UNIT_OPTIONS: UnitType[] = [
  'KG',
  'MT',
  'PCS',
  'NOS',
  'SQM',
  'SQFT',
  'M',
  'FT',
  'LTR',
  'SET',
  'BUNDLE',
];

export interface ItemFormProps {
  mode: 'create' | 'edit';
  initialData?: ItemMaster;
  onSubmit: (data: Partial<ItemMaster>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function parseOptionalNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const num = parseFloat(value);
  return isNaN(num) ? NaN : num;
}

export const ItemForm = memo(function ItemForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: ItemFormProps) {
  const createMutation = useCreateItemMaster();
  const { data: existingItems = [] } = useItemMasters();
  const { customFields: customFieldDefinitions } = useItemConfiguration();
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    itemCode: initialData?.itemCode || '',
    sku: initialData?.sku || '',
    itemName: initialData?.itemName || '',
    category: initialData?.category || '',
    subCategory: initialData?.subCategory || '',
    categoryId: initialData?.categoryId || '',
    subcategoryId: initialData?.subcategoryId || '',
    itemTypeId: initialData?.itemTypeId || '',
    brand: initialData?.brand || '',
    grade: initialData?.grade || '',
    unit: initialData?.unit || ('PCS' as UnitType),
    defaultRate: initialData?.defaultRate?.toString() || '',
    gstRate: initialData?.gstRate?.toString() || '18',
    hsnCode: initialData?.hsnCode || '',
    description: initialData?.description || '',
    specification: initialData?.specification || '',
    technicalDescription: initialData?.technicalDescription || '',
    weight: initialData?.weight?.toString() || '',
    status: initialData?.status || ('Active' as ItemStatus),
    manufacturer: initialData?.manufacturer || '',
    countryOfOrigin: initialData?.countryOfOrigin || '',
    notes: initialData?.notes || '',
    internalNotes: initialData?.internalNotes || '',
    itemTypeClass: initialData?.itemTypeClass || ('' as ItemTypeClass | ''),
    taxType: initialData?.taxType || ('' as TaxType | ''),
    materialGrade: initialData?.materialGrade || '',
    thickness:
      initialData?.thickness?.toString() ||
      initialData?.standardDimensions?.thickness?.toString() ||
      '',
    length:
      initialData?.length?.toString() ||
      initialData?.standardDimensions?.length?.toString() ||
      '',
    width:
      initialData?.width?.toString() ||
      initialData?.standardDimensions?.width?.toString() ||
      '',
    isStructural: initialData?.isStructural ?? false,
    isCladding: initialData?.isCladding ?? false,
    isAccessory: initialData?.isAccessory ?? false,
    isService: initialData?.isService ?? false,
  });
  const [customFields, setCustomFields] = useState<ItemCustomFieldValues>(
    initialData?.customFields ?? {}
  );

  const pending = createMutation.isPending || isSubmitting;

  useEffect(() => {
    if (mode !== 'create' || !formData.categoryId) return;
    const nextCode = generateItemCode(formData.categoryId, existingItems);
    setFormData((prev) =>
      prev.itemCode === nextCode ? prev : { ...prev, itemCode: nextCode }
    );
  }, [mode, formData.categoryId, existingItems]);

  const validatePositiveNumber = (
    next: FormErrors,
    key: string,
    value: string,
    label: string
  ) => {
    if (!value) return;
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
      next[key] = `${label} must be a valid positive number.`;
    }
  };

  const validate = (): boolean => {
    const next: FormErrors = {};

    if (!formData.itemName.trim()) {
      next.itemName = 'Item name is required.';
    }

    if (!formData.categoryId && !formData.category) {
      next.category = 'Category is required.';
    }

    if (!formData.unit) {
      next.unit = 'Unit is required.';
    }

    validatePositiveNumber(next, 'defaultRate', formData.defaultRate, 'Default rate');

    const gstRateNum = parseFloat(formData.gstRate);
    if (formData.gstRate && (isNaN(gstRateNum) || gstRateNum < 0 || gstRateNum > 100)) {
      next.gstRate = 'GST rate must be between 0 and 100.';
    }

    validatePositiveNumber(next, 'weight', formData.weight, 'Weight');
    validatePositiveNumber(next, 'thickness', formData.thickness, 'Thickness');
    validatePositiveNumber(next, 'length', formData.length, 'Length');
    validatePositiveNumber(next, 'width', formData.width, 'Width');

    for (const field of customFieldDefinitions) {
      if (!field.required) continue;
      const value = customFields[field.key];
      if (value === undefined || value === null || value === '') {
        next[`customFields.${field.key}`] = `${field.label} is required.`;
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const defaultRateNum = parseOptionalNumber(formData.defaultRate);
    const gstRateNum = parseOptionalNumber(formData.gstRate);
    const weightNum = parseOptionalNumber(formData.weight);
    const thicknessNum = parseOptionalNumber(formData.thickness);
    const lengthNum = parseOptionalNumber(formData.length);
    const widthNum = parseOptionalNumber(formData.width);

    const mainCategory = formData.categoryId ? getCategoryById(formData.categoryId) : undefined;
    const resolvedItemCode =
      mode === 'create'
        ? formData.itemCode ||
          (formData.categoryId
            ? generateItemCode(formData.categoryId, existingItems)
            : '')
        : formData.itemCode;

    const submitData: Partial<ItemMaster> = {
      sku: resolvedItemCode,
      itemCode: resolvedItemCode,
      itemName: formData.itemName,
      category: mainCategory?.name || formData.category,
      subCategory: formData.subCategory || undefined,
      categoryId: formData.categoryId || undefined,
      subcategoryId: formData.subcategoryId || undefined,
      itemTypeId: formData.itemTypeId || undefined,
      brand: formData.brand || undefined,
      grade: formData.grade || undefined,
      unit: formData.unit,
      defaultRate: defaultRateNum,
      gstRate: gstRateNum,
      hsnCode: formData.hsnCode || undefined,
      description: formData.description || undefined,
      specification: formData.specification || undefined,
      technicalDescription: formData.technicalDescription || undefined,
      weight: weightNum,
      status: formData.status,
      manufacturer: formData.manufacturer || undefined,
      countryOfOrigin: formData.countryOfOrigin || undefined,
      notes: formData.notes || undefined,
      internalNotes: formData.internalNotes || undefined,
      itemTypeClass: formData.itemTypeClass || undefined,
      taxType: formData.taxType || undefined,
      materialGrade: formData.materialGrade || undefined,
      isStructural: formData.isStructural,
      isCladding: formData.isCladding,
      isAccessory: formData.isAccessory,
      isService: formData.isService,
      thickness: thicknessNum,
      length: lengthNum,
      width: widthNum,
      customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
    };

    if (mode === 'create') {
      createMutation.mutate(submitData as CreateItemMasterDto, {
        onSuccess: () => onSubmit(submitData),
      });
    } else {
      onSubmit(submitData);
    }
  };

  const fieldError = (key: string) =>
    errors[key] ? <p className="text-xs text-red-500 mt-1">{errors[key]}</p> : null;

  const handleCustomFieldChange = (key: string, value: string | number | boolean) => {
    setCustomFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`customFields.${key}`];
      return next;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <CategorySelector
              onCategoryChange={(categoryId, itemTypeId, itemName, categoryPath) => {
                const itemType = itemTypeId ? getCategoryById(itemTypeId) : undefined;
                setFormData((prev) => ({
                  ...prev,
                  categoryId,
                  itemTypeId: itemTypeId || '',
                  itemName: itemName || prev.itemName,
                  category: categoryPath || '',
                  subcategoryId: itemType?.id || prev.subcategoryId,
                }));
                setErrors((prev) => ({ ...prev, category: '' }));
              }}
              initialCategoryId={initialData?.categoryId}
              initialItemTypeId={initialData?.itemTypeId}
              initialItemName={initialData?.itemName}
            />
            {fieldError('category')}
          </div>

          {mode === 'create' && formData.itemCode && (
            <div>
              <Label htmlFor="itemCodePreview">Item Code</Label>
              <Input
                id="itemCodePreview"
                value={formData.itemCode}
                readOnly
                className="bg-muted/50 font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Auto-generated from category. Managed by the system.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="itemName">Item Name *</Label>
              <Input
                id="itemName"
                value={formData.itemName}
                onChange={(e) => {
                  setFormData({ ...formData, itemName: e.target.value });
                  setErrors((prev) => ({ ...prev, itemName: '' }));
                }}
                placeholder="Product name"
              />
              {fieldError('itemName')}
            </div>
            <div>
              <Label htmlFor="unit">Unit *</Label>
              <Select
                value={formData.unit}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, unit: value as UnitType })
                }
              >
                <SelectTrigger id="unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldError('unit')}
            </div>
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g., TATA Steel"
              />
            </div>
            <div>
              <Label htmlFor="grade">Grade</Label>
              <Input
                id="grade"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                placeholder="e.g., IS 2062 Grade A"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, status: value as ItemStatus })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">PEB Classification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="itemTypeClass">Item Type Class</Label>
              <Select
                value={formData.itemTypeClass || undefined}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, itemTypeClass: value as ItemTypeClass })
                }
              >
                <SelectTrigger id="itemTypeClass">
                  <SelectValue placeholder="Select type class" />
                </SelectTrigger>
                <SelectContent>
                  {ITEM_TYPE_CLASSES.map((typeClass) => (
                    <SelectItem key={typeClass} value={typeClass}>
                      {typeClass}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="taxType">Tax Type</Label>
              <Select
                value={formData.taxType || undefined}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, taxType: value as TaxType })
                }
              >
                <SelectTrigger id="taxType">
                  <SelectValue placeholder="Select tax type" />
                </SelectTrigger>
                <SelectContent>
                  {TAX_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="materialGrade">Material Grade</Label>
              <Input
                id="materialGrade"
                value={formData.materialGrade}
                onChange={(e) => setFormData({ ...formData, materialGrade: e.target.value })}
                placeholder="e.g., IS 2062 Grade A"
              />
            </div>
            <div>
              <Label htmlFor="thickness">Thickness</Label>
              <Input
                id="thickness"
                type="number"
                min="0"
                step="0.01"
                value={formData.thickness}
                onChange={(e) => setFormData({ ...formData, thickness: e.target.value })}
                placeholder="e.g., 6"
              />
              {fieldError('thickness')}
            </div>
            <div>
              <Label htmlFor="length">Length</Label>
              <Input
                id="length"
                type="number"
                min="0"
                step="0.01"
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                placeholder="e.g., 6000"
              />
              {fieldError('length')}
            </div>
            <div>
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                min="0"
                step="0.01"
                value={formData.width}
                onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                placeholder="e.g., 1500"
              />
              {fieldError('width')}
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={formData.isStructural}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isStructural: checked === true })
                }
              />
              Structural
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={formData.isCladding}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isCladding: checked === true })
                }
              />
              Cladding
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={formData.isAccessory}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isAccessory: checked === true })
                }
              />
              Accessory
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={formData.isService}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isService: checked === true })
                }
              />
              Service
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Pricing & Tax</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="defaultRate">Default Rate (₹)</Label>
            <Input
              id="defaultRate"
              type="number"
              min="0"
              step="0.01"
              value={formData.defaultRate}
              onChange={(e) => setFormData({ ...formData, defaultRate: e.target.value })}
              placeholder="e.g., 5500"
            />
            {fieldError('defaultRate')}
          </div>
          <div>
            <Label htmlFor="gstRate">GST Rate (%)</Label>
            <Input
              id="gstRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.gstRate}
              onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
              placeholder="e.g., 18"
            />
            {fieldError('gstRate')}
          </div>
          <div>
            <Label htmlFor="hsnCode">HSN Code</Label>
            <Input
              id="hsnCode"
              value={formData.hsnCode}
              onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
              placeholder="e.g., 7208"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Physical & Origin</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="weight">Weight (per unit)</Label>
            <Input
              id="weight"
              type="number"
              min="0"
              step="0.01"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="e.g., 47.1"
            />
            {fieldError('weight')}
          </div>
          <div>
            <Label htmlFor="manufacturer">Manufacturer</Label>
            <Input
              id="manufacturer"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              placeholder="e.g., TATA Steel"
            />
          </div>
          <div>
            <Label htmlFor="countryOfOrigin">Country of Origin</Label>
            <Input
              id="countryOfOrigin"
              value={formData.countryOfOrigin}
              onChange={(e) => setFormData({ ...formData, countryOfOrigin: e.target.value })}
              placeholder="e.g., India"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="specification">Specification</Label>
            <Textarea
              id="specification"
              value={formData.specification}
              onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="technicalDescription">Technical Description</Label>
            <Textarea
              id="technicalDescription"
              value={formData.technicalDescription}
              onChange={(e) =>
                setFormData({ ...formData, technicalDescription: e.target.value })
              }
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="internalNotes">Internal Notes</Label>
            <Textarea
              id="internalNotes"
              value={formData.internalNotes}
              onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {customFieldDefinitions.length > 0 && (
        <div className="space-y-2">
          <ItemCustomFields
            mode="form"
            fields={customFieldDefinitions}
            values={customFields}
            onChange={handleCustomFieldChange}
          />
          {customFieldDefinitions.map(
            (field) =>
              errors[`customFields.${field.key}`] && (
                <p key={field.key} className="text-xs text-red-500">
                  {errors[`customFields.${field.key}`]}
                </p>
              )
          )}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Update Product'}
        </Button>
      </div>
    </form>
  );
});
