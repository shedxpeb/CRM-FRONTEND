'use client';

import { ReactNode } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthGate } from '@/features/auth/AuthGate';
import { RouteGuard } from '@/features/auth/RouteGuard';

interface SettingsLayoutProps {
  children: ReactNode;
}

export default function SettingsLayoutWrapper({ children }: SettingsLayoutProps) {
  return (
    <AuthGate>
      <RouteGuard requireSettings>
        <MainLayout currentPath="/settings" showTopbar={false}>
          {children}
        </MainLayout>
      </RouteGuard>
    </AuthGate>
  );
}
