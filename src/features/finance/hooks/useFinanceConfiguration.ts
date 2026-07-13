import { useMemo } from 'react';
import { useModuleConfiguration } from '@/features/settings/hooks/useSettings';
import { FINANCE_MODULE_DEFAULTS } from '@/features/settings/utils/moduleConfigurationDefaults';
import { pickModuleSettings } from '@/features/settings/utils/resolveModuleSettings';

export interface FinanceModuleConfiguration {
  expenseCategories: string[];
  paymentMethods: string[];
  vendorTypes: string[];
  bankAccountTypes: string[];
  transactionCategories: string[];
  invoiceStatuses: string[];
  paymentStatuses: string[];
  expenseStatuses: string[];
  gstTypes: string[];
}

export const DEFAULT_FINANCE_MODULE_CONFIGURATION: FinanceModuleConfiguration = FINANCE_MODULE_DEFAULTS;

export function useFinanceModuleConfiguration(): FinanceModuleConfiguration & { isLoading: boolean } {
  const { data, isLoading } = useModuleConfiguration('finance');

  return useMemo(() => {
    const settings = pickModuleSettings(data?.settings, DEFAULT_FINANCE_MODULE_CONFIGURATION);
    return {
      ...settings,
      isLoading,
    };
  }, [data, isLoading]);
}
