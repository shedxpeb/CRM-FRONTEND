/**
 * Item Master API — real backend calls via NestJS
 */
import { api } from '@/core/api';
import {
  ItemMaster,
  ItemVariant,
  ItemBundle,
  CreateItemMasterDto,
  UpdateItemMasterDto,
  CreateItemVariantDto,
  UpdateItemVariantDto,
  CreateItemBundleDto,
  UpdateItemBundleDto,
  ItemMasterQuery,
  ItemMasterStats,
} from '../types';

interface BackendResponse<T> {
  success: boolean;
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

function buildParams(query?: ItemMasterQuery): Record<string, any> {
  const params: Record<string, any> = {};
  if (query?.page) params.page = query.page;
  if (query?.pageSize) params.pageSize = query.pageSize;
  if (query?.sortBy) params.sortBy = query.sortBy;
  if (query?.sortOrder) params.sortOrder = query.sortOrder;
  if (query?.filter?.search) params.search = query.filter.search;
  if (query?.filter?.category) params.category = query.filter.category;
  if (query?.filter?.status) params.status = query.filter.status;
  if (query?.filter?.brand) params.brand = query.filter.brand;
  return params;
}

export const itemMasterApi = {
  async getAll(query?: ItemMasterQuery): Promise<ItemMaster[]> {
    const params = buildParams(query);
    const res = await api.get<BackendResponse<PaginatedData<ItemMaster>>>('/item-master', { params });
    return res.data.rows;
  },

  async getById(id: string): Promise<ItemMaster> {
    const res = await api.get<BackendResponse<ItemMaster>>(`/item-master/${id}`);
    return res.data;
  },

  async create(data: CreateItemMasterDto): Promise<ItemMaster> {
    const res = await api.post<BackendResponse<ItemMaster>>('/item-master', data);
    return res.data;
  },

  async update(id: string, data: UpdateItemMasterDto): Promise<ItemMaster> {
    const res = await api.patch<BackendResponse<ItemMaster>>(`/item-master/${id}`, data);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/item-master/${id}`);
  },

  async getStats(): Promise<ItemMasterStats> {
    const res = await api.get<BackendResponse<ItemMasterStats>>('/item-master/stats');
    return res.data;
  },

  async getVariants(itemMasterId: string): Promise<ItemVariant[]> {
    const res = await api.get<BackendResponse<ItemVariant[]>>(`/item-master/${itemMasterId}/variants`);
    return res.data;
  },

  async createVariant(data: CreateItemVariantDto): Promise<ItemVariant> {
    const res = await api.post<BackendResponse<ItemVariant>>(`/item-master/${data.itemMasterId}/variants`, data);
    return res.data;
  },

  async updateVariant(id: string, data: UpdateItemVariantDto): Promise<ItemVariant> {
    const res = await api.patch<BackendResponse<ItemVariant>>(`/item-master/variants/${id}`, data);
    return res.data;
  },

  async deleteVariant(id: string): Promise<void> {
    await api.delete(`/item-master/variants/${id}`);
  },

  async getBundles(_query?: ItemMasterQuery): Promise<ItemBundle[]> {
    const res = await api.get<BackendResponse<ItemBundle[]>>('/item-master/bundles/list');
    return res.data;
  },

  async getBundleById(id: string): Promise<ItemBundle> {
    const res = await api.get<BackendResponse<ItemBundle>>(`/item-master/bundles/${id}`);
    return res.data;
  },

  async createBundle(data: CreateItemBundleDto): Promise<ItemBundle> {
    const res = await api.post<BackendResponse<ItemBundle>>('/item-master/bundles', data);
    return res.data;
  },

  async updateBundle(id: string, data: UpdateItemBundleDto): Promise<ItemBundle> {
    const res = await api.patch<BackendResponse<ItemBundle>>(`/item-master/bundles/${id}`, data);
    return res.data;
  },

  async deleteBundle(id: string): Promise<void> {
    await api.delete(`/item-master/bundles/${id}`);
  },
};
