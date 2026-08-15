'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { useModules } from '@/features/settings/hooks/useSettings';
import { usePermission } from './usePermission';
import { buildNavigation } from '@/features/settings/hooks/useNavigationItems';
import type { NavigationRole } from '@/features/settings/hooks/useNavigationItems';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: NavigationRole | NavigationRole[];
  requiredModule?: string;
  requiredPermission?: string | string[];
  requireSettings?: boolean;
}

/**
 * Comprehensive route guard for CRM
 * 1. Authentication check (is user logged in?)
 * 2. Role check (does user have required role?)
 * 3. Module check (is module enabled for tenant?)
 * 4. Permission check (does user have required permission?)
 * 5. Settings check (is user accessing settings page with proper role?)
 */
export function RouteGuard({
  children,
  requiredRole,
  requiredModule,
  requiredPermission,
  requireSettings = false,
}: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { hasPermission } = usePermission();
  const { data: modules } = useModules();

  useEffect(() => {
    if (isLoading) return;

    // 1. Authentication check
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Smart landing page for users who cannot access the requested route
    // (avoids redirect loops when the user also lacks dashboard:view).
    const fallback = () => {
      const { firstHref } = buildNavigation(modules, hasPermission);
      router.push(firstHref ?? '/login');
    };

    // 2. Role check
    if (requiredRole) {
      const userRole = toNavRole(user?.role);
      const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!requiredRoles.includes(userRole)) {
        fallback();
        return;
      }
    }

    // 3. Module check
    if (requiredModule && modules) {
      const moduleConfig = modules.find(m => m.name === requiredModule);
      if (!moduleConfig || !moduleConfig.isEnabled) {
        fallback();
        return;
      }
    }

    // 4. Permission check
    if (requiredPermission) {
      const required = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
      if (!required.some((perm) => hasPermission(perm))) {
        fallback();
        return;
      }
    }

    // 5. Settings check
    if (requireSettings) {
      const userRole = toNavRole(user?.role);
      if (userRole !== 'owner' && userRole !== 'admin') {
        fallback();
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, requiredModule, requiredPermission, requireSettings, modules, hasPermission, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground" role="status" aria-live="polite">
        Checking permissions…
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Double-check client-side
  if (requiredRole) {
    const userRole = toNavRole(user?.role);
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!requiredRoles.includes(userRole)) {
      return (
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Access denied: Insufficient role
        </div>
      );
    }
  }

  if (requiredModule && modules) {
    const moduleConfig = modules.find(m => m.name === requiredModule);
    if (!moduleConfig || !moduleConfig.isEnabled) {
      return (
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Access denied: Module not enabled
        </div>
      );
    }
  }

  if (requiredPermission) {
    const required = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
    if (!required.some((perm) => hasPermission(perm))) {
      return (
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Access denied: Insufficient permissions
        </div>
      );
    }
  }

  if (requireSettings) {
    const userRole = toNavRole(user?.role);
    if (userRole !== 'owner' && userRole !== 'admin') {
      return (
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Access denied: Settings restricted to owners and admins
        </div>
      );
    }
  }

  return <>{children}</>;
}

/**
 * Helper function to convert role string to NavigationRole
 */
function toNavRole(role?: string | null): NavigationRole {
  const r = (role || '').toUpperCase();
  if (r === 'OWNER' || r === 'SUPER_ADMIN') return 'owner';
  if (r === 'ADMIN') return 'admin';
  return 'employee';
}

/**
 * Higher-order component for protecting specific routes
 */
export function withRouteGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<RouteGuardProps, 'children'>
) {
  return function GuardedComponent(props: P) {
    return (
      <RouteGuard {...options}>
        <Component {...props} />
      </RouteGuard>
    );
  };
}
