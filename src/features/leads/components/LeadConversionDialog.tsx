'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ConversionTypeSelector, ConversionType } from './ConversionTypeSelector';
import { ConversionConfirmationDialog } from './ConversionConfirmationDialog';
import { EstimateBuilder } from '@/features/documents/components/EstimateBuilder';
import { ProposalBuilder } from '@/features/documents/components/ProposalBuilder';
import { QuotationBuilder } from '@/features/documents/components/QuotationBuilder';
import {
  Estimate,
  Proposal,
  Quotation,
  CreateEstimateDto,
  CreateProposalDto,
  CreateQuotationDto,
} from '@/features/documents/types/peb-commercial';
import { Lead } from '@/types/leads';
import { BackendPendingError } from '@/core/api/capabilities';

interface LeadConversionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead;
  onEstimateCreated?: (estimate: Estimate) => void;
  onProposalCreated?: (proposal: Proposal) => void;
  onQuotationCreated?: (quotation: Quotation) => void;
}

type ConversionStep = 'select' | 'confirm' | 'build' | 'error';

export function LeadConversionDialog({
  open,
  onOpenChange,
  lead,
}: LeadConversionDialogProps) {
  const [step, setStep] = useState<ConversionStep>('select');
  const [selectedType, setSelectedType] = useState<ConversionType | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const rejectPendingDocument = async (resource: string): Promise<never> => {
    throw new BackendPendingError(resource);
  };

  const handleSaveFailure = (error: unknown) => {
    const message =
      error instanceof BackendPendingError
        ? 'Document conversion is not available yet. Convert this lead to a Customer or Project instead.'
        : error instanceof Error
          ? error.message
          : 'Failed to create document';
    setErrorMessage(message);
    setStep('error');
    setIsSaving(false);
  };

  const handleEstimateSave = async (_estimateDto: CreateEstimateDto) => {
    setIsSaving(true);
    try {
      await rejectPendingDocument('estimates');
    } catch (error) {
      handleSaveFailure(error);
    }
  };

  const handleProposalSave = async (_proposalDto: CreateProposalDto) => {
    setIsSaving(true);
    try {
      await rejectPendingDocument('proposals');
    } catch (error) {
      handleSaveFailure(error);
    }
  };

  const handleQuotationSave = async (_quotationDto: CreateQuotationDto) => {
    setIsSaving(true);
    try {
      await rejectPendingDocument('quotations');
    } catch (error) {
      handleSaveFailure(error);
    }
  };

  const handleBuilderCancel = () => {
    setStep('select');
    setSelectedType(null);
    setErrorMessage(null);
    setIsSaving(false);
  };

  const handleClose = () => {
    setStep('select');
    setSelectedType(null);
    setShowConfirmation(false);
    setErrorMessage(null);
    setIsSaving(false);
    onOpenChange(false);
  };

  const emptyScope = {
    labour: { state: 'Included' as const, requirement: 'Optional' as const, chargeability: 'Chargeable' as const, visibility: 'Visible' as const },
    installation: { state: 'Included' as const, requirement: 'Optional' as const, chargeability: 'Chargeable' as const, visibility: 'Visible' as const },
    transportation: { state: 'Included' as const, requirement: 'Optional' as const, chargeability: 'Chargeable' as const, visibility: 'Visible' as const },
    crane: { state: 'Included' as const, requirement: 'Optional' as const, chargeability: 'Chargeable' as const, visibility: 'Visible' as const },
    civilWork: { state: 'Included' as const, requirement: 'Optional' as const, chargeability: 'Chargeable' as const, visibility: 'Visible' as const },
    accommodation: { state: 'Included' as const, requirement: 'Optional' as const, chargeability: 'Chargeable' as const, visibility: 'Visible' as const },
    erection: { state: 'Included' as const, requirement: 'Optional' as const, chargeability: 'Chargeable' as const, visibility: 'Visible' as const },
    freight: { state: 'Included' as const, requirement: 'Optional' as const, chargeability: 'Chargeable' as const, visibility: 'Visible' as const },
    additionalServices: [] as never[],
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

          {step === 'error' && (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Unable to create document</h3>
                <p className="text-muted-foreground">{errorMessage}</p>
              </div>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={handleBuilderCancel}>
                  Back
                </Button>
                <Button onClick={handleClose}>Close</Button>
              </div>
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
                scopeConfiguration: emptyScope,
                technicalSpecifications: {},
                inclusions: [],
                exclusions: [],
                createdAt: new Date(),
                updatedAt: new Date(),
              } as Estimate}
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
                scopeConfiguration: emptyScope,
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
              } as Proposal}
              onSave={handleQuotationSave}
              onCancel={handleBuilderCancel}
            />
          </div>
        </div>
      )}
    </>
  );
}
