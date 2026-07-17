/**
 * Finance API Service
 * All API calls for finance module - never use axios directly
 *
 * Real backend only — errors propagate (no mock fallbacks).
 */
import { apiClient } from '@/core/api';
import { guardModuleApi } from '@/core/api/capabilities';
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


export const financeApi = guardModuleApi('finance', {
  // ─── Income ───────────────────────────────────────────────────────────────

  getAllIncome: async (params?: PaginationParams & FinanceFilters): Promise<PaginatedData<Income>> => {
    try {
      const response = await apiClient.get<PaginatedData<Income>>('/finance/income', { params });
      return response.data;
    } catch (error) {
            throw error;
    }
  },

  getIncomeById: async (id: string): Promise<Income> => {
    try {
      const response = await apiClient.get<Income>(`/finance/income/${id}`);
      return response.data;
    } catch (error) {
            throw error;
    }
  },

  createIncome: (data: CreateIncomeDto) => apiClient.post<Income>('/finance/income', data).then(r => r.data),
  updateIncome: (id: string, data: any) => apiClient.patch<Income>(`/finance/income/${id}`, data).then(r => r.data),
  deleteIncome: (id: string) => apiClient.delete(`/finance/income/${id}`),

  // ─── Expenses ─────────────────────────────────────────────────────────────

  getAllExpenses: async (params?: PaginationParams & FinanceFilters): Promise<PaginatedData<Expense>> => {
    try {
      const response = await apiClient.get<PaginatedData<Expense>>('/finance/expenses', { params });
      return response.data;
    } catch (error) {
            throw error;
    }
  },

  getExpenseById: async (id: string): Promise<Expense> => {
    try {
      const response = await apiClient.get<Expense>(`/finance/expenses/${id}`);
      return response.data;
    } catch (error) {
            throw error;
    }
  },

  createExpense: (data: CreateExpenseDto) => apiClient.post<Expense>('/finance/expenses', data).then(r => r.data),
  updateExpense: (id: string, data: any) => apiClient.patch<Expense>(`/finance/expenses/${id}`, data).then(r => r.data),
  deleteExpense: (id: string) => apiClient.delete(`/finance/expenses/${id}`),
  approveExpense: (id: string) => apiClient.post<Expense>(`/finance/expenses/${id}/approve`).then(r => r.data),
  rejectExpense: (id: string, reason: string) => apiClient.post<Expense>(`/finance/expenses/${id}/reject`, { reason }).then(r => r.data),

  // ─── Invoices ─────────────────────────────────────────────────────────────

  getAllInvoices: async (params?: PaginationParams & FinanceFilters): Promise<PaginatedData<Invoice>> => {
    try {
      const response = await apiClient.get<PaginatedData<Invoice>>('/finance/invoices', { params });
      return response.data;
    } catch (error) {
            throw error;
    }
  },

  getInvoiceById: async (id: string): Promise<Invoice> => {
    try {
      const response = await apiClient.get<Invoice>(`/finance/invoices/${id}`);
      return response.data;
    } catch (error) {
            throw error;
    }
  },

  createInvoice: (data: CreateInvoiceDto) => apiClient.post<Invoice>('/finance/invoices', data).then(r => r.data),
  updateInvoice: (id: string, data: any) => apiClient.patch<Invoice>(`/finance/invoices/${id}`, data).then(r => r.data),
  deleteInvoice: (id: string) => apiClient.delete(`/finance/invoices/${id}`),
  sendInvoice: (id: string) => apiClient.post<Invoice>(`/finance/invoices/${id}/send`).then(r => r.data),
  markInvoicePaid: (id: string) => apiClient.post<Invoice>(`/finance/invoices/${id}/mark-paid`).then(r => r.data),

  // ─── Payments ─────────────────────────────────────────────────────────────

  getAllPayments: async (params?: PaginationParams & FinanceFilters): Promise<PaginatedData<Payment>> => {
    try {
      const response = await apiClient.get<PaginatedData<Payment>>('/finance/payments', { params });
      return response.data;
    } catch (error) {
            throw error;
    }
  },

  getPaymentById: async (id: string): Promise<Payment> => {
    try {
      const response = await apiClient.get<Payment>(`/finance/payments/${id}`);
      return response.data;
    } catch (error) {
            throw error;
    }
  },

  createPayment: (data: CreatePaymentDto) => apiClient.post<Payment>('/finance/payments', data).then(r => r.data),
  updatePayment: (id: string, data: any) => apiClient.patch<Payment>(`/finance/payments/${id}`, data).then(r => r.data),
  deletePayment: (id: string) => apiClient.delete(`/finance/payments/${id}`),

  // ─── Vendors ───────────────────────────────────────────────────────────────

  getAllVendors: async (): Promise<Vendor[]> => {
    try {
      const response = await apiClient.get<Vendor[]>('/finance/vendors');
      return response.data;
    } catch (error) {
            throw error;
    }
  },

  getVendorById: async (id: string): Promise<Vendor> => {
    try {
      const response = await apiClient.get<Vendor>(`/finance/vendors/${id}`);
      return response.data;
    } catch (error) {
            throw error;
    }
  },

  createVendor: (data: CreateVendorDto) => apiClient.post<Vendor>('/finance/vendors', data).then(r => r.data),
  updateVendor: (id: string, data: any) => apiClient.patch<Vendor>(`/finance/vendors/${id}`, data).then(r => r.data),
  deleteVendor: (id: string) => apiClient.delete(`/finance/vendors/${id}`),

  // ─── Bank Accounts ─────────────────────────────────────────────────────────

  getAllBankAccounts: async (): Promise<BankAccount[]> => {
    try {
      const response = await apiClient.get<BankAccount[]>('/finance/bank-accounts');
      return response.data;
    } catch (error) {
            throw error;
    }
  },

  getBankAccountById: async (id: string): Promise<BankAccount> => {
    try {
      const response = await apiClient.get<BankAccount>(`/finance/bank-accounts/${id}`);
      return response.data;
    } catch (error) {
            throw error;
    }
  },

  createBankAccount: (data: CreateBankAccountDto) => apiClient.post<BankAccount>('/finance/bank-accounts', data).then(r => r.data),
  updateBankAccount: (id: string, data: any) => apiClient.patch<BankAccount>(`/finance/bank-accounts/${id}`, data).then(r => r.data),
  deleteBankAccount: (id: string) => apiClient.delete(`/finance/bank-accounts/${id}`),

  // ─── Transactions ─────────────────────────────────────────────────────────

  getAllTransactions: async (params?: PaginationParams & FinanceFilters): Promise<PaginatedData<Transaction>> => {
    try {
      const response = await apiClient.get<PaginatedData<Transaction>>('/finance/transactions', { params });
      return response.data;
    } catch (error) {
            throw error;
    }
  },

  // ─── Receivables ─────────────────────────────────────────────────────────

  getAllReceivables: async (params?: PaginationParams & FinanceFilters): Promise<PaginatedData<Receivable>> => {
    try {
      const response = await apiClient.get<PaginatedData<Receivable>>('/finance/receivables', { params });
      return response.data;
    } catch (error) {
            throw error;
    }
  },

  // ─── Payables ────────────────────────────────────────────────────────────

  getAllPayables: async (params?: PaginationParams & FinanceFilters): Promise<PaginatedData<Payable>> => {
    try {
      const response = await apiClient.get<PaginatedData<Payable>>('/finance/payables', { params });
      return response.data;
    } catch (error) {
            throw error;
    }
  },

  // ─── Project Finance ───────────────────────────────────────────────────────

  getProjectFinance: async (projectId: string): Promise<ProjectFinance> => {
    try {
      const response = await apiClient.get<ProjectFinance>(`/finance/projects/${projectId}`);
      return response.data;
    } catch (error) {
            throw error;
    }
  },

  // ─── Stats ───────────────────────────────────────────────────────────────────

  getStats: async (): Promise<FinanceStats> => {
    try {
      const response = await apiClient.get<FinanceStats>('/finance/stats');
      return response.data;
    } catch (error) {
            throw error;
    }
  },

  // ─── Activities ─────────────────────────────────────────────────────────────

  getActivities: async (params?: PaginationParams): Promise<FinanceActivity[]> => {
    try {
      const response = await apiClient.get<FinanceActivity[]>('/finance/activities', { params });
      return response.data;
    } catch (error) {
            throw error;
    }
  },
});
