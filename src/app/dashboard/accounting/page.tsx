'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Book,
  BookOpen,
  Calculator,
  FileEdit,
  Landmark,
  Plus,
  Receipt,
  Scale,
  Shield,
} from 'lucide-react';
import { MainLayout } from '@/layouts/MainLayout';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { FilterConfig } from '@/components/layout/FilterBar';
import { DataTable } from '@/components/data-table/DataTable';
import { KPICard } from '@/components/dashboard/KPICard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toast } from '@/components/ui/toast';
import {
  EntityViewDrawer,
  EntityViewBody,
  EntityViewField,
  EntityViewFieldGrid,
  EntityViewFooter,
  EntityViewHeader,
  EntityViewKpiStrip,
  EntityViewSection,
  EntityViewTabContent,
  EntityViewTabTrigger,
  EntityViewTabs,
  EntityViewTabsList,
  formatDrawerDate,
} from '@/components/drawer/EntityViewDrawer';
import { EntityRowActionsMenu } from '@/components/row-actions';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useBankAccounts, useExpenses, useInvoices, usePayments, useTransactions } from '@/features/finance/hooks/useFinance';
import { Expense, Invoice, Payment, Transaction } from '@/features/finance/types';
import { formatCurrency } from '@/features/finance/constants';
import {
  AccountType,
  AccountingAccount,
  AccountingJournalEntry,
  buildAccountingKpis,
  buildBalanceSheet,
  buildGstSummary,
  buildJournalEntries,
  buildProfitAndLoss,
  buildTrialBalance,
  createDefaultAccounts,
} from '@/features/accounting/utils/accountingData';
import { deriveInvoices, derivePayables } from '@/features/finance/utils/financeDerivedData';
import { useAccountingModuleConfiguration } from '@/features/accounting/hooks/useAccountingConfiguration';

type AccountingTab =
  | 'dashboard'
  | 'chart-of-accounts'
  | 'journal-entries'
  | 'ledger'
  | 'gst-center'
  | 'trial-balance'
  | 'profit-loss'
  | 'balance-sheet';

function formatDate(value?: Date | string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => `"${String(row[header] ?? '').replace(/"/g, '""')}"`)
        .join(',')
    ),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AccountingPage() {
  const { accountTypes, accountGroups } = useAccountingModuleConfiguration();
  const [activeTab, setActiveTab] = useState<AccountingTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 250);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<AccountingAccount | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<AccountingJournalEntry | null>(null);
  const [drawerType, setDrawerType] = useState<'account' | 'journal' | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountDialogMode, setAccountDialogMode] = useState<'create' | 'edit' | null>(null);
  const [entryDialogMode, setEntryDialogMode] = useState<'create' | 'edit' | null>(null);

  const [accountTypeFilter, setAccountTypeFilter] = useState<string>('all');
  const [accountStatusFilter, setAccountStatusFilter] = useState<string>('all');
  const [journalStatusFilter, setJournalStatusFilter] = useState<string>('all');
  const [journalSourceFilter, setJournalSourceFilter] = useState<string>('all');
  const [trialTypeFilter, setTrialTypeFilter] = useState<string>('all');

  const { data: invoicesResponse } = useInvoices({ page: 1, pageSize: 1000 }, true);
  const { data: paymentsResponse } = usePayments({ page: 1, pageSize: 1000 }, true);
  const { data: expensesResponse } = useExpenses({ page: 1, pageSize: 1000 }, true);
  const { data: bankAccountsResponse } = useBankAccounts();
  const { data: transactionsResponse } = useTransactions({ page: 1, pageSize: 1000 });

  const invoices = invoicesResponse?.data ?? [];
  const payments = paymentsResponse?.data ?? [];
  const expenses = expensesResponse?.data ?? [];
  const bankAccounts = bankAccountsResponse ?? [];
  const transactions = transactionsResponse?.data ?? [];

  const [accounts, setAccounts] = useState<AccountingAccount[]>([]);
  const [manualEntries, setManualEntries] = useState<AccountingJournalEntry[]>([]);
  const [accountForm, setAccountForm] = useState({
    accountCode: '',
    accountName: '',
    accountType: 'Asset' as AccountType,
    accountCategory: '',
    openingBalance: '0',
    isActive: 'true',
  });
  const [journalForm, setJournalForm] = useState({
    reference: '',
    narration: '',
    entryDate: new Date().toISOString().split('T')[0],
    debitAccountId: '',
    creditAccountId: '',
    amount: '0',
    status: 'Draft' as 'Draft' | 'Posted',
  });

  useEffect(() => {
    if (accounts.length === 0 && bankAccounts.length > 0) {
      const systemAccounts = createDefaultAccounts(bankAccounts);
      setAccounts(systemAccounts);
      setJournalForm((current) => ({
        ...current,
        debitAccountId: systemAccounts[0]?.id ?? '',
        creditAccountId: systemAccounts[1]?.id ?? '',
      }));
    }
  }, [accounts.length, bankAccounts]);

  useEffect(() => {
    if (accountDialogMode === 'create') {
      setAccountForm({
        accountCode: '',
        accountName: '',
        accountType: 'Asset',
        accountCategory: '',
        openingBalance: '0',
        isActive: 'true',
      });
    }
  }, [accountDialogMode]);

  useEffect(() => {
    if (entryDialogMode === 'create') {
      setJournalForm((current) => ({
        reference: '',
        narration: '',
        entryDate: new Date().toISOString().split('T')[0],
        debitAccountId: current.debitAccountId,
        creditAccountId: current.creditAccountId,
        amount: '0',
        status: 'Draft',
      }));
    }
  }, [entryDialogMode]);

  const derivedInvoices = useMemo(() => deriveInvoices(invoices, payments), [invoices, payments]);
  const derivedPayables = useMemo(
    () => derivePayables(expenses, [], transactions),
    [expenses, transactions]
  );
  const journalEntries = useMemo(
    () =>
      buildJournalEntries({
        invoices,
        payments,
        expenses,
        transactions,
        bankAccounts,
        manualEntries,
      }),
    [bankAccounts, expenses, invoices, manualEntries, payments, transactions]
  );
  const trialBalanceRows = useMemo(() => buildTrialBalance(accounts, journalEntries), [accounts, journalEntries]);
  const profitLoss = useMemo(() => buildProfitAndLoss(trialBalanceRows), [trialBalanceRows]);
  const balanceSheet = useMemo(() => buildBalanceSheet(trialBalanceRows), [trialBalanceRows]);
  const gstSummary = useMemo(() => buildGstSummary(derivedInvoices, expenses), [derivedInvoices, expenses]);
  const kpis = useMemo(
    () => buildAccountingKpis(accounts, journalEntries, invoices, payments, expenses),
    [accounts, journalEntries, invoices, payments, expenses]
  );
  const cashAndBank = useMemo(
    () =>
      trialBalanceRows
        .filter((row) => {
          const account = accounts.find((item) => item.id === row.accountId);
          return account?.accountCategory === 'Bank Accounts';
        })
        .reduce((sum, row) => sum + row.balance, 0),
    [accounts, trialBalanceRows]
  );
  const receivablesTotal = useMemo(
    () => derivedInvoices.reduce((sum, row) => sum + row.pendingAmount, 0),
    [derivedInvoices]
  );
  const payablesTotal = useMemo(
    () => derivedPayables.reduce((sum, row) => sum + row.pendingAmount, 0),
    [derivedPayables]
  );
  const totalEquity = balanceSheet.totalEquity;
  const trialBalanceDebitTotal = useMemo(
    () => trialBalanceRows.reduce((sum, row) => sum + row.debit, 0),
    [trialBalanceRows]
  );
  const trialBalanceCreditTotal = useMemo(
    () => trialBalanceRows.reduce((sum, row) => sum + row.credit, 0),
    [trialBalanceRows]
  );
  const trialBalanceDifference = Math.abs(trialBalanceDebitTotal - trialBalanceCreditTotal);
  const trialBalanceHealthy = trialBalanceDifference < 0.01;
  const gstSummaryTotals = useMemo(
    () => ({
      output: gstSummary.reduce((sum, row) => sum + row.outputTax, 0),
      input: gstSummary.reduce((sum, row) => sum + row.inputTax, 0),
      payable: gstSummary.reduce((sum, row) => sum + row.liability, 0),
      filingStatus: gstSummary.reduce((sum, row) => sum + row.liability, 0) > 0 ? 'Review Needed' : 'No Liability',
      filingDueDate: 'Not Scheduled',
    }),
    [gstSummary]
  );
  const netProfitMatches = useMemo(
    () => Math.abs((kpis.revenue - kpis.expenses) - kpis.netProfit) < 0.01,
    [kpis.expenses, kpis.netProfit, kpis.revenue]
  );
  const balanceSheetDifference = useMemo(
    () => Math.abs(balanceSheet.totalAssets - (balanceSheet.totalLiabilities + balanceSheet.totalEquity)),
    [balanceSheet.totalAssets, balanceSheet.totalEquity, balanceSheet.totalLiabilities]
  );
  const balanceSheetMatches = balanceSheetDifference < 0.01;
  const gstChecks = useMemo(
    () => ({
      overall: Math.abs((gstSummaryTotals.output - gstSummaryTotals.input) - gstSummaryTotals.payable) < 0.01,
      perType: gstSummary.map((row) => ({
        type: row.type,
        matches: Math.abs((row.outputTax - row.inputTax) - row.liability) < 0.01,
      })),
    }),
    [gstSummary, gstSummaryTotals.input, gstSummaryTotals.output, gstSummaryTotals.payable]
  );

  const accountRows = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    return accounts.filter((account) => {
      const matchesSearch =
        !query ||
        account.accountCode.toLowerCase().includes(query) ||
        account.accountName.toLowerCase().includes(query) ||
        account.accountCategory.toLowerCase().includes(query);
      const matchesType = accountTypeFilter === 'all' || account.accountType === accountTypeFilter;
      const matchesStatus =
        accountStatusFilter === 'all' ||
        (accountStatusFilter === 'active' ? account.isActive : !account.isActive);
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [accountStatusFilter, accountTypeFilter, accounts, debouncedSearch]);

  const journalRows = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    return journalEntries.filter((entry) => {
      const matchesSearch =
        !query ||
        entry.entryNumber.toLowerCase().includes(query) ||
        entry.reference.toLowerCase().includes(query) ||
        entry.narration.toLowerCase().includes(query);
      const matchesStatus = journalStatusFilter === 'all' || entry.status === journalStatusFilter;
      const matchesSource = journalSourceFilter === 'all' || entry.sourceType === journalSourceFilter;
      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [debouncedSearch, journalEntries, journalSourceFilter, journalStatusFilter]);

  const ledgerRows = useMemo(
    () =>
      journalRows.flatMap((entry) =>
        entry.lines.map((line) => ({
          id: `${entry.id}-${line.id}`,
          entryNumber: entry.entryNumber,
          entryDate: entry.entryDate,
          reference: entry.reference,
          accountName: line.accountName,
          debit: line.debitAmount,
          credit: line.creditAmount,
          sourceType: entry.sourceType,
          status: entry.status,
        }))
      ),
    [journalRows]
  );

  const filteredTrialBalance = useMemo(
    () =>
      trialBalanceRows.filter(
        (row) =>
          (trialTypeFilter === 'all' || row.accountType === trialTypeFilter) &&
          (!debouncedSearch ||
            row.accountCode.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            row.accountName.toLowerCase().includes(debouncedSearch.toLowerCase()))
      ),
    [debouncedSearch, trialBalanceRows, trialTypeFilter]
  );

  const currentFilters: FilterConfig[] = useMemo(() => {
    if (activeTab === 'chart-of-accounts') {
      return [
        {
          key: 'accountType',
          label: 'Type',
          value: accountTypeFilter,
          onChange: setAccountTypeFilter,
          options: [{ value: 'all', label: 'All Types' }, ...accountTypes.map((value) => ({ value, label: value }))],
        },
        {
          key: 'accountStatus',
          label: 'Status',
          value: accountStatusFilter,
          onChange: setAccountStatusFilter,
          options: [
            { value: 'all', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ],
        },
      ];
    }
    if (activeTab === 'journal-entries') {
      return [
        {
          key: 'journalStatus',
          label: 'Status',
          value: journalStatusFilter,
          onChange: setJournalStatusFilter,
          options: [
            { value: 'all', label: 'All Status' },
            { value: 'Draft', label: 'Draft' },
            { value: 'Posted', label: 'Posted' },
            { value: 'Reversed', label: 'Reversed' },
          ],
        },
        {
          key: 'journalSource',
          label: 'Source',
          value: journalSourceFilter,
          onChange: setJournalSourceFilter,
          options: [
            { value: 'all', label: 'All Sources' },
            ...['Invoice', 'Payment', 'Expense', 'Manual'].map((value) => ({ value, label: value })),
          ],
        },
      ];
    }
    if (activeTab === 'trial-balance') {
      return [
        {
          key: 'trialType',
          label: 'Account Type',
          value: trialTypeFilter,
          onChange: setTrialTypeFilter,
          options: [{ value: 'all', label: 'All Types' }, ...accountTypes.map((value) => ({ value, label: value }))],
        },
      ];
    }
    return [];
  }, [
    activeTab,
    accountStatusFilter,
    accountTypeFilter,
    journalSourceFilter,
    journalStatusFilter,
    trialTypeFilter,
  ]);

  const clearFilters = () => {
    setAccountTypeFilter('all');
    setAccountStatusFilter('all');
    setJournalStatusFilter('all');
    setJournalSourceFilter('all');
    setTrialTypeFilter('all');
  };

  const exportCurrentTab = () => {
    if (activeTab === 'chart-of-accounts') {
      downloadCsv(
        'accounting-chart-of-accounts.csv',
        accountRows.map((row) => ({
          accountCode: row.accountCode,
          accountName: row.accountName,
          accountType: row.accountType,
          accountCategory: row.accountCategory,
          isSystemAccount: row.isSystemAccount,
          isActive: row.isActive,
        }))
      );
    }
    if (activeTab === 'journal-entries') {
      downloadCsv(
        'accounting-journal-entries.csv',
        journalRows.map((row) => ({
          entryNumber: row.entryNumber,
          entryDate: formatDate(row.entryDate),
          reference: row.reference,
          narration: row.narration,
          status: row.status,
          sourceType: row.sourceType,
        }))
      );
    }
    if (activeTab === 'trial-balance') {
      downloadCsv(
        'accounting-trial-balance.csv',
        filteredTrialBalance.map((row) => ({
          accountCode: row.accountCode,
          accountName: row.accountName,
          accountType: row.accountType,
          debit: row.debit,
          credit: row.credit,
          balance: row.balance,
        }))
      );
    }
  };

  const openAccountDrawer = (account: AccountingAccount) => {
    setSelectedAccount(account);
    setDrawerType('account');
    setDrawerOpen(true);
  };

  const openJournalDrawer = (entry: AccountingJournalEntry) => {
    setSelectedEntry(entry);
    setDrawerType('journal');
    setDrawerOpen(true);
  };

  const submitAccount = () => {
    const payload: AccountingAccount = {
      id: accountDialogMode === 'edit' && selectedAccount ? selectedAccount.id : `account-${Date.now()}`,
      accountCode: accountForm.accountCode,
      accountName: accountForm.accountName,
      accountType: accountForm.accountType,
      accountCategory: accountForm.accountCategory,
      openingBalance: Number(accountForm.openingBalance),
      isSystemAccount: accountDialogMode === 'edit' && selectedAccount ? selectedAccount.isSystemAccount : false,
      isActive: accountForm.isActive === 'true',
    };

    if (accountDialogMode === 'edit' && selectedAccount) {
      setAccounts((current) => current.map((account) => (account.id === payload.id ? payload : account)));
      setToast({ message: 'Account updated', type: 'success' });
    } else {
      setAccounts((current) => [payload, ...current]);
      setToast({ message: 'Account created', type: 'success' });
    }
    setAccountDialogMode(null);
  };

  const submitJournalEntry = () => {
    const debitAccount = accounts.find((account) => account.id === journalForm.debitAccountId);
    const creditAccount = accounts.find((account) => account.id === journalForm.creditAccountId);
    if (!debitAccount || !creditAccount) return;

    const amount = Number(journalForm.amount);
    const entry: AccountingJournalEntry = {
      id: entryDialogMode === 'edit' && selectedEntry ? selectedEntry.id : `manual-entry-${Date.now()}`,
      entryNumber:
        entryDialogMode === 'edit' && selectedEntry
          ? selectedEntry.entryNumber
          : `JE-MAN-${String(manualEntries.length + 1).padStart(3, '0')}`,
      entryDate: new Date(journalForm.entryDate),
      reference: journalForm.reference,
      narration: journalForm.narration,
      status: journalForm.status,
      sourceType: 'Manual',
      sourceId: undefined,
      lines: [
        {
          id: `line-debit-${Date.now()}`,
          accountId: debitAccount.id,
          accountName: debitAccount.accountName,
          debitAmount: amount,
          creditAmount: 0,
        },
        {
          id: `line-credit-${Date.now() + 1}`,
          accountId: creditAccount.id,
          accountName: creditAccount.accountName,
          debitAmount: 0,
          creditAmount: amount,
        },
      ],
    };

    if (entryDialogMode === 'edit' && selectedEntry) {
      setManualEntries((current) => current.map((item) => (item.id === entry.id ? entry : item)));
      setToast({ message: 'Manual journal entry updated', type: 'success' });
    } else {
      setManualEntries((current) => [entry, ...current]);
      setToast({ message: 'Manual journal entry created', type: 'success' });
    }
    setEntryDialogMode(null);
  };

  const dashboardCards = [
    {
      title: 'Assets',
      value: formatCurrency(kpis.assets),
      change: 0,
      icon: <Landmark className="h-5 w-5 text-blue-600" />,
      color: 'text-blue-600',
    },
    {
      title: 'Liabilities',
      value: formatCurrency(kpis.liabilities),
      change: 0,
      icon: <Shield className="h-5 w-5 text-amber-600" />,
      color: 'text-amber-600',
    },
    {
      title: 'Equity',
      value: formatCurrency(totalEquity),
      change: 0,
      icon: <BookOpen className="h-5 w-5 text-emerald-600" />,
      color: 'text-emerald-600',
    },
    {
      title: 'Net Profit',
      value: formatCurrency(kpis.netProfit),
      change: 0,
      icon: <BarChart3 className="h-5 w-5 text-violet-600" />,
      color: 'text-violet-600',
    },
    {
      title: 'Cash & Bank',
      value: formatCurrency(cashAndBank),
      change: 0,
      icon: <Landmark className="h-5 w-5 text-blue-600" />,
      color: 'text-blue-600',
    },
    {
      title: 'Receivables',
      value: formatCurrency(receivablesTotal),
      change: 0,
      icon: <Receipt className="h-5 w-5 text-amber-600" />,
      color: 'text-amber-600',
    },
    {
      title: 'Payables',
      value: formatCurrency(payablesTotal),
      change: 0,
      icon: <Shield className="h-5 w-5 text-rose-600" />,
      color: 'text-rose-600',
    },
    {
      title: 'GST Payable',
      value: formatCurrency(kpis.gstPayable),
      change: 0,
      icon: <Scale className="h-5 w-5 text-cyan-600" />,
      color: 'text-cyan-600',
    },
  ];

  return (
    <MainLayout title="Accounting" subtitle="Financial truth engine derived from accounting records">
      <StandardPageLayout
        title="Accounting"
        subtitle="Chart of accounts, journal entries, GST visibility, and financial reports"
        headerActions={
          activeTab === 'chart-of-accounts' ? (
            <Button onClick={() => setAccountDialogMode('create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Account
            </Button>
          ) : activeTab === 'journal-entries' ? (
            <Button onClick={() => setEntryDialogMode('create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Journal Entry
            </Button>
          ) : undefined
        }
        kpiCards={dashboardCards.map((kpi) => (
          <KPICard key={kpi.title} data={kpi} />
        ))}
        kpiGridClassName="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
        searchValue={activeTab === 'dashboard' ? undefined : searchQuery}
        onSearchChange={activeTab === 'dashboard' ? undefined : setSearchQuery}
        searchPlaceholder={activeTab === 'dashboard' ? undefined : `Search ${activeTab.replace('-', ' ')}`}
        filters={currentFilters}
        onClearFilters={clearFilters}
        filterMode="popover"
        toolbarActions={
          activeTab !== 'dashboard' && activeTab !== 'gst-center' && activeTab !== 'profit-loss' && activeTab !== 'balance-sheet' ? (
            <Button variant="outline" size="sm" onClick={exportCurrentTab}>
              Export
            </Button>
          ) : undefined
        }
      >
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AccountingTab)} className="space-y-4">
          <TabsList className="h-auto w-full justify-start overflow-x-auto p-1">
            <TabsTrigger value="dashboard" className="gap-2"><BarChart3 className="h-4 w-4" />Dashboard</TabsTrigger>
            <TabsTrigger value="chart-of-accounts" className="gap-2"><BookOpen className="h-4 w-4" />Chart of Accounts</TabsTrigger>
            <TabsTrigger value="journal-entries" className="gap-2"><FileEdit className="h-4 w-4" />Journal Entries</TabsTrigger>
            <TabsTrigger value="ledger" className="gap-2"><Book className="h-4 w-4" />Ledger</TabsTrigger>
            <TabsTrigger value="gst-center" className="gap-2"><Receipt className="h-4 w-4" />GST Center</TabsTrigger>
            <TabsTrigger value="trial-balance" className="gap-2"><Scale className="h-4 w-4" />Trial Balance</TabsTrigger>
            <TabsTrigger value="profit-loss" className="gap-2"><Calculator className="h-4 w-4" />Profit &amp; Loss</TabsTrigger>
            <TabsTrigger value="balance-sheet" className="gap-2"><Landmark className="h-4 w-4" />Balance Sheet</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Profit &amp; Loss Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="mt-1 text-xl font-semibold">{formatCurrency(profitLoss.totalRevenue)}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Derived from posted income accounts.</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Expenses</p>
                    <p className="mt-1 text-xl font-semibold">{formatCurrency(profitLoss.totalExpenses)}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Derived from expense-side ledgers.</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Gross Profit</p>
                    <p className="mt-1 text-xl font-semibold">{formatCurrency(profitLoss.totalRevenue - profitLoss.totalExpenses)}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Current period business margin snapshot.</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Net Profit</p>
                    <p className="mt-1 text-xl font-semibold">{formatCurrency(profitLoss.netProfit)}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Final profitability after all recorded expenses.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Trial Balance Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={trialBalanceHealthy ? 'success' : 'destructive'}>
                        {trialBalanceHealthy ? 'Balanced' : 'Not Balanced'}
                      </Badge>
                    </div>
                    <p className="mt-3 text-xl font-semibold">{formatCurrency(trialBalanceDifference)}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Difference between debit and credit totals.</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="mt-1 text-xl font-semibold">{journalEntries[0] ? formatDate(journalEntries[0].entryDate) : '-'}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Based on the most recent journal posting date.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Balance Sheet Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Assets</p>
                    <p className="mt-1 font-semibold">{formatCurrency(balanceSheet.totalAssets)}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Liabilities</p>
                    <p className="mt-1 font-semibold">{formatCurrency(balanceSheet.totalLiabilities)}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Equity</p>
                    <p className="mt-1 font-semibold">{formatCurrency(balanceSheet.totalEquity)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">GST Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Output GST</p>
                    <p className="mt-1 font-semibold">{formatCurrency(gstSummaryTotals.output)}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Input GST</p>
                    <p className="mt-1 font-semibold">{formatCurrency(gstSummaryTotals.input)}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Net GST Payable</p>
                    <p className="mt-1 font-semibold">{formatCurrency(gstSummaryTotals.payable)}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Filing Status</p>
                    <p className="mt-1 font-semibold">{gstSummaryTotals.filingStatus}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Accounting Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Chart of Accounts</p>
                    <p className="mt-1 font-semibold">{accounts.length} accounts</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Journal Entries</p>
                    <p className="mt-1 font-semibold">{journalEntries.length} entries</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Cash &amp; Bank</p>
                    <p className="mt-1 font-semibold">{formatCurrency(cashAndBank)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Consistency Checks</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Net Profit</p>
                    <Badge variant={netProfitMatches ? 'success' : 'destructive'}>
                      {netProfitMatches ? 'Matched' : 'Mismatch'}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Revenue {formatCurrency(kpis.revenue)} - Expenses {formatCurrency(kpis.expenses)} = Net Profit {formatCurrency(kpis.netProfit)}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Balance Sheet</p>
                    <Badge variant={balanceSheetMatches ? 'success' : 'destructive'}>
                      {balanceSheetMatches ? 'Matched' : 'Mismatch'}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Assets {formatCurrency(balanceSheet.totalAssets)} vs Liabilities + Equity {formatCurrency(balanceSheet.totalLiabilities + balanceSheet.totalEquity)}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Overall GST</p>
                    <Badge variant={gstChecks.overall ? 'success' : 'destructive'}>
                      {gstChecks.overall ? 'Matched' : 'Mismatch'}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Output {formatCurrency(gstSummaryTotals.output)} - Input {formatCurrency(gstSummaryTotals.input)} = Net {formatCurrency(gstSummaryTotals.payable)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chart-of-accounts">
            <DataTable
              columns={[
                { key: 'accountCode', label: 'Code', render: (value: string) => <span className="font-mono text-xs">{value}</span> },
                { key: 'accountName', label: 'Account Name' },
                { key: 'accountType', label: 'Type' },
                { key: 'accountCategory', label: 'Category' },
                { key: 'isSystemAccount', label: 'System', render: (value: boolean) => <Badge variant={value ? 'secondary' : 'outline'}>{value ? 'System' : 'Custom'}</Badge> },
                { key: 'isActive', label: 'Status', render: (value: boolean) => <Badge variant={value ? 'success' : 'secondary'}>{value ? 'Active' : 'Inactive'}</Badge> },
              ]}
              data={accountRows}
              rowIdKey="id"
              showToolbar={false}
              emptyMessage="No accounts found"
              rowActions={(row: AccountingAccount) => (
                <EntityRowActionsMenu
                  sections={{
                    view: [{ key: 'view', label: 'View Account', icon: BookOpen, onClick: () => openAccountDrawer(row) }],
                    edit: [{
                      key: 'edit',
                      label: 'Edit Account',
                      icon: FileEdit,
                      onClick: () => {
                        setSelectedAccount(row);
                        setAccountForm({
                          accountCode: row.accountCode,
                          accountName: row.accountName,
                          accountType: row.accountType,
                          accountCategory: row.accountCategory,
                          openingBalance: String(row.openingBalance),
                          isActive: row.isActive ? 'true' : 'false',
                        });
                        setAccountDialogMode('edit');
                      },
                      hidden: row.isSystemAccount,
                    }],
                    danger: [{
                      key: 'delete',
                      label: 'Delete Account',
                      icon: Shield,
                      onClick: () => {
                        if (row.isSystemAccount) return;
                        setAccounts((current) => current.filter((account) => account.id !== row.id));
                        setToast({ message: 'Account deleted', type: 'success' });
                      },
                      hidden: row.isSystemAccount,
                    }],
                  }}
                />
              )}
            />
          </TabsContent>

          <TabsContent value="journal-entries">
            <DataTable
              columns={[
                { key: 'entryNumber', label: 'Entry No', render: (value: string) => <span className="font-semibold">{value}</span> },
                { key: 'entryDate', label: 'Date', render: (value: Date) => formatDate(value) },
                { key: 'reference', label: 'Reference' },
                { key: 'narration', label: 'Narration' },
                { key: 'sourceType', label: 'Source' },
                { key: 'status', label: 'Status', render: (value: string) => <Badge variant={value === 'Posted' ? 'success' : value === 'Reversed' ? 'destructive' : 'secondary'}>{value}</Badge> },
              ]}
              data={journalRows}
              rowIdKey="id"
              showToolbar={false}
              emptyMessage="No journal entries found"
              rowActions={(row: AccountingJournalEntry) => (
                <EntityRowActionsMenu
                  sections={{
                    view: [{ key: 'view', label: 'View Entry', icon: Book, onClick: () => openJournalDrawer(row) }],
                    edit: [{
                      key: 'edit',
                      label: 'Edit Entry',
                      icon: FileEdit,
                      onClick: () => {
                        const debitLine = row.lines.find((line) => line.debitAmount > 0);
                        const creditLine = row.lines.find((line) => line.creditAmount > 0);
                        setSelectedEntry(row);
                        setJournalForm({
                          reference: row.reference,
                          narration: row.narration,
                          entryDate: new Date(row.entryDate).toISOString().split('T')[0],
                          debitAccountId: debitLine?.accountId ?? '',
                          creditAccountId: creditLine?.accountId ?? '',
                          amount: String(debitLine?.debitAmount ?? 0),
                          status: row.status === 'Reversed' ? 'Draft' : row.status,
                        });
                        setEntryDialogMode('edit');
                      },
                      hidden: row.sourceType !== 'Manual',
                    }],
                    danger: [{
                      key: 'delete',
                      label: 'Delete Entry',
                      icon: Shield,
                      onClick: () => {
                        setManualEntries((current) => current.filter((entry) => entry.id !== row.id));
                        setToast({ message: 'Manual journal entry deleted', type: 'success' });
                      },
                      hidden: row.sourceType !== 'Manual',
                    }],
                  }}
                />
              )}
            />
          </TabsContent>

          <TabsContent value="ledger">
            <DataTable
              columns={[
                { key: 'entryNumber', label: 'Entry No' },
                { key: 'entryDate', label: 'Date', render: (value: Date) => formatDate(value) },
                { key: 'reference', label: 'Reference' },
                { key: 'accountName', label: 'Account' },
                { key: 'debit', label: 'Debit', render: (value: number) => formatCurrency(value) },
                { key: 'credit', label: 'Credit', render: (value: number) => formatCurrency(value) },
                { key: 'sourceType', label: 'Source' },
              ]}
              data={ledgerRows}
              rowIdKey="id"
              showToolbar={false}
              emptyMessage="No ledger rows found"
            />
          </TabsContent>

          <TabsContent value="gst-center">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">GST Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Output GST</p>
                    <p className="mt-1 font-semibold">{formatCurrency(gstSummaryTotals.output)}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Input GST</p>
                    <p className="mt-1 font-semibold">{formatCurrency(gstSummaryTotals.input)}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Net GST Payable</p>
                    <p className="mt-1 font-semibold">{formatCurrency(gstSummaryTotals.payable)}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Filing Status</p>
                    <p className="mt-1 font-semibold">{gstSummaryTotals.filingStatus}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Due Date: {gstSummaryTotals.filingDueDate}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tax Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {gstSummary.map((row) => (
                    <div key={row.type} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{row.type}</p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              gstChecks.perType.find((item) => item.type === row.type)?.matches
                                ? 'success'
                                : 'destructive'
                            }
                          >
                            {gstChecks.perType.find((item) => item.type === row.type)?.matches ? 'Matched' : 'Mismatch'}
                          </Badge>
                          <Badge variant="outline">{formatCurrency(row.liability)}</Badge>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Output Tax</p>
                          <p className="mt-1 font-semibold">{formatCurrency(row.outputTax)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Input Tax</p>
                          <p className="mt-1 font-semibold">{formatCurrency(row.inputTax)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Liability</p>
                          <p className="mt-1 font-semibold">{formatCurrency(row.liability)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trial-balance">
            <DataTable
              columns={[
                { key: 'accountCode', label: 'Code' },
                { key: 'accountName', label: 'Account' },
                { key: 'accountType', label: 'Type' },
                { key: 'debit', label: 'Debit', render: (value: number) => formatCurrency(value) },
                { key: 'credit', label: 'Credit', render: (value: number) => formatCurrency(value) },
                { key: 'balance', label: 'Balance', render: (value: number) => formatCurrency(value) },
              ]}
              data={filteredTrialBalance}
              rowIdKey="accountId"
              showToolbar={false}
              emptyMessage="No trial balance rows found"
            />
          </TabsContent>

          <TabsContent value="profit-loss">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Revenue</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profitLoss.revenueRows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between rounded-lg border p-3">
                      <span>{row.label}</span>
                      <span className="font-semibold">{formatCurrency(row.amount)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <span className="font-medium">Total Revenue</span>
                    <span className="font-semibold">{formatCurrency(profitLoss.totalRevenue)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Expenses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profitLoss.expenseRows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between rounded-lg border p-3">
                      <span>{row.label}</span>
                      <span className="font-semibold">{formatCurrency(row.amount)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 p-3">
                    <span className="font-medium">Total Expenses</span>
                    <span className="font-semibold">{formatCurrency(profitLoss.totalExpenses)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-violet-200 bg-violet-50 p-3">
                    <span className="font-medium">Net Profit</span>
                    <span className="font-semibold">{formatCurrency(profitLoss.netProfit)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="balance-sheet">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card>
                <CardHeader><CardTitle className="text-base">Assets</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {balanceSheet.assets.map((row) => (
                    <div key={row.label} className="flex items-center justify-between rounded-lg border p-3">
                      <span>{row.label}</span>
                      <span className="font-semibold">{formatCurrency(row.amount)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                    <span className="font-medium">Total Assets</span>
                    <span className="font-semibold">{formatCurrency(balanceSheet.totalAssets)}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Liabilities</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {balanceSheet.liabilities.map((row) => (
                    <div key={row.label} className="flex items-center justify-between rounded-lg border p-3">
                      <span>{row.label}</span>
                      <span className="font-semibold">{formatCurrency(row.amount)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                    <span className="font-medium">Total Liabilities</span>
                    <span className="font-semibold">{formatCurrency(balanceSheet.totalLiabilities)}</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Equity</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {balanceSheet.equity.map((row) => (
                    <div key={row.label} className="flex items-center justify-between rounded-lg border p-3">
                      <span>{row.label}</span>
                      <span className="font-semibold">{formatCurrency(row.amount)}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                    <span className="font-medium">Total Equity</span>
                    <span className="font-semibold">{formatCurrency(balanceSheet.totalEquity)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </StandardPageLayout>

      <EntityViewDrawer open={drawerOpen && drawerType === 'account'} onOpenChange={setDrawerOpen}>
        {selectedAccount && (
          <>
            <EntityViewHeader
              title={selectedAccount.accountName}
              subtitle={`${selectedAccount.accountCode} · ${selectedAccount.accountType}`}
              onClose={() => setDrawerOpen(false)}
            />
            <EntityViewBody>
              <EntityViewKpiStrip
                items={[
                  { label: 'Type', value: selectedAccount.accountType, icon: <BookOpen className="h-4 w-4 text-blue-600" />, accentClassName: 'text-blue-600' },
                  { label: 'Category', value: selectedAccount.accountCategory, icon: <Book className="h-4 w-4 text-violet-600" />, accentClassName: 'text-violet-600' },
                  { label: 'Opening Balance', value: formatCurrency(selectedAccount.openingBalance), icon: <Landmark className="h-4 w-4 text-emerald-600" />, accentClassName: 'text-emerald-600' },
                  { label: 'Status', value: selectedAccount.isActive ? 'Active' : 'Inactive', icon: <Shield className="h-4 w-4 text-amber-600" />, accentClassName: 'text-amber-600' },
                ]}
              />
              <EntityViewTabs defaultValue="overview">
                <EntityViewTabsList>
                  <EntityViewTabTrigger value="overview">Overview</EntityViewTabTrigger>
                  <EntityViewTabTrigger value="balances">Balances</EntityViewTabTrigger>
                </EntityViewTabsList>
                <EntityViewTabContent value="overview">
                  <EntityViewSection title="Account Details">
                    <EntityViewFieldGrid>
                      <EntityViewField label="Account Code" value={selectedAccount.accountCode} />
                      <EntityViewField label="Account Name" value={selectedAccount.accountName} />
                      <EntityViewField label="Account Type" value={selectedAccount.accountType} />
                      <EntityViewField label="Category" value={selectedAccount.accountCategory} />
                      <EntityViewField label="System Account" value={selectedAccount.isSystemAccount ? 'Yes' : 'No'} />
                      <EntityViewField label="Status" value={selectedAccount.isActive ? 'Active' : 'Inactive'} />
                    </EntityViewFieldGrid>
                  </EntityViewSection>
                </EntityViewTabContent>
                <EntityViewTabContent value="balances">
                  <EntityViewSection title="Current Balance Snapshot">
                    {(() => {
                      const row = trialBalanceRows.find((item) => item.accountId === selectedAccount.id);
                      return (
                        <EntityViewFieldGrid>
                          <EntityViewField label="Opening Balance" value={formatCurrency(selectedAccount.openingBalance)} />
                          <EntityViewField label="Debit Total" value={formatCurrency(row?.debit ?? 0)} />
                          <EntityViewField label="Credit Total" value={formatCurrency(row?.credit ?? 0)} />
                          <EntityViewField label="Closing Balance" value={formatCurrency(row?.balance ?? 0)} />
                        </EntityViewFieldGrid>
                      );
                    })()}
                  </EntityViewSection>
                </EntityViewTabContent>
              </EntityViewTabs>
            </EntityViewBody>
            <EntityViewFooter onClose={() => setDrawerOpen(false)} />
          </>
        )}
      </EntityViewDrawer>

      <EntityViewDrawer open={drawerOpen && drawerType === 'journal'} onOpenChange={setDrawerOpen}>
        {selectedEntry && (
          <>
            <EntityViewHeader
              title={selectedEntry.entryNumber}
              subtitle={`${selectedEntry.reference} · ${selectedEntry.sourceType}`}
              onClose={() => setDrawerOpen(false)}
            />
            <EntityViewBody>
              <EntityViewKpiStrip
                items={[
                  { label: 'Entry Date', value: formatDrawerDate(selectedEntry.entryDate), icon: <FileEdit className="h-4 w-4 text-blue-600" />, accentClassName: 'text-blue-600' },
                  { label: 'Status', value: selectedEntry.status, icon: <Shield className="h-4 w-4 text-amber-600" />, accentClassName: 'text-amber-600' },
                  { label: 'Lines', value: String(selectedEntry.lines.length), icon: <Book className="h-4 w-4 text-violet-600" />, accentClassName: 'text-violet-600' },
                  { label: 'Source', value: selectedEntry.sourceType, icon: <Receipt className="h-4 w-4 text-emerald-600" />, accentClassName: 'text-emerald-600' },
                ]}
              />
              <EntityViewTabs defaultValue="overview">
                <EntityViewTabsList>
                  <EntityViewTabTrigger value="overview">Overview</EntityViewTabTrigger>
                  <EntityViewTabTrigger value="lines">Lines</EntityViewTabTrigger>
                </EntityViewTabsList>
                <EntityViewTabContent value="overview">
                  <EntityViewSection title="Entry Details">
                    <EntityViewFieldGrid>
                      <EntityViewField label="Entry Number" value={selectedEntry.entryNumber} />
                      <EntityViewField label="Reference" value={selectedEntry.reference} />
                      <EntityViewField label="Entry Date" value={formatDrawerDate(selectedEntry.entryDate)} />
                      <EntityViewField label="Status" value={selectedEntry.status} />
                      <EntityViewField label="Source Type" value={selectedEntry.sourceType} />
                      <EntityViewField label="Narration" value={selectedEntry.narration} />
                    </EntityViewFieldGrid>
                  </EntityViewSection>
                </EntityViewTabContent>
                <EntityViewTabContent value="lines">
                  <EntityViewSection title="Debit / Credit Lines">
                    <div className="space-y-3">
                      {selectedEntry.lines.map((line) => (
                        <div key={line.id} className="rounded-lg border p-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium">{line.accountName}</span>
                            <span className="text-sm text-muted-foreground">
                              Dr {formatCurrency(line.debitAmount)} | Cr {formatCurrency(line.creditAmount)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </EntityViewSection>
                </EntityViewTabContent>
              </EntityViewTabs>
            </EntityViewBody>
            <EntityViewFooter onClose={() => setDrawerOpen(false)} />
          </>
        )}
      </EntityViewDrawer>

      <Dialog open={accountDialogMode !== null} onOpenChange={(open) => !open && setAccountDialogMode(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{accountDialogMode === 'edit' ? 'Edit Account' : 'Create Account'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Account Code</label>
              <Input value={accountForm.accountCode} onChange={(e) => setAccountForm((current) => ({ ...current, accountCode: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Account Name</label>
              <Input value={accountForm.accountName} onChange={(e) => setAccountForm((current) => ({ ...current, accountName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Account Type</label>
              <Select value={accountForm.accountType} onValueChange={(value) => setAccountForm((current) => ({ ...current, accountType: value as AccountType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Input value={accountForm.accountCategory} onChange={(e) => setAccountForm((current) => ({ ...current, accountCategory: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Opening Balance</label>
              <Input type="number" value={accountForm.openingBalance} onChange={(e) => setAccountForm((current) => ({ ...current, openingBalance: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={accountForm.isActive} onValueChange={(value) => setAccountForm((current) => ({ ...current, isActive: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAccountDialogMode(null)}>Cancel</Button>
            <Button onClick={submitAccount}>{accountDialogMode === 'edit' ? 'Save Account' : 'Create Account'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={entryDialogMode !== null} onOpenChange={(open) => !open && setEntryDialogMode(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{entryDialogMode === 'edit' ? 'Edit Manual Journal Entry' : 'Create Manual Journal Entry'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reference</label>
              <Input value={journalForm.reference} onChange={(e) => setJournalForm((current) => ({ ...current, reference: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Entry Date</label>
              <Input type="date" value={journalForm.entryDate} onChange={(e) => setJournalForm((current) => ({ ...current, entryDate: e.target.value }))} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Narration</label>
              <Input value={journalForm.narration} onChange={(e) => setJournalForm((current) => ({ ...current, narration: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Debit Account</label>
              <Select value={journalForm.debitAccountId} onValueChange={(value) => setJournalForm((current) => ({ ...current, debitAccountId: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>{account.accountCode} · {account.accountName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Credit Account</label>
              <Select value={journalForm.creditAccountId} onValueChange={(value) => setJournalForm((current) => ({ ...current, creditAccountId: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>{account.accountCode} · {account.accountName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input type="number" value={journalForm.amount} onChange={(e) => setJournalForm((current) => ({ ...current, amount: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={journalForm.status} onValueChange={(value) => setJournalForm((current) => ({ ...current, status: value as 'Draft' | 'Posted' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Posted">Posted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEntryDialogMode(null)}>Cancel</Button>
            <Button onClick={submitJournalEntry}>{entryDialogMode === 'edit' ? 'Save Entry' : 'Create Entry'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}
    </MainLayout>
  );
}
