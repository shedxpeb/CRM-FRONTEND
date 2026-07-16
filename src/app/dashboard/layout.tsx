'use client';

import { ReactNode } from 'react';
import { AuthGate } from '@/features/auth/AuthGate';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
