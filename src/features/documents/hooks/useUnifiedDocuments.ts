'use client';

import { useMemo, useCallback } from 'react';
import { useEstimates } from './useEstimate';
import { useProposals } from './useProposal';
import { useQuotations } from './useQuotation';
import { useDocuments } from './useDocuments';
import { PaginatedData } from '@/shared/types/pagination';
import { Document, DocumentActivity } from '@/features/documents/types';
import {
  UnifiedDocument,
  normalizeEstimate,
  normalizeProposal,
  normalizeQuotation,
  normalizeApiDocument,
} from '@/features/documents/utils/documentHelpers';

export function useUnifiedDocuments() {
  const { data: estimates, loading: estimatesLoading, refetch: refetchEstimates } = useEstimates({ page: 1, pageSize: 1000 });
  const { data: proposals, loading: proposalsLoading, refetch: refetchProposals } = useProposals({ page: 1, pageSize: 1000 });
  const { data: quotations, loading: quotationsLoading, refetch: refetchQuotations } = useQuotations({ page: 1, pageSize: 1000 });
  const { data: apiDocuments, isLoading: apiLoading, refetch: refetchApi } = useDocuments({ page: 1, pageSize: 1000 });

  const allDocuments = useMemo(() => {
    const list: UnifiedDocument[] = [
      ...(estimates ?? []).map(normalizeEstimate),
      ...(proposals ?? []).map(normalizeProposal),
      ...(quotations ?? []).map(normalizeQuotation),
    ];

    const apiItems = (apiDocuments as PaginatedData<Document> | undefined)?.data ?? [];
    for (const doc of apiItems) {
      if (doc.documentType === 'Invoice') {
        list.push(normalizeApiDocument(doc));
      }
    }

    return list.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [estimates, proposals, quotations, apiDocuments]);

  const refetch = useCallback(async () => {
    await Promise.all([
      refetchEstimates?.(),
      refetchProposals?.(),
      refetchQuotations?.(),
      refetchApi?.(),
    ]);
  }, [refetchEstimates, refetchProposals, refetchQuotations, refetchApi]);

  return {
    allDocuments,
    loading: estimatesLoading || proposalsLoading || quotationsLoading || apiLoading,
    refetch,
  };
}

export function useUnifiedDocument(id: string) {
  const { allDocuments, loading, refetch } = useUnifiedDocuments();

  const document = useMemo(
    () => allDocuments.find((d) => d.id === id) ?? null,
    [allDocuments, id]
  );

  return { document, loading, refetch };
}
