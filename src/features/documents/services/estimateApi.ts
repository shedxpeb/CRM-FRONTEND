import { api } from '@/core/api';
import { Estimate, CreateEstimateDto, UpdateEstimateDto } from '../types/peb-commercial';

const API_BASE = '/estimates';

export const estimateApi = {
  create: async (data: CreateEstimateDto): Promise<Estimate> => {
    return api.post(API_BASE, data);
  },

  findAll: async (params?: {
    page?: number;
    pageSize?: number;
    customerId?: string;
    status?: string;
    leadId?: string;
    projectId?: string;
    search?: string;
  }): Promise<{ data: Estimate[]; total: number }> => {
    return api.get(API_BASE, { params });
  },

  getStats: async (): Promise<any> => {
    return api.get(`${API_BASE}/stats`);
  },

  findOne: async (id: string): Promise<Estimate> => {
    return api.get(`${API_BASE}/${id}`);
  },

  findByNumber: async (estimateNumber: string): Promise<Estimate> => {
    return api.get(`${API_BASE}/number/${estimateNumber}`);
  },

  update: async (id: string, data: UpdateEstimateDto): Promise<Estimate> => {
    return api.patch(`${API_BASE}/${id}`, data);
  },

  updateStatus: async (id: string, status: string): Promise<Estimate> => {
    return api.patch(`${API_BASE}/${id}/status`, { status });
  },

  convertToProposal: async (id: string, proposalData: any): Promise<Estimate> => {
    return api.patch(`${API_BASE}/${id}/convert-to-proposal`, proposalData);
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`${API_BASE}/${id}`);
  },
};
