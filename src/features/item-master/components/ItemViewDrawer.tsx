'use client';

import { memo } from 'react';
import { ItemMaster } from '@/features/item-master/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ItemCustomFields } from './ItemCustomFields';
import { useItemConfiguration } from '@/features/item-master/hooks/useItemMaster';
import { getCategoryPath } from '@/features/item-master/data/categoryMasterData';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/core/routes';
import {
  EntityViewDrawer,
  EntityViewHeader,
  EntityViewBadges,
  EntityViewKpiStrip,
  EntityViewBody,
  EntityViewSection,
  EntityViewFieldGrid,
  EntityViewField,
  EntityViewTabs,
  EntityViewTabsList,
  EntityViewTabTrigger,
  EntityViewTabContent,
  EntityViewFooter,
} from '@/components/drawer/EntityViewDrawer';
import { ExternalLink, IndianRupee, Percent, Package, Tag } from 'lucide-react';

interface ItemViewDrawerProps {
  item: ItemMaster | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (item: ItemMaster) => void;
}

function getItemCategoryLabel(item: ItemMaster): string {
  if (item.itemTypeId) return getCategoryPath(item.itemTypeId);
  if (item.categoryId) return getCategoryPath(item.categoryId);
  if (item.subCategory && item.category) return `${item.category} > ${item.subCategory}`;
  return item.category || '-';
}

export const ItemViewDrawer = memo(function ItemViewDrawer({ item, open, onOpenChange, onEdit }: ItemViewDrawerProps) {
  const router = useRouter();
  const itemConfig = useItemConfiguration();

  if (!item) return null;

  const pebFlags = [
    item.isStructural && 'Structural',
    item.isCladding && 'Cladding',
    item.isAccessory && 'Accessory',
    item.isService && 'Service',
  ].filter((f): f is string => Boolean(f));

  return (
    <EntityViewDrawer open={open} onOpenChange={onOpenChange}>
      <EntityViewHeader
        title={item.itemName}
        subtitle={`${item.itemCode} · ${item.brand || 'No brand'}`}
        onClose={() => onOpenChange(false)}
      />

      <EntityViewBody>
        <EntityViewBadges>
          <Badge variant={item.status === 'Active' ? 'default' : item.status === 'Inactive' ? 'secondary' : 'destructive'}>
            {item.status}
          </Badge>
          {item.itemTypeClass && <Badge variant="outline">{item.itemTypeClass}</Badge>}
          {pebFlags.map((flag) => (
            <Badge key={flag} variant="secondary" className="text-[10px]">{flag}</Badge>
          ))}
        </EntityViewBadges>

        <EntityViewKpiStrip
          items={[
            {
              label: 'Default Rate',
              value: item.defaultRate != null ? `₹${item.defaultRate.toLocaleString()}` : '-',
              icon: <IndianRupee className="h-4 w-4 text-green-600" />,
              accentClassName: 'text-green-600',
            },
            {
              label: 'GST %',
              value: item.gstRate != null ? `${item.gstRate}%` : '-',
              icon: <Percent className="h-4 w-4 text-blue-600" />,
              accentClassName: 'text-blue-600',
            },
            {
              label: 'Unit',
              value: item.unit,
              icon: <Package className="h-4 w-4 text-purple-600" />,
              accentClassName: 'text-purple-600',
            },
            {
              label: 'Category',
              value: getItemCategoryLabel(item),
              icon: <Tag className="h-4 w-4 text-amber-600" />,
              accentClassName: 'text-amber-600',
            },
          ]}
        />

        <EntityViewTabs defaultValue="overview">
          <EntityViewTabsList>
            <EntityViewTabTrigger value="overview">Overview</EntityViewTabTrigger>
            <EntityViewTabTrigger value="specs">Specifications</EntityViewTabTrigger>
            <EntityViewTabTrigger value="pricing">Pricing & Tax</EntityViewTabTrigger>
            <EntityViewTabTrigger value="references">References</EntityViewTabTrigger>
          </EntityViewTabsList>

          <EntityViewTabContent value="overview">
            <EntityViewSection title="Basic Information">
              <EntityViewFieldGrid>
                <EntityViewField label="Item Code" value={<span className="font-mono">{item.itemCode}</span>} />
                <EntityViewField label="SKU" value={item.sku} />
                <EntityViewField label="Category" value={getItemCategoryLabel(item)} />
                <EntityViewField label="Brand" value={item.brand} />
                <EntityViewField label="Grade / Material" value={item.materialGrade || item.grade} />
                <EntityViewField label="HSN Code" value={item.hsnCode} />
                <EntityViewField label="Manufacturer" value={item.manufacturer} />
              </EntityViewFieldGrid>
            </EntityViewSection>

            <EntityViewSection title="Custom Fields">
              <ItemCustomFields mode="view" fields={itemConfig.customFields} values={item.customFields} />
            </EntityViewSection>

            <EntityViewSection title="Description">
              <EntityViewField label="Description" value={item.description} />
            </EntityViewSection>
          </EntityViewTabContent>

          <EntityViewTabContent value="specs">
            <EntityViewSection title="Technical Specifications">
              <EntityViewFieldGrid>
                <EntityViewField label="Specification" value={item.specification} />
                <EntityViewField label="Technical Description" value={item.technicalDescription} />
                <EntityViewField label="Weight (per unit)" value={item.weight} />
                <EntityViewField label="Thickness" value={item.thickness ?? item.standardDimensions?.thickness} />
                <EntityViewField label="Length" value={item.length ?? item.standardDimensions?.length} />
                <EntityViewField label="Width" value={item.width ?? item.standardDimensions?.width} />
              </EntityViewFieldGrid>
            </EntityViewSection>
          </EntityViewTabContent>

          <EntityViewTabContent value="pricing">
            <EntityViewSection title="Pricing & Tax">
              <EntityViewFieldGrid>
                <EntityViewField label="Default Rate" value={item.defaultRate != null ? `₹${item.defaultRate.toLocaleString()}` : '-'} />
                <EntityViewField label="GST %" value={item.gstRate} />
                <EntityViewField label="Tax Type" value={item.taxType} />
                <EntityViewField label="Currency" value={item.currency || 'INR'} />
              </EntityViewFieldGrid>
            </EntityViewSection>
          </EntityViewTabContent>

          <EntityViewTabContent value="references">
            <EntityViewSection title="Cross-Module References">
              <div className="flex flex-wrap gap-2">
                {item.inventoryItemId && (
                  <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.inventory)}>
                    View Inventory
                    <ExternalLink className="h-3 w-3 ml-1.5" />
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.itemsDetail(item.id))}>
                  Open Full Profile
                  <ExternalLink className="h-3 w-3 ml-1.5" />
                </Button>
              </div>
            </EntityViewSection>
          </EntityViewTabContent>
        </EntityViewTabs>
      </EntityViewBody>

      <EntityViewFooter onClose={() => onOpenChange(false)}>
        {onEdit && <Button onClick={() => onEdit(item)}>Edit</Button>}
      </EntityViewFooter>
    </EntityViewDrawer>
  );
});
