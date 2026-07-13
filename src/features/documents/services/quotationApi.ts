import { api } from '@/core/api';
import { Quotation, CreateQuotationDto } from '../types/peb-commercial';

const API_BASE = '/quotations';

export const quotationApi = {
  createFromProposal: async (data: CreateQuotationDto): Promise<Quotation> => {
    return api.post(API_BASE, data);
  },

  findAll: async (params?: {
    page?: number;
    pageSize?: number;
    customerId?: string;
    status?: string;
    proposalId?: string;
    search?: string;
  }): Promise<{ data: Quotation[]; total: number }> => {
    return api.get(API_BASE, { params });
  },

  getStats: async (): Promise<any> => {
    return api.get(`${API_BASE}/stats`);
  },

  findOne: async (id: string): Promise<Quotation> => {
    return api.get(`${API_BASE}/${id}`);
  },

  update: async (id: string, data: any): Promise<Quotation> => {
    return api.patch(`${API_BASE}/${id}`, data);
  },

  updateStatus: async (id: string, status: string): Promise<Quotation> => {
    return api.patch(`${API_BASE}/${id}/status`, { status });
  },

  convertToProject: async (id: string, projectData: any): Promise<Quotation> => {
    return api.patch(`${API_BASE}/${id}/convert-to-project`, projectData);
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`${API_BASE}/${id}`);
  },
};
