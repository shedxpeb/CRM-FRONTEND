/**
 * useFinance Hooks
 * React Query hooks for finance - never use useState/useEffect for server data
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/features/finance/services/financeApi';
import {
  FinanceFilters,
  CreateIncomeDto,
  CreateExpenseDto,
  CreateInvoiceDto,
  CreatePaymentDto,
  CreateVendorDto,
  CreateBankAccountDto,
} from '@/features/finance/types';
import { PaginationParams } from '@/shared/types/pagination';

// ─── Income ──────────────────────────────────────────────────────────────────

export function useIncome(params?: PaginationParams & FinanceFilters) {
  return useQuery({
    queryKey: ['finance', 'income', params],
    queryFn: () => financeApi.getAllIncome(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useIncomeById(id: string) {
  return useQuery({
    queryKey: ['finance', 'income', id],
    queryFn: () => financeApi.getIncomeById(id),
    enabled: !!id,
    refetchOnMount: false,
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIncomeDto) => financeApi.createIncome(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'income'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => financeApi.updateIncome(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'income'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'income', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteIncome(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'income'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ─── Expenses ───────────────────────────────────────────────────────────────

export function useExpenses(params?: PaginationParams & FinanceFilters, enabled: boolean = true) {
  return useQuery({
    queryKey: ['finance', 'expenses', params],
    queryFn: () => financeApi.getAllExpenses(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled,
  });
}

export function useExpenseById(id: string) {
  return useQuery({
    queryKey: ['finance', 'expenses', id],
    queryFn: () => financeApi.getExpenseById(id),
    enabled: !!id,
    refetchOnMount: false,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseDto) => financeApi.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => financeApi.updateExpense(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'expenses', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useApproveExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.approveExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useRejectExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => financeApi.rejectExpense(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ─── Invoices ────────────────────────────────────────────────────────────────

export function useInvoices(params?: PaginationParams & FinanceFilters, enabled: boolean = true) {
  return useQuery({
    queryKey: ['finance', 'invoices', params],
    queryFn: () => financeApi.getAllInvoices(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled,
  });
}

export function useInvoiceById(id: string) {
  return useQuery({
    queryKey: ['finance', 'invoices', id],
    queryFn: () => financeApi.getInvoiceById(id),
    enabled: !!id,
    refetchOnMount: false,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInvoiceDto) => financeApi.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'receivables'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => financeApi.updateInvoice(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'invoices', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'receivables'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useSendInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.sendInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useMarkInvoicePaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.markInvoicePaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'invoices'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'receivables'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ─── Payments ────────────────────────────────────────────────────────────────

export function usePayments(params?: PaginationParams & FinanceFilters, enabled: boolean = true) {
  return useQuery({
    queryKey: ['finance', 'payments', params],
    queryFn: () => financeApi.getAllPayments(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled,
  });
}

export function usePaymentById(id: string) {
  return useQuery({
    queryKey: ['finance', 'payments', id],
    queryFn: () => financeApi.getPaymentById(id),
    enabled: !!id,
    refetchOnMount: false,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentDto) => financeApi.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'receivables'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => financeApi.updatePayment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'payments', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deletePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ─── Vendors ─────────────────────────────────────────────────────────────────

export function useVendors() {
  return useQuery({
    queryKey: ['finance', 'vendors'],
    queryFn: () => financeApi.getAllVendors(),
    staleTime: 10 * 60 * 1000,
    refetchOnMount: false,
  });
}

export function useVendorById(id: string) {
  return useQuery({
    queryKey: ['finance', 'vendors', id],
    queryFn: () => financeApi.getVendorById(id),
    enabled: !!id,
    refetchOnMount: false,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVendorDto) => financeApi.createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'vendors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => financeApi.updateVendor(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'vendors'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'vendors', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'vendors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ─── Bank Accounts ───────────────────────────────────────────────────────────

export function useBankAccounts() {
  return useQuery({
    queryKey: ['finance', 'bank-accounts'],
    queryFn: () => financeApi.getAllBankAccounts(),
    staleTime: 10 * 60 * 1000,
    refetchOnMount: false,
  });
}

export function useBankAccountById(id: string) {
  return useQuery({
    queryKey: ['finance', 'bank-accounts', id],
    queryFn: () => financeApi.getBankAccountById(id),
    enabled: !!id,
    refetchOnMount: false,
  });
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBankAccountDto) => financeApi.createBankAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => financeApi.updateBankAccount(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'bank-accounts', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteBankAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'bank-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ─── Transactions ────────────────────────────────────────────────────────────

export function useTransactions(params?: PaginationParams & FinanceFilters) {
  return useQuery({
    queryKey: ['finance', 'transactions', params],
    queryFn: () => financeApi.getAllTransactions(params),
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// ─── Receivables ─────────────────────────────────────────────────────────────

export function useReceivables(params?: PaginationParams & FinanceFilters) {
  return useQuery({
    queryKey: ['finance', 'receivables', params],
    queryFn: () => financeApi.getAllReceivables(params),
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// ─── Payables ────────────────────────────────────────────────────────────────

export function usePayables(params?: PaginationParams & FinanceFilters) {
  return useQuery({
    queryKey: ['finance', 'payables', params],
    queryFn: () => financeApi.getAllPayables(params),
    staleTime: 3 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// ─── Project Finance ─────────────────────────────────────────────────────────

export function useProjectFinance(projectId: string) {
  return useQuery({
    queryKey: ['finance', 'projects', projectId],
    queryFn: () => financeApi.getProjectFinance(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
  });
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

export function useFinanceStats(enabled: boolean = true) {
  return useQuery({
    queryKey: ['finance', 'stats'],
    queryFn: () => financeApi.getStats(),
    staleTime: 2 * 60 * 1000,
    enabled,
    refetchOnMount: false,
    retry: 0, // No retry for dashboard - fail fast
  });
}

// ─── Activities ───────────────────────────────────────────────────────────────

export function useFinanceActivities(params?: PaginationParams, enabled: boolean = true) {
  return useQuery({
    queryKey: ['finance', 'activities', params],
    queryFn: () => financeApi.getActivities(params),
    staleTime: 3 * 60 * 1000,
    enabled,
    refetchOnMount: false,
  });
}
