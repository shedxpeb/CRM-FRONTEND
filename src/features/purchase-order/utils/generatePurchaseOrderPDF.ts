// Purchase Order PDF Generator - Enterprise Architecture
import { generatePurchaseOrderPDF as generatePDF, downloadPurchaseOrderPDF as downloadPDF, getPurchaseOrderPDFBlob as getPDFBlob } from './pdf/purchase-order-pdf-generator';
import { PDFDataMapperOptions } from './pdf/mappers/data-mapper';
import { PurchaseOrder } from '../types/purchase-order.types';

// Re-export functions with original names for backward compatibility
export function generatePurchaseOrderPDF(po: PurchaseOrder, options: PDFDataMapperOptions) {
  return generatePDF(po, options);
}

export function downloadPurchaseOrderPDF(po: PurchaseOrder, options: PDFDataMapperOptions) {
  downloadPDF(po, options);
}

export function getPurchaseOrderPDFBlob(po: PurchaseOrder, options: PDFDataMapperOptions): Blob {
  return getPDFBlob(po, options);
}
