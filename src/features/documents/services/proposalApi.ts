import { api } from '@/core/api';
import { Proposal, CreateProposalDto } from '../types/peb-commercial';

const API_BASE = '/proposals';

export const proposalApi = {
  createFromEstimate: async (data: CreateProposalDto): Promise<Proposal> => {
    return api.post(API_BASE, data);
  },

  findAll: async (params?: {
    page?: number;
    pageSize?: number;
    customerId?: string;
    status?: string;
    estimateId?: string;
    search?: string;
  }): Promise<{ data: Proposal[]; total: number }> => {
    return api.get(API_BASE, { params });
  },

  getStats: async (): Promise<any> => {
    return api.get(`${API_BASE}/stats`);
  },

  findOne: async (id: string): Promise<Proposal> => {
    return api.get(`${API_BASE}/${id}`);
  },

  update: async (id: string, data: any): Promise<Proposal> => {
    return api.patch(`${API_BASE}/${id}`, data);
  },

  updateStatus: async (id: string, status: string): Promise<Proposal> => {
    return api.patch(`${API_BASE}/${id}/status`, { status });
  },

  convertToQuotation: async (id: string, quotationData: any): Promise<Proposal> => {
    return api.patch(`${API_BASE}/${id}/convert-to-quotation`, quotationData);
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`${API_BASE}/${id}`);
  },
};
