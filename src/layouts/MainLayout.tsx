'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ContentWrapper } from '@/components/layout/ContentWrapper';
import { useSidebarWidth } from '@/store/useSidebarStore';
import { useAuth } from '@/features/auth/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  currentPath?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showTopbar?: boolean;
}

function toNavRole(role?: string | null): 'owner' | 'admin' | 'employee' {
  const r = (role || '').toUpperCase();
  if (r === 'OWNER' || r === 'SUPER_ADMIN') return 'owner';
  if (r === 'ADMIN') return 'admin';
  return 'employee';
}

export const MainLayout = function MainLayout({
  children,
  title = '',
  subtitle,
  currentPath,
  showBackButton,
  onBackClick,
  showTopbar = true,
}: MainLayoutProps) {
  const sidebarWidth = useSidebarWidth();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid blank flash: render a stable shell skeleton until client mount
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background" aria-busy="true">
        <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Sidebar currentPath={currentPath} userRole={toNavRole(user?.role)} />

      <main style={{ marginLeft: sidebarWidth }} className="transition-all duration-300 min-h-screen">
        {showTopbar && (
          <Topbar title={title} subtitle={subtitle} showBackButton={showBackButton} onBackClick={onBackClick} />
        )}

        <ContentWrapper>{children}</ContentWrapper>
      </main>
    </div>
  );
};
