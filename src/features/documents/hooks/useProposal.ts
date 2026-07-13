import { useState, useEffect } from 'react';
import { Proposal, CreateProposalDto } from '../types/peb-commercial';

// Mock data for frontend-only mode
const mockProposals: Proposal[] = [
  {
    id: '1',
    proposalNumber: 'PROP-001',
    version: 1,
    estimateId: 'EST-001',
    estimateNumber: 'EST-001',
    customerId: 'CUST-001',
    customerName: 'ABC Construction',
    status: 'Draft',
    materialSelections: [],
    scopeConfiguration: {
      labour: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      installation: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      transportation: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      crane: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      civilWork: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      accommodation: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      erection: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      freight: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      additionalServices: [],
    },
    technicalSpecifications: {},
    inclusions: [],
    exclusions: [],
    proposalConfiguration: {
      labourIncluded: true,
      installationIncluded: true,
      transportationIncluded: true,
      craneIncluded: true,
      civilWorkIncluded: true,
      accommodationIncluded: true,
      erectionIncluded: true,
      freightIncluded: true,
      includeTechnicalDrawings: true,
      include3DRenderings: false,
      includeMaterialSamples: false,
      includePastProjects: false,
    },
    includeCommercialSummary: false,
    createdBy: 'Priya Sharma',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    proposalNumber: 'PROP-002',
    version: 1,
    estimateId: 'EST-002',
    estimateNumber: 'EST-002',
    customerId: 'CUST-002',
    customerName: 'XYZ Industries',
    status: 'Sent',
    materialSelections: [],
    scopeConfiguration: {
      labour: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      installation: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      transportation: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      crane: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      civilWork: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      accommodation: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      erection: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      freight: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      additionalServices: [],
    },
    technicalSpecifications: {},
    inclusions: [],
    exclusions: [],
    proposalConfiguration: {
      labourIncluded: true,
      installationIncluded: true,
      transportationIncluded: true,
      craneIncluded: true,
      civilWorkIncluded: true,
      accommodationIncluded: true,
      erectionIncluded: true,
      freightIncluded: true,
      includeTechnicalDrawings: true,
      include3DRenderings: false,
      includeMaterialSamples: false,
      includePastProjects: false,
    },
    includeCommercialSummary: false,
    createdBy: 'Amit Shah',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    sentAt: new Date('2024-01-18'),
  },
  {
    id: '3',
    proposalNumber: 'PROP-003',
    version: 1,
    estimateId: 'EST-003',
    estimateNumber: 'EST-003',
    customerId: 'CUST-003',
    customerName: 'Tech Corp',
    status: 'Accepted',
    materialSelections: [],
    scopeConfiguration: {
      labour: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      installation: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      transportation: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      crane: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      civilWork: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      accommodation: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      erection: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      freight: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
      additionalServices: [],
    },
    technicalSpecifications: {},
    inclusions: [],
    exclusions: [],
    proposalConfiguration: {
      labourIncluded: true,
      installationIncluded: true,
      transportationIncluded: true,
      craneIncluded: true,
      civilWorkIncluded: true,
      accommodationIncluded: true,
      erectionIncluded: true,
      freightIncluded: true,
      includeTechnicalDrawings: true,
      include3DRenderings: false,
      includeMaterialSamples: false,
      includePastProjects: false,
    },
    includeCommercialSummary: false,
    createdBy: 'Ravi Kumar',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-15'),
    sentAt: new Date('2024-01-10'),
    viewedAt: new Date('2024-01-12'),
  },
];

const mockStats = {
  total: 3,
  draft: 1,
  sent: 1,
  accepted: 1,
  rejected: 0,
  totalValue: 900000,
};

export function useProposals(params?: {
  page?: number;
  pageSize?: number;
  customerId?: string;
  status?: string;
  estimateId?: string;
  search?: string;
}) {
  const [data, setData] = useState<Proposal[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProposals();
  }, [params?.page, params?.pageSize, params?.customerId, params?.status]);

  const loadProposals = async () => {
    try {
      setLoading(true);
      // Use mock data instead of API call
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      setData(mockProposals);
      setTotal(mockProposals.length);
      setError(null);
    } catch (err) {
      setError('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const createProposal = async (data: CreateProposalDto) => {
    try {
      // Mock create operation
      await new Promise(resolve => setTimeout(resolve, 500));
      const newProposal: Proposal = {
        id: String(mockProposals.length + 1),
        proposalNumber: `PROP-00${mockProposals.length + 1}`,
        version: 1,
        estimateId: data.estimateId,
        estimateNumber: `EST-00${mockProposals.length + 1}`,
        customerId: '',
        customerName: 'New Customer',
        status: 'Draft',
        materialSelections: [],
        scopeConfiguration: {
          labour: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
          installation: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
          transportation: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
          crane: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
          civilWork: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
          accommodation: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
          erection: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
          freight: { state: 'Included', requirement: 'Optional', chargeability: 'Chargeable', visibility: 'Visible' },
          additionalServices: [],
        },
        technicalSpecifications: {},
        inclusions: [],
        exclusions: [],
        proposalConfiguration: data.proposalConfiguration || {
          labourIncluded: true,
          installationIncluded: true,
          transportationIncluded: true,
          craneIncluded: true,
          civilWorkIncluded: true,
          accommodationIncluded: true,
          erectionIncluded: true,
          freightIncluded: true,
          includeTechnicalDrawings: true,
          include3DRenderings: false,
          includeMaterialSamples: false,
          includePastProjects: false,
        },
        includeCommercialSummary: data.includeCommercialSummary || false,
        commercialSummary: data.commercialSummary,
        timeline: data.timeline,
        coverPage: data.coverPage,
        companyProfile: data.companyProfile,
        projectOverview: data.projectOverview,
        scopeOfWork: data.scopeOfWork,
        termsAndConditions: data.termsAndConditions,
        notes: data.notes,
        internalNotes: data.internalNotes,
        templateId: data.templateId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockProposals.push(newProposal);
      await loadProposals();
      return newProposal;
    } catch (err) {
      setError('Failed to create proposal');
      throw err;
    }
  };

  const updateProposal = async (id: string, data: any) => {
    try {
      // Mock update operation
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockProposals.findIndex(p => p.id === id);
      if (index !== -1) {
        mockProposals[index] = { ...mockProposals[index], ...data, updatedAt: new Date() };
      }
      await loadProposals();
      return mockProposals[index];
    } catch (err) {
      setError('Failed to update proposal');
      throw err;
    }
  };

  const deleteProposal = async (id: string) => {
    try {
      // Mock delete operation
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockProposals.findIndex(p => p.id === id);
      if (index !== -1) {
        mockProposals.splice(index, 1);
      }
      await loadProposals();
    } catch (err) {
      setError('Failed to delete proposal');
      throw err;
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      // Mock status update
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockProposals.findIndex(p => p.id === id);
      if (index !== -1) {
        mockProposals[index] = { ...mockProposals[index], status: status as any, updatedAt: new Date() };
      }
      await loadProposals();
      return mockProposals[index];
    } catch (err) {
      setError('Failed to update status');
      throw err;
    }
  };

  const convertToQuotation = async (id: string, quotationData: any) => {
    try {
      // Mock conversion
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockProposals.findIndex(p => p.id === id);
      if (index !== -1) {
        mockProposals[index] = { ...mockProposals[index], status: 'Converted' as any, updatedAt: new Date() };
      }
      await loadProposals();
      return mockProposals[index];
    } catch (err) {
      setError('Failed to convert to quotation');
      throw err;
    }
  };

  return {
    data,
    total,
    loading,
    error,
    createProposal,
    updateProposal,
    deleteProposal,
    updateStatus,
    convertToQuotation,
    refetch: loadProposals,
  };
}

export function useProposal(id: string) {
  const [data, setData] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProposal();
    }
  }, [id]);

  const loadProposal = async () => {
    try {
      setLoading(true);
      // Use mock data instead of API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const proposal = mockProposals.find(p => p.id === id) || null;
      setData(proposal);
      setError(null);
    } catch (err) {
      setError('Failed to load proposal');
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    refetch: loadProposal,
  };
}

export function useProposalStats() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      // Use mock stats instead of API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setData(mockStats);
      setError(null);
    } catch (err) {
      setError('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    refetch: loadStats,
  };
}
