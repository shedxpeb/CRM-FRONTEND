'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Plus,
  Receipt,
  Wallet,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toast } from '@/components/ui/toast';
import { useDebounce } from '@/shared/hooks/useDebounce';
import {
  useBankAccounts,
  useExpenses,
  useFinanceActivities,
  useInvoices,
  usePayments,
  useTransactions,
  useVendors,
} from '@/features/finance/hooks/useFinance';
import {
  BankAccount,
  CreateBankAccountDto,
  CreateExpenseDto,
  CreateInvoiceDto,
  CreatePaymentDto,
  CreateVendorDto,
  Expense,
  Invoice,
  Payment,
  Transaction,
  Vendor,
} from '@/features/finance/types';
import {
  formatCurrency,
  getExpenseStatusVariant,
  getInvoiceStatusVariant,
  getPaymentStatusVariant,
} from '@/features/finance/constants';
import {
  DerivedBankAccount,
  DerivedVendor,
  deriveBankAccountSummaries,
  deriveFinanceActivities,
  deriveFinanceDashboardMetrics,
  deriveInvoices,
  deriveMonthlyCollections,
  derivePayables,
  deriveReceivables,
  deriveVendorSummaries,
} from '@/features/finance/utils/financeDerivedData';
import { FinanceRowActions } from '@/features/finance/components/FinanceRowActions';

// Lazy load forms and drawers to reduce initial bundle size
const InvoiceForm = dynamic(() => import('@/features/finance/components/InvoiceForm').then(m => ({ default: m.InvoiceForm })), {
  loading: () => <div className="p-8 text-center">Loading form...</div>
});
const PaymentForm = dynamic(() => import('@/features/finance/components/PaymentForm').then(m => ({ default: m.PaymentForm })), {
  loading: () => <div className="p-8 text-center">Loading form...</div>
});
const ExpenseForm = dynamic(() => import('@/features/finance/components/ExpenseForm').then(m => ({ default: m.ExpenseForm })), {
  loading: () => <div className="p-8 text-center">Loading form...</div>
});
const VendorForm = dynamic(() => import('@/features/finance/components/VendorForm').then(m => ({ default: m.VendorForm })), {
  loading: () => <div className="p-8 text-center">Loading form...</div>
});
const BankAccountForm = dynamic(() => import('@/features/finance/components/BankAccountForm').then(m => ({ default: m.BankAccountForm })), {
  loading: () => <div className="p-8 text-center">Loading form...</div>
});
const InvoiceViewDrawer = dynamic(() => import('@/features/finance/components/InvoiceViewDrawer').then(m => ({ default: m.InvoiceViewDrawer })), {
  loading: () => <div className="p-8 text-center">Loading...</div>
});
const PaymentViewDrawer = dynamic(() => import('@/features/finance/components/PaymentViewDrawer').then(m => ({ default: m.PaymentViewDrawer })), {
  loading: () => <div className="p-8 text-center">Loading...</div>
});
const ExpenseViewDrawer = dynamic(() => import('@/features/finance/components/ExpenseViewDrawer').then(m => ({ default: m.ExpenseViewDrawer })), {
  loading: () => <div className="p-8 text-center">Loading...</div>
});
const VendorViewDrawer = dynamic(() => import('@/features/finance/components/VendorViewDrawer').then(m => ({ default: m.VendorViewDrawer })), {
  loading: () => <div className="p-8 text-center">Loading...</div>
});
const BankAccountViewDrawer = dynamic(() => import('@/features/finance/components/BankAccountViewDrawer').then(m => ({ default: m.BankAccountViewDrawer })), {
  loading: () => <div className="p-8 text-center">Loading...</div>
});
const ReceivableViewDrawer = dynamic(() => import('@/features/finance/components/ReceivableViewDrawer').then(m => ({ default: m.ReceivableViewDrawer })), {
  loading: () => <div className="p-8 text-center">Loading...</div>
});
const PayableViewDrawer = dynamic(() => import('@/features/finance/components/PayableViewDrawer').then(m => ({ default: m.PayableViewDrawer })), {
  loading: () => <div className="p-8 text-center">Loading...</div>
});

type FinanceTab =
  | 'dashboard'
  | 'invoices'
  | 'payments'
  | 'expenses'
  | 'receivables'
  | 'payables'
  | 'vendors'
  | 'bank-accounts';

type EditableFinanceTab = 'invoices' | 'payments' | 'expenses' | 'vendors' | 'bank-accounts';

function formatDate(value?: Date | string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function isSameMonth(value: Date | string | undefined, anchor: Date) {
  if (!value) return false;
  const date = new Date(value);
  return (
    date.getFullYear() === anchor.getFullYear() &&
    date.getMonth() === anchor.getMonth()
  );
}

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          const safe = String(value ?? '').replace(/"/g, '""');
          return `"${safe}"`;
        })
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

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<FinanceTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 250);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedEntityTab, setSelectedEntityTab] = useState<FinanceTab>('invoices');
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [editorState, setEditorState] = useState<{ mode: 'create' | 'edit'; tab: EditableFinanceTab } | null>(null);

  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('all');
  const [invoiceSourceFilter, setInvoiceSourceFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [expenseStatusFilter, setExpenseStatusFilter] = useState<string>('all');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('all');
  const [receivableAgingFilter, setReceivableAgingFilter] = useState<string>('all');
  const [payableAgingFilter, setPayableAgingFilter] = useState<string>('all');
  const [vendorStatusFilter, setVendorStatusFilter] = useState<string>('all');
  const [vendorCityFilter, setVendorCityFilter] = useState<string>('all');
  const [bankStatusFilter, setBankStatusFilter] = useState<string>('all');
  const [bankTypeFilter, setBankTypeFilter] = useState<string>('all');

  const { data: invoicesResponse, isLoading: invoicesLoading } = useInvoices({ page: 1, pageSize: 1000 }, true);
  const { data: paymentsResponse, isLoading: paymentsLoading } = usePayments({ page: 1, pageSize: 1000 }, true);
  const { data: expensesResponse, isLoading: expensesLoading } = useExpenses({ page: 1, pageSize: 1000 }, true);
  const { data: vendorsResponse, isLoading: vendorsLoading } = useVendors();
  const { data: bankAccountsResponse, isLoading: bankAccountsLoading } = useBankAccounts();
  const { data: transactionsResponse, isLoading: transactionsLoading } = useTransactions({ page: 1, pageSize: 1000 });
  const { data: activitiesResponse } = useFinanceActivities({ page: 1, pageSize: 1000 }, true);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (invoices.length === 0 && invoicesResponse?.data) setInvoices(invoicesResponse.data);
  }, [invoices.length, invoicesResponse?.data]);

  useEffect(() => {
    if (payments.length === 0 && paymentsResponse?.data) setPayments(paymentsResponse.data);
  }, [payments.length, paymentsResponse?.data]);

  useEffect(() => {
    if (expenses.length === 0 && expensesResponse?.data) setExpenses(expensesResponse.data);
  }, [expenses.length, expensesResponse?.data]);

  useEffect(() => {
    if (vendors.length === 0 && vendorsResponse) setVendors(vendorsResponse);
  }, [vendors.length, vendorsResponse]);

  useEffect(() => {
    if (bankAccounts.length === 0 && bankAccountsResponse) setBankAccounts(bankAccountsResponse);
  }, [bankAccounts.length, bankAccountsResponse]);

  useEffect(() => {
    if (transactions.length === 0 && transactionsResponse?.data) setTransactions(transactionsResponse.data);
  }, [transactions.length, transactionsResponse?.data]);

  const derivedInvoices = useMemo(() => deriveInvoices(invoices, payments), [invoices, payments]);
  const derivedBankAccounts = useMemo(
    () => deriveBankAccountSummaries(bankAccounts, transactions),
    [bankAccounts, transactions]
  );
  const receivables = useMemo(() => deriveReceivables(derivedInvoices), [derivedInvoices]);
  const payables = useMemo(
    () => derivePayables(expenses, vendors, transactions),
    [expenses, vendors, transactions]
  );
  const vendorRows = useMemo<DerivedVendor[]>(
    () => deriveVendorSummaries(vendors, expenses, transactions),
    [vendors, expenses, transactions]
  );
  const financeMetrics = useMemo(
    () => deriveFinanceDashboardMetrics(derivedInvoices, payments, expenses, derivedBankAccounts),
    [derivedInvoices, payments, expenses, derivedBankAccounts]
  );
  const monthlyCollections = useMemo(() => deriveMonthlyCollections(payments), [payments]);
  const recentActivities = useMemo(
    () => deriveFinanceActivities(activitiesResponse ?? [], derivedInvoices, payments, expenses).slice(0, 8),
    [activitiesResponse, derivedInvoices, payments, expenses]
  );
  const outstandingPayablesTotal = useMemo(
    () => payables.reduce((sum, row) => sum + row.pendingAmount, 0),
    [payables]
  );
  // Combine date-related computations to reduce re-renders
  const { dashboardAnchorDate, monthLabel, currentMonthSales, currentMonthExpenses } = useMemo(() => {
    const allDates = [
      ...derivedInvoices.map((item) => item.sentAt ?? item.createdAt ?? item.dueDate),
      ...payments.map((item) => item.paymentDate),
      ...expenses.map((item) => item.date),
    ].filter(Boolean) as Array<Date | string>;
    const anchorDate = allDates.length === 0 ? new Date() : new Date(
      [...allDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
    );
    
    const monthLbl = anchorDate.toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    });
    
    const sales = derivedInvoices
      .filter((item) => item.status !== 'Draft' && item.status !== 'Cancelled')
      .filter((item) => isSameMonth(item.sentAt ?? item.createdAt ?? item.dueDate, anchorDate))
      .reduce((sum, item) => sum + item.totalAmount, 0);
    
    const exp = expenses
      .filter((item) => item.status !== 'Rejected' && item.status !== 'Cancelled')
      .filter((item) => isSameMonth(item.date, anchorDate))
      .reduce((sum, item) => sum + item.totalAmount, 0);
    
    return { dashboardAnchorDate: anchorDate, monthLabel: monthLbl, currentMonthSales: sales, currentMonthExpenses: exp };
  }, [derivedInvoices, expenses, payments]);
  // Combine overdue counts and cash position computations
  const { netCashPosition, overdueReceivablesCount, overduePayablesCount } = useMemo(() => {
    const netCash = financeMetrics.cashPosition + financeMetrics.outstandingAmount - outstandingPayablesTotal;
    const overdueRecv = receivables.filter((row) => row.overdueDays > 0).length;
    const overduePay = payables.filter((row) => row.overdueDays > 0).length;
    return { netCashPosition: netCash, overdueReceivablesCount: overdueRecv, overduePayablesCount: overduePay };
  }, [financeMetrics.cashPosition, financeMetrics.outstandingAmount, outstandingPayablesTotal, receivables, payables]);
  const prioritizedInvoices = useMemo(
    () =>
      [...receivables]
        .sort((a, b) => {
          if (b.overdueDays !== a.overdueDays) return b.overdueDays - a.overdueDays;
          return b.pendingAmount - a.pendingAmount;
        })
        .slice(0, 6),
    [receivables]
  );
  const upcomingVendorPayments = useMemo(
    () =>
      [...payables]
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 6),
    [payables]
  );
  const topCustomers = useMemo(() => {
    const customerMap = new Map<string, { customerId: string; customerName: string; revenue: number; outstanding: number }>();
    for (const invoice of derivedInvoices) {
      if (invoice.status === 'Draft' || invoice.status === 'Cancelled') continue;
      const current = customerMap.get(invoice.customerId) ?? {
        customerId: invoice.customerId,
        customerName: invoice.customerName,
        revenue: 0,
        outstanding: 0,
      };
      current.revenue += invoice.totalAmount;
      current.outstanding += invoice.pendingAmount;
      customerMap.set(invoice.customerId, current);
    }
    return [...customerMap.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [derivedInvoices]);
  const topVendors = useMemo(
    () =>
      [...vendorRows]
        .sort((a, b) => b.totalPurchases - a.totalPurchases)
        .slice(0, 5),
    [vendorRows]
  );
  // Combine total balance computations
  const { totalBankBalance, totalInvoiceOutstanding, totalVendorOutstanding } = useMemo(() => {
    const bankBal = derivedBankAccounts.reduce((sum, row) => sum + row.derivedBalance, 0);
    const invOut = derivedInvoices.reduce((sum, row) => sum + row.pendingAmount, 0);
    const vendOut = vendorRows.reduce((sum, row) => sum + row.outstandingBalance, 0);
    return { totalBankBalance: bankBal, totalInvoiceOutstanding: invOut, totalVendorOutstanding: vendOut };
  }, [derivedBankAccounts, derivedInvoices, vendorRows]);
  const financeConsistency = useMemo(
    () => ({
      cashMatches: Math.abs(financeMetrics.cashPosition - totalBankBalance) < 0.01,
      receivablesMatch: Math.abs(financeMetrics.outstandingAmount - totalInvoiceOutstanding) < 0.01,
      payablesMatch: Math.abs(outstandingPayablesTotal - totalVendorOutstanding) < 0.01,
    }),
    [
      financeMetrics.cashPosition,
      financeMetrics.outstandingAmount,
      outstandingPayablesTotal,
      totalBankBalance,
      totalInvoiceOutstanding,
      totalVendorOutstanding,
    ]
  );
  const cashPositionHealth = useMemo(() => {
    if (financeMetrics.cashPosition >= outstandingPayablesTotal) {
      return 'Healthy';
    }
    if (financeMetrics.cashPosition + financeMetrics.outstandingAmount >= outstandingPayablesTotal) {
      return 'Warning';
    }
    return 'Critical';
  }, [financeMetrics.cashPosition, financeMetrics.outstandingAmount, outstandingPayablesTotal]);

  const isLoading =
    invoicesLoading ||
    paymentsLoading ||
    expensesLoading ||
    vendorsLoading ||
    bankAccountsLoading ||
    transactionsLoading;

  const lookupCustomer = (customerId?: string) => {
    const fromInvoice = derivedInvoices.find((item) => item.customerId === customerId);
    if (fromInvoice) {
      return {
        customerName: fromInvoice.customerName,
        customerAddress: fromInvoice.customerAddress,
        customerGST: fromInvoice.customerGST,
      };
    }
    const fromPayment = payments.find((item) => item.customerId === customerId);
    return {
      customerName: fromPayment?.customerName ?? `Customer ${customerId ?? ''}`.trim(),
      customerAddress: '',
      customerGST: undefined,
    };
  };

  const lookupProjectName = (projectId?: string) => {
    if (!projectId) return undefined;
    return (
      derivedInvoices.find((item) => item.projectId === projectId)?.projectName ??
      payments.find((item) => item.projectId === projectId)?.projectName ??
      expenses.find((item) => item.projectId === projectId)?.projectName ??
      `Project ${projectId}`
    );
  };

  const nextNumber = (prefix: string, existing: string[]) =>
    `${prefix}-${String(existing.length + 1).padStart(4, '0')}`;

  const resetTransientState = () => {
    setSelectedItem(null);
    setDeleteOpen(false);
    setRejectOpen(false);
    setRejectReason('');
    setViewOpen(false);
    setEditorState(null);
  };

  const openCreateDialog = () => {
    if (activeTab === 'dashboard') {
      setEditorState({ mode: 'create', tab: 'invoices' });
      return;
    }
    if (activeTab === 'receivables' || activeTab === 'payables') return;
    setEditorState({ mode: 'create', tab: activeTab as EditableFinanceTab });
  };

  const handleView = (item: any, tab: FinanceTab = activeTab) => {
    setSelectedItem(item);
    setSelectedEntityTab(tab);
    setViewOpen(true);
  };

  const handleEdit = (item: any, tab: EditableFinanceTab = activeTab as EditableFinanceTab) => {
    setSelectedItem(item);
    setSelectedEntityTab(tab);
    setEditorState({ mode: 'edit', tab });
  };

  const handleDelete = (item: any, tab: FinanceTab = activeTab) => {
    setSelectedItem(item);
    setSelectedEntityTab(tab);
    setDeleteOpen(true);
  };

  const handleSendInvoice = (invoice: Invoice) => {
    setInvoices((current) =>
      current.map((item) =>
        item.id === invoice.id ? { ...item, status: 'Sent', sentAt: new Date() } : item
      )
    );
    setToast({ message: `${invoice.invoiceNumber} marked as sent`, type: 'success' });
  };

  const handleApproveExpense = (expense: Expense) => {
    setExpenses((current) =>
      current.map((item) =>
        item.id === expense.id
          ? { ...item, status: 'Approved', approvedAt: new Date(), approvedBy: 'Finance User' }
          : item
      )
    );
    setToast({ message: `${expense.expenseNumber} approved`, type: 'success' });
  };

  const handleRejectExpense = (expense: Expense) => {
    setSelectedItem(expense);
    setSelectedEntityTab('expenses');
    setRejectReason('');
    setRejectOpen(true);
  };

  const confirmRejectExpense = () => {
    if (!selectedItem) return;
    setExpenses((current) =>
      current.map((item) =>
        item.id === selectedItem.id
          ? { ...item, status: 'Rejected', rejectionReason: rejectReason }
          : item
      )
    );
    setToast({ message: `${selectedItem.expenseNumber} rejected`, type: 'success' });
    resetTransientState();
  };

  const confirmDelete = () => {
    if (!selectedItem) return;

    if (selectedEntityTab === 'invoices') {
      const invoiceId = selectedItem.id;
      const linkedPaymentIds = payments.filter((item) => item.invoiceId === invoiceId).map((item) => item.id);
      setInvoices((current) => current.filter((item) => item.id !== invoiceId));
      setPayments((current) => current.filter((item) => !linkedPaymentIds.includes(item.id)));
      setTransactions((current) =>
        current.filter(
          (item) => item.referenceId !== invoiceId && !linkedPaymentIds.includes(item.referenceId ?? '')
        )
      );
      setToast({ message: 'Invoice and linked payment records removed', type: 'success' });
    }

    if (selectedEntityTab === 'payments') {
      setPayments((current) => current.filter((item) => item.id !== selectedItem.id));
      setTransactions((current) => current.filter((item) => item.referenceId !== selectedItem.id));
      setToast({ message: 'Payment deleted', type: 'success' });
    }

    if (selectedEntityTab === 'expenses') {
      setExpenses((current) => current.filter((item) => item.id !== selectedItem.id));
      setTransactions((current) => current.filter((item) => item.referenceId !== selectedItem.id));
      setToast({ message: 'Expense deleted', type: 'success' });
    }

    if (selectedEntityTab === 'vendors') {
      setVendors((current) => current.filter((item) => item.id !== selectedItem.id));
      setToast({ message: 'Vendor deleted', type: 'success' });
    }

    if (selectedEntityTab === 'bank-accounts') {
      setBankAccounts((current) => current.filter((item) => item.id !== selectedItem.id));
      setTransactions((current) => current.filter((item) => item.bankAccountId !== selectedItem.id));
      setToast({ message: 'Bank account deleted', type: 'success' });
    }

    resetTransientState();
  };

  const submitInvoice = (data: CreateInvoiceDto) => {
    const customer = lookupCustomer(data.customerId);
    if (editorState?.mode === 'edit' && selectedItem) {
      setInvoices((current) =>
        current.map((item) =>
          item.id === selectedItem.id
            ? {
                ...item,
                ...data,
                customerName: customer.customerName,
                customerAddress: customer.customerAddress,
                customerGST: customer.customerGST,
                projectName: lookupProjectName(data.projectId),
                updatedAt: new Date(),
              }
            : item
        )
      );
      setToast({ message: 'Invoice updated', type: 'success' });
    } else {
      const nextInvoice: Invoice = {
        id: `invoice-${Date.now()}`,
        invoiceNumber: nextNumber('INV', invoices.map((item) => item.invoiceNumber)),
        version: 1,
        customerId: data.customerId,
        customerName: customer.customerName,
        customerAddress: customer.customerAddress,
        customerGST: customer.customerGST,
        projectId: data.projectId,
        projectName: lookupProjectName(data.projectId),
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        subtotal: data.subtotal,
        taxAmount: data.taxAmount,
        totalAmount: data.totalAmount,
        paidAmount: 0,
        pendingAmount: data.totalAmount,
        gstType: data.gstType,
        cgstAmount: data.gstType === 'CGST' ? data.taxAmount / 2 : 0,
        sgstAmount: data.gstType === 'CGST' ? data.taxAmount / 2 : 0,
        igstAmount: data.gstType === 'IGST' ? data.taxAmount : 0,
        dueDate: data.dueDate,
        paymentTerms: data.paymentTerms,
        status: 'Draft',
        lineItems: data.lineItems,
        createdAt: new Date(),
      };
      setInvoices((current) => [nextInvoice, ...current]);
      setToast({ message: 'Invoice created', type: 'success' });
    }
    setEditorState(null);
    setSelectedItem(null);
  };

  const submitPayment = (data: CreatePaymentDto) => {
    const customer = lookupCustomer(data.customerId);
    const totalAmount = Number(data.amount) + Number(data.taxAmount ?? 0);
    const linkedInvoice = derivedInvoices.find((item) => item.id === data.invoiceId);
    const paymentId = editorState?.mode === 'edit' && selectedItem ? selectedItem.id : `payment-${Date.now()}`;
    const paymentRecord: Payment = {
      id: paymentId,
      paymentNumber:
        editorState?.mode === 'edit' && selectedItem
          ? selectedItem.paymentNumber
          : nextNumber('PAY', payments.map((item) => item.paymentNumber)),
      type: data.type,
      invoiceId: data.invoiceId,
      invoiceNumber: linkedInvoice?.invoiceNumber,
      customerId: data.customerId,
      customerName: customer.customerName,
      projectId: data.projectId,
      projectName: lookupProjectName(data.projectId),
      amount: data.amount,
      taxAmount: data.taxAmount,
      totalAmount,
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber,
      transactionId: data.transactionId,
      notes: data.notes,
      attachments: data.attachments ?? [],
      status: 'Completed',
      createdAt: editorState?.mode === 'edit' && selectedItem ? selectedItem.createdAt : new Date(),
      updatedAt: new Date(),
    };

    const transactionRecord: Transaction = {
      id: `txn-payment-${paymentId}`,
      transactionNumber:
        editorState?.mode === 'edit' && selectedItem
          ? `TXN-${selectedItem.paymentNumber}`
          : nextNumber('TXN', transactions.map((item) => item.transactionNumber)),
      type: 'Credit',
      category: 'Income',
      amount: totalAmount,
      referenceType: 'Payment',
      referenceId: paymentId,
      referenceNumber: data.referenceNumber ?? paymentRecord.paymentNumber,
      bankAccountId: bankAccounts[0]?.id,
      bankAccountName: bankAccounts[0]?.accountName,
      description: `Payment from ${customer.customerName}`,
      transactionDate: data.paymentDate,
      balance: undefined,
      createdAt: new Date(),
    };

    if (editorState?.mode === 'edit' && selectedItem) {
      setPayments((current) => current.map((item) => (item.id === paymentId ? paymentRecord : item)));
      setTransactions((current) => {
        const rest = current.filter((item) => item.referenceId !== paymentId);
        return [transactionRecord, ...rest];
      });
      setToast({ message: 'Payment updated', type: 'success' });
    } else {
      setPayments((current) => [paymentRecord, ...current]);
      setTransactions((current) => [transactionRecord, ...current]);
      setToast({ message: 'Payment created', type: 'success' });
    }
    setEditorState(null);
    setSelectedItem(null);
  };

  const submitExpense = (data: CreateExpenseDto) => {
    const vendor = vendors.find((item) => item.id === data.vendorId);
    const totalAmount = Number(data.amount) + Number(data.taxAmount ?? 0);
    const expenseRecord: Expense = {
      id: editorState?.mode === 'edit' && selectedItem ? selectedItem.id : `expense-${Date.now()}`,
      expenseNumber:
        editorState?.mode === 'edit' && selectedItem
          ? selectedItem.expenseNumber
          : nextNumber('EXP', expenses.map((item) => item.expenseNumber)),
      vendorId: data.vendorId,
      vendorName: vendor?.name ?? `Vendor ${data.vendorId}`,
      category: data.category,
      subCategory: data.subCategory,
      projectId: data.projectId,
      projectName: lookupProjectName(data.projectId),
      amount: data.amount,
      taxAmount: data.taxAmount,
      totalAmount,
      date: data.date,
      description: data.description,
      receiptNumber: data.receiptNumber,
      invoiceNumber: data.invoiceNumber,
      notes: data.notes,
      attachments: data.attachments ?? [],
      status:
        editorState?.mode === 'edit' && selectedItem
          ? selectedItem.status
          : 'Pending',
      createdAt: editorState?.mode === 'edit' && selectedItem ? selectedItem.createdAt : new Date(),
      updatedAt: new Date(),
    };

    if (editorState?.mode === 'edit' && selectedItem) {
      setExpenses((current) => current.map((item) => (item.id === expenseRecord.id ? expenseRecord : item)));
      setToast({ message: 'Expense updated', type: 'success' });
    } else {
      setExpenses((current) => [expenseRecord, ...current]);
      setToast({ message: 'Expense created', type: 'success' });
    }
    setEditorState(null);
    setSelectedItem(null);
  };

  const submitVendor = (data: CreateVendorDto) => {
    const vendorRecord: Vendor = {
      id: editorState?.mode === 'edit' && selectedItem ? selectedItem.id : `vendor-${Date.now()}`,
      vendorCode:
        editorState?.mode === 'edit' && selectedItem
          ? selectedItem.vendorCode
          : nextNumber('VND', vendors.map((item) => item.vendorCode)),
      name: data.name,
      gstNumber: data.gstNumber,
      panNumber: data.panNumber,
      contactPerson: data.contactPerson,
      mobile: data.mobile,
      email: data.email,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      creditLimit: data.creditLimit,
      creditPeriod: data.creditPeriod,
      paymentTerms: data.paymentTerms,
      totalPurchases: selectedItem?.totalPurchases ?? 0,
      totalPayments: selectedItem?.totalPayments ?? 0,
      outstandingBalance: selectedItem?.outstandingBalance ?? 0,
      performanceRating: selectedItem?.performanceRating ?? 0,
      status: selectedItem?.status ?? 'Active',
      createdAt: editorState?.mode === 'edit' && selectedItem ? selectedItem.createdAt : new Date(),
      updatedAt: new Date(),
    };

    if (editorState?.mode === 'edit' && selectedItem) {
      setVendors((current) => current.map((item) => (item.id === vendorRecord.id ? vendorRecord : item)));
      setToast({ message: 'Vendor updated', type: 'success' });
    } else {
      setVendors((current) => [vendorRecord, ...current]);
      setToast({ message: 'Vendor created', type: 'success' });
    }
    setEditorState(null);
    setSelectedItem(null);
  };

  const submitBankAccount = (data: CreateBankAccountDto) => {
    const bankAccountRecord: BankAccount = {
      id:
        editorState?.mode === 'edit' && selectedItem
          ? selectedItem.id
          : `bank-${Date.now()}`,
      accountCode:
        editorState?.mode === 'edit' && selectedItem
          ? selectedItem.accountCode
          : nextNumber('ACC', bankAccounts.map((item) => item.accountCode)),
      accountName: data.accountName,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      ifscCode: data.ifscCode,
      branch: data.branch,
      accountType: data.accountType,
      currentBalance: selectedItem?.currentBalance ?? 0,
      status: selectedItem?.status ?? 'Active',
      createdAt: editorState?.mode === 'edit' && selectedItem ? selectedItem.createdAt : new Date(),
      updatedAt: new Date(),
    };

    if (editorState?.mode === 'edit' && selectedItem) {
      setBankAccounts((current) =>
        current.map((item) => (item.id === bankAccountRecord.id ? bankAccountRecord : item))
      );
      setToast({ message: 'Bank account updated', type: 'success' });
    } else {
      setBankAccounts((current) => [bankAccountRecord, ...current]);
      setToast({ message: 'Bank account created', type: 'success' });
    }
    setEditorState(null);
    setSelectedItem(null);
  };

  const invoiceRows = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    return derivedInvoices.filter((invoice) => {
      const matchesSearch =
        !query ||
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.customerName.toLowerCase().includes(query) ||
        invoice.projectName?.toLowerCase().includes(query);
      const matchesStatus = invoiceStatusFilter === 'all' || invoice.status === invoiceStatusFilter;
      const matchesSource = invoiceSourceFilter === 'all' || invoice.sourceType === invoiceSourceFilter;
      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [debouncedSearch, derivedInvoices, invoiceSourceFilter, invoiceStatusFilter]);

  const paymentRows = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    return payments.filter((payment) => {
      const matchesSearch =
        !query ||
        payment.paymentNumber.toLowerCase().includes(query) ||
        payment.customerName.toLowerCase().includes(query) ||
        payment.referenceNumber?.toLowerCase().includes(query);
      const matchesStatus = paymentStatusFilter === 'all' || payment.status === paymentStatusFilter;
      const matchesMethod = paymentMethodFilter === 'all' || payment.paymentMethod === paymentMethodFilter;
      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [debouncedSearch, paymentMethodFilter, paymentStatusFilter, payments]);

  const expenseRows = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    return expenses.filter((expense) => {
      const matchesSearch =
        !query ||
        expense.expenseNumber.toLowerCase().includes(query) ||
        expense.vendorName.toLowerCase().includes(query) ||
        expense.description.toLowerCase().includes(query);
      const matchesStatus = expenseStatusFilter === 'all' || expense.status === expenseStatusFilter;
      const matchesCategory = expenseCategoryFilter === 'all' || expense.category === expenseCategoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [debouncedSearch, expenseCategoryFilter, expenseStatusFilter, expenses]);

  const receivableRows = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    return receivables.filter((row) => {
      const matchesSearch =
        !query ||
        row.invoiceNumber.toLowerCase().includes(query) ||
        row.customerName.toLowerCase().includes(query);
      const matchesAging = receivableAgingFilter === 'all' || row.agingBucket === receivableAgingFilter;
      return matchesSearch && matchesAging;
    });
  }, [debouncedSearch, receivableAgingFilter, receivables]);

  const payableRows = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    return payables.filter((row) => {
      const matchesSearch =
        !query ||
        row.billNumber.toLowerCase().includes(query) ||
        row.vendorName.toLowerCase().includes(query);
      const matchesAging = payableAgingFilter === 'all' || row.agingBucket === payableAgingFilter;
      return matchesSearch && matchesAging;
    });
  }, [debouncedSearch, payables, payableAgingFilter]);

  const vendorRowsFiltered = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    return vendorRows.filter((row) => {
      const matchesSearch =
        !query ||
        row.vendorCode.toLowerCase().includes(query) ||
        row.vendorName.toLowerCase().includes(query) ||
        row.contactPerson.toLowerCase().includes(query);
      const matchesStatus = vendorStatusFilter === 'all' || row.status === vendorStatusFilter;
      const matchesCity = vendorCityFilter === 'all' || row.city === vendorCityFilter;
      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [debouncedSearch, vendorCityFilter, vendorRows, vendorStatusFilter]);

  const bankRows = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    return derivedBankAccounts.filter((row) => {
      const matchesSearch =
        !query ||
        row.accountName.toLowerCase().includes(query) ||
        row.bankName.toLowerCase().includes(query) ||
        row.accountNumber.toLowerCase().includes(query);
      const matchesStatus = bankStatusFilter === 'all' || row.status === bankStatusFilter;
      const matchesType = bankTypeFilter === 'all' || row.accountType === bankTypeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [bankStatusFilter, bankTypeFilter, debouncedSearch, derivedBankAccounts]);

  const currentCities = useMemo(
    () => [...new Set(vendorRows.map((row) => row.city).filter(Boolean))].sort(),
    [vendorRows]
  );

  const currentFilters: FilterConfig[] = useMemo(() => {
    if (activeTab === 'invoices') {
      return [
        {
          key: 'invoiceStatus',
          label: 'Status',
          value: invoiceStatusFilter,
          onChange: setInvoiceStatusFilter,
          options: [
            { value: 'all', label: 'All Status' },
            ...['Draft', 'Sent', 'Viewed', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'].map((value) => ({ value, label: value })),
          ],
        },
        {
          key: 'invoiceSource',
          label: 'Source',
          value: invoiceSourceFilter,
          onChange: setInvoiceSourceFilter,
          options: [
            { value: 'all', label: 'All Sources' },
            ...['Estimate', 'Proposal', 'Quotation', 'Project', 'Manual'].map((value) => ({ value, label: value })),
          ],
        },
      ];
    }
    if (activeTab === 'payments') {
      return [
        {
          key: 'paymentStatus',
          label: 'Status',
          value: paymentStatusFilter,
          onChange: setPaymentStatusFilter,
          options: [
            { value: 'all', label: 'All Status' },
            ...['Pending', 'Processing', 'Completed', 'Failed', 'Refunded', 'Cancelled'].map((value) => ({ value, label: value })),
          ],
        },
        {
          key: 'paymentMethod',
          label: 'Method',
          value: paymentMethodFilter,
          onChange: setPaymentMethodFilter,
          options: [
            { value: 'all', label: 'All Methods' },
            ...['Bank Transfer', 'UPI', 'Cash', 'Cheque', 'RTGS', 'NEFT', 'IMPS', 'Credit Card', 'Debit Card'].map((value) => ({ value, label: value })),
          ],
        },
      ];
    }
    if (activeTab === 'expenses') {
      return [
        {
          key: 'expenseStatus',
          label: 'Status',
          value: expenseStatusFilter,
          onChange: setExpenseStatusFilter,
          options: [
            { value: 'all', label: 'All Status' },
            ...['Pending', 'Approved', 'Rejected', 'Paid', 'Cancelled'].map((value) => ({ value, label: value })),
          ],
        },
        {
          key: 'expenseCategory',
          label: 'Category',
          value: expenseCategoryFilter,
          onChange: setExpenseCategoryFilter,
          options: [
            { value: 'all', label: 'All Categories' },
            ...[
              'Material Purchase',
              'Labour Cost',
              'Transport',
              'Machinery',
              'Fabrication',
              'Installation',
              'Site Expenses',
              'Administrative Expenses',
              'Miscellaneous Expenses',
            ].map((value) => ({ value, label: value })),
          ],
        },
      ];
    }
    if (activeTab === 'receivables') {
      return [
        {
          key: 'receivableAging',
          label: 'Aging',
          value: receivableAgingFilter,
          onChange: setReceivableAgingFilter,
          options: [
            { value: 'all', label: 'All Aging' },
            ...['0-30 Days', '31-60 Days', '61-90 Days', '90+ Days'].map((value) => ({ value, label: value })),
          ],
        },
      ];
    }
    if (activeTab === 'payables') {
      return [
        {
          key: 'payableAging',
          label: 'Aging',
          value: payableAgingFilter,
          onChange: setPayableAgingFilter,
          options: [
            { value: 'all', label: 'All Aging' },
            ...['0-30 Days', '31-60 Days', '61-90 Days', '90+ Days'].map((value) => ({ value, label: value })),
          ],
        },
      ];
    }
    if (activeTab === 'vendors') {
      return [
        {
          key: 'vendorStatus',
          label: 'Status',
          value: vendorStatusFilter,
          onChange: setVendorStatusFilter,
          options: [
            { value: 'all', label: 'All Status' },
            ...['Active', 'Inactive', 'Blocked'].map((value) => ({ value, label: value })),
          ],
        },
        {
          key: 'vendorCity',
          label: 'City',
          value: vendorCityFilter,
          onChange: setVendorCityFilter,
          options: [{ value: 'all', label: 'All Cities' }, ...currentCities.map((value) => ({ value, label: value }))],
        },
      ];
    }
    if (activeTab === 'bank-accounts') {
      return [
        {
          key: 'bankStatus',
          label: 'Status',
          value: bankStatusFilter,
          onChange: setBankStatusFilter,
          options: [
            { value: 'all', label: 'All Status' },
            ...['Active', 'Inactive', 'Frozen'].map((value) => ({ value, label: value })),
          ],
        },
        {
          key: 'bankType',
          label: 'Type',
          value: bankTypeFilter,
          onChange: setBankTypeFilter,
          options: [
            { value: 'all', label: 'All Types' },
            ...['Current', 'Savings'].map((value) => ({ value, label: value })),
          ],
        },
      ];
    }
    return [];
  }, [
    activeTab,
    bankStatusFilter,
    bankTypeFilter,
    currentCities,
    expenseCategoryFilter,
    expenseStatusFilter,
    invoiceSourceFilter,
    invoiceStatusFilter,
    payableAgingFilter,
    paymentMethodFilter,
    paymentStatusFilter,
    receivableAgingFilter,
    vendorCityFilter,
    vendorStatusFilter,
  ]);

  const clearFilters = () => {
    setInvoiceStatusFilter('all');
    setInvoiceSourceFilter('all');
    setPaymentStatusFilter('all');
    setPaymentMethodFilter('all');
    setExpenseStatusFilter('all');
    setExpenseCategoryFilter('all');
    setReceivableAgingFilter('all');
    setPayableAgingFilter('all');
    setVendorStatusFilter('all');
    setVendorCityFilter('all');
    setBankStatusFilter('all');
    setBankTypeFilter('all');
  };

  const exportCurrentTab = () => {
    if (activeTab === 'invoices') {
      downloadCsv(
        'finance-invoices.csv',
        invoiceRows.map((row) => ({
          invoiceNumber: row.invoiceNumber,
          customer: row.customerName,
          totalAmount: row.totalAmount,
          paidAmount: row.paidAmount,
          pendingAmount: row.pendingAmount,
          status: row.status,
          dueDate: formatDate(row.dueDate),
        }))
      );
    }
    if (activeTab === 'payments') {
      downloadCsv(
        'finance-payments.csv',
        paymentRows.map((row) => ({
          paymentNumber: row.paymentNumber,
          customer: row.customerName,
          totalAmount: row.totalAmount,
          paymentMethod: row.paymentMethod,
          status: row.status,
          paymentDate: formatDate(row.paymentDate),
        }))
      );
    }
    if (activeTab === 'expenses') {
      downloadCsv(
        'finance-expenses.csv',
        expenseRows.map((row) => ({
          expenseNumber: row.expenseNumber,
          vendor: row.vendorName,
          category: row.category,
          totalAmount: row.totalAmount,
          status: row.status,
          date: formatDate(row.date),
        }))
      );
    }
    if (activeTab === 'receivables') {
      downloadCsv(
        'finance-receivables.csv',
        receivableRows.map((row) => ({
          invoiceNumber: row.invoiceNumber,
          customer: row.customerName,
          pendingAmount: row.pendingAmount,
          agingBucket: row.agingBucket,
          dueDate: formatDate(row.dueDate),
        }))
      );
    }
    if (activeTab === 'payables') {
      downloadCsv(
        'finance-payables.csv',
        payableRows.map((row) => ({
          billNumber: row.billNumber,
          vendor: row.vendorName,
          pendingAmount: row.pendingAmount,
          agingBucket: row.agingBucket,
          dueDate: formatDate(row.dueDate),
        }))
      );
    }
    if (activeTab === 'vendors') {
      downloadCsv(
        'finance-vendors.csv',
        vendorRowsFiltered.map((row) => ({
          vendorCode: row.vendorCode,
          vendorName: row.vendorName,
          city: row.city,
          totalPurchases: row.totalPurchases,
          outstandingBalance: row.outstandingBalance,
          status: row.status,
        }))
      );
    }
    if (activeTab === 'bank-accounts') {
      downloadCsv(
        'finance-bank-accounts.csv',
        bankRows.map((row) => ({
          accountName: row.accountName,
          bankName: row.bankName,
          accountType: row.accountType,
          currentBalance: row.derivedBalance,
          inflow: row.inflow,
          outflow: row.outflow,
          status: row.status,
        }))
      );
    }
  };

  const kpiCards = useMemo(
    () => [
      {
        title: 'Cash In Bank',
        value: formatCurrency(financeMetrics.cashPosition),
        change: 0,
        icon: <Wallet className="h-5 w-5 text-blue-600" />,
        color: 'text-blue-600',
      },
      {
        title: 'Outstanding Receivables',
        value: formatCurrency(financeMetrics.outstandingAmount),
        change: 0,
        icon: <ArrowUpRight className="h-5 w-5 text-amber-600" />,
        color: 'text-amber-600',
      },
      {
        title: 'Outstanding Payables',
        value: formatCurrency(outstandingPayablesTotal),
        change: 0,
        icon: <ArrowDownRight className="h-5 w-5 text-rose-600" />,
        color: 'text-rose-600',
      },
      {
        title: 'Net Cash Position',
        value: formatCurrency(netCashPosition),
        change: 0,
        icon: <DollarSign className="h-5 w-5 text-violet-600" />,
        color: 'text-violet-600',
      },
      {
        title: `This Month Sales (${monthLabel})`,
        value: formatCurrency(currentMonthSales),
        change: 0,
        icon: <Receipt className="h-5 w-5 text-emerald-600" />,
        color: 'text-emerald-600',
      },
      {
        title: `This Month Collections (${monthlyCollections.anchorLabel})`,
        value: formatCurrency(financeMetrics.monthlyCollections),
        change: 0,
        icon: <CreditCard className="h-5 w-5 text-green-600" />,
        color: 'text-green-600',
      },
      {
        title: `This Month Expenses (${monthLabel})`,
        value: formatCurrency(currentMonthExpenses),
        change: 0,
        icon: <FileText className="h-5 w-5 text-rose-600" />,
        color: 'text-rose-600',
      },
      {
        title: 'GST Liability',
        value: formatCurrency(financeMetrics.gstPayable),
        change: 0,
        icon: <BarChart3 className="h-5 w-5 text-cyan-600" />,
        color: 'text-cyan-600',
      },
    ],
    [
      currentMonthExpenses,
      currentMonthSales,
      financeMetrics.cashPosition,
      financeMetrics.gstPayable,
      financeMetrics.monthlyCollections,
      financeMetrics.outstandingAmount,
      monthLabel,
      monthlyCollections.anchorLabel,
      netCashPosition,
      outstandingPayablesTotal,
    ]
  );

  const invoiceColumns = useMemo(
    () => [
      { key: 'invoiceNumber', label: 'Invoice No', render: (value: string) => <span className="font-semibold">{value}</span> },
      { key: 'customerName', label: 'Customer' },
      { key: 'projectName', label: 'Project' },
      { key: 'totalAmount', label: 'Invoice Total', render: (value: number) => formatCurrency(value) },
      { key: 'paidAmount', label: 'Payments', render: (value: number) => <span className="text-green-600">{formatCurrency(value)}</span> },
      { key: 'pendingAmount', label: 'Outstanding', render: (value: number) => <span className="text-amber-600">{formatCurrency(value)}</span> },
      { key: 'status', label: 'Status', render: (value: string) => <Badge variant={getInvoiceStatusVariant(value)}>{value}</Badge> },
      { key: 'dueDate', label: 'Due Date', render: (value: Date) => formatDate(value) },
    ],
    []
  );

  const paymentColumns = useMemo(
    () => [
      { key: 'paymentNumber', label: 'Payment No', render: (value: string) => <span className="font-semibold">{value}</span> },
      { key: 'customerName', label: 'Customer' },
      { key: 'invoiceNumber', label: 'Invoice' },
      { key: 'totalAmount', label: 'Amount', render: (value: number) => <span className="text-green-600">{formatCurrency(value)}</span> },
      { key: 'paymentMethod', label: 'Method' },
      { key: 'status', label: 'Status', render: (value: string) => <Badge variant={getPaymentStatusVariant(value)}>{value}</Badge> },
      { key: 'paymentDate', label: 'Date', render: (value: Date) => formatDate(value) },
    ],
    []
  );

  const expenseColumns = useMemo(
    () => [
      { key: 'expenseNumber', label: 'Expense No', render: (value: string) => <span className="font-semibold">{value}</span> },
      { key: 'vendorName', label: 'Vendor' },
      { key: 'projectName', label: 'Project' },
      { key: 'category', label: 'Category' },
      { key: 'totalAmount', label: 'Amount', render: (value: number) => <span className="text-rose-600">{formatCurrency(value)}</span> },
      { key: 'status', label: 'Status', render: (value: string) => <Badge variant={getExpenseStatusVariant(value)}>{value}</Badge> },
      { key: 'date', label: 'Date', render: (value: Date) => formatDate(value) },
    ],
    []
  );

  const receivableColumns = useMemo(
    () => [
      { key: 'invoiceNumber', label: 'Invoice' },
      { key: 'customerName', label: 'Customer' },
      { key: 'projectName', label: 'Project' },
      { key: 'totalAmount', label: 'Invoice Total', render: (value: number) => formatCurrency(value) },
      { key: 'pendingAmount', label: 'Outstanding', render: (value: number) => <span className="text-amber-600">{formatCurrency(value)}</span> },
      { key: 'agingBucket', label: 'Aging', render: (value: string) => <Badge variant={value === '90+ Days' ? 'destructive' : 'secondary'}>{value}</Badge> },
      { key: 'dueDate', label: 'Due Date', render: (value: Date) => formatDate(value) },
    ],
    []
  );

  const payableColumns = useMemo(
    () => [
      { key: 'billNumber', label: 'Expense' },
      { key: 'vendorName', label: 'Vendor' },
      { key: 'projectName', label: 'Project' },
      { key: 'totalAmount', label: 'Bill Total', render: (value: number) => formatCurrency(value) },
      { key: 'pendingAmount', label: 'Outstanding', render: (value: number) => <span className="text-amber-600">{formatCurrency(value)}</span> },
      { key: 'agingBucket', label: 'Aging', render: (value: string) => <Badge variant={value === '90+ Days' ? 'destructive' : 'secondary'}>{value}</Badge> },
      { key: 'dueDate', label: 'Due Date', render: (value: Date) => formatDate(value) },
    ],
    []
  );

  const vendorColumns = useMemo(
    () => [
      { key: 'vendorCode', label: 'Vendor Code', render: (value: string) => <span className="font-mono text-xs">{value}</span> },
      { key: 'vendorName', label: 'Vendor Name' },
      { key: 'contactPerson', label: 'Contact' },
      { key: 'city', label: 'City' },
      { key: 'totalPurchases', label: 'Purchases', render: (value: number) => formatCurrency(value) },
      { key: 'outstandingBalance', label: 'Outstanding', render: (value: number) => <span className="text-amber-600">{formatCurrency(value)}</span> },
      { key: 'status', label: 'Status', render: (value: string) => <Badge variant={value === 'Active' ? 'success' : 'secondary'}>{value}</Badge> },
    ],
    []
  );

  const bankColumns = useMemo(
    () => [
      { key: 'accountNumber', label: 'Account Number', render: (value: string) => <span className="font-mono text-xs">{value}</span> },
      { key: 'accountName', label: 'Account' },
      { key: 'bankName', label: 'Bank' },
      { key: 'accountType', label: 'Type' },
      { key: 'derivedBalance', label: 'Balance', render: (value: number) => formatCurrency(value) },
      { key: 'inflow', label: 'Inflow', render: (value: number) => <span className="text-green-600">{formatCurrency(value)}</span> },
      { key: 'outflow', label: 'Outflow', render: (value: number) => <span className="text-rose-600">{formatCurrency(value)}</span> },
      { key: 'status', label: 'Status', render: (value: string) => <Badge variant={value === 'Active' ? 'success' : 'secondary'}>{value}</Badge> },
    ],
    []
  );

  const toolbarActions =
    activeTab !== 'dashboard' ? (
      <Button variant="outline" size="sm" onClick={exportCurrentTab} className="h-9 gap-2">
        <Download className="h-4 w-4" />
        Export
      </Button>
    ) : undefined;

  return (
    <MainLayout title="Finance" subtitle="Operational finance derived from source records">
      <StandardPageLayout
        title="Finance"
        subtitle="Invoices, payments, expenses, receivables, payables, vendors, and bank balances from source entities"
        headerActions={
          activeTab !== 'receivables' && activeTab !== 'payables' ? (
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              {activeTab === 'payments'
                ? 'Create Payment'
                : activeTab === 'expenses'
                  ? 'Create Expense'
                  : activeTab === 'vendors'
                    ? 'Create Vendor'
                    : activeTab === 'bank-accounts'
                      ? 'Create Bank Account'
                      : 'Create Invoice'}
            </Button>
          ) : undefined
        }
        kpiCards={kpiCards.map((kpi) => (
          <KPICard
            key={kpi.title}
            data={
              kpi.title === 'Cash In Bank'
                ? {
                    ...kpi,
                    previousValue: cashPositionHealth,
                    comparisonLabel: 'status',
                  }
                : kpi
            }
            showComparison={kpi.title === 'Cash In Bank'}
            onClick={
              kpi.title === 'Cash In Bank'
                ? () => setActiveTab('bank-accounts')
                : kpi.title === 'Outstanding Receivables'
                  ? () => setActiveTab('receivables')
                  : kpi.title === 'Outstanding Payables'
                    ? () => setActiveTab('payables')
                    : kpi.title === 'This Month Collections (' + monthlyCollections.anchorLabel + ')'
                      ? () => setActiveTab('payments')
                      : undefined
            }
          />
        ))}
        kpiGridClassName="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
        searchValue={activeTab === 'dashboard' ? undefined : searchQuery}
        onSearchChange={activeTab === 'dashboard' ? undefined : setSearchQuery}
        searchPlaceholder={
          activeTab === 'dashboard'
            ? undefined
            : `Search ${activeTab.replace('-', ' ')}`
        }
        filters={currentFilters}
        onClearFilters={clearFilters}
        filterMode="popover"
        toolbarActions={toolbarActions}
      >
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FinanceTab)} className="space-y-4">
          <TabsList className="h-auto w-full justify-start overflow-x-auto p-1">
            <TabsTrigger value="dashboard" className="gap-2"><BarChart3 className="h-4 w-4" />Dashboard</TabsTrigger>
            <TabsTrigger value="invoices" className="gap-2"><Receipt className="h-4 w-4" />Invoices</TabsTrigger>
            <TabsTrigger value="payments" className="gap-2"><CreditCard className="h-4 w-4" />Payments</TabsTrigger>
            <TabsTrigger value="expenses" className="gap-2"><FileText className="h-4 w-4" />Expenses</TabsTrigger>
            <TabsTrigger value="receivables" className="gap-2"><ArrowUpRight className="h-4 w-4" />Receivables</TabsTrigger>
            <TabsTrigger value="payables" className="gap-2"><ArrowDownRight className="h-4 w-4" />Payables</TabsTrigger>
            <TabsTrigger value="vendors" className="gap-2"><Building2 className="h-4 w-4" />Vendors</TabsTrigger>
            <TabsTrigger value="bank-accounts" className="gap-2"><Wallet className="h-4 w-4" />Bank Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">What Requires Attention Today</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Overdue Customer Invoices</p>
                    <p className="mt-1 text-xl font-semibold">{overdueReceivablesCount}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatCurrency(
                        receivableRows
                          .filter((row) => row.overdueDays > 0)
                          .reduce((sum, row) => sum + row.pendingAmount, 0)
                      )}{' '}
                      is already overdue.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Vendor Payments Due</p>
                    <p className="mt-1 text-xl font-semibold">{overduePayablesCount}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatCurrency(
                        payableRows
                          .filter((row) => row.overdueDays > 0)
                          .reduce((sum, row) => sum + row.pendingAmount, 0)
                      )}{' '}
                      needs immediate vendor attention.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Collections vs Payables</p>
                    <p className="mt-1 text-xl font-semibold">
                      {formatCurrency(financeMetrics.monthlyCollections - outstandingPayablesTotal)}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Near-term coverage after vendor dues are considered.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">GST Watch</p>
                    <p className="mt-1 text-xl font-semibold">{formatCurrency(financeMetrics.gstPayable)}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Net GST payable from approved source tax records.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cash Flow Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Cash In Bank</p>
                    <p className="mt-1 text-lg font-semibold">{formatCurrency(financeMetrics.cashPosition)}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Money Coming In</p>
                    <p className="mt-1 text-lg font-semibold">{formatCurrency(financeMetrics.outstandingAmount)}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Money Going Out</p>
                    <p className="mt-1 text-lg font-semibold">{formatCurrency(outstandingPayablesTotal)}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Business Position</p>
                    <p className="mt-1 text-lg font-semibold">{formatCurrency(netCashPosition)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{cashPositionHealth}</p>
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
                    <p className="text-sm text-muted-foreground">Cash In Bank</p>
                    <Badge variant={financeConsistency.cashMatches ? 'success' : 'destructive'}>
                      {financeConsistency.cashMatches ? 'Matched' : 'Mismatch'}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    KPI {formatCurrency(financeMetrics.cashPosition)} = Bank total {formatCurrency(totalBankBalance)}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Outstanding Receivables</p>
                    <Badge variant={financeConsistency.receivablesMatch ? 'success' : 'destructive'}>
                      {financeConsistency.receivablesMatch ? 'Matched' : 'Mismatch'}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    KPI {formatCurrency(financeMetrics.outstandingAmount)} = Invoice total {formatCurrency(totalInvoiceOutstanding)}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Outstanding Payables</p>
                    <Badge variant={financeConsistency.payablesMatch ? 'success' : 'destructive'}>
                      {financeConsistency.payablesMatch ? 'Matched' : 'Mismatch'}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    KPI {formatCurrency(outstandingPayablesTotal)} = Vendor total {formatCurrency(totalVendorOutstanding)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Outstanding Invoices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {prioritizedInvoices.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => handleView(row, 'receivables')}
                      className="grid w-full grid-cols-[1.6fr_1fr_auto] items-center gap-3 rounded-lg border p-3 text-left hover:bg-card-hover"
                    >
                      <div>
                        <p className="font-medium">{row.customerName}</p>
                        <p className="text-xs text-muted-foreground">{row.invoiceNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{formatDate(row.dueDate)}</p>
                        <p className="text-xs text-muted-foreground">{row.overdueDays} days outstanding</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(row.pendingAmount)}</p>
                        <p className="text-xs text-muted-foreground">{row.agingBucket}</p>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Upcoming Vendor Payments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingVendorPayments.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => handleView(row, 'payables')}
                      className="grid w-full grid-cols-[1.6fr_1fr_auto] items-center gap-3 rounded-lg border p-3 text-left hover:bg-card-hover"
                    >
                      <div>
                        <p className="font-medium">{row.vendorName}</p>
                        <p className="text-xs text-muted-foreground">{row.billNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{formatDate(row.dueDate)}</p>
                        <p className="text-xs text-muted-foreground">{row.status}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(row.pendingAmount)}</p>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{activity.performedBy}</p>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(activity.performedAt)}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Top Customers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {topCustomers.map((row) => (
                      <div key={row.customerId} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{row.customerName}</p>
                          <p className="text-sm font-semibold">{formatCurrency(row.revenue)}</p>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Outstanding {formatCurrency(row.outstanding)}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Top Vendors</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {topVendors.map((row) => (
                      <div key={row.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{row.vendorName}</p>
                          <p className="text-sm font-semibold">{formatCurrency(row.totalPurchases)}</p>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Outstanding payable {formatCurrency(row.outstandingBalance)}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="invoices">
            <DataTable
              columns={invoiceColumns}
              data={invoiceRows}
              loading={isLoading}
              rowIdKey="id"
              showToolbar={false}
              emptyMessage="No invoices found"
              rowActions={(row) => (
                <FinanceRowActions
                  onView={() => handleView(row, 'invoices')}
                  onEdit={() => handleEdit(row, 'invoices')}
                  onDelete={() => handleDelete(row, 'invoices')}
                  onSend={() => handleSendInvoice(row)}
                />
              )}
            />
          </TabsContent>

          <TabsContent value="payments">
            <DataTable
              columns={paymentColumns}
              data={paymentRows}
              loading={isLoading}
              rowIdKey="id"
              showToolbar={false}
              emptyMessage="No payments found"
              rowActions={(row) => (
                <FinanceRowActions
                  onView={() => handleView(row, 'payments')}
                  onEdit={() => handleEdit(row, 'payments')}
                  onDelete={() => handleDelete(row, 'payments')}
                />
              )}
            />
          </TabsContent>

          <TabsContent value="expenses">
            <DataTable
              columns={expenseColumns}
              data={expenseRows}
              loading={isLoading}
              rowIdKey="id"
              showToolbar={false}
              emptyMessage="No expenses found"
              rowActions={(row) => (
                <FinanceRowActions
                  onView={() => handleView(row, 'expenses')}
                  onEdit={() => handleEdit(row, 'expenses')}
                  onDelete={() => handleDelete(row, 'expenses')}
                  onApprove={() => handleApproveExpense(row)}
                  onReject={() => handleRejectExpense(row)}
                />
              )}
            />
          </TabsContent>

          <TabsContent value="receivables">
            <DataTable
              columns={receivableColumns}
              data={receivableRows}
              loading={isLoading}
              rowIdKey="id"
              showToolbar={false}
              emptyMessage="No receivables found"
              rowActions={(row) => (
                <FinanceRowActions onView={() => handleView(row, 'receivables')} />
              )}
            />
          </TabsContent>

          <TabsContent value="payables">
            <DataTable
              columns={payableColumns}
              data={payableRows}
              loading={isLoading}
              rowIdKey="id"
              showToolbar={false}
              emptyMessage="No payables found"
              rowActions={(row) => (
                <FinanceRowActions onView={() => handleView(row, 'payables')} />
              )}
            />
          </TabsContent>

          <TabsContent value="vendors">
            <DataTable
              columns={vendorColumns}
              data={vendorRowsFiltered}
              loading={isLoading}
              rowIdKey="id"
              showToolbar={false}
              emptyMessage="No vendors found"
              rowActions={(row) => (
                <FinanceRowActions
                  onView={() => handleView(row, 'vendors')}
                  onEdit={() => handleEdit(row, 'vendors')}
                  onDelete={() => handleDelete(row, 'vendors')}
                />
              )}
            />
          </TabsContent>

          <TabsContent value="bank-accounts">
            <DataTable
              columns={bankColumns}
              data={bankRows}
              loading={isLoading}
              rowIdKey="id"
              showToolbar={false}
              emptyMessage="No bank accounts found"
              rowActions={(row) => (
                <FinanceRowActions
                  onView={() => handleView(row, 'bank-accounts')}
                  onEdit={() => handleEdit(row, 'bank-accounts')}
                  onDelete={() => handleDelete(row, 'bank-accounts')}
                />
              )}
            />
          </TabsContent>
        </Tabs>
      </StandardPageLayout>

      <InvoiceViewDrawer
        invoice={selectedEntityTab === 'invoices' ? selectedItem : null}
        open={viewOpen && selectedEntityTab === 'invoices'}
        onOpenChange={setViewOpen}
      />
      <PaymentViewDrawer
        payment={selectedEntityTab === 'payments' ? selectedItem : null}
        open={viewOpen && selectedEntityTab === 'payments'}
        onOpenChange={setViewOpen}
      />
      <ExpenseViewDrawer
        expense={selectedEntityTab === 'expenses' ? selectedItem : null}
        open={viewOpen && selectedEntityTab === 'expenses'}
        onOpenChange={setViewOpen}
      />
      <ReceivableViewDrawer
        receivable={selectedEntityTab === 'receivables' ? selectedItem : null}
        open={viewOpen && selectedEntityTab === 'receivables'}
        onOpenChange={setViewOpen}
      />
      <PayableViewDrawer
        payable={selectedEntityTab === 'payables' ? selectedItem : null}
        open={viewOpen && selectedEntityTab === 'payables'}
        onOpenChange={setViewOpen}
      />
      <VendorViewDrawer
        vendor={selectedEntityTab === 'vendors' ? selectedItem : null}
        open={viewOpen && selectedEntityTab === 'vendors'}
        onOpenChange={setViewOpen}
      />
      <BankAccountViewDrawer
        bankAccount={selectedEntityTab === 'bank-accounts' ? selectedItem : null}
        open={viewOpen && selectedEntityTab === 'bank-accounts'}
        onOpenChange={setViewOpen}
      />

      <Dialog open={editorState?.tab === 'invoices'} onOpenChange={(open) => !open && setEditorState(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editorState?.mode === 'edit' ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle>
          </DialogHeader>
          {editorState?.tab === 'invoices' && (
            <InvoiceForm
              mode={editorState.mode}
              initialData={editorState.mode === 'edit' ? selectedItem : undefined}
              onSubmit={submitInvoice}
              onCancel={() => setEditorState(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editorState?.tab === 'payments'} onOpenChange={(open) => !open && setEditorState(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editorState?.mode === 'edit' ? 'Edit Payment' : 'Create Payment'}</DialogTitle>
          </DialogHeader>
          {editorState?.tab === 'payments' && (
            <PaymentForm
              mode={editorState.mode}
              initialData={editorState.mode === 'edit' ? selectedItem : undefined}
              onSubmit={submitPayment}
              onCancel={() => setEditorState(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editorState?.tab === 'expenses'} onOpenChange={(open) => !open && setEditorState(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editorState?.mode === 'edit' ? 'Edit Expense' : 'Create Expense'}</DialogTitle>
          </DialogHeader>
          {editorState?.tab === 'expenses' && (
            <ExpenseForm
              mode={editorState.mode}
              initialData={editorState.mode === 'edit' ? selectedItem : undefined}
              onSubmit={submitExpense}
              onCancel={() => setEditorState(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editorState?.tab === 'vendors'} onOpenChange={(open) => !open && setEditorState(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editorState?.mode === 'edit' ? 'Edit Vendor' : 'Create Vendor'}</DialogTitle>
          </DialogHeader>
          {editorState?.tab === 'vendors' && (
            <VendorForm
              mode={editorState.mode}
              initialData={
                editorState.mode === 'edit' && selectedItem
                  ? {
                      name: selectedItem.name ?? selectedItem.vendorName,
                      gstNumber: selectedItem.gstNumber,
                      panNumber: selectedItem.panNumber,
                      contactPerson: selectedItem.contactPerson,
                      mobile: selectedItem.mobile,
                      email: selectedItem.email,
                      address: selectedItem.address,
                      city: selectedItem.city,
                      state: selectedItem.state,
                      pincode: selectedItem.pincode,
                      creditLimit: selectedItem.creditLimit,
                      creditPeriod: selectedItem.creditPeriod,
                      paymentTerms: selectedItem.paymentTerms,
                    }
                  : undefined
              }
              onSubmit={submitVendor}
              onCancel={() => setEditorState(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editorState?.tab === 'bank-accounts'} onOpenChange={(open) => !open && setEditorState(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editorState?.mode === 'edit' ? 'Edit Bank Account' : 'Create Bank Account'}</DialogTitle>
          </DialogHeader>
          {editorState?.tab === 'bank-accounts' && (
            <BankAccountForm
              mode={editorState.mode}
              initialData={
                editorState.mode === 'edit' && selectedItem
                  ? {
                      accountName: selectedItem.accountName,
                      bankName: selectedItem.bankName,
                      accountNumber: selectedItem.accountNumber,
                      ifscCode: selectedItem.ifscCode,
                      branch: selectedItem.branch,
                      accountType: selectedItem.accountType,
                    }
                  : undefined
              }
              onSubmit={submitBankAccount}
              onCancel={() => setEditorState(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Delete <span className="font-medium text-foreground">
              {selectedItem?.invoiceNumber ??
                selectedItem?.paymentNumber ??
                selectedItem?.expenseNumber ??
                selectedItem?.vendorName ??
                selectedItem?.accountName ??
                'record'}
            </span>
            ? Source-linked derived metrics will refresh automatically.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Enter rejection reason"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" disabled={!rejectReason.trim()} onClick={confirmRejectExpense}>
                Reject
              </Button>
            </div>
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
