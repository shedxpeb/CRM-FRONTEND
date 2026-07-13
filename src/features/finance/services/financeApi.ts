/**
 * Finance API Service
 * All API calls for finance module - never use axios directly
 *
 * Mock fallback: When backend is unavailable, returns mock data.
 * Remove mock fallbacks once backend is connected.
 */
import { apiClient } from '@/core/api';
import {
  Income,
  Expense,
  Invoice,
  Payment,
  Vendor,
  BankAccount,
  Transaction,
  LedgerEntry,
  Receivable,
  Payable,
  ProjectFinance,
  GSTRecord,
  Budget,
  FinanceActivity,
  FinanceStats,
  FinanceFilters,
  CreateIncomeDto,
  CreateExpenseDto,
  CreateInvoiceDto,
  CreatePaymentDto,
  CreateVendorDto,
  CreateBankAccountDto,
  CreateBudgetDto,
} from '@/features/finance/types';
import { PaginatedData, PaginationParams } from '@/shared/types/pagination';

// ─── Mock Data (development only - remove when backend is ready) ─────────────

const MOCK_VENDORS: Vendor[] = [
  {
    id: 'v1',
    vendorCode: 'VND-001',
    name: 'Tata Steel Ltd',
    gstNumber: '27AAACT1234A1Z5',
    panNumber: 'AAACT1234A1Z5',
    contactPerson: 'Anil Mehta',
    mobile: '+91 98765 11111',
    email: 'sales@tatasteel.com',
    address: 'Bombay House',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    creditLimit: 5000000,
    creditPeriod: 30,
    paymentTerms: 'Net 30',
    totalPurchases: 25000000,
    totalPayments: 20000000,
    outstandingBalance: 5000000,
    performanceRating: 4.5,
    status: 'Active',
  },
  {
    id: 'v2',
    vendorCode: 'VND-002',
    name: 'JSW Steel',
    gstNumber: '27AAACJ5678B1Z3',
    panNumber: 'AAACJ5678B1Z3',
    contactPerson: 'Ravi Kumar',
    mobile: '+91 87654 22222',
    email: 'supply@jswsteel.com',
    address: 'Bandra Kurla Complex',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400051',
    creditLimit: 3000000,
    creditPeriod: 45,
    paymentTerms: 'Net 45',
    totalPurchases: 18000000,
    totalPayments: 15000000,
    outstandingBalance: 3000000,
    performanceRating: 4.2,
    status: 'Active',
  },
];

const MOCK_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'ba1',
    accountCode: 'ACC-001',
    accountName: 'PEB Solutions - Current Account',
    bankName: 'HDFC Bank',
    accountNumber: '50200012345678',
    ifscCode: 'HDFC0001234',
    branch: 'Pune Main Branch',
    accountType: 'Current',
    currentBalance: 25000000,
    status: 'Active',
  },
  {
    id: 'ba2',
    accountCode: 'ACC-002',
    accountName: 'PEB Solutions - Salary Account',
    bankName: 'ICICI Bank',
    accountNumber: '123456789012',
    ifscCode: 'ICIC0001234',
    branch: 'Pune Branch',
    accountType: 'Savings',
    currentBalance: 5000000,
    status: 'Active',
  },
];

const MOCK_INCOME: Income[] = [
  {
    id: 'inc1',
    incomeNumber: 'INC-2024-001',
    customerId: 'c1',
    customerName: 'ABC Manufacturing Ltd',
    projectId: 'p1',
    projectName: 'Warehouse Project',
    invoiceId: 'inv1',
    invoiceNumber: 'INV-2024-001',
    amount: 5000000,
    taxAmount: 900000,
    totalAmount: 5900000,
    paymentDate: new Date('2024-06-01'),
    paymentMethod: 'Bank Transfer',
    referenceNumber: 'TXN-001',
    transactionId: 'NEFT123456',
    notes: 'Advance payment for warehouse project',
    status: 'Completed',
    category: 'Advance Payment',
  },
  {
    id: 'inc2',
    incomeNumber: 'INC-2024-002',
    customerId: 'c2',
    customerName: 'XYZ Industries',
    projectId: 'p2',
    projectName: 'Factory Shed',
    invoiceId: 'inv2',
    invoiceNumber: 'INV-2024-002',
    amount: 3000000,
    taxAmount: 540000,
    totalAmount: 3540000,
    paymentDate: new Date('2024-06-05'),
    paymentMethod: 'UPI',
    referenceNumber: 'UPI-001',
    transactionId: 'UPI987654',
    notes: 'Stage 1 payment',
    status: 'Completed',
    category: 'Stage Payment',
  },
];

const MOCK_EXPENSES: Expense[] = [
  {
    id: 'exp1',
    expenseNumber: 'EXP-2024-001',
    vendorId: 'v1',
    vendorName: 'Tata Steel Ltd',
    category: 'Material Purchase',
    subCategory: 'Structural Steel',
    projectId: 'p1',
    projectName: 'Warehouse Project',
    amount: 2000000,
    taxAmount: 360000,
    totalAmount: 2360000,
    date: new Date('2024-06-02'),
    description: 'Steel purchase for warehouse project',
    receiptNumber: 'RCPT-001',
    invoiceNumber: 'PO-2024-001',
    notes: 'ISMB 300 Steel Beam',
    attachments: ['receipt1.pdf'],
    status: 'Approved',
    approvedBy: 'John Doe',
    approvedAt: new Date('2024-06-03'),
  },
  {
    id: 'exp2',
    expenseNumber: 'EXP-2024-002',
    vendorId: 'v2',
    vendorName: 'JSW Steel',
    category: 'Material Purchase',
    subCategory: 'Secondary Steel',
    projectId: 'p2',
    projectName: 'Factory Shed',
    amount: 1500000,
    taxAmount: 270000,
    totalAmount: 1770000,
    date: new Date('2024-06-04'),
    description: 'Purlin purchase',
    receiptNumber: 'RCPT-002',
    invoiceNumber: 'PO-2024-002',
    notes: 'Z-Purlin 200x75',
    attachments: ['receipt2.pdf'],
    status: 'Pending',
  },
];

const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV-2024-001',
    version: 1,
    customerId: 'c1',
    customerName: 'ABC Manufacturing Ltd',
    customerAddress: 'Industrial Area, Pune',
    customerGST: '27AAACT1234A1Z5',
    projectId: 'p1',
    projectName: 'Warehouse Project',
    sourceType: 'Project',
    sourceId: 'p1',
    subtotal: 5000000,
    taxAmount: 900000,
    totalAmount: 5900000,
    paidAmount: 5900000,
    pendingAmount: 0,
    gstType: 'CGST',
    cgstAmount: 450000,
    sgstAmount: 450000,
    dueDate: new Date('2024-07-01'),
    paymentTerms: 'Net 30',
    status: 'Paid',
    lineItems: [
      {
        id: 'li1',
        description: 'Warehouse Construction - Phase 1',
        quantity: 1,
        unit: 'Lot',
        rate: 5000000,
        amount: 5000000,
        taxRate: 18,
        taxAmount: 900000,
      },
    ],
    sentAt: new Date('2024-06-01'),
    viewedAt: new Date('2024-06-02'),
    paidAt: new Date('2024-06-01'),
  },
  {
    id: 'inv2',
    invoiceNumber: 'INV-2024-002',
    version: 1,
    customerId: 'c2',
    customerName: 'XYZ Industries',
    customerAddress: 'Industrial Area, Mumbai',
    customerGST: '27AAACJ5678B1Z3',
    projectId: 'p2',
    projectName: 'Factory Shed',
    sourceType: 'Project',
    sourceId: 'p2',
    subtotal: 8000000,
    taxAmount: 1440000,
    totalAmount: 9440000,
    paidAmount: 3540000,
    pendingAmount: 5900000,
    gstType: 'CGST',
    cgstAmount: 720000,
    sgstAmount: 720000,
    dueDate: new Date('2024-07-15'),
    paymentTerms: 'Net 45',
    status: 'Partially Paid',
    lineItems: [
      {
        id: 'li2',
        description: 'Factory Shed Construction',
        quantity: 1,
        unit: 'Lot',
        rate: 8000000,
        amount: 8000000,
        taxRate: 18,
        taxAmount: 1440000,
      },
    ],
    sentAt: new Date('2024-06-05'),
    viewedAt: new Date('2024-06-06'),
  },
];

const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'pay1',
    paymentNumber: 'PAY-2024-001',
    type: 'Advance',
    invoiceId: 'inv1',
    invoiceNumber: 'INV-2024-001',
    customerId: 'c1',
    customerName: 'ABC Manufacturing Ltd',
    projectId: 'p1',
    projectName: 'Warehouse Project',
    amount: 5000000,
    taxAmount: 900000,
    totalAmount: 5900000,
    paymentDate: new Date('2024-06-01'),
    paymentMethod: 'Bank Transfer',
    referenceNumber: 'TXN-001',
    transactionId: 'NEFT123456',
    notes: 'Advance payment',
    attachments: ['receipt.pdf'],
    status: 'Completed',
  },
  {
    id: 'pay2',
    paymentNumber: 'PAY-2024-002',
    type: 'Stage',
    invoiceId: 'inv2',
    invoiceNumber: 'INV-2024-002',
    customerId: 'c2',
    customerName: 'XYZ Industries',
    projectId: 'p2',
    projectName: 'Factory Shed',
    amount: 3000000,
    taxAmount: 540000,
    totalAmount: 3540000,
    paymentDate: new Date('2024-06-05'),
    paymentMethod: 'UPI',
    referenceNumber: 'UPI-001',
    transactionId: 'UPI987654',
    notes: 'Stage 1 payment',
    attachments: [],
    status: 'Completed',
  },
];

const MOCK_RECEIVABLES: Receivable[] = [
  {
    id: 'rec1',
    customerId: 'c2',
    customerName: 'XYZ Industries',
    invoiceId: 'inv2',
    invoiceNumber: 'INV-2024-002',
    invoiceDate: new Date('2024-06-05'),
    projectId: 'p2',
    projectName: 'Factory Shed',
    totalAmount: 9440000,
    paidAmount: 3540000,
    pendingAmount: 5900000,
    dueDate: new Date('2024-07-15'),
    overdueDays: 0,
    agingBucket: '0-30 Days',
    status: 'Partial',
  },
];

const MOCK_PAYABLES: Payable[] = [
  {
    id: 'payb1',
    vendorId: 'v2',
    vendorName: 'JSW Steel',
    billId: 'exp2',
    billNumber: 'EXP-2024-002',
    billDate: new Date('2024-06-04'),
    projectId: 'p2',
    projectName: 'Factory Shed',
    totalAmount: 1770000,
    paidAmount: 0,
    pendingAmount: 1770000,
    dueDate: new Date('2024-07-04'),
    overdueDays: 0,
    agingBucket: '0-30 Days',
    status: 'Pending',
  },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn1',
    transactionNumber: 'TXN-001',
    type: 'Credit',
    category: 'Income',
    amount: 5900000,
    balance: 30900000,
    referenceType: 'Payment',
    referenceId: 'pay1',
    referenceNumber: 'NEFT123456',
    bankAccountId: 'ba1',
    bankAccountName: 'PEB Solutions - Current Account',
    description: 'Advance payment from ABC Manufacturing Ltd',
    transactionDate: new Date('2024-06-01'),
  },
  {
    id: 'txn2',
    transactionNumber: 'TXN-002',
    type: 'Debit',
    category: 'Expense',
    amount: 2360000,
    balance: 28540000,
    referenceType: 'Vendor Payment',
    referenceId: 'exp1',
    referenceNumber: 'PO-2024-001',
    bankAccountId: 'ba1',
    bankAccountName: 'PEB Solutions - Current Account',
    description: 'Payment to Tata Steel Ltd',
    transactionDate: new Date('2024-06-03'),
  },
];

const MOCK_PROJECT_FINANCE: ProjectFinance[] = [
  {
    id: 'pf1',
    projectId: 'p1',
    projectName: 'Warehouse Project',
    estimatedCost: 15000000,
    actualCost: 12000000,
    budgetVariance: 3000000,
    remainingBudget: 3000000,
    totalRevenue: 20000000,
    receivedAmount: 5900000,
    pendingReceivables: 14100000,
    totalExpenses: 12000000,
    materialCost: 8000000,
    labourCost: 3000000,
    otherCost: 1000000,
    grossProfit: 8000000,
    netProfit: 5000000,
    profitMargin: 25,
    pendingPayables: 2000000,
    financialHealth: 'Healthy',
    lastUpdated: new Date('2024-06-10'),
  },
];

const MOCK_ACTIVITIES: FinanceActivity[] = [
  {
    id: 'fa1',
    type: 'income_created',
    description: 'Income created: ₹5,900,000 from ABC Manufacturing Ltd',
    performedBy: 'John Doe',
    performedAt: new Date('2024-06-01T10:00:00'),
  },
  {
    id: 'fa2',
    type: 'expense_created',
    description: 'Expense created: ₹2,360,000 to Tata Steel Ltd',
    performedBy: 'John Doe',
    performedAt: new Date('2024-06-02T14:30:00'),
  },
  {
    id: 'fa3',
    type: 'invoice_sent',
    description: 'Invoice INV-2024-001 sent to ABC Manufacturing Ltd',
    performedBy: 'Jane Smith',
    performedAt: new Date('2024-06-01T11:00:00'),
  },
  {
    id: 'fa4',
    type: 'payment_completed',
    description: 'Payment completed: ₹5,900,000 received via Bank Transfer',
    performedBy: 'System',
    performedAt: new Date('2024-06-01T12:00:00'),
  },
];

const MOCK_STATS: FinanceStats = {
  totalInvoiced: 9440000,
  totalReceived: 3540000,
  totalExpenses: 4130000,
  pendingReceivables: 5900000,
  pendingPayables: 1770000,
  monthlyRevenue: 9440000,
  monthlyExpenses: 4130000,
  cashInflow: 9440000,
  cashOutflow: 4130000,
  outstandingInvoices: 1,
  overduePayments: 0,
  gstLiability: 270000,
  availableCashPosition: 30000000,
  projectProfitability: 25,
  // Optional percentage changes
  totalInvoicedChange: 12.5,
  totalReceivedChange: 15.3,
  totalExpensesChange: -8.2,
  pendingReceivablesChange: -5.1,
  pendingPayablesChange: 3.2,
  cashInflowChange: 18.7,
  cashOutflowChange: -12.4,
  availableCashChange: 8.9,
};

/** Check if error is a connection failure (no backend) or 404 (endpoint not implemented) */
function isConnectionError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const err = error as any;
    if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED' || err.code === 'ERR_CONNECTION_REFUSED') return true;
    if (!err.response && err.message && err.message.toLowerCase().includes('network')) return true;
    // Also treat 404 errors as connection errors to trigger mock fallback
    if (err.response && err.response.status === 404) return true;
  }
  return false;
}

// ─── API Service ──────────────────────────────────────────────────────────────

export const financeApi = {
  // ─── Income ───────────────────────────────────────────────────────────────

  getAllIncome: async (params?: PaginationParams & FinanceFilters): Promise<PaginatedData<Income>> => {
    try {
      const response = await apiClient.get<PaginatedData<Income>>('/api/finance/income', { params });
      return response.data;
    } catch (error) {
      if (isConnectionError(error)) {
        const page = params?.page ?? 1;
        const pageSize = params?.pageSize ?? 20;
        return {
          data: MOCK_INCOME.slice((page - 1) * pageSize, page * pageSize),
          meta: { page, pageSize, total: MOCK_INCOME.length, totalPages: Math.ceil(MOCK_INCOME.length / pageSize), hasNext: false, hasPrevious: false },
        };
      }
      throw error;
    }
  },

  getIncomeById: async (id: string): Promise<Income> => {
    try {
      const response = await apiClient.get<Income>(`/api/finance/income/${id}`);
      return response.data;
    } catch (error) {
      if (isConnectionError(error)) {
        const income = MOCK_INCOME.find((i) => i.id === id);
        if (income) return income;
        throw new Error(`Income not found: ${id}`);
      }
      throw error;
    }
  },

  createIncome: (data: CreateIncomeDto) => apiClient.post<Income>('/api/finance/income', data).then(r => r.data),
  updateIncome: (id: string, data: any) => apiClient.patch<Income>(`/api/finance/income/${id}`, data).then(r => r.data),
  deleteIncome: (id: string) => apiClient.delete(`/api/finance/income/${id}`),

  // ─── Expenses ─────────────────────────────────────────────────────────────

  getAllExpenses: async (params?: PaginationParams & FinanceFilters): Promise<PaginatedData<Expense>> => {
    try {
      const response = await apiClient.get<PaginatedData<Expense>>('/api/finance/expenses', { params });
      return response.data;
    } catch (error) {
      if (isConnectionError(error)) {
        const page = params?.page ?? 1;
        const pageSize = params?.pageSize ?? 20;
        return {
          data: MOCK_EXPENSES.slice((page - 1) * pageSize, page * pageSize),
          meta: { page, pageSize, total: MOCK_EXPENSES.length, totalPages: Math.ceil(MOCK_EXPENSES.length / pageSize), hasNext: false, hasPrevious: false },
        };
      }
      throw error;
    }
  },

  getExpenseById: async (id: string): Promise<Expense> => {
    try {
      const response = await apiClient.get<Expense>(`/api/finance/expenses/${id}`);
      return response.data;
    } catch (error) {
      if (isConnectionError(error)) {
        const expense = MOCK_EXPENSES.find((e) => e.id === id);
        if (expense) return expense;
        throw new Error(`Expense not found: ${id}`);
      }
      throw error;
    }
  },

  createExpense: (data: CreateExpenseDto) => apiClient.post<Expense>('/api/finance/expenses', data).then(r => r.data),
  updateExpense: (id: string, data: any) => apiClient.patch<Expense>(`/api/finance/expenses/${id}`, data).then(r => r.data),
  deleteExpense: (id: string) => apiClient.delete(`/api/finance/expenses/${id}`),
  approveExpense: (id: string) => apiClient.post<Expense>(`/api/finance/expenses/${id}/approve`).then(r => r.data),
  rejectExpense: (id: string, reason: string) => apiClient.post<Expense>(`/api/finance/expenses/${id}/reject`, { reason }).then(r => r.data),

  // ─── Invoices ─────────────────────────────────────────────────────────────

  getAllInvoices: async (params?: PaginationParams & FinanceFilters): Promise<PaginatedData<Invoice>> => {
    try {
      const response = await apiClient.get<PaginatedData<Invoice>>('/api/finance/invoices', { params });
      return response.data;
    } catch (error) {
      if (isConnectionError(error)) {
        const page = params?.page ?? 1;
        const pageSize = params?.pageSize ?? 20;
        return {
          data: MOCK_INVOICES.slice((page - 1) * pageSize, page * pageSize),
          meta: { page, pageSize, total: MOCK_INVOICES.length, totalPages: Math.ceil(MOCK_INVOICES.length / pageSize), hasNext: false, hasPrevious: false },
        };
      }
      throw error;
    }
  },

  getInvoiceById: async (id: string): Promise<Invoice> => {
    try {
      const response = await apiClient.get<Invoice>(`/api/finance/invoices/${id}`);
      return response.data;
    } catch (error) {
      if (isConnectionError(error)) {
        const invoice = MOCK_INVOICES.find((i) => i.id === id);
        if (invoice) return invoice;
        throw new Error(`Invoice not found: ${id}`);
      }
      throw error;
    }
  },

  createInvoice: (data: CreateInvoiceDto) => apiClient.post<Invoice>('/api/finance/invoices', data).then(r => r.data),
  updateInvoice: (id: string, data: any) => apiClient.patch<Invoice>(`/api/finance/invoices/${id}`, data).then(r => r.data),
  deleteInvoice: (id: string) => apiClient.delete(`/api/finance/invoices/${id}`),
  sendInvoice: (id: string) => apiClient.post<Invoice>(`/api/finance/invoices/${id}/send`).then(r => r.data),
  markInvoicePaid: (id: string) => apiClient.post<Invoice>(`/api/finance/invoices/${id}/mark-paid`).then(r => r.data),

  // ─── Payments ─────────────────────────────────────────────────────────────

  getAllPayments: async (params?: PaginationParams & FinanceFilters): Promise<PaginatedData<Payment>> => {
    try {
      const response = await apiClient.get<PaginatedData<Payment>>('/api/finance/payments', { params });
      return response.data;
    } catch (error) {
      if (isConnectionError(error)) {
        const page = params?.page ?? 1;
        const pageSize = params?.pageSize ?? 20;
        return {
          data: MOCK_PAYMENTS.slice((page - 1) * pageSize, page * pageSize),
          meta: { page, pageSize, total: MOCK_PAYMENTS.length, totalPages: Math.ceil(MOCK_PAYMENTS.length / pageSize), hasNext: false, hasPrevious: false },
        };
      }
      throw error;
    }
  },

  getPaymentById: async (id: string): Promise<Payment> => {
    try {
      const response = await apiClient.get<Payment>(`/api/finance/payments/${id}`);
      return response.data;
    } catch (error) {
      if (isConnectionError(error)) {
        const payment = MOCK_PAYMENTS.find((p) => p.id === id);
        if (payment) return payment;
        throw new Error(`Payment not found: ${id}`);
      }
      throw error;
    }
  },

  createPayment: (data: CreatePaymentDto) => apiClient.post<Payment>('/api/finance/payments', data).then(r => r.data),
  updatePayment: (id: string, data: any) => apiClient.patch<Payment>(`/api/finance/payments/${id}`, data).then(r => r.data),
  deletePayment: (id: string) => apiClient.delete(`/api/finance/payments/${id}`),

  // ─── Vendors ───────────────────────────────────────────────────────────────

  getAllVendors: async (): Promise<Vendor[]> => {
    try {
      const response = await apiClient.get<Vendor[]>('/api/finance/vendors');
      return response.data;
    } catch (error) {
      if (isConnectionError(error)) return MOCK_VENDORS;
      throw error;
    }
  },

  getVendorById: async (id: string): Promise<Vendor> => {
    try {
      const response = await apiClient.get<Vendor>(`/api/finance/vendors/${id}`);
      return response.data;
    } catch (error) {
      if (isConnectionError(error)) {
        const vendor = MOCK_VENDORS.find((v) => v.id === id);
        if (vendor) return vendor;
        throw new Error(`Vendor not found: ${id}`);
      }
      throw error;
    }
  },

  createVendor: (data: CreateVendorDto) => apiClient.post<Vendor>('/api/finance/vendors', data).then(r => r.data),
  updateVendor: (id: string, data: any) => apiClient.patch<Vendor>(`/api/finance/vendors/${id}`, data).then(r => r.data),
  deleteVendor: (id: string) => apiClient.delete(`/api/finance/vendors/${id}`),

  // ─── Bank Accounts ─────────────────────────────────────────────────────────

  getAllBankAccounts: async (): Promise<BankAccount[]> => {
    try {
      const response = await apiClient.get<BankAccount[]>('/api/finance/bank-accounts');
      return response.data;
    } catch (error) {
      if (isConnectionError(error)) return MOCK_BANK_ACCOUNTS;
      throw error;
    }
  },

  getBankAccountById: async (id: string): Promise<BankAccount> => {
    try {
      const response = await apiClient.get<BankAccount>(`/api/finance/bank-accounts/${id}`);
      return response.data;
    } catch (error) {
      if (isConnectionError(error)) {
        const account = MOCK_BANK_ACCOUNTS.find((a) => a.id === id);
        if (account) return account;
        throw new Error(`Bank account not found: ${id}`);
      }
      throw error;
    }
  },

  createBankAccount: (data: CreateBankAccountDto) => apiClient.post<BankAccount>('/api/finance/bank-accounts', data).then(r => r.data),
  updateBankAccount: (id: string, data: any) => apiClient.patch<BankAccount>(`/api/finance/bank-accounts/${id}`, data).then(r => r.data),
  deleteBankAccount: (id: string) => apiClient.delete(`/api/finance/bank-accounts/${id}`),

  // ─── Transactions ─────────────────────────────────────────────────────────

  getAllTransactions: async (params?: PaginationParams & FinanceFilters): Promise<PaginatedData<Transaction>> => {
    try {
      const response = await apiClient.get<PaginatedData<Transaction>>('/api/finance/transactions', { params });
      return response.data;
    } catch (error) {
      if (isConnectionError(error)) {
        const page = params?.page ?? 1;
        const pageSize = params?.pageSize ?? 20;
        return {
          data: MOCK_TRANSACTIONS.slice((page - 1) * pageSize, page * pageSize),
          meta: { page, pageSize, total: MOCK_TRANSACTIONS.length, totalPages: Math.ceil(MOCK_TRANSACTIONS.length / pageSize), hasNext: false, hasPrevious: false },
        };
      }
      throw error;
    }
  },

  // ─── Receivables ─────────────────────────────────────────────────────────

  getAllReceivables: async (params?: PaginationParams & FinanceFilters): Promise<PaginatedData<Receivable>> => {
    try {
      const response = await apiClient.get<PaginatedData<Receivable>>('/api/finance/receivables', { params });
      return response.data;
    } catch (error) {
      if (isConnectionError(error)) {
        const page = params?.page ?? 1;
        const pageSize = params?.pageSize ?? 20;
        return {
          data: MOCK_RECEIVABLES.slice((page - 1) * pageSize, page * pageSize),
          meta: { page, pageSize, total: MOCK_RECEIVABLES.length, totalPages: Math.ceil(MOCK_RECEIVABLES.length / pageSize), hasNext: false, hasPrevious: false },
        };
      }
      throw error;
    }
  },

  // ─── Payables ────────────────────────────────────────────────────────────

  getAllPayables: async (params?: PaginationParams & FinanceFilters): Promise<PaginatedData<Payable>> => {
    try {
      const response = await apiClient.get<PaginatedData<Payable>>('/api/finance/payables', { params });
      return response.data;
    } catch (error) {
      if (isConnectionError(error)) {
        const page = params?.page ?? 1;
        const pageSize = params?.pageSize ?? 20;
        return {
          data: MOCK_PAYABLES.slice((page - 1) * pageSize, page * pageSize),
          meta: { page, pageSize, total: MOCK_PAYABLES.length, totalPages: Math.ceil(MOCK_PAYABLES.length / pageSize), hasNext: false, hasPrevious: false },
        };
      }
      throw error;
    }
  },

  // ─── Project Finance ───────────────────────────────────────────────────────

  getProjectFinance: async (projectId: string): Promise<ProjectFinance> => {
    try {
      const response = await apiClient.get<ProjectFinance>(`/api/finance/projects/${projectId}`);
      return response.data;
    } catch (error) {
      if (isConnectionError(error)) {
        const finance = MOCK_PROJECT_FINANCE.find((p) => p.projectId === projectId);
        if (finance) return finance;
        throw new Error(`Project finance not found: ${projectId}`);
      }
      throw error;
    }
  },

  // ─── Stats ───────────────────────────────────────────────────────────────────

  getStats: async (): Promise<FinanceStats> => {
    try {
      const response = await apiClient.get<FinanceStats>('/api/finance/stats');
      return response.data;
    } catch (error) {
      if (isConnectionError(error)) return MOCK_STATS;
      throw error;
    }
  },

  // ─── Activities ─────────────────────────────────────────────────────────────

  getActivities: async (params?: PaginationParams): Promise<FinanceActivity[]> => {
    try {
      const response = await apiClient.get<FinanceActivity[]>('/api/finance/activities', { params });
      return response.data;
    } catch (error) {
      if (isConnectionError(error)) return MOCK_ACTIVITIES;
      throw error;
    }
  },
};
