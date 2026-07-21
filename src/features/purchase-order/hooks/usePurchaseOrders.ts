/**
 * Purchase Order Hooks
 * React Query hooks for purchase order data management
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseOrderApi } from '../services/purchaseOrderApi';
import {
  PurchaseOrderQuery,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  ReceiveItemDto,
  RejectPoDto,
} from '../types/purchase-order.types';

const PO_QUERY_KEYS = {
  list: ['purchase-orders'] as const,
  detail: (id: string) => ['purchase-order', id] as const,
  stats: ['po-stats'] as const,
};

export function usePurchaseOrders(params?: PurchaseOrderQuery, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...PO_QUERY_KEYS.list, params],
    queryFn: () => purchaseOrderApi.getAll(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled !== false,
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: PO_QUERY_KEYS.detail(id),
    queryFn: () => purchaseOrderApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePoStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: PO_QUERY_KEYS.stats,
    queryFn: () => purchaseOrderApi.getStats(),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled !== false,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchaseOrderDto) => purchaseOrderApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.list });
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.stats });
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePurchaseOrderDto }) =>
      purchaseOrderApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.list });
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.detail(id) });
    },
  });
}

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseOrderApi.approve(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.list });
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.stats });
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.detail(id) });
    },
  });
}

export function useRejectPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectPoDto }) =>
      purchaseOrderApi.reject(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.list });
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.stats });
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.detail(id) });
    },
  });
}

export function useSendPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseOrderApi.markSent(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.list });
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.stats });
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.detail(id) });
    },
  });
}

export function useReceiveItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, items }: { id: string; items: ReceiveItemDto[] }) =>
      purchaseOrderApi.receiveItems(id, items),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.list });
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.stats });
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.detail(id) });
    },
  });
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseOrderApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.list });
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.stats });
    },
  });
}

export function useRestorePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => purchaseOrderApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.list });
      queryClient.invalidateQueries({ queryKey: PO_QUERY_KEYS.stats });
    },
  });
}
