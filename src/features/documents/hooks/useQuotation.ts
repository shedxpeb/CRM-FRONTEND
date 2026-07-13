import { useState, useEffect } from 'react';
import { Quotation, CreateQuotationDto } from '../types/peb-commercial';

// Mock data for frontend-only mode
const mockQuotations: Quotation[] = [
  {
    id: '1',
    quotationNumber: 'QUOT-001',
    version: 1,
    proposalId: 'PROP-001',
    proposalNumber: 'PROP-001',
    sourceEstimateId: 'EST-001',
    sourceEstimateNumber: 'EST-001',
    customerId: 'CUST-001',
    customerName: 'ABC Construction',
    status: 'Draft',
    paymentTerms: '30% Advance, 70% on Delivery',
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
    pricingConfiguration: {
      materialRates: [],
      labourCost: 50000,
      installationCost: 30000,
      transportationCost: 10000,
      craneCost: 5000,
      civilCost: 20000,
      accommodationCost: 5000,
      erectionCost: 25000,
      freightCost: 8000,
      additionalServiceCosts: [],
      discountType: 'percentage',
      discountValue: 5,
      gstRate: 18,
      gstType: 'CGST',
      roundingMethod: 'nearest',
    },
    materialCost: 150000,
    labourCost: 50000,
    installationCost: 30000,
    transportationCost: 10000,
    craneCost: 5000,
    civilCost: 20000,
    accommodationCost: 5000,
    erectionCost: 25000,
    freightCost: 8000,
    otherCosts: 0,
    subtotal: 303000,
    discountAmount: 15150,
    discountPercentage: 5,
    taxAmount: 51153,
    gstType: 'CGST',
    cgstAmount: 25576.5,
    sgstAmount: 25576.5,
    igstAmount: 0,
    cessAmount: 0,
    grandTotal: 339003,
    createdBy: 'Priya Sharma',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    quotationNumber: 'QUOT-002',
    version: 1,
    proposalId: 'PROP-002',
    proposalNumber: 'PROP-002',
    sourceEstimateId: 'EST-002',
    sourceEstimateNumber: 'EST-002',
    customerId: 'CUST-002',
    customerName: 'XYZ Industries',
    status: 'Sent',
    validUntil: new Date('2024-12-31'),
    paymentTerms: '50% Advance, 50% on Delivery',
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
    pricingConfiguration: {
      materialRates: [],
      labourCost: 80000,
      installationCost: 50000,
      transportationCost: 15000,
      craneCost: 8000,
      civilCost: 30000,
      accommodationCost: 8000,
      erectionCost: 40000,
      freightCost: 12000,
      additionalServiceCosts: [],
      discountType: 'percentage',
      discountValue: 10,
      gstRate: 18,
      gstType: 'CGST',
      roundingMethod: 'nearest',
    },
    materialCost: 250000,
    labourCost: 80000,
    installationCost: 50000,
    transportationCost: 15000,
    craneCost: 8000,
    civilCost: 30000,
    accommodationCost: 8000,
    erectionCost: 40000,
    freightCost: 12000,
    otherCosts: 0,
    subtotal: 493000,
    discountAmount: 49300,
    discountPercentage: 10,
    taxAmount: 79854,
    gstType: 'CGST',
    cgstAmount: 39927,
    sgstAmount: 39927,
    igstAmount: 0,
    cessAmount: 0,
    grandTotal: 523554,
    createdBy: 'Amit Shah',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    sentAt: new Date('2024-01-18'),
  },
];

const mockStats = {
  total: 2,
  draft: 1,
  sent: 1,
  accepted: 0,
  rejected: 0,
  totalValue: 862557,
};

export function useQuotations(params?: {
  page?: number;
  pageSize?: number;
  customerId?: string;
  status?: string;
  proposalId?: string;
  search?: string;
}) {
  const [data, setData] = useState<Quotation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuotations();
  }, [params?.page, params?.pageSize, params?.customerId, params?.status]);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      // Use mock data instead of API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setData(mockQuotations);
      setTotal(mockQuotations.length);
      setError(null);
    } catch (err) {
      setError('Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  const createQuotation = async (data: CreateQuotationDto) => {
    try {
      // Mock create operation
      await new Promise(resolve => setTimeout(resolve, 500));
      const newQuotation: Quotation = {
        id: String(mockQuotations.length + 1),
        quotationNumber: `QUOT-00${mockQuotations.length + 1}`,
        version: 1,
        proposalId: data.proposalId,
        proposalNumber: `PROP-00${mockQuotations.length + 1}`,
        sourceEstimateId: 'EST-001',
        sourceEstimateNumber: 'EST-001',
        customerId: '',
        customerName: 'New Customer',
        status: 'Draft',
        paymentTerms: data.paymentTerms,
        deliveryTerms: data.deliveryTerms,
        pricingConfiguration: data.pricingConfiguration,
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
        materialCost: 0,
        labourCost: data.pricingConfiguration.labourCost,
        installationCost: data.pricingConfiguration.installationCost,
        transportationCost: data.pricingConfiguration.transportationCost,
        craneCost: data.pricingConfiguration.craneCost,
        civilCost: data.pricingConfiguration.civilCost,
        accommodationCost: data.pricingConfiguration.accommodationCost,
        erectionCost: data.pricingConfiguration.erectionCost,
        freightCost: data.pricingConfiguration.freightCost,
        otherCosts: 0,
        subtotal: 0,
        discountAmount: 0,
        taxAmount: 0,
        gstType: data.pricingConfiguration.gstType,
        grandTotal: 0,
        termsAndConditions: data.termsAndConditions,
        notes: data.notes,
        internalNotes: data.internalNotes,
        templateId: data.templateId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockQuotations.push(newQuotation);
      await loadQuotations();
      return newQuotation;
    } catch (err) {
      setError('Failed to create quotation');
      throw err;
    }
  };

  const updateQuotation = async (id: string, data: any) => {
    try {
      // Mock update operation
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockQuotations.findIndex(q => q.id === id);
      if (index !== -1) {
        mockQuotations[index] = { ...mockQuotations[index], ...data, updatedAt: new Date() };
      }
      await loadQuotations();
      return mockQuotations[index];
    } catch (err) {
      setError('Failed to update quotation');
      throw err;
    }
  };

  const deleteQuotation = async (id: string) => {
    try {
      // Mock delete operation
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockQuotations.findIndex(q => q.id === id);
      if (index !== -1) {
        mockQuotations.splice(index, 1);
      }
      await loadQuotations();
    } catch (err) {
      setError('Failed to delete quotation');
      throw err;
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      // Mock status update
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockQuotations.findIndex(q => q.id === id);
      if (index !== -1) {
        mockQuotations[index] = { ...mockQuotations[index], status: status as any, updatedAt: new Date() };
      }
      await loadQuotations();
      return mockQuotations[index];
    } catch (err) {
      setError('Failed to update status');
      throw err;
    }
  };

  const convertToProject = async (id: string, projectData: any) => {
    try {
      // Mock conversion
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockQuotations.findIndex(q => q.id === id);
      if (index !== -1) {
        mockQuotations[index] = { ...mockQuotations[index], status: 'Converted' as any, updatedAt: new Date() };
      }
      await loadQuotations();
      return mockQuotations[index];
    } catch (err) {
      setError('Failed to convert to project');
      throw err;
    }
  };

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
    refetch: loadQuotations,
  };
}

export function useQuotation(id: string) {
  const [data, setData] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadQuotation();
    }
  }, [id]);

  const loadQuotation = async () => {
    try {
      setLoading(true);
      // Use mock data instead of API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const quotation = mockQuotations.find(q => q.id === id) || null;
      setData(quotation);
      setError(null);
    } catch (err) {
      setError('Failed to load quotation');
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    refetch: loadQuotation,
  };
}

export function useQuotationStats(enabled: boolean = true) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    loadStats();
  }, [enabled]);

  const loadStats = async () => {
    try {
      setLoading(true);
      // Use mock stats instead of API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setData({
        ...mockStats,
        changePercent: 6.8, // Add changePercent for consistency
        monthly: 1, // Add monthly for consistency
        yearly: 2, // Add yearly for consistency
      });
      error && setError(null);
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
