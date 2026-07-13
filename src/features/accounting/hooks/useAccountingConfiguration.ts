import { useMemo } from 'react';
import { useModuleConfiguration } from '@/features/settings/hooks/useSettings';
import { ACCOUNTING_MODULE_DEFAULTS } from '@/features/settings/utils/moduleConfigurationDefaults';
import { pickModuleSettings } from '@/features/settings/utils/resolveModuleSettings';

export interface AccountingModuleConfiguration {
  accountTypes: string[];
  accountGroups: string[];
  journalTypes: string[];
  taxCategories: string[];
  gstSettings: {
    cgstRate: number;
    sgstRate: number;
    igstRate: number;
    cessRate: number;
  };
}

export const DEFAULT_ACCOUNTING_MODULE_CONFIGURATION: AccountingModuleConfiguration =
  ACCOUNTING_MODULE_DEFAULTS;

export function useAccountingModuleConfiguration(): AccountingModuleConfiguration & { isLoading: boolean } {
  const { data, isLoading } = useModuleConfiguration('accounting');

  return useMemo(() => {
    const settings = pickModuleSettings(data?.settings, DEFAULT_ACCOUNTING_MODULE_CONFIGURATION);
    return {
      ...settings,
      isLoading,
    };
  }, [data, isLoading]);
}
