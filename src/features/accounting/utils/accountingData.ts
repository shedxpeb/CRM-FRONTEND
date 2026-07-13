import { BankAccount, Expense, Invoice, Payment, Transaction } from '@/features/finance/types';
import { DerivedInvoice, deriveInvoices } from '@/features/finance/utils/financeDerivedData';

export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';

export interface AccountingAccount {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  accountCategory: string;
  parentAccountId?: string;
  isSystemAccount: boolean;
  isActive: boolean;
  openingBalance: number;
}

export interface JournalEntryLine {
  id: string;
  accountId: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  description?: string;
}

export interface AccountingJournalEntry {
  id: string;
  entryNumber: string;
  entryDate: Date;
  reference: string;
  narration: string;
  status: 'Draft' | 'Posted' | 'Reversed';
  sourceType: 'Invoice' | 'Payment' | 'Expense' | 'Manual';
  sourceId?: string;
  lines: JournalEntryLine[];
}

export interface TrialBalanceRow {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  debit: number;
  credit: number;
  balance: number;
}

export interface ProfitAndLossRow {
  label: string;
  amount: number;
}

export interface BalanceSheetSection {
  label: string;
  amount: number;
}

export interface GstSummaryRow {
  type: 'CGST' | 'SGST' | 'IGST';
  outputTax: number;
  inputTax: number;
  liability: number;
}

function money(value?: number) {
  return Number((value ?? 0).toFixed(2));
}

function entryDate(...values: Array<Date | string | undefined>) {
  const first = values.find(Boolean);
  return first ? new Date(first) : new Date();
}

function relatedBankAccountId(payment: Payment, bankAccounts: BankAccount[]) {
  const linked = bankAccounts.find((account) =>
    payment.referenceNumber?.includes(account.accountCode) ||
    payment.notes?.includes(account.accountName)
  );
  return linked?.id ?? bankAccounts[0]?.id ?? 'acc-bank-primary';
}

function expensePaid(expense: Expense, transactions: Transaction[]) {
  return (
    expense.status === 'Paid' ||
    transactions.some(
      (transaction) =>
        transaction.referenceType === 'Vendor Payment' &&
        transaction.referenceId === expense.id &&
        transaction.type === 'Debit'
    )
  );
}

export function createDefaultAccounts(bankAccounts: BankAccount[]): AccountingAccount[] {
  const bankAccountsAsLedger = bankAccounts.map((account, index) => ({
    id: `acc-bank-${account.id}`,
    accountCode: `101${index + 1}`,
    accountName: account.accountName,
    accountType: 'Asset' as const,
    accountCategory: 'Bank Accounts',
    isSystemAccount: true,
    isActive: true,
    openingBalance: 0,
  }));

  return [
    {
      id: 'acc-ar',
      accountCode: '1100',
      accountName: 'Accounts Receivable',
      accountType: 'Asset',
      accountCategory: 'Current Assets',
      isSystemAccount: true,
      isActive: true,
      openingBalance: 0,
    },
    {
      id: 'acc-gst-input',
      accountCode: '1150',
      accountName: 'GST Input Credit',
      accountType: 'Asset',
      accountCategory: 'Current Assets',
      isSystemAccount: true,
      isActive: true,
      openingBalance: 0,
    },
    ...bankAccountsAsLedger,
    {
      id: 'acc-ap',
      accountCode: '2100',
      accountName: 'Accounts Payable',
      accountType: 'Liability',
      accountCategory: 'Current Liabilities',
      isSystemAccount: true,
      isActive: true,
      openingBalance: 0,
    },
    {
      id: 'acc-gst-payable',
      accountCode: '2200',
      accountName: 'GST Payable',
      accountType: 'Liability',
      accountCategory: 'Tax Liabilities',
      isSystemAccount: true,
      isActive: true,
      openingBalance: 0,
    },
    {
      id: 'acc-equity',
      accountCode: '3000',
      accountName: `Owner's Equity`,
      accountType: 'Equity',
      accountCategory: 'Capital',
      isSystemAccount: true,
      isActive: true,
      openingBalance: 0,
    },
    {
      id: 'acc-sales',
      accountCode: '4000',
      accountName: 'Project Revenue',
      accountType: 'Income',
      accountCategory: 'Operating Income',
      isSystemAccount: true,
      isActive: true,
      openingBalance: 0,
    },
    {
      id: 'acc-material',
      accountCode: '5000',
      accountName: 'Material Consumption',
      accountType: 'Expense',
      accountCategory: 'Cost of Sales',
      isSystemAccount: true,
      isActive: true,
      openingBalance: 0,
    },
    {
      id: 'acc-opex',
      accountCode: '5100',
      accountName: 'Operating Expenses',
      accountType: 'Expense',
      accountCategory: 'Operating Expenses',
      isSystemAccount: true,
      isActive: true,
      openingBalance: 0,
    },
  ];
}

export function buildJournalEntries(params: {
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  transactions: Transaction[];
  bankAccounts: BankAccount[];
  manualEntries?: AccountingJournalEntry[];
}): AccountingJournalEntry[] {
  const {
    invoices,
    payments,
    expenses,
    transactions,
    bankAccounts,
    manualEntries = [],
  } = params;

  const derivedInvoices = deriveInvoices(invoices, payments);
  const entries: AccountingJournalEntry[] = [];

  for (const invoice of derivedInvoices) {
    if (invoice.status === 'Draft' || invoice.status === 'Cancelled') continue;
    entries.push({
      id: `je-invoice-${invoice.id}`,
      entryNumber: `JE-INV-${invoice.invoiceNumber}`,
      entryDate: entryDate(invoice.sentAt, invoice.createdAt, invoice.dueDate),
      reference: invoice.invoiceNumber,
      narration: `Invoice raised for ${invoice.customerName}`,
      status: 'Posted',
      sourceType: 'Invoice',
      sourceId: invoice.id,
      lines: [
        {
          id: `je-invoice-${invoice.id}-1`,
          accountId: 'acc-ar',
          accountName: 'Accounts Receivable',
          debitAmount: money(invoice.totalAmount),
          creditAmount: 0,
        },
        {
          id: `je-invoice-${invoice.id}-2`,
          accountId: 'acc-sales',
          accountName: 'Project Revenue',
          debitAmount: 0,
          creditAmount: money(invoice.subtotal),
        },
        {
          id: `je-invoice-${invoice.id}-3`,
          accountId: 'acc-gst-payable',
          accountName: 'GST Payable',
          debitAmount: 0,
          creditAmount: money(invoice.taxAmount),
        },
      ],
    });
  }

  for (const payment of payments) {
    if (payment.status !== 'Completed') continue;
    const bankAccountId = relatedBankAccountId(payment, bankAccounts);
    const bankAccount =
      bankAccounts.find((account) => `acc-bank-${account.id}` === bankAccountId) ??
      bankAccounts[0];
    entries.push({
      id: `je-payment-${payment.id}`,
      entryNumber: `JE-PAY-${payment.paymentNumber}`,
      entryDate: new Date(payment.paymentDate),
      reference: payment.paymentNumber,
      narration: `Payment received from ${payment.customerName}`,
      status: 'Posted',
      sourceType: 'Payment',
      sourceId: payment.id,
      lines: [
        {
          id: `je-payment-${payment.id}-1`,
          accountId: `acc-bank-${bankAccount?.id ?? 'primary'}`,
          accountName: bankAccount?.accountName ?? 'Primary Bank Account',
          debitAmount: money(payment.totalAmount),
          creditAmount: 0,
        },
        {
          id: `je-payment-${payment.id}-2`,
          accountId: 'acc-ar',
          accountName: 'Accounts Receivable',
          debitAmount: 0,
          creditAmount: money(payment.totalAmount),
        },
      ],
    });
  }

  for (const expense of expenses) {
    if (expense.status === 'Rejected' || expense.status === 'Cancelled') continue;
    const paid = expensePaid(expense, transactions);
    entries.push({
      id: `je-expense-${expense.id}`,
      entryNumber: `JE-EXP-${expense.expenseNumber}`,
      entryDate: new Date(expense.date),
      reference: expense.expenseNumber,
      narration: expense.description,
      status: expense.status === 'Pending' ? 'Draft' : 'Posted',
      sourceType: 'Expense',
      sourceId: expense.id,
      lines: [
        {
          id: `je-expense-${expense.id}-1`,
          accountId:
            expense.category === 'Material Purchase' ? 'acc-material' : 'acc-opex',
          accountName:
            expense.category === 'Material Purchase'
              ? 'Material Consumption'
              : 'Operating Expenses',
          debitAmount: money(expense.amount),
          creditAmount: 0,
        },
        {
          id: `je-expense-${expense.id}-2`,
          accountId: 'acc-gst-input',
          accountName: 'GST Input Credit',
          debitAmount: money(expense.taxAmount),
          creditAmount: 0,
        },
        {
          id: `je-expense-${expense.id}-3`,
          accountId: paid ? `acc-bank-${bankAccounts[0]?.id ?? 'primary'}` : 'acc-ap',
          accountName: paid
            ? bankAccounts[0]?.accountName ?? 'Primary Bank Account'
            : 'Accounts Payable',
          debitAmount: 0,
          creditAmount: money(expense.totalAmount),
        },
      ],
    });
  }

  return [...entries, ...manualEntries].sort(
    (a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
  );
}

export function buildTrialBalance(
  accounts: AccountingAccount[],
  entries: AccountingJournalEntry[]
): TrialBalanceRow[] {
  return accounts.map((account) => {
    let debit = 0;
    let credit = 0;

    for (const entry of entries) {
      if (entry.status === 'Reversed') continue;
      for (const line of entry.lines) {
        if (line.accountId !== account.id) continue;
        debit += line.debitAmount;
        credit += line.creditAmount;
      }
    }

    const opening = account.openingBalance ?? 0;
    const balance =
      account.accountType === 'Asset' || account.accountType === 'Expense'
        ? opening + debit - credit
        : opening + credit - debit;

    return {
      accountId: account.id,
      accountCode: account.accountCode,
      accountName: account.accountName,
      accountType: account.accountType,
      debit: money(debit),
      credit: money(credit),
      balance: money(balance),
    };
  });
}

export function buildProfitAndLoss(trialBalance: TrialBalanceRow[]) {
  const revenueRows = trialBalance
    .filter((row) => row.accountType === 'Income')
    .map((row) => ({ label: row.accountName, amount: row.credit - row.debit }));

  const expenseRows = trialBalance
    .filter((row) => row.accountType === 'Expense')
    .map((row) => ({ label: row.accountName, amount: row.debit - row.credit }));

  const totalRevenue = revenueRows.reduce((sum, row) => sum + row.amount, 0);
  const totalExpenses = expenseRows.reduce((sum, row) => sum + row.amount, 0);

  return {
    revenueRows,
    expenseRows,
    totalRevenue: money(totalRevenue),
    totalExpenses: money(totalExpenses),
    netProfit: money(totalRevenue - totalExpenses),
  };
}

export function buildBalanceSheet(trialBalance: TrialBalanceRow[]) {
  const assets = trialBalance
    .filter((row) => row.accountType === 'Asset')
    .map((row) => ({ label: row.accountName, amount: row.balance }));
  const liabilities = trialBalance
    .filter((row) => row.accountType === 'Liability')
    .map((row) => ({ label: row.accountName, amount: row.balance }));
  const equity = trialBalance
    .filter((row) => row.accountType === 'Equity')
    .map((row) => ({ label: row.accountName, amount: row.balance }));

  const pnl = buildProfitAndLoss(trialBalance);
  equity.push({ label: 'Current Period Profit', amount: pnl.netProfit });

  return {
    assets,
    liabilities,
    equity,
    totalAssets: money(assets.reduce((sum, row) => sum + row.amount, 0)),
    totalLiabilities: money(liabilities.reduce((sum, row) => sum + row.amount, 0)),
    totalEquity: money(equity.reduce((sum, row) => sum + row.amount, 0)),
  };
}

export function buildGstSummary(
  invoices: DerivedInvoice[],
  expenses: Expense[]
): GstSummaryRow[] {
  const rows: GstSummaryRow[] = [
    { type: 'CGST', outputTax: 0, inputTax: 0, liability: 0 },
    { type: 'SGST', outputTax: 0, inputTax: 0, liability: 0 },
    { type: 'IGST', outputTax: 0, inputTax: 0, liability: 0 },
  ];

  for (const invoice of invoices) {
    rows[0].outputTax += invoice.cgstAmount ?? 0;
    rows[1].outputTax += invoice.sgstAmount ?? 0;
    rows[2].outputTax += invoice.igstAmount ?? 0;
  }

  for (const expense of expenses) {
    const halfTax = (expense.taxAmount ?? 0) / 2;
    rows[0].inputTax += halfTax;
    rows[1].inputTax += halfTax;
  }

  return rows.map((row) => ({
    ...row,
    outputTax: money(row.outputTax),
    inputTax: money(row.inputTax),
    liability: money(row.outputTax - row.inputTax),
  }));
}

export function buildAccountingKpis(
  accounts: AccountingAccount[],
  entries: AccountingJournalEntry[],
  invoices: Invoice[],
  payments: Payment[],
  expenses: Expense[]
) {
  const trialBalance = buildTrialBalance(accounts, entries);
  const balanceSheet = buildBalanceSheet(trialBalance);
  const profitAndLoss = buildProfitAndLoss(trialBalance);
  const gstSummary = buildGstSummary(deriveInvoices(invoices, payments), expenses);

  return {
    assets: balanceSheet.totalAssets,
    liabilities: balanceSheet.totalLiabilities,
    revenue: profitAndLoss.totalRevenue,
    expenses: profitAndLoss.totalExpenses,
    netProfit: profitAndLoss.netProfit,
    gstPayable: gstSummary.reduce((sum, row) => sum + row.liability, 0),
  };
}
