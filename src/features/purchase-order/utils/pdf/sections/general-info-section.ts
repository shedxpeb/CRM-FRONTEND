// General Information Section Renderer
import jsPDF from 'jspdf';
import { PDFSection, PDFRenderContext, PDFRenderResult } from '../models/layout.types';

export function createGeneralInfoSection(): PDFSection {
  return {
    type: 'general-info',
    priority: 3,
    render: (context: PDFRenderContext): PDFRenderResult => {
      const { doc, y, data, config, contentWidth } = context;
      const { purchaseOrder } = data;
      
      let currentY = y;
      
      // Section Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('GENERAL INFORMATION', config.margins.left, currentY);
      
      currentY += 5;
      
      // Separator line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(config.margins.left, currentY, doc.internal.pageSize.getWidth() - config.margins.right, currentY);
      
      currentY += 5;
      
      // Two-column grid for information
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);
      
      const infoFields = [
        { label: 'PO Date', value: purchaseOrder.date },
        { label: 'Delivery Date', value: purchaseOrder.expectedDeliveryDate || 'TBD' },
        { label: 'Payment Terms', value: purchaseOrder.paymentTerms },
        { label: 'Shipping Terms', value: purchaseOrder.shippingTerms },
        { label: 'Currency', value: purchaseOrder.currency },
        { label: 'Reference', value: purchaseOrder.reference },
        { label: 'Purchase Type', value: purchaseOrder.purchaseType },
        { label: 'Department', value: purchaseOrder.department },
        { label: 'Created By', value: purchaseOrder.createdBy },
        { label: 'Approved By', value: purchaseOrder.approvedBy || 'Pending' },
      ];
      
      const columnWidth = contentWidth / 2;
      let currentX = config.margins.left;
      
      infoFields.forEach((field, index) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${field.label}:`, currentX, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(field.value, currentX + 35, currentY);
        
        if (index % 2 === 1) {
          currentX = config.margins.left;
          currentY += 4;
        } else {
          currentX = config.margins.left + columnWidth;
        }
      });
      
      // Notes field if present
      if (purchaseOrder.notes) {
        currentY += 5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('Notes:', config.margins.left, currentY);
        
        currentY += 3;
        doc.setFont('helvetica', 'normal');
        const noteLines = doc.splitTextToSize(purchaseOrder.notes, contentWidth - 10);
        doc.text(noteLines, config.margins.left + 10, currentY);
        currentY += noteLines.length * 3;
      }
      
      // Separator line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(config.margins.left, currentY + 3, doc.internal.pageSize.getWidth() - config.margins.right, currentY + 3);
      
      return {
        nextY: currentY + 6,
        height: currentY - y + 6,
      };
    },
  };
}
