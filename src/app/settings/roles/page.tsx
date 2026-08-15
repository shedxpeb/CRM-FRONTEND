'use client';

import { UsersRoles } from '@/features/settings/pages/UsersRoles';
import { RouteGuard } from '@/features/auth/RouteGuard';

export default function RolesPage() {
  return (
    <RouteGuard requireSettings requiredPermission="organization:read">
      <UsersRoles />
    </RouteGuard>
  );
}
