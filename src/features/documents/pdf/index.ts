/**
 * PDF Generation Module
 * Exports all PDF components and utilities
 */

export { DocumentHeader } from './components/DocumentHeader';
export { DocumentFooter } from './components/DocumentFooter';
export { DocumentTable } from './components/DocumentTable';
export { DocumentTotals } from './components/DocumentTotals';
export { DocumentSignature } from './components/DocumentSignature';
export { EstimatePDF } from './EstimatePDF';
export { ProposalPDF } from './ProposalPDF';
export { QuotationPDF } from './QuotationPDF';
export { InvoicePDF } from './InvoicePDF';

export {
  numberToWords,
  formatDateForPDF,
  calculateGST,
  calculateDiscount,
  formatCurrencyForPDF,
} from './utils/pdfUtils';

export {
  buildDocumentPdfElement,
  mapCompanyToPdfProps,
  getPdfFilename,
  getPdfAuthorizedBy,
} from './buildDocumentPdf';
export type { CompanyPdfProps } from './buildDocumentPdf';
export {
  generateDocumentPdfBlob,
  downloadDocumentPdf,
  createDocumentPdfPreviewUrl,
} from './documentPdfService';
