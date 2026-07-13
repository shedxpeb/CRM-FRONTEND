'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ConversionTypeSelector, ConversionType } from './ConversionTypeSelector';
import { ConversionConfirmationDialog } from './ConversionConfirmationDialog';
import { EstimateBuilder } from '@/features/documents/components/EstimateBuilder';
import { ProposalBuilder } from '@/features/documents/components/ProposalBuilder';
import { QuotationBuilder } from '@/features/documents/components/QuotationBuilder';
import { Estimate, Proposal, Quotation, CreateEstimateDto, CreateProposalDto, CreateQuotationDto } from '@/features/documents/types/peb-commercial';
import { Lead } from '@/types/leads';

interface LeadConversionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead;
  onEstimateCreated?: (estimate: Estimate) => void;
  onProposalCreated?: (proposal: Proposal) => void;
  onQuotationCreated?: (quotation: Quotation) => void;
}

type ConversionStep = 'select' | 'confirm' | 'build' | 'complete';

export function LeadConversionDialog({
  open,
  onOpenChange,
  lead,
  onEstimateCreated,
  onProposalCreated,
  onQuotationCreated,
}: LeadConversionDialogProps) {
  const [step, setStep] = useState<ConversionStep>('select');
  const [selectedType, setSelectedType] = useState<ConversionType | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [createdDocument, setCreatedDocument] = useState<Estimate | Proposal | Quotation | null>(null);

  const handleTypeSelect = (type: ConversionType) => {
    setSelectedType(type);
    setShowConfirmation(true);
  };

  const handleConfirmConversion = () => {
    setShowConfirmation(false);
    setStep('build');
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setSelectedType(null);
  };

  const handleEstimateSave = (estimateDto: CreateEstimateDto) => {
    // In a real implementation, this would call the API
    const mockEstimate: Estimate = {
      id: `EST-${Date.now()}`,
      estimateNumber: `EST-${Date.now()}`,
      version: 1,
      customerId: estimateDto.customerId,
      customerName: lead.companyName || lead.customerName || 'Unknown',
      leadId: lead.id,
      leadNumber: String(lead.leadNumber),
      status: 'Draft',
      includePricing: estimateDto.includePricing,
      materialSelections: estimateDto.materialSelections.map((m, i) => ({
        ...m,
        id: `mat-${i}`,
      })),
      scopeConfiguration: estimateDto.scopeConfiguration,
      technicalSpecifications: estimateDto.technicalSpecifications || {},
      inclusions: estimateDto.inclusions || [],
      exclusions: estimateDto.exclusions || [],
      notes: estimateDto.notes,
      internalNotes: estimateDto.internalNotes,
      terms: estimateDto.terms,
      contactPersonName: estimateDto.contactPersonName,
      salesExecutive: estimateDto.salesExecutive,
      validTill: estimateDto.validTill,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setCreatedDocument(mockEstimate);
    setStep('complete');
    onEstimateCreated?.(mockEstimate);
  };

  const handleProposalSave = (proposalDto: CreateProposalDto) => {
    // In a real implementation, this would call the API
    const mockProposal: Proposal = {
      id: `PROP-${Date.now()}`,
      proposalNumber: `PROP-${Date.now()}`,
      version: 1,
      estimateId: proposalDto.estimateId,
      estimateNumber: `EST-${proposalDto.estimateId}`,
      customerId: lead.customerId || '',
      customerName: lead.companyName || lead.customerName || 'Unknown',
      leadId: lead.id,
      leadNumber: String(lead.leadNumber),
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
      proposalConfiguration: proposalDto.proposalConfiguration || {
        labourIncluded: false,
        installationIncluded: false,
        transportationIncluded: false,
        craneIncluded: false,
        civilWorkIncluded: false,
        accommodationIncluded: false,
        erectionIncluded: false,
        freightIncluded: false,
        includeTechnicalDrawings: false,
        include3DRenderings: false,
        includeMaterialSamples: false,
        includePastProjects: false,
      },
      includeCommercialSummary: proposalDto.includeCommercialSummary || false,
      commercialSummary: proposalDto.commercialSummary,
      timeline: proposalDto.timeline,
      coverPage: proposalDto.coverPage,
      companyProfile: proposalDto.companyProfile,
      projectOverview: proposalDto.projectOverview,
      scopeOfWork: proposalDto.scopeOfWork,
      termsAndConditions: proposalDto.termsAndConditions,
      notes: proposalDto.notes,
      internalNotes: proposalDto.internalNotes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setCreatedDocument(mockProposal);
    setStep('complete');
    onProposalCreated?.(mockProposal);
  };

  const handleQuotationSave = (quotationDto: CreateQuotationDto) => {
    // In a real implementation, this would call the API
    const mockQuotation: Quotation = {
      id: `QUO-${Date.now()}`,
      quotationNumber: `QUO-${Date.now()}`,
      version: 1,
      proposalId: quotationDto.proposalId,
      proposalNumber: `PROP-${quotationDto.proposalId}`,
      sourceEstimateId: '',
      sourceEstimateNumber: '',
      customerId: lead.customerId || '',
      customerName: lead.companyName || lead.customerName || 'Unknown',
      leadId: lead.id,
      leadNumber: String(lead.leadNumber),
      status: 'Draft',
      validUntil: quotationDto.validUntil,
      paymentTerms: quotationDto.paymentTerms,
      deliveryTerms: quotationDto.deliveryTerms,
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
        labourIncluded: false,
        installationIncluded: false,
        transportationIncluded: false,
        craneIncluded: false,
        civilWorkIncluded: false,
        accommodationIncluded: false,
        erectionIncluded: false,
        freightIncluded: false,
        includeTechnicalDrawings: false,
        include3DRenderings: false,
        includeMaterialSamples: false,
        includePastProjects: false,
      },
      pricingConfiguration: quotationDto.pricingConfiguration,
      materialCost: 0,
      labourCost: 0,
      installationCost: 0,
      transportationCost: 0,
      craneCost: 0,
      civilCost: 0,
      accommodationCost: 0,
      erectionCost: 0,
      freightCost: 0,
      otherCosts: 0,
      subtotal: 0,
      discountAmount: 0,
      taxAmount: 0,
      gstType: 'CGST',
      grandTotal: 0,
      termsAndConditions: quotationDto.termsAndConditions,
      notes: quotationDto.notes,
      internalNotes: quotationDto.internalNotes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setCreatedDocument(mockQuotation);
    setStep('complete');
    onQuotationCreated?.(mockQuotation);
  };

  const handleBuilderCancel = () => {
    setStep('select');
    setSelectedType(null);
  };

  const handleClose = () => {
    setStep('select');
    setSelectedType(null);
    setShowConfirmation(false);
    setCreatedDocument(null);
    onOpenChange(false);
  };

  const getDocumentNumber = () => {
    if (!createdDocument) return '';
    const doc = createdDocument as any;
    return doc.estimateNumber || doc.proposalNumber || doc.quotationNumber || '';
  };

  const getDocumentType = () => {
    if (!createdDocument) return '';
    const doc = createdDocument as any;
    if (doc.estimateNumber) return 'Estimate';
    if (doc.proposalNumber) return 'Proposal';
    if (doc.quotationNumber) return 'Quotation';
    return 'Document';
  };

  return (
    <>
      <Dialog open={open && step !== 'build'} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              Convert Lead to...
            </DialogTitle>
          </DialogHeader>

          {step === 'select' && (
            <div className="py-4">
              <ConversionTypeSelector
                selectedType={selectedType}
                onSelect={handleTypeSelect}
              />
            </div>
          )}

          {step === 'complete' && createdDocument && (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{getDocumentType()} Created</h3>
                <p className="text-muted-foreground">{getDocumentNumber()}</p>
              </div>
              <Button onClick={handleClose} className="mt-4">
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {showConfirmation && selectedType && (
        <ConversionConfirmationDialog
          open={showConfirmation}
          onOpenChange={handleCancelConfirmation}
          conversionType={selectedType}
          leadId={lead.id}
          leadName={lead.companyName || lead.customerName || 'Unknown'}
          onConfirm={handleConfirmConversion}
        />
      )}

      {step === 'build' && selectedType === 'estimate' && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen py-8 px-4">
            <EstimateBuilder
              onSave={handleEstimateSave}
              onCancel={handleBuilderCancel}
            />
          </div>
        </div>
      )}

      {step === 'build' && selectedType === 'proposal' && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen py-8 px-4">
            <ProposalBuilder
              estimate={{
                id: lead.id,
                estimateNumber: `EST-${lead.id}`,
                version: 1,
                customerId: lead.customerId || '',
                customerName: lead.companyName || lead.customerName || 'Unknown',
                leadId: lead.id,
                leadNumber: String(lead.leadNumber),
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
                createdAt: new Date(),
                updatedAt: new Date(),
              }}
              onSave={handleProposalSave}
              onCancel={handleBuilderCancel}
            />
          </div>
        </div>
      )}

      {step === 'build' && selectedType === 'quotation' && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen py-8 px-4">
            <QuotationBuilder
              proposal={{
                id: lead.id,
                proposalNumber: `PROP-${lead.id}`,
                version: 1,
                estimateId: lead.id,
                estimateNumber: `EST-${lead.id}`,
                customerId: lead.customerId || '',
                customerName: lead.companyName || lead.customerName || 'Unknown',
                leadId: lead.id,
                leadNumber: String(lead.leadNumber),
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
                  labourIncluded: false,
                  installationIncluded: false,
                  transportationIncluded: false,
                  craneIncluded: false,
                  civilWorkIncluded: false,
                  accommodationIncluded: false,
                  erectionIncluded: false,
                  freightIncluded: false,
                  includeTechnicalDrawings: false,
                  include3DRenderings: false,
                  includeMaterialSamples: false,
                  includePastProjects: false,
                },
                includeCommercialSummary: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              }}
              onSave={handleQuotationSave}
              onCancel={handleBuilderCancel}
            />
          </div>
        </div>
      )}
    </>
  );
}
