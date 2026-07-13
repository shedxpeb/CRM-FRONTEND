/**
 * Documents API Service
 * Centralized API calls for documents module with mock fallback
 */

import { apiClient } from '@/core/api';
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

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_DOCUMENTS: Document[] = [
  {
    id: '1',
    documentNumber: 'EST-001',
    version: 1,
    documentType: 'Estimate',
    customerId: 'CUST-001',
    customerName: 'Acme Corporation',
    customerEmail: 'contact@acme.com',
    customerPhone: '+91-9876543210',
    customerAddress: '123 Business Park, Mumbai',
    customerGST: '27AABCU9603R1ZM',
    leadId: 'LEAD-001',
    leadNumber: 'LD-001',
    projectId: 'PROJ-001',
    projectName: 'Warehouse Construction',
    subtotal: 500000,
    taxAmount: 90000,
    totalAmount: 590000,
    discountAmount: 0,
    gstType: 'CGST',
    cgstAmount: 45000,
    sgstAmount: 45000,
    validUntil: new Date('2024-03-01'),
    paymentTerms: '30% Advance + 70% Before Delivery',
    deliveryTerms: 'Ex-Works',
    notes: 'Standard PEB warehouse structure',
    termsAndConditions: 'Standard terms apply',
    status: 'Sent',
    approvalStatus: 'Approved',
    approvedBy: 'John Doe',
    approvedAt: new Date('2024-01-15'),
    lineItems: [
      {
        id: '1',
        description: 'Steel Columns - ISMB 300',
        quantity: 50,
        unit: 'MT',
        rate: 55000,
        amount: 2750000,
        taxRate: 18,
        taxAmount: 495000,
        itemId: 'INV-001',
        itemCode: 'ISMB300',
      },
    ],
    templateId: 'TPL-001',
    templateName: 'Standard Estimate',
    sentAt: new Date('2024-01-10'),
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    documentNumber: 'PRO-001',
    version: 1,
    documentType: 'Proposal',
    customerId: 'CUST-002',
    customerName: 'Tech Solutions Ltd',
    customerEmail: 'info@techsol.com',
    customerPhone: '+91-9876543211',
    customerAddress: '456 Tech Park, Bangalore',
    customerGST: '29AABCU9603R1ZM',
    leadId: 'LEAD-002',
    leadNumber: 'LD-002',
    projectId: 'PROJ-002',
    projectName: 'Industrial Shed',
    subtotal: 750000,
    taxAmount: 135000,
    totalAmount: 885000,
    discountAmount: 25000,
    discountPercentage: 3,
    gstType: 'IGST',
    igstAmount: 135000,
    validUntil: new Date('2024-02-28'),
    paymentTerms: '50% Advance + 50% Before Delivery',
    deliveryTerms: 'Delivered at Place',
    notes: 'Custom industrial shed with mezzanine',
    termsAndConditions: 'Custom terms apply',
    status: 'Viewed',
    lineItems: [
      {
        id: '1',
        description: 'Steel Beams - ISMB 250',
        quantity: 75,
        unit: 'MT',
        rate: 52000,
        amount: 3900000,
        taxRate: 18,
        taxAmount: 702000,
        itemId: 'INV-002',
        itemCode: 'ISMB250',
      },
    ],
    templateId: 'TPL-002',
    templateName: 'Detailed Proposal',
    sentAt: new Date('2024-01-20'),
    viewedAt: new Date('2024-01-22'),
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-22'),
    createdBy: 'Priya Sharma',
  },
  {
    id: '3',
    documentNumber: 'QUO-001',
    version: 1,
    documentType: 'Quotation',
    customerId: 'CUST-003',
    customerName: 'Reliance Industries',
    customerEmail: 'procurement@ril.com',
    projectId: 'PROJ-003',
    projectName: 'Factory Shed - Ahmedabad',
    subtotal: 1200000,
    taxAmount: 216000,
    totalAmount: 1416000,
    discountAmount: 10000,
    gstType: 'IGST',
    igstAmount: 216000,
    paymentTerms: '40% Advance + 60% Before Dispatch',
    status: 'Accepted',
    approvalStatus: 'Approved',
    createdBy: 'Amit Shah',
    lineItems: [
      {
        id: '1',
        description: 'PEB Structure Package',
        quantity: 1,
        unit: 'LOT',
        rate: 1200000,
        amount: 1200000,
        taxRate: 18,
        taxAmount: 216000,
      },
    ],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: '4',
    documentNumber: 'INV-2024-001',
    version: 1,
    documentType: 'Invoice',
    customerId: 'CUST-003',
    customerName: 'Reliance Industries',
    customerEmail: 'procurement@ril.com',
    projectId: 'PROJ-003',
    projectName: 'Factory Shed - Ahmedabad',
    subtotal: 600000,
    taxAmount: 108000,
    totalAmount: 708000,
    discountAmount: 0,
    gstType: 'IGST',
    igstAmount: 108000,
    paymentTerms: 'Net 30',
    status: 'Sent',
    convertedFrom: 'Quotation',
    convertedDocumentId: '3',
    createdBy: 'Finance Team',
    lineItems: [
      {
        id: '1',
        description: 'Advance Invoice - PEB Structure',
        quantity: 1,
        unit: 'LOT',
        rate: 600000,
        amount: 600000,
        taxRate: 18,
        taxAmount: 108000,
      },
    ],
    sentAt: new Date('2024-02-15'),
    createdAt: new Date('2024-02-14'),
    updatedAt: new Date('2024-02-15'),
  },
];

const MOCK_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'TPL-001',
    templateCode: 'TPL-EST-STD',
    templateType: 'Estimate',
    name: 'Standard Estimate',
    description: 'Standard estimate template for PEB projects',
    header: 'PEB-CRM Estimate',
    footer: 'Thank you for your business',
    termsAndConditions: 'Standard terms and conditions apply',
    layout: 'Standard',
    numberingPattern: 'Sequential',
    numberingPrefix: 'EST',
    numberingStart: 1,
    defaultPaymentTerms: '30% Advance + 70% Before Delivery',
    defaultDeliveryTerms: 'Ex-Works',
    defaultValidDays: 30,
    isDefault: true,
    isActive: true,
    usageCount: 150,
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date('2023-12-15'),
  },
  {
    id: 'TPL-002',
    templateCode: 'TPL-PRO-DTL',
    templateType: 'Proposal',
    name: 'Detailed Proposal',
    description: 'Detailed proposal template with extended information',
    header: 'PEB-CRM Detailed Proposal',
    footer: 'We look forward to working with you',
    termsAndConditions: 'Detailed terms and conditions apply',
    layout: 'Detailed',
    numberingPattern: 'Sequential',
    numberingPrefix: 'PRO',
    numberingStart: 1,
    defaultPaymentTerms: '50% Advance + 50% Before Delivery',
    defaultDeliveryTerms: 'Delivered at Place',
    defaultValidDays: 45,
    isDefault: false,
    isActive: true,
    usageCount: 85,
    createdAt: new Date('2023-07-01'),
    updatedAt: new Date('2023-11-20'),
  },
];

const MOCK_STATS: DocumentStats = {
  totalEstimates: 45,
  totalProposals: 32,
  totalQuotations: 28,
  totalInvoices: 12,
  totalDocuments: 117,
  draftDocuments: 15,
  approvedDocuments: 22,
  sentDocuments: 50,
  viewedDocuments: 25,
  acceptedDocuments: 18,
  rejectedDocuments: 7,
  expiredDocuments: 5,
  convertedDocuments: 12,
  pendingApprovals: 8,
  totalRevenuePipeline: 15000000,
  conversionRate: 26.7,
  averageDealSize: 333333,
  monthlyDocuments: 12,
  monthlyRevenue: 2500000,
};

const MOCK_ACTIVITIES: DocumentActivity[] = [
  {
    id: '1',
    type: 'document_created',
    description: 'Estimate EST-001 created for Acme Corporation',
    performedBy: 'John Doe',
    performedAt: new Date('2024-01-05T10:30:00'),
    metadata: { documentId: '1', documentNumber: 'EST-001' },
  },
  {
    id: '2',
    type: 'document_sent',
    description: 'Estimate EST-001 sent to Acme Corporation',
    performedBy: 'John Doe',
    performedAt: new Date('2024-01-10T14:15:00'),
    metadata: { documentId: '1', documentNumber: 'EST-001' },
  },
  {
    id: '3',
    type: 'approval_approved',
    description: 'Estimate EST-001 approved by John Doe',
    performedBy: 'John Doe',
    performedAt: new Date('2024-01-15T11:00:00'),
    metadata: { documentId: '1', documentNumber: 'EST-001' },
  },
];

// ─── Documents API ──────────────────────────────────────────────────────────────

export const documentsApi = {
  // Get all documents with pagination and filters
  getAllDocuments: async (params: PaginationParams & DocumentFilters): Promise<PaginatedData<Document>> => {
    try {
      const response = await apiClient.get<PaginatedData<Document>>('/documents', { params });
      return response.data;
    } catch (error) {
      // Silent fallback to mock data when backend is unavailable
      
      // Filter mock data
      let filtered = [...MOCK_DOCUMENTS];
      
      if (params.documentType) {
        filtered = filtered.filter(d => d.documentType === params.documentType);
      }
      if (params.status) {
        filtered = filtered.filter(d => d.status === params.status);
      }
      if (params.customerId) {
        filtered = filtered.filter(d => d.customerId === params.customerId);
      }
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(d => 
          d.documentNumber.toLowerCase().includes(search) ||
          d.customerName.toLowerCase().includes(search) ||
          d.projectName?.toLowerCase().includes(search)
        );
      }
      
      // Pagination
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);
      
      return {
        data: paginated,
        meta: {
          page,
          pageSize,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / pageSize),
          hasNext: page < Math.ceil(filtered.length / pageSize),
          hasPrevious: page > 1,
        },
      };
    }
  },

  // Get single document by ID
  getDocumentById: async (id: string): Promise<Document> => {
    try {
      const response = await apiClient.get<Document>(`/documents/${id}`);
      return response.data;
    } catch (error) {
      // Silent fallback to mock data when backend is unavailable
      const document = MOCK_DOCUMENTS.find(d => d.id === id);
      if (!document) throw new Error('Document not found');
      return document;
    }
  },

  // Create new document
  createDocument: async (data: CreateDocumentDto): Promise<Document> => {
    try {
      const response = await apiClient.post<Document>('/documents', data);
      return response.data;
    } catch (error) {
      // Silent fallback to mock data when backend is unavailable
      // Generate different ID prefixes based on document type
      let idPrefix = '';
      if (data.documentType === 'Estimate') idPrefix = 'EST';
      else if (data.documentType === 'Proposal') idPrefix = 'PRP';
      else if (data.documentType === 'Quotation') idPrefix = 'QT';
      else idPrefix = 'DOC';
      
      const newDocument: Document = {
        id: `${idPrefix}-${String(MOCK_DOCUMENTS.length + 1).padStart(3, '0')}`,
        documentNumber: `${data.documentType.substring(0, 3).toUpperCase()}-${String(MOCK_DOCUMENTS.length + 1).padStart(3, '0')}`,
        version: 1,
        documentType: data.documentType,
        customerId: data.customerId,
        customerName: 'Mock Customer',
        subtotal: data.subtotal,
        taxAmount: data.taxAmount,
        totalAmount: data.totalAmount,
        discountAmount: data.discountAmount,
        discountPercentage: data.discountPercentage,
        gstType: data.gstType,
        validUntil: data.validUntil,
        paymentTerms: data.paymentTerms,
        deliveryTerms: data.deliveryTerms,
        notes: data.notes,
        termsAndConditions: data.termsAndConditions,
        status: 'Draft',
        lineItems: data.lineItems.map((item, index) => ({
          ...item,
          id: String(index + 1),
        })),
        templateId: data.templateId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_DOCUMENTS.push(newDocument);
      return newDocument;
    }
  },

  // Update document
  updateDocument: async (id: string, data: UpdateDocumentDto): Promise<Document> => {
    try {
      const response = await apiClient.patch<Document>(`/documents/${id}`, data);
      return response.data;
    } catch (error) {
      // Silent fallback to mock data when backend is unavailable
      const index = MOCK_DOCUMENTS.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Document not found');
      MOCK_DOCUMENTS[index] = { ...MOCK_DOCUMENTS[index], ...data, updatedAt: new Date() };
      return MOCK_DOCUMENTS[index];
    }
  },

  // Delete document
  deleteDocument: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/documents/${id}`);
    } catch (error) {
      // Silent fallback to mock data when backend is unavailable
      const index = MOCK_DOCUMENTS.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Document not found');
      MOCK_DOCUMENTS.splice(index, 1);
    }
  },

  // Send document
  sendDocument: async (data: SendDocumentDto): Promise<void> => {
    try {
      await apiClient.post('/documents/send', data);
    } catch (error) {
      // Silent fallback to mock data when backend is unavailable
      // Mock send - just update status
      const document = MOCK_DOCUMENTS.find(d => d.id === data.documentId);
      if (document) {
        document.status = 'Sent';
        document.sentAt = new Date();
      }
    }
  },

  // Convert document
  convertDocument: async (data: ConvertDocumentDto): Promise<Document> => {
    try {
      const response = await apiClient.post<Document>('/documents/convert', data);
      return response.data;
    } catch (error) {
      // Silent fallback to mock data when backend is unavailable
      const source = MOCK_DOCUMENTS.find(d => d.id === data.sourceDocumentId);
      if (!source) throw new Error('Source document not found');
      
      // Generate different ID prefixes based on document type
      let idPrefix = '';
      if (data.targetType === 'Estimate') idPrefix = 'EST';
      else if (data.targetType === 'Proposal') idPrefix = 'PRP';
      else if (data.targetType === 'Quotation') idPrefix = 'QT';
      else idPrefix = 'DOC';
      
      const converted: Document = {
        ...source,
        id: `${idPrefix}-${String(MOCK_DOCUMENTS.length + 1).padStart(3, '0')}`,
        documentNumber: `${data.targetType.substring(0, 3).toUpperCase()}-${String(MOCK_DOCUMENTS.length + 1).padStart(3, '0')}`,
        documentType: data.targetType,
        version: 1,
        convertedFrom: source.documentType,
        convertedDocumentId: source.id,
        status: 'Draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_DOCUMENTS.push(converted);
      return converted;
    }
  },

  // Get document stats
  getDocumentStats: async (): Promise<DocumentStats> => {
    try {
      const response = await apiClient.get<DocumentStats>('/documents/stats');
      return response.data;
    } catch (error) {
      // Silent fallback to mock data when backend is unavailable
      return MOCK_STATS;
    }
  },

  // Get document activities
  getDocumentActivities: async (documentId: string): Promise<DocumentActivity[]> => {
    try {
      const response = await apiClient.get<DocumentActivity[]>(`/documents/${documentId}/activities`);
      return response.data;
    } catch (error) {
      // Silent fallback to mock data when backend is unavailable
      return MOCK_ACTIVITIES.filter(a => a.metadata?.documentId === documentId);
    }
  },

  // Export documents
  exportDocuments: async (filters: DocumentFilters): Promise<Blob> => {
    try {
      const response = await apiClient.post('/documents/export', filters, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      // Silent fallback to mock data when backend is unavailable
      throw new Error('Export failed');
    }
  },
};

// ─── Templates API ─────────────────────────────────────────────────────────────

export const templatesApi = {
  // Get all templates with pagination and filters
  getAllTemplates: async (params: PaginationParams & TemplateFilters): Promise<PaginatedData<DocumentTemplate>> => {
    try {
      const response = await apiClient.get<PaginatedData<DocumentTemplate>>('/templates', { params });
      return response.data;
    } catch (error) {
      // Silent fallback to mock data when backend is unavailable
      
      let filtered = [...MOCK_TEMPLATES];
      
      if (params.templateType) {
        filtered = filtered.filter(t => t.templateType === params.templateType);
      }
      if (params.isActive !== undefined) {
        filtered = filtered.filter(t => t.isActive === params.isActive);
      }
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(t => 
          t.name.toLowerCase().includes(search) ||
          t.templateCode.toLowerCase().includes(search)
        );
      }
      
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);
      
      return {
        data: paginated,
        meta: {
          page,
          pageSize,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / pageSize),
          hasNext: page < Math.ceil(filtered.length / pageSize),
          hasPrevious: page > 1,
        },
      };
    }
  },

  // Get single template by ID
  getTemplateById: async (id: string): Promise<DocumentTemplate> => {
    try {
      const response = await apiClient.get<DocumentTemplate>(`/templates/${id}`);
      return response.data;
    } catch (error) {
      // Silent fallback to mock data when backend is unavailable
      const template = MOCK_TEMPLATES.find(t => t.id === id);
      if (!template) throw new Error('Template not found');
      return template;
    }
  },

  // Create new template
  createTemplate: async (data: CreateTemplateDto): Promise<DocumentTemplate> => {
    try {
      const response = await apiClient.post<DocumentTemplate>('/templates', data);
      return response.data;
    } catch (error) {
      // Silent fallback to mock data when backend is unavailable
      const newTemplate: DocumentTemplate = {
        id: String(MOCK_TEMPLATES.length + 1),
        templateCode: `TPL-${data.templateType.substring(0, 3).toUpperCase()}-${String(MOCK_TEMPLATES.length + 1).padStart(3, '0')}`,
        templateType: data.templateType,
        name: data.name,
        description: data.description,
        header: data.header,
        footer: data.footer,
        termsAndConditions: data.termsAndConditions,
        layout: data.layout,
        numberingPattern: data.numberingPattern,
        numberingPrefix: data.numberingPrefix,
        numberingStart: data.numberingStart,
        defaultPaymentTerms: data.defaultPaymentTerms,
        defaultDeliveryTerms: data.defaultDeliveryTerms,
        defaultValidDays: data.defaultValidDays,
        isDefault: data.isDefault || false,
        isActive: true,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      MOCK_TEMPLATES.push(newTemplate);
      return newTemplate;
    }
  },

  // Update template
  updateTemplate: async (id: string, data: UpdateTemplateDto): Promise<DocumentTemplate> => {
    try {
      const response = await apiClient.patch<DocumentTemplate>(`/templates/${id}`, data);
      return response.data;
    } catch (error) {
      // Silent fallback to mock data when backend is unavailable
      const index = MOCK_TEMPLATES.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Template not found');
      MOCK_TEMPLATES[index] = { ...MOCK_TEMPLATES[index], ...data, updatedAt: new Date() };
      return MOCK_TEMPLATES[index];
    }
  },

  // Delete template
  deleteTemplate: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/templates/${id}`);
    } catch (error) {
      // Silent fallback to mock data when backend is unavailable
      const index = MOCK_TEMPLATES.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Template not found');
      MOCK_TEMPLATES.splice(index, 1);
    }
  },
};

// ─── Approvals API ─────────────────────────────────────────────────────────────

export const approvalsApi = {
  // Request approval
  requestApproval: async (data: RequestApprovalDto): Promise<DocumentApproval> => {
    try {
      const response = await apiClient.post<DocumentApproval>('/approvals', data);
      return response.data;
    } catch (error) {
      // Silent fallback to mock data when backend is unavailable
      const document = MOCK_DOCUMENTS.find(d => d.id === data.documentId);
      if (!document) throw new Error('Document not found');
      
      const approval: DocumentApproval = {
        id: String(Date.now()),
        approvalNumber: `APR-${String(Date.now()).slice(-6)}`,
        documentId: data.documentId,
        documentNumber: document.documentNumber,
        documentType: document.documentType,
        amount: document.totalAmount,
        currentStep: 1,
        totalSteps: 3,
        approvalChain: [
          {
            step: 1,
            approverId: 'USR-001',
            approverName: 'Manager',
            approverRole: 'Manager',
            status: 'Pending',
          },
          {
            step: 2,
            approverId: 'USR-002',
            approverName: 'Director',
            approverRole: 'Director',
            status: 'Pending',
          },
          {
            step: 3,
            approverId: 'USR-003',
            approverName: 'CEO',
            approverRole: 'CEO',
            status: 'Pending',
          },
        ],
        status: 'Pending',
        currentApproverId: 'USR-001',
        currentApproverName: 'Manager',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return approval;
    }
  },

  // Make approval decision
  makeDecision: async (data: ApprovalDecisionDto): Promise<DocumentApproval> => {
    try {
      const response = await apiClient.patch<DocumentApproval>(`/approvals/${data.approvalId}`, data);
      return response.data;
    } catch (error) {
      // Silent fallback to mock data when backend is unavailable
      throw new Error('Approval decision failed');
    }
  },

  // Get pending approvals
  getPendingApprovals: async (): Promise<DocumentApproval[]> => {
    try {
      const response = await apiClient.get<DocumentApproval[]>('/approvals/pending');
      return response.data;
    } catch (error) {
      // Silent fallback to mock data when backend is unavailable
      return [];
    }
  },
};

// ─── Versions API ───────────────────────────────────────────────────────────────

export const versionsApi = {
  // Create version
  createVersion: async (data: CreateVersionDto): Promise<DocumentVersion> => {
    try {
      const response = await apiClient.post<DocumentVersion>('/versions', data);
      return response.data;
    } catch (error) {
      // Silent fallback to mock data when backend is unavailable
      const document = MOCK_DOCUMENTS.find(d => d.id === data.documentId);
      if (!document) throw new Error('Document not found');
      
      const version: DocumentVersion = {
        id: String(Date.now()),
        version: document.version + 1,
        documentId: data.documentId,
        documentNumber: document.documentNumber,
        documentType: document.documentType,
        changeDescription: data.changeDescription,
        changedBy: 'Current User',
        changedAt: new Date(),
        documentData: { ...document },
        changes: [],
      };
      return version;
    }
  },

  // Get document versions
  getDocumentVersions: async (documentId: string): Promise<DocumentVersion[]> => {
    try {
      const response = await apiClient.get<DocumentVersion[]>(`/documents/${documentId}/versions`);
      return response.data;
    } catch (error) {
      // Silent fallback to mock data when backend is unavailable
      return [];
    }
  },
};
