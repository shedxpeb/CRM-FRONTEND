// Invoice Instructions Section Renderer
import jsPDF from 'jspdf';
import { PDFSection, PDFRenderContext, PDFRenderResult } from '../models/layout.types';

export function createInvoiceInstructionsSection(): PDFSection {
  return {
    type: 'invoice-instructions',
    priority: 7,
    render: (context: PDFRenderContext): PDFRenderResult => {
      const { doc, y, data, config } = context;
      const { invoiceInstructions } = data;
      
      let currentY = y;
      
      // Section Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('INVOICE INSTRUCTIONS', config.margins.left, currentY);
      
      currentY += 5;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(config.margins.left, currentY, doc.internal.pageSize.getWidth() - config.margins.right, currentY);
      
      currentY += 5;
      
      // Invoice instructions
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);
      
      if (invoiceInstructions && invoiceInstructions.length > 0) {
        invoiceInstructions.forEach((instruction, index) => {
          doc.text(`${index + 1}. ${instruction}`, config.margins.left + 10, currentY);
          currentY += 4;
        });
      } else {
        // Default instructions
        const defaultInstructions = [
          'Please quote Purchase Order number on all invoices and correspondence.',
          'Send original invoice along with goods delivery note.',
          'Ensure all goods are properly packed and labeled.',
          'Any discrepancies must be reported within 7 days of delivery.',
        ];
        
        defaultInstructions.forEach((instruction, index) => {
          doc.text(`${index + 1}. ${instruction}`, config.margins.left + 10, currentY);
          currentY += 4;
        });
      }
      
      currentY += 3;
      
      // Separator line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(config.margins.left, currentY, doc.internal.pageSize.getWidth() - config.margins.right, currentY);
      
      return {
        nextY: currentY + 6,
        height: currentY - y + 6,
      };
    },
  };
}
