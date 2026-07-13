'use client';

import { ReactNode } from 'react';
import { MainLayout } from '@/layouts/MainLayout';

interface SettingsLayoutProps {
  children: ReactNode;
}

export default function SettingsLayoutWrapper({ children }: SettingsLayoutProps) {
  return (
    <MainLayout currentPath="/settings" showTopbar={false}>
      {children}
    </MainLayout>
  );
}
