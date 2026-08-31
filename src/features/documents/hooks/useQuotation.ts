import { useCallback, useState, useEffect, useRef } from 'react';
import { apiClient } from '@/core/api';
import type { CreateQuotationDto, Quotation } from '../types/peb-commercial';

interface UseQuotationsParams {
  page?: number;
  pageSize?: number;
  customerId?: string;
  status?: string;
  proposalId?: string;
  projectId?: string;
  search?: string;
}

interface QuotationsResponse {
  message: string;
  data: {
    data: Quotation[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export function useQuotations(params?: UseQuotationsParams) {
  const [data, setData] = useState<Quotation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.status) searchParams.set('status', params.status);
      if (params?.customerId) searchParams.set('customerId', params.customerId);
      if (params?.search) searchParams.set('search', params.search);

      const url = `/quotations?${searchParams.toString()}`;
      const response = await apiClient.get<QuotationsResponse>(url);
      const result = response.data?.data;

      if (mountedRef.current) {
        setData(result?.data || []);
        setTotal(result?.total || 0);
        setLoading(false);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err?.message || 'Failed to load quotations');
        setLoading(false);
      }
    }
  }, [params?.page, params?.pageSize, params?.status, params?.customerId, params?.search]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const createQuotation = useCallback(async (dto: CreateQuotationDto): Promise<Quotation> => {
    const response = await apiClient.post<{ message: string; data: { data: Quotation } }>('/quotations', dto);
    return response.data.data.data;
  }, []);

  const updateQuotation = useCallback(async (id: string, dto: Partial<Quotation>): Promise<Quotation> => {
    const response = await apiClient.patch<{ message: string; data: Quotation }>(`/quotations/${id}`, dto);
    return response.data.data;
  }, []);

  const deleteQuotation = useCallback(async (id: string): Promise<void> => {
    await apiClient.delete(`/quotations/${id}`);
  }, []);

  const updateStatus = useCallback(async (id: string, status: string): Promise<Quotation> => {
    const response = await apiClient.patch<{ message: string; data: Quotation }>(`/quotations/${id}/status`, { status });
    return response.data.data;
  }, []);

  const convertToProject = useCallback(async (id: string): Promise<any> => {
    const response = await apiClient.patch<{ message: string; data: any }>(`/quotations/${id}/convert-to-project`);
    return response.data.data;
  }, []);

  return {
    data,
    total,
    loading,
    error,
    createQuotation,
    updateQuotation,
    deleteQuotation,
    updateStatus,
    convertToProject,
    refetch,
  };
}

export function useQuotation(id: string) {
  const [data, setData] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchQuotation = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<{ message: string; data: Quotation }>(`/quotations/${id}`);
        setData(response.data.data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load quotation');
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [id]);

  const refetch = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await apiClient.get<{ message: string; data: Quotation }>(`/quotations/${id}`);
      setData(response.data.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load quotation');
    } finally {
      setLoading(false);
    }
  }, [id]);

  return { data, loading, error, refetch };
}

export function useQuotationStats(_enabled: boolean = true) {
  return {
    data: null,
    loading: false,
    error: null,
    refetch: async () => undefined,
  };
}
