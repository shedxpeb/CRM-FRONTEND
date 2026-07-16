import { useCallback } from 'react';
import { BackendPendingError } from '@/core/api/capabilities';
import type { CreateProposalDto, Proposal } from '../types/peb-commercial';

const pendingMessage = 'Backend implementation pending.';

function pendingOperation<T>(resource: string): Promise<T> {
  return Promise.reject(new BackendPendingError(resource));
}

export function useProposals(_params?: {
  page?: number;
  pageSize?: number;
  customerId?: string;
  status?: string;
  estimateId?: string;
  projectId?: string;
  search?: string;
}) {
  const refetch = useCallback(async () => undefined, []);
  const createProposal = useCallback((_: CreateProposalDto) => pendingOperation<Proposal>('proposals'), []);
  const updateProposal = useCallback((_: string, __: Partial<Proposal>) => pendingOperation<Proposal>('proposals'), []);
  const deleteProposal = useCallback((_: string) => pendingOperation<void>('proposals'), []);
  const updateStatus = useCallback((_: string, __: string) => pendingOperation<Proposal>('proposals'), []);
  const convertToQuotation = useCallback((_: string, __: unknown) => pendingOperation<Proposal>('proposals'), []);

  return {
    data: [] as Proposal[],
    total: 0,
    loading: false,
    error: pendingMessage,
    createProposal,
    updateProposal,
    deleteProposal,
    updateStatus,
    convertToQuotation,
    refetch,
  };
}

export function useProposal(_id: string) {
  return {
    data: null as Proposal | null,
    loading: false,
    error: pendingMessage,
    refetch: async () => undefined,
  };
}

export function useProposalStats() {
  return {
    data: null,
    loading: false,
    error: pendingMessage,
    refetch: async () => undefined,
  };
}
