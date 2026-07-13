import {
  AgingBucket,
  BankAccount,
  Expense,
  FinanceActivity,
  Invoice,
  Payable,
  Payment,
  Receivable,
  Transaction,
  Vendor,
} from '@/features/finance/types';

export interface DerivedInvoice extends Invoice {
  paidAmount: number;
  pendingAmount: number;
  status: Invoice['status'];
}

export interface DerivedVendor extends Vendor {
  vendorName: string;
  totalPurchases: number;
  totalPayments: number;
  outstandingBalance: number;
}

export interface DerivedBankAccount extends BankAccount {
  openingBalance: number;
  derivedBalance: number;
  inflow: number;
  outflow: number;
  transactionCount: number;
}

export interface FinanceDashboardMetrics {
  totalRevenue: number;
  outstandingAmount: number;
  totalPayments: number;
  monthlyCollections: number;
  totalExpenses: number;
  cashPosition: number;
  gstPayable: number;
}

export interface MonthlyCollectionSummary {
  anchorLabel: string;
  total: number;
}

function toTime(value?: Date | string | null) {
  if (!value) return 0;
  return new Date(value).getTime();
}

function sameMonth(date: Date | string, anchor: Date) {
  const value = new Date(date);
  return (
    value.getFullYear() === anchor.getFullYear() &&
    value.getMonth() === anchor.getMonth()
  );
}

function getAnchorDate(payments: Payment[]) {
  if (payments.length === 0) return new Date();
  const latest = [...payments].sort((a, b) => toTime(b.paymentDate) - toTime(a.paymentDate))[0];
  return new Date(latest.paymentDate);
}

function signedAmount(transaction: Transaction) {
  return transaction.type === 'Credit' ? transaction.amount : -transaction.amount;
}

function getAgingBucket(days: number): AgingBucket {
  if (days <= 30) return '0-30 Days';
  if (days <= 60) return '31-60 Days';
  if (days <= 90) return '61-90 Days';
  return '90+ Days';
}

function isCompletedPayment(payment: Payment) {
  return payment.status === 'Completed';
}

function isRevenueInvoice(invoice: Invoice) {
  return invoice.status !== 'Draft' && invoice.status !== 'Cancelled';
}

function isExpenseIncluded(expense: Expense) {
  return expense.status !== 'Rejected' && expense.status !== 'Cancelled';
}

function deriveInvoiceStatus(
  baseStatus: Invoice['status'],
  pendingAmount: number,
  paidAmount: number,
  dueDate: Date
): Invoice['status'] {
  if (baseStatus === 'Cancelled') return 'Cancelled';
  if (baseStatus === 'Draft') return 'Draft';
  if (pendingAmount <= 0) return 'Paid';
  if (paidAmount > 0) return 'Partially Paid';
  if (new Date(dueDate).getTime() < Date.now()) return 'Overdue';
  if (baseStatus === 'Viewed') return 'Viewed';
  return 'Sent';
}

export function deriveInvoices(invoices: Invoice[], payments: Payment[]): DerivedInvoice[] {
  const paymentTotals = new Map<string, number>();

  for (const payment of payments) {
    if (!payment.invoiceId || !isCompletedPayment(payment)) continue;
    paymentTotals.set(
      payment.invoiceId,
      (paymentTotals.get(payment.invoiceId) ?? 0) + payment.totalAmount
    );
  }

  return invoices.map((invoice) => {
    const paidAmount = paymentTotals.get(invoice.id) ?? 0;
    const pendingAmount = Math.max(invoice.totalAmount - paidAmount, 0);
    return {
      ...invoice,
      paidAmount,
      pendingAmount,
      status: deriveInvoiceStatus(invoice.status, pendingAmount, paidAmount, invoice.dueDate),
    };
  });
}

export function deriveReceivables(
  invoices: DerivedInvoice[],
  filters?: { customerId?: string; search?: string }
): Receivable[] {
  const query = filters?.search?.trim().toLowerCase() ?? '';

  return invoices
    .filter((invoice) => invoice.status !== 'Draft' && invoice.status !== 'Cancelled')
    .filter((invoice) => invoice.pendingAmount > 0)
    .filter((invoice) => !filters?.customerId || invoice.customerId === filters.customerId)
    .filter((invoice) => {
      if (!query) return true;
      return (
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.customerName.toLowerCase().includes(query) ||
        invoice.projectName?.toLowerCase().includes(query)
      );
    })
    .map((invoice) => {
      const overdueDays = Math.max(
        0,
        Math.floor((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))
      );

      return {
        id: `rec-${invoice.id}`,
        customerId: invoice.customerId,
        customerName: invoice.customerName,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.createdAt ?? invoice.sentAt ?? invoice.dueDate,
        projectId: invoice.projectId,
        projectName: invoice.projectName,
        totalAmount: invoice.totalAmount,
        paidAmount: invoice.paidAmount,
        pendingAmount: invoice.pendingAmount,
        dueDate: invoice.dueDate,
        overdueDays,
        agingBucket: getAgingBucket(overdueDays),
        status: overdueDays > 0 ? 'Overdue' : invoice.paidAmount > 0 ? 'Partial' : 'Pending',
      };
    });
}

export function derivePayables(
  expenses: Expense[],
  vendors: Vendor[],
  transactions: Transaction[],
  filters?: { vendorId?: string; search?: string }
): Payable[] {
  const vendorById = new Map(vendors.map((vendor) => [vendor.id, vendor]));
  const paymentsByExpense = new Map<string, number>();
  const query = filters?.search?.trim().toLowerCase() ?? '';

  for (const transaction of transactions) {
    if (
      transaction.referenceType === 'Vendor Payment' &&
      transaction.referenceId &&
      transaction.type === 'Debit'
    ) {
      paymentsByExpense.set(
        transaction.referenceId,
        (paymentsByExpense.get(transaction.referenceId) ?? 0) + transaction.amount
      );
    }
  }

  return expenses
    .filter(isExpenseIncluded)
    .filter((expense) => !filters?.vendorId || expense.vendorId === filters.vendorId)
    .filter((expense) => {
      if (!query) return true;
      return (
        expense.expenseNumber.toLowerCase().includes(query) ||
        expense.vendorName.toLowerCase().includes(query) ||
        expense.description.toLowerCase().includes(query)
      );
    })
    .map((expense) => {
      const vendor = vendorById.get(expense.vendorId);
      const paidAmount =
        expense.status === 'Paid'
          ? expense.totalAmount
          : Math.min(expense.totalAmount, paymentsByExpense.get(expense.id) ?? 0);
      const pendingAmount = Math.max(expense.totalAmount - paidAmount, 0);
      const dueDate = new Date(expense.date);
      dueDate.setDate(dueDate.getDate() + (vendor?.creditPeriod ?? 30));
      const overdueDays = Math.max(
        0,
        Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      );

      return {
        id: `payable-${expense.id}`,
        vendorId: expense.vendorId,
        vendorName: expense.vendorName,
        billId: expense.id,
        billNumber: expense.expenseNumber,
        billDate: expense.date,
        projectId: expense.projectId,
        projectName: expense.projectName,
        totalAmount: expense.totalAmount,
        paidAmount,
        pendingAmount,
        dueDate,
        overdueDays,
        agingBucket: getAgingBucket(overdueDays),
        status: (
          paidAmount > 0
            ? overdueDays > 0
              ? 'Overdue'
              : 'Partial'
            : overdueDays > 0
              ? 'Overdue'
              : 'Pending'
        ) as Payable['status'],
      };
    })
    .filter((row) => row.pendingAmount > 0);
}

export function deriveVendorSummaries(
  vendors: Vendor[],
  expenses: Expense[],
  transactions: Transaction[]
): DerivedVendor[] {
  const payables = derivePayables(expenses, vendors, transactions);
  const payableByVendor = new Map<string, Payable[]>();

  for (const payable of payables) {
    const list = payableByVendor.get(payable.vendorId) ?? [];
    list.push(payable);
    payableByVendor.set(payable.vendorId, list);
  }

  return vendors.map((vendor) => {
    const vendorPayables = payableByVendor.get(vendor.id) ?? [];
    const totalPurchases = vendorPayables.reduce((sum, row) => sum + row.totalAmount, 0);
    const totalPayments = vendorPayables.reduce((sum, row) => sum + row.paidAmount, 0);
    const outstandingBalance = vendorPayables.reduce((sum, row) => sum + row.pendingAmount, 0);

    return {
      ...vendor,
      vendorName: vendor.name,
      totalPurchases,
      totalPayments,
      outstandingBalance,
    };
  });
}

export function deriveBankAccountSummaries(
  bankAccounts: BankAccount[],
  transactions: Transaction[]
): DerivedBankAccount[] {
  return bankAccounts.map((account) => {
    const accountTransactions = transactions
      .filter((transaction) => transaction.bankAccountId === account.id)
      .sort((a, b) => toTime(a.transactionDate) - toTime(b.transactionDate));

    const inflow = accountTransactions
      .filter((transaction) => transaction.type === 'Credit')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const outflow = accountTransactions
      .filter((transaction) => transaction.type === 'Debit')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const latestBalance =
      accountTransactions.length > 0
        ? accountTransactions[accountTransactions.length - 1].balance ??
          account.currentBalance + inflow - outflow
        : account.currentBalance;

    const openingBalance = latestBalance - inflow + outflow;

    return {
      ...account,
      openingBalance,
      derivedBalance: latestBalance,
      inflow,
      outflow,
      transactionCount: accountTransactions.length,
    };
  });
}

export function deriveMonthlyCollections(payments: Payment[]): MonthlyCollectionSummary {
  const anchor = getAnchorDate(payments);
  const total = payments
    .filter(isCompletedPayment)
    .filter((payment) => sameMonth(payment.paymentDate, anchor))
    .reduce((sum, payment) => sum + payment.totalAmount, 0);

  return {
    anchorLabel: anchor.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
    total,
  };
}

export function deriveFinanceDashboardMetrics(
  invoices: DerivedInvoice[],
  payments: Payment[],
  expenses: Expense[],
  bankAccounts: DerivedBankAccount[]
): FinanceDashboardMetrics {
  const totalRevenue = invoices
    .filter(isRevenueInvoice)
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  const outstandingAmount = invoices.reduce((sum, invoice) => sum + invoice.pendingAmount, 0);
  const totalPayments = payments
    .filter(isCompletedPayment)
    .reduce((sum, payment) => sum + payment.totalAmount, 0);
  const totalExpenses = expenses
    .filter(isExpenseIncluded)
    .reduce((sum, expense) => sum + expense.totalAmount, 0);
  const cashPosition = bankAccounts.reduce((sum, account) => sum + account.derivedBalance, 0);

  const outputTax = invoices
    .filter(isRevenueInvoice)
    .reduce((sum, invoice) => sum + (invoice.taxAmount ?? 0), 0);
  const inputTax = expenses
    .filter(isExpenseIncluded)
    .reduce((sum, expense) => sum + (expense.taxAmount ?? 0), 0);

  return {
    totalRevenue,
    outstandingAmount,
    totalPayments,
    monthlyCollections: deriveMonthlyCollections(payments).total,
    totalExpenses,
    cashPosition,
    gstPayable: outputTax - inputTax,
  };
}

export function deriveFinanceActivities(
  activities: FinanceActivity[],
  invoices: DerivedInvoice[],
  payments: Payment[],
  expenses: Expense[]
) {
  if (activities.length > 0) {
    return activities
      .slice()
      .sort((a, b) => toTime(b.performedAt) - toTime(a.performedAt));
  }

  const generated = [
    ...invoices.map((invoice) => ({
      id: `invoice-${invoice.id}`,
      type: 'invoice',
      description: `${invoice.invoiceNumber} for ${invoice.customerName}`,
      performedBy: 'Finance',
      performedAt: invoice.sentAt ?? invoice.createdAt ?? invoice.dueDate,
    })),
    ...payments.map((payment) => ({
      id: `payment-${payment.id}`,
      type: 'payment',
      description: `${payment.paymentNumber} received from ${payment.customerName}`,
      performedBy: 'Finance',
      performedAt: payment.paymentDate,
    })),
    ...expenses.map((expense) => ({
      id: `expense-${expense.id}`,
      type: 'expense',
      description: `${expense.expenseNumber} for ${expense.vendorName}`,
      performedBy: expense.approvedBy ?? 'Finance',
      performedAt: expense.approvedAt ?? expense.date,
    })),
  ];

  return generated.sort((a, b) => toTime(b.performedAt) - toTime(a.performedAt));
}
