'use client';

import { UsersRoles } from '@/features/settings/pages/UsersRoles';
import { RouteGuard } from '@/features/auth/RouteGuard';

export default function UsersPage() {
  return (
    <RouteGuard requireSettings requiredPermission="organization:read">
      <UsersRoles />
    </RouteGuard>
  );
}
