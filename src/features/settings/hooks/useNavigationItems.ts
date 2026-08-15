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
  ReceiptText,
  ShoppingCart,
  Truck,
  Settings,
  Shield,
  type LucideIcon,
} from 'lucide-react';
import type { ModuleName, Module } from '@/features/settings/types';
import { MODULES } from '@/features/settings/constants/settingsConstants';
import { useModules } from './useSettings';
import { usePermission } from '@/features/auth/usePermission';

export type NavigationRole = 'owner' | 'admin' | 'employee';

export interface NavigationItem {
  title: string;
  /** Optional: group/parent headers (e.g. Inventory, Finance) have no own page. */
  href?: string;
  icon: LucideIcon;
  /** Kept for type-compatibility; sidebar visibility is module+permission driven, not role-driven. */
  roles: NavigationRole[];
  moduleId?: ModuleName;
  /** Permission required for this item to be visible (checked alongside module enablement). */
  permission?: string;
  /** Nested navigation children. Presence makes this an expandable parent. */
  children?: NavigationItem[];
}

export interface NavigationTree {
  items: NavigationItem[];
  /** First clickable href in the tree — safe landing page for users denied elsewhere. */
  firstHref: string | null;
}

/**
 * Per-module navigation metadata. Titles here are the labels shown in the
 * sidebar (overriding the module displayName) so that grouped modules read
 * naturally under their parent (e.g. "Items", "Stock", "Operations").
 *
 * Sidebar visibility formula: moduleEnabled && hasPermission(permission).
 * Modules without a permission key (finance/accounting) are module-gated only.
 */
const MODULE_NAV_MAP: Partial<
  Record<ModuleName, { href?: string; icon: LucideIcon; title?: string; permission?: string }>
> = {
  leads: { href: '/dashboard/leads', icon: Users, permission: 'lead:list' },
  customers: { href: '/dashboard/customers', icon: Building, permission: 'customer:list' },
  items: { href: '/dashboard/item', icon: Package, title: 'Items', permission: 'item-master:list' },
  projects: { href: '/dashboard/projects', icon: FolderKanban, permission: 'project:list' },
  inventory: { href: '/dashboard/inventory', icon: Warehouse, title: 'Stock', permission: 'inventory:list' },
  finance: { href: '/dashboard/finance', icon: DollarSign, title: 'Operations' },
  accounting: { href: '/dashboard/accounting', icon: Calculator, title: 'Accounting' },
  documents: { icon: FileText, permission: 'document:list' },
};

const DASHBOARD_ITEM: NavigationItem = {
  title: 'Dashboard',
  href: '/dashboard',
  icon: LayoutDashboard,
  roles: ['owner', 'admin', 'employee'],
  permission: 'dashboard:view',
};

const TASK_MANAGEMENT_ITEM: NavigationItem = {
  title: 'Task Management',
  href: '/dashboard/task-management',
  icon: CheckSquare,
  roles: ['owner', 'admin', 'employee'],
  permission: 'task:list',
};

const SETTINGS_ITEM: NavigationItem = {
  title: 'Settings',
  href: '/settings',
  icon: Settings,
  roles: ['owner', 'admin'],
  permission: 'organization:read',
};

/**
 * Document sub-pages surfaced as Documents children. Invoice stays in Finance.
 */
const DOCUMENT_CHILDREN: NavigationItem[] = [
  { title: 'Dashboard', href: '/dashboard/documents/dashboard', icon: LayoutDashboard, roles: ['owner', 'admin', 'employee'], permission: 'document:list' },
  { title: 'Estimates', href: '/dashboard/documents/estimates', icon: FileSpreadsheet, roles: ['owner', 'admin', 'employee'], permission: 'document:list' },
  { title: 'Quotations', href: '/dashboard/documents/quotations', icon: ReceiptText, roles: ['owner', 'admin', 'employee'], permission: 'document:list' },
];

const unionRoles = (items: NavigationItem[]): NavigationRole[] => {
  const set = new Set<NavigationRole>();
  items.forEach((item) => item.roles.forEach((role) => set.add(role)));
  return Array.from(set);
};

/**
 * Pure navigation builder. Deterministic given the org module state and the
 * user's effective permissions, so the sidebar hook and the route guard can
 * agree on what is visible and where denied users should be redirected.
 */
export function buildNavigation(
  modules: Module[] | undefined,
  hasPermission: (permission: string) => boolean,
): NavigationTree {
  const isEnabled = (name: ModuleName): boolean => {
    const moduleStatus = modules?.find((m) => m.name === name);
    // Default ON while loading or when the org has no row for this module.
    return moduleStatus ? moduleStatus.isEnabled : true;
  };

  const visible = (name: string, permission?: string): boolean => {
    if (!isEnabled(name as ModuleName)) return false;
    // No permission key (e.g. finance/accounting) → module-only gating.
    if (!permission) return true;
    return hasPermission(permission);
  };

  const moduleItems = new Map<ModuleName, NavigationItem>();
  (Object.entries(MODULE_NAV_MAP) as [ModuleName, NonNullable<typeof MODULE_NAV_MAP[ModuleName]>][]).forEach(
    ([name, nav]) => {
      if (!visible(name, nav.permission)) return;

      const configuredModule = MODULES.find((module) => module.name === name);
      moduleItems.set(name, {
        title: nav.title ?? configuredModule?.displayName ?? name,
        href: nav.href,
        icon: nav.icon,
        roles: ['owner', 'admin', 'employee'],
        moduleId: name,
        permission: nav.permission,
      });
    },
  );

  const get = (name: ModuleName) => moduleItems.get(name);
  const tree: NavigationItem[] = [];

  if (visible('dashboard', DASHBOARD_ITEM.permission)) {
    tree.push(DASHBOARD_ITEM);
  }

  (['leads', 'customers', 'projects'] as ModuleName[]).forEach((name) => {
    const item = get(name);
    if (item) tree.push(item);
  });

  // Inventory group: Items (Item Master) + Stock (Inventory).
  const inventoryChildren = [get('items'), get('inventory')].filter(
    (item): item is NavigationItem => Boolean(item),
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
    (item): item is NavigationItem => Boolean(item),
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
    tree.push({ ...documents, children: DOCUMENT_CHILDREN });
  }

  // Purchase group: Vendors + Purchase Orders (gated by module enablement + permission).
  const purchaseChildren: NavigationItem[] = [];
  if (visible('vendors', 'vendor:list')) {
    purchaseChildren.push({ title: 'Vendors', href: '/purchase/vendors', icon: Truck, roles: ['owner', 'admin', 'employee'], permission: 'vendor:list' });
  }
  if (visible('purchases', 'purchase-order:list')) {
    purchaseChildren.push({ title: 'Purchase Orders', href: '/purchase/orders', icon: ShoppingCart, roles: ['owner', 'admin', 'employee'], permission: 'purchase-order:list' });
  }
  if (purchaseChildren.length > 0) {
    tree.push({
      title: 'Purchase',
      icon: ShoppingCart,
      roles: unionRoles(purchaseChildren),
      children: purchaseChildren,
    });
  }

  // Task Management is gated by the task module + task:list permission.
  if (visible('task', TASK_MANAGEMENT_ITEM.permission)) {
    tree.push(TASK_MANAGEMENT_ITEM);
  }

  // Settings is gated by the user/role modules and organization:read.
  if ((isEnabled('user') || isEnabled('role')) && hasPermission('organization:read')) {
    tree.push({ ...SETTINGS_ITEM, icon: isEnabled('role') ? Shield : Settings });
  }

  // First clickable destination (group headers without href resolve to first child).
  let firstHref: string | null = null;
  const walk = (items: NavigationItem[]): boolean => {
    for (const item of items) {
      if (item.href) {
        firstHref = item.href;
        return true;
      }
      if (item.children && walk(item.children)) return true;
    }
    return false;
  };
  walk(tree);

  return { items: tree, firstHref };
}

export function useNavigationItems() {
  const { data: modules } = useModules();
  const { hasPermission } = usePermission();

  return useMemo(() => {
    const { items } = buildNavigation(modules, hasPermission);
    return { items, isLoading: !modules };
  }, [modules, hasPermission]);
}
