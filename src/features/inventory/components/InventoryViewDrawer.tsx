'use client';

import { memo } from 'react';
import { InventoryItem } from '@/features/inventory/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InventoryCustomFields } from './InventoryCustomFields';
import { useInventoryConfiguration } from '@/features/inventory/hooks/useInventory';
import { getStockStatusVariant } from '@/features/inventory/constants';
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
  formatDrawerDate,
} from '@/components/drawer/EntityViewDrawer';
import { ExternalLink, Package, Lock, CheckCircle, IndianRupee, Warehouse } from 'lucide-react';

interface InventoryViewDrawerProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (item: InventoryItem) => void;
}

export const InventoryViewDrawer = memo(function InventoryViewDrawer({ item, open, onOpenChange, onEdit }: InventoryViewDrawerProps) {
  const router = useRouter();
  const inventoryConfig = useInventoryConfiguration();

  if (!item) return null;

  const needsReorder = item.currentStock <= item.reorderLevel;

  return (
    <EntityViewDrawer open={open} onOpenChange={onOpenChange}>
      <EntityViewHeader
        title={item.itemName}
        subtitle={`${item.itemCode} · ${item.warehouseName}`}
        onClose={() => onOpenChange(false)}
      />

      <EntityViewBody>
        <EntityViewBadges>
          <Badge variant={getStockStatusVariant(item.status)}>{item.status}</Badge>
          {item.itemTypeClass && <Badge variant="outline">{item.itemTypeClass}</Badge>}
          {needsReorder && <Badge variant="destructive">Reorder Required</Badge>}
        </EntityViewBadges>

        <EntityViewKpiStrip
          items={[
            {
              label: 'Current Stock',
              value: `${Number(item.currentStock).toLocaleString()} ${item.unit}`,
              icon: <Package className="h-4 w-4 text-blue-600" />,
              accentClassName: 'text-blue-600',
            },
            {
              label: 'Available',
              value: `${Number(item.availableStock).toLocaleString()} ${item.unit}`,
              icon: <CheckCircle className="h-4 w-4 text-green-600" />,
              accentClassName: 'text-green-600',
            },
            {
              label: 'Reserved',
              value: `${Number(item.reservedStock).toLocaleString()} ${item.unit}`,
              icon: <Lock className="h-4 w-4 text-purple-600" />,
              accentClassName: 'text-purple-600',
            },
            {
              label: 'Total Value',
              value: `₹${Number(item.totalValue).toLocaleString()}`,
              icon: <IndianRupee className="h-4 w-4 text-emerald-600" />,
              accentClassName: 'text-emerald-600',
            },
          ]}
        />

        <EntityViewTabs defaultValue="overview">
          <EntityViewTabsList>
            <EntityViewTabTrigger value="overview">Overview</EntityViewTabTrigger>
            <EntityViewTabTrigger value="stock">Stock</EntityViewTabTrigger>
            <EntityViewTabTrigger value="warehouse">Warehouse</EntityViewTabTrigger>
            <EntityViewTabTrigger value="reorder">Reorder</EntityViewTabTrigger>
            <EntityViewTabTrigger value="references">References</EntityViewTabTrigger>
          </EntityViewTabsList>

          <EntityViewTabContent value="overview">
            <EntityViewSection title="Item Reference (Read-only)">
              <EntityViewFieldGrid>
                <EntityViewField label="Item Code" value={<span className="font-mono text-xs">{item.itemCode}</span>} />
                <EntityViewField label="Item Master ID" value={item.itemMasterId} />
                <EntityViewField label="Category" value={item.category} />
                <EntityViewField label="Brand" value={item.brand} />
                <EntityViewField label="Unit" value={item.unit} />
                <EntityViewField
                  label="Last Movement"
                  value={item.lastMovementDate ? formatDrawerDate(item.lastMovementDate) : '-'}
                />
              </EntityViewFieldGrid>
            </EntityViewSection>

            <EntityViewSection title="Custom Fields">
              <InventoryCustomFields mode="view" fields={inventoryConfig.customFields} values={item.customFields} />
            </EntityViewSection>
          </EntityViewTabContent>

          <EntityViewTabContent value="stock">
            <EntityViewSection title="Stock Metrics">
              <EntityViewFieldGrid>
                <EntityViewField label="Current Stock" value={`${Number(item.currentStock).toLocaleString()} ${item.unit}`} />
                <EntityViewField label="Reserved Stock" value={`${Number(item.reservedStock).toLocaleString()} ${item.unit}`} />
                <EntityViewField label="Available Stock" value={`${Number(item.availableStock).toLocaleString()} ${item.unit}`} />
                <EntityViewField label="Issued Stock" value={`${Number(item.issuedStock).toLocaleString()} ${item.unit}`} />
                <EntityViewField label="Incoming Stock" value={`${Number(item.incomingStock ?? 0).toLocaleString()} ${item.unit}`} />
                <EntityViewField label="Outgoing Stock" value={`${Number(item.outgoingStock ?? 0).toLocaleString()} ${item.unit}`} />
              </EntityViewFieldGrid>
            </EntityViewSection>

            <EntityViewSection title="Valuation">
              <EntityViewFieldGrid>
                <EntityViewField label="Purchase Rate" value={item.purchaseRate != null ? `₹${item.purchaseRate.toLocaleString()}` : '-'} />
                <EntityViewField label="Total Value" value={`₹${Number(item.totalValue).toLocaleString()}`} />
              </EntityViewFieldGrid>
            </EntityViewSection>
          </EntityViewTabContent>

          <EntityViewTabContent value="warehouse">
            <EntityViewSection title="Warehouse Information" icon={<Warehouse className="h-4 w-4" />}>
              <EntityViewFieldGrid>
                <EntityViewField label="Warehouse" value={item.warehouseName} />
                <EntityViewField label="Bin Location" value={item.binLocation} />
              </EntityViewFieldGrid>
            </EntityViewSection>
          </EntityViewTabContent>

          <EntityViewTabContent value="reorder">
            <EntityViewSection title="Reorder Settings">
              <EntityViewFieldGrid>
                <EntityViewField label="Minimum Stock" value={`${Number(item.minimumStock).toLocaleString()} ${item.unit}`} />
                <EntityViewField label="Reorder Level" value={`${Number(item.reorderLevel).toLocaleString()} ${item.unit}`} />
                <EntityViewField label="Reorder Quantity" value={`${Number(item.reorderQuantity ?? 0).toLocaleString()} ${item.unit}`} />
                <EntityViewField label="Safety Stock" value={`${Number(item.safetyStock).toLocaleString()} ${item.unit}`} />
              </EntityViewFieldGrid>
            </EntityViewSection>
          </EntityViewTabContent>

          <EntityViewTabContent value="references">
            <EntityViewSection title="Cross-Module References">
              <div className="flex flex-wrap gap-2">
                {item.itemMasterId && (
                  <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.items)}>
                    View Item Master
                    <ExternalLink className="h-3 w-3 ml-1.5" />
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.inventoryDetail(item.id))}>
                  Open Full Profile
                  <ExternalLink className="h-3 w-3 ml-1.5" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.finance)}>
                  Finance
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
