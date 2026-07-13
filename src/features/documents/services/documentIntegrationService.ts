/**
 * Document Integration Service (Frontend-First Approach)
 * 
 * This service provides UI navigation helpers and mock state management.
 * Direct business logic is NOT implemented in the frontend phase.
 * 
 * Integrations:
 * - Documents ↔ Leads (Create Estimate from Lead - Pre-fill only)
 * - Documents ↔ Projects (Convert Quotation to Project - Pre-fill only)
 * - Documents ↔ Inventory (Stock Reservation - Handled in Project module)
 * - Documents ↔ Finance (Revenue Pipeline - Read-only tracking)
 */

import { Estimate, Proposal, Quotation, CreateEstimateDto } from '../types/peb-commercial';
import { Lead } from '@/features/leads/types';
import { Customer } from '@/features/customers/types';
import { Project, CreateProjectDto } from '@/features/projects/types';
import { PEBInventoryItem, StockReservation, StockMovement, CreateStockReservationDto, CreateStockMovementDto } from '@/features/inventory/types/peb-inventory';
import { RevenuePipeline, Invoice } from '@/features/finance/types';

// ─── Documents ↔ Leads Integration ─────────────────────────────────────────────

/**
 * Create Estimate from Lead
 * Pre-fills estimate data from lead for UI navigation
 * This is a UI helper function - actual creation happens via API
 */
export async function createEstimateFromLead(lead: Lead): Promise<CreateEstimateDto> {
  const estimateDto: CreateEstimateDto = {
    customerId: lead.customerId || '', // Will need to create customer if not exists
    leadId: lead.id,
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
    technicalSpecifications: {
      buildingLength: lead.length,
      buildingWidth: lead.width,
      buildingHeight: lead.height,
      buildingArea: lead.width && lead.length ? lead.width * lead.length : undefined,
    },
    inclusions: [],
    exclusions: [],
    notes: lead.remarks,
  };

  return estimateDto;
}

/**
 * Update Lead Status on Document Creation
 * UI helper - actual status update happens via API
 */
export async function updateLeadStatusOnDocument(
  leadId: string,
  documentType: 'Estimate' | 'Proposal' | 'Quotation',
  documentId: string
): Promise<void> {
  const statusMap = {
    Estimate: 'Estimate Sent' as const,
    Proposal: 'Proposal Sent' as const,
    Quotation: 'Negotiation' as const,
  };

  // UI Helper: Navigate to update lead status
}

// ─── Documents ↔ Projects Integration ───────────────────────────────────────────

/**
 * Convert Quotation to Project
 * Pre-fills project data from quotation for UI navigation
 * This is a UI helper function - actual creation happens via API (manual action)
 */
export async function convertQuotationToProject(quotation: Quotation): Promise<CreateProjectDto> {
  const projectDto: CreateProjectDto = {
    projectName: quotation.projectName || `${quotation.customerName} - PEB Project`,
    customerId: quotation.customerId,
    leadId: quotation.leadId,
    projectType: 'Industrial Shed', // Default, should be derived from quotation
    value: quotation.grandTotal,
    budget: quotation.grandTotal,
    location: quotation.customerAddress || 'TBD',
    city: 'TBD', // Should be derived from customer address
    state: 'TBD',
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    priority: 'Medium',
    projectManagerId: '', // Should be assigned based on availability
    structureType: 'PEB Building',
    width: quotation.technicalSpecifications.buildingWidth,
    length: quotation.technicalSpecifications.buildingLength,
    height: quotation.technicalSpecifications.buildingHeight,
    baySpacing: quotation.technicalSpecifications.baySpacing,
    roofType: 'Standing Seam',
    craneSystem: 'None',
    mezzanine: false,
    wallType: 'Single Skin',
    insulation: false,
    coveredArea: quotation.technicalSpecifications.buildingArea,
  };

  return projectDto;
}

/**
 * Update Quotation on Project Creation
 * UI helper - actual update happens via API
 */
export async function updateQuotationOnProjectCreation(
  quotationId: string,
  projectId: string,
  projectName: string
): Promise<void> {
  // UI Helper: Navigate to update quotation
}

// ─── Documents ↔ Inventory Integration ─────────────────────────────────────────

/**
 * Reserve Stock for Quotation
 * DEPRECATED - Stock reservation happens at project creation, not quotation acceptance
 * This function is kept for backward compatibility but should not be used
 * Use project-based stock reservation instead
 */
export async function reserveStockForQuotation(
  quotation: Quotation,
  inventoryItems: PEBInventoryItem[]
): Promise<StockReservation[]> {
  const reservations: StockReservation[] = [];

  for (const materialSelection of quotation.materialSelections) {
    const inventoryItem = inventoryItems.find(
      (item) => item.itemCode === materialSelection.itemCode
    );

    if (!inventoryItem) {
      continue;
    }

    const quantity = materialSelection.quantity || 0;
    if (quantity <= 0) continue;

    // Check if enough stock is available
    if (inventoryItem.availableStock < quantity) {
      continue;
    }

    // Create reservation
    const reservation: StockReservation = {
      id: `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      reservationNumber: `SRV-${Date.now()}`,
      projectId: quotation.convertedToProjectId || '', // Will be set when project is created
      projectName: quotation.projectName || '',
      quotationId: quotation.id,
      quotationNumber: quotation.quotationNumber,
      inventoryItemId: inventoryItem.id,
      itemCode: inventoryItem.itemCode,
      itemName: inventoryItem.itemName,
      reservedQuantity: quantity,
      consumedQuantity: 0,
      releasedQuantity: 0,
      status: 'Reserved',
      reservedAt: new Date(),
    };

    reservations.push(reservation);
  }

  return reservations;
}

/**
 * Consume Stock for Project
 * Called when materials are issued to project (manual action)
 * This happens in Project module, not Documents module
 */
export async function consumeStockForProject(
  projectId: string,
  projectName: string,
  reservations: StockReservation[]
): Promise<StockMovement[]> {
  const movements: StockMovement[] = [];

  for (const reservation of reservations) {
    if (reservation.status !== 'Reserved') continue;

    const quantityToConsume = reservation.reservedQuantity - reservation.consumedQuantity;
    if (quantityToConsume <= 0) continue;

    const movement: StockMovement = {
      id: `MOV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      movementNumber: `STM-${Date.now()}`,
      type: 'Consumption',
      inventoryItemId: reservation.inventoryItemId,
      itemCode: reservation.itemCode,
      itemName: reservation.itemName,
      quantity: quantityToConsume,
      previousStock: 0, // Would be fetched from inventory
      newStock: 0, // Would be calculated
      referenceType: 'Project',
      referenceId: projectId,
      referenceNumber: projectName,
      performedBy: 'System',
      performedByRole: 'Auto',
      movementDate: new Date(),
    };

    movements.push(movement);
  }

  return movements;
}

/**
 * Release Stock for Quotation
 * Called when project is cancelled
 * This happens in Project module, not Documents module
 */
export async function releaseStockForQuotation(
  quotationId: string,
  quotationNumber: string,
  reservations: StockReservation[]
): Promise<StockMovement[]> {
  const movements: StockMovement[] = [];

  for (const reservation of reservations) {
    if (reservation.status !== 'Reserved') continue;

    const quantityToRelease = reservation.reservedQuantity - reservation.releasedQuantity;
    if (quantityToRelease <= 0) continue;

    const movement: StockMovement = {
      id: `MOV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      movementNumber: `STM-${Date.now()}`,
      type: 'Release',
      inventoryItemId: reservation.inventoryItemId,
      itemCode: reservation.itemCode,
      itemName: reservation.itemName,
      quantity: quantityToRelease,
      previousStock: 0, // Would be fetched from inventory
      newStock: 0, // Would be calculated
      referenceType: 'Project',
      referenceId: reservation.projectId,
      referenceNumber: reservation.projectName,
      performedBy: 'System',
      performedByRole: 'Auto',
      movementDate: new Date(),
      notes: 'Stock released due to project cancellation',
    };

    movements.push(movement);
  }

  return movements;
}

// ─── Documents ↔ Finance Integration ─────────────────────────────────────────────

/**
 * Add Quotation to Revenue Pipeline
 * Read-only tracking for UI display - actual pipeline managed by Finance module
 */
export async function addToRevenuePipeline(quotation: Quotation): Promise<RevenuePipeline> {
  const probabilityMap: Record<string, number> = {
    Draft: 10,
    Sent: 30,
    Viewed: 40,
    Accepted: 100,
    Rejected: 0,
    Expired: 0,
    Converted: 100,
    Cancelled: 0,
  };

  const pipelineItem: RevenuePipeline = {
    id: `RVP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    quotationId: quotation.id,
    quotationNumber: quotation.quotationNumber,
    customerId: quotation.customerId,
    customerName: quotation.customerName,
    projectId: quotation.convertedToProjectId,
    projectName: quotation.projectName,
    grandTotal: quotation.grandTotal,
    materialCost: quotation.materialCost,
    labourCost: quotation.labourCost,
    otherCosts: quotation.otherCosts,
    status: quotation.status,
    probability: probabilityMap[quotation.status] || 0,
    expectedCloseDate: quotation.validUntil,
    convertedToProject: !!quotation.convertedToProjectId,
    convertedAt: quotation.convertedAt,
    createdAt: quotation.createdAt || new Date(),
    updatedAt: quotation.updatedAt,
  };

  return pipelineItem;
}

/**
 * Generate Invoice from Quotation
 * DEPRECATED - Finance module is independent
 * Invoices are created in Finance module, not from Documents
 * This function is kept for backward compatibility but should not be used
 */
export async function generateInvoiceFromQuotation(
  quotation: Quotation,
  projectId: string
): Promise<Partial<Invoice>> {
  const invoice: Partial<Invoice> = {
    customerId: quotation.customerId,
    customerName: quotation.customerName,
    customerAddress: quotation.customerAddress || '',
    customerGST: quotation.customerGST,
    projectId: projectId,
    projectName: quotation.projectName,
    sourceType: 'Project', // Changed from Quotation
    sourceId: projectId,
    subtotal: quotation.subtotal,
    taxAmount: quotation.taxAmount,
    totalAmount: quotation.grandTotal,
    paidAmount: 0,
    pendingAmount: quotation.grandTotal,
    gstType: quotation.gstType,
    cgstAmount: quotation.cgstAmount,
    sgstAmount: quotation.sgstAmount,
    igstAmount: quotation.igstAmount,
    cessAmount: quotation.cessAmount,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    paymentTerms: quotation.paymentTerms,
    status: 'Draft',
    lineItems: quotation.materialSelections.map((material) => ({
      id: `LI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: material.itemName,
      quantity: material.quantity || 0,
      unit: material.unit || 'pcs',
      rate: material.rate || 0,
      amount: material.amount || 0,
    })),
  };

  return invoice;
}

/**
 * Calculate Finance Stats from Documents
 * Read-only aggregation for UI display - actual stats managed by Finance module
 */
export async function calculateFinanceStatsFromDocuments(
  quotations: Quotation[]
): Promise<{
  totalPipelineValue: number;
  confirmedRevenue: number;
  pendingQuotations: number;
  conversionRate: number;
}> {
  const totalPipelineValue = quotations
    .filter((q) => ['Sent', 'Viewed', 'Accepted'].includes(q.status))
    .reduce((sum, q) => sum + q.grandTotal, 0);

  const confirmedRevenue = quotations
    .filter((q) => q.status === 'Accepted' || q.status === 'Converted')
    .reduce((sum, q) => sum + q.grandTotal, 0);

  const pendingQuotations = quotations.filter((q) =>
    ['Draft', 'Sent', 'Viewed'].includes(q.status)
  ).length;

  const totalQuotations = quotations.length;
  const convertedQuotations = quotations.filter((q) => q.status === 'Converted').length;
  const conversionRate = totalQuotations > 0 ? (convertedQuotations / totalQuotations) * 100 : 0;

  return {
    totalPipelineValue,
    confirmedRevenue,
    pendingQuotations,
    conversionRate,
  };
}

// ─── Customer Document Tracking ─────────────────────────────────────────────────────

/**
 * Update Customer Document Arrays
 * UI helper - actual update happens via API
 */
export async function updateCustomerDocumentArrays(
  customerId: string,
  documentType: 'Estimate' | 'Proposal' | 'Quotation',
  documentId: string
): Promise<void> {
  // UI Helper: Navigate to update customer
}

/**
 * Get Customer Document Stats
 * Read-only aggregation for UI display - actual stats managed by Customer module
 */
export async function getCustomerDocumentStats(
  customerId: string,
  estimates: Estimate[],
  proposals: Proposal[],
  quotations: Quotation[]
): Promise<{
  totalEstimates: number;
  totalProposals: number;
  totalQuotations: number;
  totalRevenue: number;
  pendingQuotations: number;
}> {
  const customerEstimates = estimates.filter((e) => e.customerId === customerId);
  const customerProposals = proposals.filter((p) => p.customerId === customerId);
  const customerQuotations = quotations.filter((q) => q.customerId === customerId);

  const totalRevenue = customerQuotations
    .filter((q) => q.status === 'Accepted' || q.status === 'Converted')
    .reduce((sum, q) => sum + q.grandTotal, 0);

  const pendingQuotations = customerQuotations.filter((q) =>
    ['Draft', 'Sent', 'Viewed'].includes(q.status)
  ).length;

  return {
    totalEstimates: customerEstimates.length,
    totalProposals: customerProposals.length,
    totalQuotations: customerQuotations.length,
    totalRevenue,
    pendingQuotations,
  };
}
