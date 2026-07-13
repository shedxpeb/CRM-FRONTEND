'use client';

import { useTheme } from './ThemeProvider';
import { Theme } from './types';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, setTheme, isMounted } = useTheme();

  if (!isMounted) {
    // Return a placeholder to prevent layout shift
    return (
      <div className="w-14 h-7 bg-card rounded-full border border-border relative">
        <div className="absolute top-1 left-1 w-5 h-5 bg-gray-300 rounded-full" />
      </div>
    );
  }

  const isLight = theme === 'light';

  return (
    <button
      onClick={() => setTheme(isLight ? 'dark' : 'light')}
      className={cn(
        'w-14 h-7 rounded-full relative transition-all duration-300',
        'border-2',
        isLight
          ? 'bg-white border-gray-300'
          : 'bg-gray-800 border-gray-600'
      )}
      aria-label={`Switch to ${isLight ? 'Dark' : 'Light'} theme`}
    >
      <div
        className={cn(
          'absolute top-0.5 w-5 h-5 rounded-full flex items-center justify-center',
          isLight
            ? 'left-1 bg-blue-400 transition-all duration-300 ease-in-out'
            : 'left-7 bg-gray-600 transition-all duration-500 ease-bounce'
        )}
      >
        {isLight ? (
          <Sun className="h-3 w-3 text-white" />
        ) : (
          <Moon className="h-3 w-3 text-white" />
        )}
      </div>
    </button>
  );
}
