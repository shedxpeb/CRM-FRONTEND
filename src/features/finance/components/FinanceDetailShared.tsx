'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ROUTES } from '@/core/routes';

export function formatFinanceDate(value?: Date | string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function useFinanceBack() {
  const router = useRouter();
  return useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(ROUTES.finance);
  }, [router]);
}

export function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        {title}
        {open ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

export function InfoGrid({
  items,
}: {
  items: { label: string; value: React.ReactNode; icon?: React.ReactNode }[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {item.icon}
            {item.label}
          </p>
          <p className="text-sm font-medium break-words">{item.value ?? '-'}</p>
        </div>
      ))}
    </div>
  );
}
