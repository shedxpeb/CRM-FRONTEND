import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api';
import type { CreateQuotationDto, Quotation } from '../types/peb-commercial';

// ─── Types ────────────────────────────────────────────────────────────────

interface BackendResponse<T> {
  data: T;
  message?: string;
}

interface PaginatedData<T> {
  rows: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// ─── useQuotations ────────────────────────────────────────────────────────

export function useQuotations(params?: {
  page?: number;
  pageSize?: number;
  customerId?: string;
  status?: string;
  proposalId?: string;
  projectId?: string;
  search?: string;
}) {
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['quotations', params],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (params?.page) queryParams.page = String(params.page);
      if (params?.pageSize) queryParams.pageSize = String(params.pageSize);
      if (params?.customerId) queryParams.customerId = params.customerId;
      if (params?.status) queryParams.status = params.status;
      if (params?.search) queryParams.search = params.search;

      const res = await api.get<BackendResponse<PaginatedData<Quotation>>>('/quotations', {
        params: queryParams,
      });
      return res.data.rows;
    },
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: async (dto: CreateQuotationDto) => {
      const res = await api.post<BackendResponse<Quotation>>('/quotations', dto);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Quotation> }) => {
      const res = await api.patch<BackendResponse<Quotation>>(`/quotations/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/quotations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });

  const createQuotation = useCallback(
    (dto: CreateQuotationDto) => createMutation.mutateAsync(dto),
    [createMutation],
  );

  const updateQuotation = useCallback(
    (id: string, data: Partial<Quotation>) =>
      updateMutation.mutateAsync({ id, data }),
    [updateMutation],
  );

  const deleteQuotation = useCallback(
    (id: string) => deleteMutation.mutateAsync(id),
    [deleteMutation],
  );

  const updateStatus = useCallback(
    async (id: string, status: string) => {
      const res = await api.patch<BackendResponse<Quotation>>(`/quotations/${id}/status`, { status });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      return res.data;
    },
    [queryClient],
  );

  const convertToProject = useCallback(
    async (id: string, _data?: unknown) => {
      const res = await api.patch<BackendResponse<Quotation>>(`/quotations/${id}/convert-to-project`);
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      return res.data;
    },
    [queryClient],
  );

  return {
    data: (response ?? []) as Quotation[],
    total: response?.length ?? 0,
    loading,
    error: queryError ? (queryError as Error).message : null,
    createQuotation,
    updateQuotation,
    deleteQuotation,
    updateStatus,
    convertToProject,
    refetch: useCallback(() => refetch(), [refetch]),
  };
}

// ─── useQuotation (single) ────────────────────────────────────────────────

export function useQuotation(id: string) {
  const {
    data: response,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['quotation', id],
    queryFn: async () => {
      const res = await api.get<BackendResponse<Quotation>>(`/quotations/${id}`);
      return res.data;
    },
    enabled: !!id,
    staleTime: 30_000,
  });

  return {
    data: (response ?? null) as Quotation | null,
    loading,
    error: queryError ? (queryError as Error).message : null,
    refetch: useCallback(() => refetch(), [refetch]),
  };
}

// ─── useQuotationStats ────────────────────────────────────────────────────

export function useQuotationStats(_enabled: boolean = true) {
  // Stats are computed client-side from the quotations list for now
  return {
    data: null,
    loading: false,
    error: null,
  };
}
