// Header Section Renderer
import jsPDF from 'jspdf';
import { PDFSection, PDFRenderContext, PDFRenderResult } from '../models/layout.types';
import { generateBarcode } from '../utils/barcode-utils';

export function createHeaderSection(): PDFSection {
  return {
    type: 'header',
    priority: 1,
    render: (context: PDFRenderContext): PDFRenderResult => {
      const { doc, y, data, config } = context;
      const { organization, purchaseOrder } = data;
      
      let currentY = y;
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header row with logo, title, and PO details
      const headerHeight = 25;
      
      // Left: Logo placeholder (will be replaced with actual logo)
      doc.setFillColor(0, 0, 0);
      doc.rect(pageWidth - config.margins.right - 30, currentY, 25, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('LOGO', pageWidth - config.margins.right - 17, currentY + 12, { align: 'center' });
      
      // Center: Company Name and Document Title
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(organization.name, pageWidth / 2, currentY + 5, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('PURCHASE ORDER', pageWidth / 2, currentY + 15, { align: 'center' });
      
      // Right: PO Number with Barcode
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(`PO: ${purchaseOrder.poNumber}`, pageWidth - config.margins.right - 30, currentY + 5, { align: 'right' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Rev: ${purchaseOrder.revision}`, pageWidth - config.margins.right - 30, currentY + 10, { align: 'right' });
      doc.text(`Date: ${purchaseOrder.date}`, pageWidth - config.margins.right - 30, currentY + 15, { align: 'right' });
      
      // Generate barcode for PO number
      generateBarcode(doc, purchaseOrder.poNumber, pageWidth - config.margins.right - 30, currentY + 18);
      
      // Separator line
      currentY += headerHeight;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(config.margins.left, currentY, pageWidth - config.margins.right, currentY);
      
      return {
        nextY: currentY + 3,
        height: headerHeight + 3,
      };
    },
  };
}
