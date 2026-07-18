// Main Purchase Order PDF Generator using Layout Engine
import jsPDF from 'jspdf';
import { PDFLayoutEngine } from './engine/layout-engine';
import { PDFLayoutConfig } from './models/layout.types';
import { createHeaderSection } from './sections/header-section';
import { createAddressBlocksSection } from './sections/address-blocks-section';
import { createGeneralInfoSection } from './sections/general-info-section';
import { createItemTableSection } from './sections/item-table-section';
import { createFinancialSummarySection } from './sections/financial-summary-section';
import { createAmountInWordsSection } from './sections/amount-in-words-section';
import { createInvoiceInstructionsSection } from './sections/invoice-instructions-section';
import { createTermsSection } from './sections/terms-section';
import { createSignatureSection } from './sections/signature-section';
import { createFooterSection } from './sections/footer-section';
import { mapPurchaseOrderToPDFData, PDFDataMapperOptions } from './mappers/data-mapper';
import { PurchaseOrder } from '../../types/purchase-order.types';
import { OrganizationData } from './models/layout.types';

export type { PDFDataMapperOptions };

export function generatePurchaseOrderPDF(po: PurchaseOrder, options: PDFDataMapperOptions): jsPDF {
  // Create layout configuration
  const config: PDFLayoutConfig = {
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    margins: {
      top: 15,
      right: 15,
      bottom: 15,
      left: 15,
    },
  };

  // Initialize layout engine
  const engine = new PDFLayoutEngine(config);

  // Map PurchaseOrder data to PDF data format
  const pdfData = mapPurchaseOrderToPDFData(po, options);

  // Add all sections in order
  engine.addSections([
    createHeaderSection(),
    createAddressBlocksSection(),
    createGeneralInfoSection(),
    createItemTableSection(),
    createFinancialSummarySection(),
    createAmountInWordsSection(),
    createInvoiceInstructionsSection(),
    createTermsSection(),
    createSignatureSection(),
    createFooterSection(),
  ]);

  // Render the PDF
  return engine.render(pdfData);
}

export function downloadPurchaseOrderPDF(po: PurchaseOrder, options: PDFDataMapperOptions): void {
  const doc = generatePurchaseOrderPDF(po, options);
  doc.save(`PO-${po.poNumber}.pdf`);
}

export function getPurchaseOrderPDFBlob(po: PurchaseOrder, options: PDFDataMapperOptions): Blob {
  const doc = generatePurchaseOrderPDF(po, options);
  return doc.output('blob');
}
