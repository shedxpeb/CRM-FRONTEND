import { useCallback } from 'react';
import { BackendPendingError } from '@/core/api/capabilities';
import type { CreateQuotationDto, Quotation } from '../types/peb-commercial';

const pendingMessage = 'Backend implementation pending.';

function pendingOperation<T>(resource: string): Promise<T> {
  return Promise.reject(new BackendPendingError(resource));
}

export function useQuotations(_params?: {
  page?: number;
  pageSize?: number;
  customerId?: string;
  status?: string;
  proposalId?: string;
  projectId?: string;
  search?: string;
}) {
  const refetch = useCallback(async () => undefined, []);
  const createQuotation = useCallback((_: CreateQuotationDto) => pendingOperation<Quotation>('quotations'), []);
  const updateQuotation = useCallback((_: string, __: Partial<Quotation>) => pendingOperation<Quotation>('quotations'), []);
  const deleteQuotation = useCallback((_: string) => pendingOperation<void>('quotations'), []);
  const updateStatus = useCallback((_: string, __: string) => pendingOperation<Quotation>('quotations'), []);
  const convertToProject = useCallback((_: string, __: unknown) => pendingOperation<Quotation>('quotations'), []);

  return {
    data: [] as Quotation[],
    total: 0,
    loading: false,
    error: pendingMessage,
    createQuotation,
    updateQuotation,
    deleteQuotation,
    updateStatus,
    convertToProject,
    refetch,
  };
}

export function useQuotation(_id: string) {
  return {
    data: null as Quotation | null,
    loading: false,
    error: pendingMessage,
    refetch: async () => undefined,
  };
}

export function useQuotationStats(_enabled: boolean = true) {
  return {
    data: null,
    loading: false,
    error: pendingMessage,
    refetch: async () => undefined,
  };
}
