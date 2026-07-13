import { useState, useEffect } from 'react';
import { Estimate, CreateEstimateDto, UpdateEstimateDto } from '../types/peb-commercial';

// Mock data for frontend-only mode
const mockEstimates: Estimate[] = [
  {
    id: '1',
    estimateNumber: 'EST-001',
    version: 1,
    customerId: 'CUST-001',
    customerName: 'ABC Construction',
    status: 'Draft',
    includePricing: false,
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
    salesExecutive: 'Priya Sharma',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    estimateNumber: 'EST-002',
    version: 1,
    customerId: 'CUST-002',
    customerName: 'XYZ Industries',
    status: 'Sent',
    includePricing: true,
    subtotal: 200000,
    totalAmount: 236000,
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
    salesExecutive: 'Amit Shah',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    sentAt: new Date('2024-01-18'),
  },
  {
    id: '3',
    estimateNumber: 'EST-003',
    version: 1,
    customerId: 'CUST-003',
    customerName: 'Tech Corp',
    status: 'Converted',
    includePricing: true,
    subtotal: 350000,
    totalAmount: 413000,
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
    salesExecutive: 'Ravi Kumar',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-15'),
    sentAt: new Date('2024-01-10'),
    convertedToProposalId: 'PROP-003',
    convertedAt: new Date('2024-01-12'),
  },
];

const mockStats = {
  total: 3,
  draft: 1,
  sent: 1,
  converted: 1,
  totalValue: 649000,
};

export function useEstimates(params?: {
  page?: number;
  pageSize?: number;
  customerId?: string;
  status?: string;
  leadId?: string;
  projectId?: string;
  search?: string;
}) {
  const [data, setData] = useState<Estimate[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEstimates();
  }, [params?.page, params?.pageSize, params?.customerId, params?.status]);

  const loadEstimates = async () => {
    try {
      setLoading(true);
      // Use mock data instead of API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setData(mockEstimates);
      setTotal(mockEstimates.length);
      setError(null);
    } catch (err) {
      setError('Failed to load estimates');
    } finally {
      setLoading(false);
    }
  };

  const createEstimate = async (data: CreateEstimateDto) => {
    try {
      // Mock create operation
      await new Promise(resolve => setTimeout(resolve, 500));
      const newEstimate: Estimate = {
        id: String(mockEstimates.length + 1),
        estimateNumber: `EST-00${mockEstimates.length + 1}`,
        version: 1,
        customerId: data.customerId,
        customerName: 'New Customer',
        status: 'Draft',
        includePricing: data.includePricing,
        subtotal: data.includePricing ? 0 : undefined,
        totalAmount: data.includePricing ? 0 : undefined,
        materialSelections: data.materialSelections.map((m, i) => ({ ...m, id: String(i) })),
        scopeConfiguration: data.scopeConfiguration,
        technicalSpecifications: data.technicalSpecifications || {},
        inclusions: data.inclusions || [],
        exclusions: data.exclusions || [],
        notes: data.notes,
        internalNotes: data.internalNotes,
        templateId: data.templateId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockEstimates.push(newEstimate);
      await loadEstimates();
      return newEstimate;
    } catch (err) {
      setError('Failed to create estimate');
      throw err;
    }
  };

  const updateEstimate = async (id: string, data: UpdateEstimateDto) => {
    try {
      // Mock update operation
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockEstimates.findIndex(e => e.id === id);
      if (index !== -1) {
        mockEstimates[index] = { ...mockEstimates[index], ...data, updatedAt: new Date() };
      }
      await loadEstimates();
      return mockEstimates[index];
    } catch (err) {
      setError('Failed to update estimate');
      throw err;
    }
  };

  const deleteEstimate = async (id: string) => {
    try {
      // Mock delete operation
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockEstimates.findIndex(e => e.id === id);
      if (index !== -1) {
        mockEstimates.splice(index, 1);
      }
      await loadEstimates();
    } catch (err) {
      setError('Failed to delete estimate');
      throw err;
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      // Mock status update
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockEstimates.findIndex(e => e.id === id);
      if (index !== -1) {
        mockEstimates[index] = { ...mockEstimates[index], status: status as any, updatedAt: new Date() };
      }
      await loadEstimates();
      return mockEstimates[index];
    } catch (err) {
      setError('Failed to update status');
      throw err;
    }
  };

  const convertToProposal = async (id: string, proposalData: any) => {
    try {
      // Mock conversion
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockEstimates.findIndex(e => e.id === id);
      if (index !== -1) {
        mockEstimates[index] = { 
          ...mockEstimates[index], 
          status: 'Converted' as any, 
          convertedToProposalId: `PROP-00${mockEstimates.length + 1}`,
          convertedAt: new Date(),
          updatedAt: new Date() 
        };
      }
      await loadEstimates();
      return mockEstimates[index];
    } catch (err) {
      setError('Failed to convert to proposal');
      throw err;
    }
  };

  return {
    data,
    total,
    loading,
    error,
    createEstimate,
    updateEstimate,
    deleteEstimate,
    updateStatus,
    convertToProposal,
    refetch: loadEstimates,
  };
}

export function useEstimate(id: string) {
  const [data, setData] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadEstimate();
    }
  }, [id]);

  const loadEstimate = async () => {
    try {
      setLoading(true);
      // Use mock data instead of API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const estimate = mockEstimates.find(e => e.id === id) || null;
      setData(estimate);
      setError(null);
    } catch (err) {
      setError('Failed to load estimate');
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    refetch: loadEstimate,
  };
}

export function useEstimateStats() {
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
