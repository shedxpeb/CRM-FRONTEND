/**
 * Documents React Query Hooks
 * React Query hooks for documents module following existing patterns
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useModuleConfiguration } from '@/features/settings/hooks/useSettings';
import { DOCUMENT_MODULE_DEFAULTS } from '@/features/settings/utils/moduleConfigurationDefaults';
import { pickModuleSettings } from '@/features/settings/utils/resolveModuleSettings';
import { documentsApi, templatesApi, approvalsApi, versionsApi } from '../services/documentsApi';
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
import { PaginationParams } from '@/shared/types/pagination';

export interface DocumentCustomFieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea';
  options?: string[];
}

export interface DocumentModuleConfiguration {
  estimateTypes: string[];
  proposalTypes: string[];
  quotationTypes: string[];
  documentStatuses: string[];
  approvalStatuses: string[];
  customFields: DocumentCustomFieldDefinition[];
}

export const DEFAULT_DOCUMENT_CONFIGURATION: DocumentModuleConfiguration = DOCUMENT_MODULE_DEFAULTS;

export function useDocumentConfiguration(): DocumentModuleConfiguration & { isLoading: boolean } {
  const { data, isLoading } = useModuleConfiguration('documents');

  return useMemo(() => {
    const settings = pickModuleSettings(data?.settings, DEFAULT_DOCUMENT_CONFIGURATION);
    return {
      ...settings,
      isLoading,
    };
  }, [data, isLoading]);
}

// ─── Documents Hooks ────────────────────────────────────────────────────────────

export const useDocuments = (params: PaginationParams & DocumentFilters = { page: 1, pageSize: 10 }, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => documentsApi.getAllDocuments(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...options,
  });
};

export const useDocument = (id: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => documentsApi.getDocumentById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    ...options,
  });
};

export const useDocumentStats = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: ['documentStats'],
    queryFn: () => documentsApi.getDocumentStats(),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    ...options,
  });
};

export const useDocumentActivities = (documentId: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: ['documentActivities', documentId],
    queryFn: () => documentsApi.getDocumentActivities(documentId),
    enabled: !!documentId,
    staleTime: 2 * 60 * 1000,
    refetchOnMount: false,
    ...options,
  });
};

export const useCreateDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateDocumentDto) => documentsApi.createDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documentStats'] });
    },
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentDto }) =>
      documentsApi.updateDocument(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', id] });
      queryClient.invalidateQueries({ queryKey: ['documentStats'] });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => documentsApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documentStats'] });
    },
  });
};

export const useSendDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SendDocumentDto) => documentsApi.sendDocument(data),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', documentId] });
      queryClient.invalidateQueries({ queryKey: ['documentActivities', documentId] });
    },
  });
};

export const useConvertDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ConvertDocumentDto) => documentsApi.convertDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documentStats'] });
    },
  });
};

export const useExportDocuments = () => {
  return useMutation({
    mutationFn: (filters: DocumentFilters) => documentsApi.exportDocuments(filters),
  });
};

// ─── Templates Hooks ────────────────────────────────────────────────────────────

export const useTemplates = (params: PaginationParams & TemplateFilters = { page: 1, pageSize: 10 }, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: ['templates', params],
    queryFn: () => templatesApi.getAllTemplates(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: false,
    ...options,
  });
};

export const useTemplate = (id: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: ['template', id],
    queryFn: () => templatesApi.getTemplateById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    refetchOnMount: false,
    ...options,
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTemplateDto) => templatesApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateDto }) =>
      templatesApi.updateTemplate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template', id] });
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => templatesApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
};

// ─── Approvals Hooks ────────────────────────────────────────────────────────────

export const usePendingApprovals = (options?: UseQueryOptions) => {
  return useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: () => approvalsApi.getPendingApprovals(),
    staleTime: 2 * 60 * 1000,
    refetchOnMount: false,
    ...options,
  });
};

export const useRequestApproval = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RequestApprovalDto) => approvalsApi.requestApproval(data),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ['document', documentId] });
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
    },
  });
};

export const useApprovalDecision = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ApprovalDecisionDto) => approvalsApi.makeDecision(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
};

// ─── Versions Hooks ─────────────────────────────────────────────────────────────

export const useDocumentVersions = (documentId: string, options?: UseQueryOptions) => {
  return useQuery({
    queryKey: ['documentVersions', documentId],
    queryFn: () => versionsApi.getDocumentVersions(documentId),
    enabled: !!documentId,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    ...options,
  });
};

export const useCreateVersion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateVersionDto) => versionsApi.createVersion(data),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ['documentVersions', documentId] });
      queryClient.invalidateQueries({ queryKey: ['document', documentId] });
    },
  });
};
