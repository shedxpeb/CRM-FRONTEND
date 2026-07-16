import { useCallback } from 'react';
import { BackendPendingError } from '@/core/api/capabilities';
import type { CreateEstimateDto, Estimate, UpdateEstimateDto } from '../types/peb-commercial';

const pendingMessage = 'Backend implementation pending.';

function pendingOperation<T>(resource: string): Promise<T> {
  return Promise.reject(new BackendPendingError(resource));
}

export function useEstimates(_params?: {
  page?: number;
  pageSize?: number;
  customerId?: string;
  status?: string;
  leadId?: string;
  projectId?: string;
  search?: string;
}) {
  const refetch = useCallback(async () => undefined, []);
  const createEstimate = useCallback((_: CreateEstimateDto) => pendingOperation<Estimate>('estimates'), []);
  const updateEstimate = useCallback((_: string, __: UpdateEstimateDto) => pendingOperation<Estimate>('estimates'), []);
  const deleteEstimate = useCallback((_: string) => pendingOperation<void>('estimates'), []);
  const updateStatus = useCallback((_: string, __: string) => pendingOperation<Estimate>('estimates'), []);
  const convertToProposal = useCallback((_: string, __: unknown) => pendingOperation<Estimate>('estimates'), []);

  return {
    data: [] as Estimate[],
    total: 0,
    loading: false,
    error: pendingMessage,
    createEstimate,
    updateEstimate,
    deleteEstimate,
    updateStatus,
    convertToProposal,
    refetch,
  };
}

export function useEstimate(_id: string) {
  return {
    data: null as Estimate | null,
    loading: false,
    error: pendingMessage,
    refetch: async () => undefined,
  };
}

export function useEstimateStats() {
  return {
    data: null,
    loading: false,
    error: pendingMessage,
    refetch: async () => undefined,
  };
}
