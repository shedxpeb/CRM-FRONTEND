/**
 * Documents API Service — real backend only (no mock fallbacks).
 */
import { apiClient } from '@/core/api';
import { guardModuleApi } from '@/core/api/capabilities';
import type {
  Document,
  DocumentTemplate,
  DocumentApproval,
  DocumentVersion,
  DocumentActivity,
  DocumentStats,
  DocumentFilters,
  TemplateFilters,
  CreateDocumentDto,
  UpdateDocumentDto,
  CreateTemplateDto,
  UpdateTemplateDto,
  SendDocumentDto,
  ConvertDocumentDto,
  RequestApprovalDto,
  ApprovalDecisionDto,
  CreateVersionDto,
} from '../types';
import { PaginatedData, PaginationParams } from '@/shared/types/pagination';

export const documentsApi = guardModuleApi('documents', {
  getAllDocuments: async (params: PaginationParams & DocumentFilters): Promise<PaginatedData<Document>> => {
    const response = await apiClient.get<PaginatedData<Document>>('/documents', { params });
    return response.data;
  },
  getDocumentById: async (id: string): Promise<Document> => {
    const response = await apiClient.get<Document>(`/documents/${id}`);
    return response.data;
  },
  createDocument: async (data: CreateDocumentDto): Promise<Document> => {
    const response = await apiClient.post<Document>('/documents', data);
    return response.data;
  },
  updateDocument: async (id: string, data: UpdateDocumentDto): Promise<Document> => {
    const response = await apiClient.patch<Document>(`/documents/${id}`, data);
    return response.data;
  },
  deleteDocument: async (id: string): Promise<void> => {
    await apiClient.delete(`/documents/${id}`);
  },
  sendDocument: async (data: SendDocumentDto): Promise<Document> => {
    const response = await apiClient.post<Document>('/documents/send', data);
    return response.data;
  },
  convertDocument: async (data: ConvertDocumentDto): Promise<Document> => {
    const response = await apiClient.post<Document>('/documents/convert', data);
    return response.data;
  },
  getDocumentStats: async (): Promise<DocumentStats> => {
    const response = await apiClient.get<DocumentStats>('/documents/stats');
    return response.data;
  },
  getDocumentActivities: async (documentId: string): Promise<DocumentActivity[]> => {
    const response = await apiClient.get<DocumentActivity[]>(`/documents/${documentId}/activities`);
    return response.data;
  },
  exportDocuments: async (filters: DocumentFilters): Promise<Blob> => {
    const response = await apiClient.get('/documents/export', { params: filters, responseType: 'blob' });
    return response.data as Blob;
  },
});

export const templatesApi = guardModuleApi('documents', {
  getAllTemplates: async (params: PaginationParams & TemplateFilters): Promise<PaginatedData<DocumentTemplate>> => {
    const response = await apiClient.get<PaginatedData<DocumentTemplate>>('/templates', { params });
    return response.data;
  },
  getTemplateById: async (id: string): Promise<DocumentTemplate> => {
    const response = await apiClient.get<DocumentTemplate>(`/templates/${id}`);
    return response.data;
  },
  createTemplate: async (data: CreateTemplateDto): Promise<DocumentTemplate> => {
    const response = await apiClient.post<DocumentTemplate>('/templates', data);
    return response.data;
  },
  updateTemplate: async (id: string, data: UpdateTemplateDto): Promise<DocumentTemplate> => {
    const response = await apiClient.patch<DocumentTemplate>(`/templates/${id}`, data);
    return response.data;
  },
  deleteTemplate: async (id: string): Promise<void> => {
    await apiClient.delete(`/templates/${id}`);
  },
});

export const approvalsApi = guardModuleApi('documents', {
  requestApproval: async (data: RequestApprovalDto): Promise<DocumentApproval> => {
    const response = await apiClient.post<DocumentApproval>('/approvals', data);
    return response.data;
  },
  makeDecision: async (data: ApprovalDecisionDto): Promise<DocumentApproval> => {
    const response = await apiClient.patch<DocumentApproval>(`/approvals/${data.approvalId}`, data);
    return response.data;
  },
  getPendingApprovals: async (): Promise<DocumentApproval[]> => {
    const response = await apiClient.get<DocumentApproval[]>('/approvals/pending');
    return response.data;
  },
});

export const versionsApi = guardModuleApi('documents', {
  createVersion: async (data: CreateVersionDto): Promise<DocumentVersion> => {
    const response = await apiClient.post<DocumentVersion>('/versions', data);
    return response.data;
  },
  getDocumentVersions: async (documentId: string): Promise<DocumentVersion[]> => {
    const response = await apiClient.get<DocumentVersion[]>(`/documents/${documentId}/versions`);
    return response.data;
  },
});
