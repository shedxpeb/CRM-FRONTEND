'use client';

import { useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  Building,
  Package,
  FolderKanban,
  CheckSquare,
  Boxes,
  Warehouse,
  Wallet,
  DollarSign,
  Calculator,
  FileText,
  FileSpreadsheet,
  ScrollText,
  ReceiptText,
  ShoppingCart,
  Truck,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import type { ModuleName } from '@/features/settings/types';
import { MODULES } from '@/features/settings/constants/settingsConstants';

export type NavigationRole = 'owner' | 'admin' | 'employee';

export interface NavigationItem {
  title: string;
  /** Optional: group/parent headers (e.g. Inventory, Finance) have no own page. */
  href?: string;
  icon: LucideIcon;
  roles: NavigationRole[];
  moduleId?: ModuleName;
  /** Nested navigation children. Presence makes this an expandable parent. */
  children?: NavigationItem[];
}

/**
 * Per-module navigation metadata. Titles here are the labels shown in the
 * sidebar (overriding the module displayName) so that grouped modules read
 * naturally under their parent (e.g. "Items", "Stock", "Operations").
 */
const MODULE_NAV_MAP: Partial<
  Record<ModuleName, { href: string; icon: LucideIcon; title?: string; roles: NavigationRole[] }>
> = {
  leads: { href: '/dashboard/leads', icon: Users, roles: ['owner', 'admin', 'employee'] },
  customers: { href: '/dashboard/customers', icon: Building, roles: ['owner', 'admin', 'employee'] },
  items: { href: '/dashboard/item', icon: Package, title: 'Items', roles: ['owner', 'admin', 'employee'] },
  projects: { href: '/dashboard/projects', icon: FolderKanban, roles: ['owner', 'admin', 'employee'] },
  inventory: { href: '/dashboard/inventory', icon: Warehouse, title: 'Stock', roles: ['owner', 'admin'] },
  finance: { href: '/dashboard/finance', icon: DollarSign, title: 'Operations', roles: ['owner', 'admin'] },
  accounting: { href: '/dashboard/accounting', icon: Calculator, title: 'Accounting', roles: ['owner', 'admin'] },
  documents: { href: '/dashboard/documents', icon: FileText, roles: ['owner', 'admin', 'employee'] },
};

const DASHBOARD_ITEM: NavigationItem = {
  title: 'Dashboard',
  href: '/dashboard',
  icon: LayoutDashboard,
  roles: ['owner', 'admin', 'employee'],
};

const TASK_MANAGEMENT_ITEM: NavigationItem = {
  title: 'Task Management',
  href: '/dashboard/task-management',
  icon: CheckSquare,
  roles: ['owner', 'admin', 'employee'],
};

const SETTINGS_ITEM: NavigationItem = {
  title: 'Settings',
  href: '/settings',
  icon: Settings,
  roles: ['owner', 'admin'],
};

/**
 * Document sub-pages surfaced as Documents children. These reuse existing
 * routes — no new pages, no Invoice (Invoice stays in Finance).
 */
const DOCUMENT_CHILDREN: NavigationItem[] = [
  { title: 'Estimates', href: '/dashboard/documents/estimates', icon: FileSpreadsheet, roles: ['owner', 'admin', 'employee'] },
  { title: 'Proposals', href: '/dashboard/documents/proposals', icon: ScrollText, roles: ['owner', 'admin', 'employee'] },
  { title: 'Quotations', href: '/dashboard/documents/quotations', icon: ReceiptText, roles: ['owner', 'admin', 'employee'] },
];

const unionRoles = (items: NavigationItem[]): NavigationRole[] => {
  const set = new Set<NavigationRole>();
  items.forEach((item) => item.roles.forEach((role) => set.add(role)));
  return Array.from(set);
};

export function useNavigationItems(userRole: NavigationRole = 'owner') {
  return useMemo(() => {
    const moduleItems = new Map<ModuleName, NavigationItem>();
    (Object.entries(MODULE_NAV_MAP) as [ModuleName, NonNullable<typeof MODULE_NAV_MAP[ModuleName]>][])
      .forEach(([name, nav]) => {
        if (!nav.roles.includes(userRole)) return;
        const configuredModule = MODULES.find((module) => module.name === name);
        moduleItems.set(name, {
          title: nav.title ?? configuredModule?.displayName ?? name,
          href: nav.href,
          icon: nav.icon,
          roles: nav.roles,
          moduleId: name,
        });
      });

    const get = (name: ModuleName) => moduleItems.get(name);
    const tree: NavigationItem[] = [];

    if (DASHBOARD_ITEM.roles.includes(userRole)) tree.push(DASHBOARD_ITEM);

    (['leads', 'customers', 'projects'] as ModuleName[]).forEach((name) => {
      const item = get(name);
      if (item) tree.push(item);
    });

    // Inventory group: Items (Item Master) + Stock (Inventory).
    const inventoryChildren = [get('items'), get('inventory')].filter(
      (item): item is NavigationItem => Boolean(item)
    );
    if (inventoryChildren.length > 0) {
      tree.push({
        title: 'Inventory',
        icon: Boxes,
        roles: unionRoles(inventoryChildren),
        children: inventoryChildren,
      });
    }

    // Finance group: Operations (Finance) + Accounting.
    const financeChildren = [get('finance'), get('accounting')].filter(
      (item): item is NavigationItem => Boolean(item)
    );
    if (financeChildren.length > 0) {
      tree.push({
        title: 'Finance',
        icon: Wallet,
        roles: unionRoles(financeChildren),
        children: financeChildren,
      });
    }

    // Documents: keeps its own landing route AND exposes document children.
    const documents = get('documents');
    if (documents) {
      const documentChildren = DOCUMENT_CHILDREN.filter((child) => child.roles.includes(userRole));
      tree.push({ ...documents, children: documentChildren.length > 0 ? documentChildren : undefined });
    }

    // Purchase group: Vendors + Purchase Orders + Purchase Reports
    const purchaseChildren: NavigationItem[] = [
      { title: 'Vendors', href: '/purchase/vendors', icon: Truck, roles: ['owner', 'admin', 'employee'] },
      { title: 'Purchase Orders', href: '/purchase/orders', icon: ShoppingCart, roles: ['owner', 'admin', 'employee'] },
      { title: 'Purchase Reports', href: '/purchase/reports', icon: BarChart3, roles: ['owner', 'admin'] },
    ];
    const filteredPurchaseChildren = purchaseChildren.filter((child) => child.roles.includes(userRole));
    if (filteredPurchaseChildren.length > 0) {
      tree.push({
        title: 'Purchase',
        icon: ShoppingCart,
        roles: unionRoles(filteredPurchaseChildren),
        children: filteredPurchaseChildren,
      });
    }

    if (TASK_MANAGEMENT_ITEM.roles.includes(userRole)) tree.push(TASK_MANAGEMENT_ITEM);
    if (SETTINGS_ITEM.roles.includes(userRole)) tree.push(SETTINGS_ITEM);

    return { items: tree, isLoading: false };
  }, [userRole]);
}
