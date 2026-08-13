'use client';

import { ReactNode } from 'react';
import { AuthGate } from '@/features/auth/AuthGate';
import { RouteGuard } from '@/features/auth/RouteGuard';
import { MainLayout } from '@/layouts/MainLayout';

export default function PurchaseLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <RouteGuard requiredRole={['owner', 'admin', 'employee']}>
        <MainLayout>{children}</MainLayout>
      </RouteGuard>
    </AuthGate>
  );
}
