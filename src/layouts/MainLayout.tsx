'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ContentWrapper } from '@/components/layout/ContentWrapper';
import { useSidebarWidth } from '@/store/useSidebarStore';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  currentPath?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showTopbar?: boolean;
}

export const MainLayout = function MainLayout({ children, title = '', subtitle, currentPath, showBackButton, onBackClick, showTopbar = true }: MainLayoutProps) {
  const sidebarWidth = useSidebarWidth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Sidebar currentPath={currentPath} />

      <main
        style={{ marginLeft: sidebarWidth }}
        className="transition-all duration-300 min-h-screen"
      >
        {showTopbar && (
          <Topbar title={title} subtitle={subtitle} showBackButton={showBackButton} onBackClick={onBackClick} />
        )}

        <ContentWrapper>{children}</ContentWrapper>
      </main>
    </div>
  );
};
