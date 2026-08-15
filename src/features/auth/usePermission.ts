'use client';

import { useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

/**
 * Permission-based UI gating for the CRM frontend.
 *
 * Reads the current user's effective permissions (returned by the backend on
 * `/auth/me`) and exposes helpers for hiding buttons, menus and form fields
 * when the permission is missing.
 *
 * The `permissions` array contains `'*'` for super users (SUPER_ADMIN / OWNER
 * with the full org permission pool), so `hasPermission` treats `'*'` as
 * "everything".
 *
 * All helpers are memoized on the permissions array so consumers can safely
 * use them in useMemo/useEffect dependency arrays without re-render loops.
 */
export function usePermission() {
  const { user } = useAuth();
  const permissions = useMemo(() => user?.permissions ?? [], [user?.permissions]);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!permission) return true;
      if (permissions.includes('*')) return true;
      return permissions.includes(permission);
    },
    [permissions],
  );

  const hasAnyPermission = useCallback(
    (required: string[]): boolean => {
      if (required.length === 0) return true;
      return required.some((perm) => hasPermission(perm));
    },
    [hasPermission],
  );

  const hasAllPermissions = useCallback(
    (required: string[]): boolean => {
      return required.every((perm) => hasPermission(perm));
    },
    [hasPermission],
  );

  return { permissions, hasPermission, hasAnyPermission, hasAllPermissions };
}
