// Terms Section Renderer
import jsPDF from 'jspdf';
import { PDFSection, PDFRenderContext, PDFRenderResult } from '../models/layout.types';

export function createTermsSection(): PDFSection {
  return {
    type: 'terms',
    priority: 8,
    render: (context: PDFRenderContext): PDFRenderResult => {
      const { doc, y, data, config, contentWidth } = context;
      const { terms, purchaseOrder } = data;
      
      let currentY = y;
      
      // Section Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('TERMS AND CONDITIONS', config.margins.left, currentY);
      
      currentY += 5;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(config.margins.left, currentY, doc.internal.pageSize.getWidth() - config.margins.right, currentY);
      
      currentY += 5;
      
      // Terms in two-column layout
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);
      
      const termFields = [
        { label: 'Payment Terms', value: purchaseOrder.paymentTerms },
        { label: 'Delivery Terms', value: purchaseOrder.shippingTerms },
        { label: 'Warranty', value: 'As per manufacturer warranty' },
        { label: 'Inspection', value: 'Material inspection at buyer premises' },
        { label: 'Transportation', value: 'Seller responsibility' },
        { label: 'Special Instructions', value: purchaseOrder.terms || 'None' },
      ];
      
      const columnWidth = contentWidth / 2;
      let currentX = config.margins.left;
      
      termFields.forEach((term, index) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${term.label}:`, currentX, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(term.value, currentX + 35, currentY);
        
        if (index % 2 === 1) {
          currentX = config.margins.left;
          currentY += 4;
        } else {
          currentX = config.margins.left + columnWidth;
        }
      });
      
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
