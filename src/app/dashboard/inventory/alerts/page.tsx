'use client';

import { MainLayout } from '@/layouts/MainLayout';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { DataTable, Column } from '@/components/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { InventoryAlert } from '@/features/inventory/types';
import { useInventoryAlerts } from '@/features/inventory/hooks/useInventory';
import {
  AlertTriangle,
  AlertOctagon,
  XCircle,
  Download,
  Package,
  ArrowUpFromLine,
  ShoppingCart,
} from 'lucide-react';

export default function AlertsPage() {
  const { data: alerts, isLoading } = useInventoryAlerts();

  const columns: Column<InventoryAlert>[] = [
    {
      key: 'itemCode',
      label: 'Item Code',
      sortable: true,
      render: (value) => <span className="font-mono text-xs">{value}</span>,
    },
    {
      key: 'itemName',
      label: 'Item Name',
      sortable: true,
      filterable: true,
      render: (_, row) => (
        <div>
          <p className="font-medium text-sm">{row.itemName}</p>
          <p className="text-xs text-muted-foreground">{row.itemCode}</p>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Alert Type',
      sortable: true,
      filterable: true,
      render: (value) => {
        const icons = {
          'Low Stock': <AlertTriangle className="h-3 w-3" />,
          'Out of Stock': <XCircle className="h-3 w-3" />,
          'Reorder Required': <ShoppingCart className="h-3 w-3" />,
          'Critical Stock': <AlertOctagon className="h-3 w-3" />,
        };
        return (
          <div className="flex items-center gap-1">
            {icons[value as keyof typeof icons]}
            <span className="text-xs">{value}</span>
          </div>
        );
      },
    },
    {
      key: 'currentStock',
      label: 'Current Stock',
      sortable: true,
      render: (value) => (
        <span className="text-xs font-medium">{Number(value).toLocaleString()}</span>
      ),
    },
    {
      key: 'threshold',
      label: 'Threshold',
      sortable: true,
      render: (value) => (
        <span className="text-xs text-muted-foreground">{Number(value).toLocaleString()}</span>
      ),
    },
    {
      key: 'severity',
      label: 'Severity',
      sortable: true,
      filterable: true,
      render: (value) => (
        <Badge
          variant={
            value === 'critical'
              ? 'destructive'
              : value === 'warning'
              ? 'warning'
              : 'default'
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value) => {
        if (!value) return <span className="text-xs text-muted-foreground">-</span>;
        const date = new Date(value);
        return (
          <span className="text-xs text-muted-foreground">
            {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <MainLayout title="Inventory Alerts" subtitle="Low stock and shortage alerts">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Loading alerts...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const criticalAlerts = alerts?.filter((a) => a.severity === 'critical') || [];
  const warningAlerts = alerts?.filter((a) => a.severity === 'warning') || [];

  const kpiCards = (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 shrink-0">
              <AlertOctagon className="h-5 w-5 text-red-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground truncate">Critical Alerts</p>
              <p className="text-2xl font-bold text-red-600">{criticalAlerts.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground truncate">Warnings</p>
              <p className="text-2xl font-bold text-amber-600">{warningAlerts.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 shrink-0">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground truncate">Out of Stock</p>
              <p className="text-2xl font-bold">
                {alerts?.filter((a) => a.type === 'Out of Stock').length || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 shrink-0">
              <ShoppingCart className="h-5 w-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground truncate">Reorder Required</p>
              <p className="text-2xl font-bold">
                {alerts?.filter((a) => a.type === 'Reorder Required').length || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );

  return (
    <MainLayout title="Inventory Alerts" subtitle="Low stock and shortage alerts">
      <StandardPageLayout
        title="Inventory Alerts"
        subtitle="Low stock and shortage alerts"
        kpiCards={kpiCards}
        kpiGridClassName="grid-cols-2 sm:grid-cols-4"
        toolbarActions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">Export</span>
            </Button>
            <Button size="sm" variant="destructive">
              <ArrowUpFromLine className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Create Purchase Requests</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </div>
        }
      >
        <DataTable
          columns={columns}
          data={alerts || []}
          rowIdKey="id"
        />
      </StandardPageLayout>
    </MainLayout>
  );
}
