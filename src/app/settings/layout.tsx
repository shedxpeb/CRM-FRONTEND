'use client';

import { ReactNode } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthGate } from '@/features/auth/AuthGate';

interface SettingsLayoutProps {
  children: ReactNode;
}

export default function SettingsLayoutWrapper({ children }: SettingsLayoutProps) {
  return (
    <AuthGate>
      <MainLayout currentPath="/settings" showTopbar={false}>
        {children}
      </MainLayout>
    </AuthGate>
  );
}
