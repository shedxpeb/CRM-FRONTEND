// Signature Section Renderer
import jsPDF from 'jspdf';
import { PDFSection, PDFRenderContext, PDFRenderResult } from '../models/layout.types';

export function createSignatureSection(): PDFSection {
  return {
    type: 'signature',
    priority: 9,
    render: (context: PDFRenderContext): PDFRenderResult => {
      const { doc, y, data, config, contentWidth } = context;
      const { purchaseOrder } = data;
      
      let currentY = y;
      
      // Section Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('APPROVALS', config.margins.left, currentY);
      
      currentY += 5;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(config.margins.left, currentY, doc.internal.pageSize.getWidth() - config.margins.right, currentY);
      
      currentY += 8;
      
      // Signature boxes
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);
      
      const signatureData = [
        { role: 'Prepared By', name: purchaseOrder.createdBy, date: purchaseOrder.date },
        { role: 'Checked By', name: 'Manager', date: purchaseOrder.approvedAt || 'Pending' },
        { role: 'Approved By', name: purchaseOrder.approvedBy || 'Pending', date: purchaseOrder.approvedAt || 'Pending' },
        { role: 'Vendor Acceptance', name: 'Pending', date: 'Pending' },
      ];
      
      const boxWidth = contentWidth / 4;
      const boxHeight = 35;
      let currentX = config.margins.left;
      
      signatureData.forEach((sig) => {
        // Draw signature box
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.rect(currentX, currentY, boxWidth - 10, boxHeight);
        
        // Role
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(sig.role, currentX + 5, currentY + 8);
        
        // Name
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(sig.name, currentX + 5, currentY + 18);
        
        // Date
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text(`Date: ${sig.date}`, currentX + 5, currentY + 26);
        
        // Signature line
        doc.setDrawColor(150, 150, 150);
        doc.setLineWidth(0.3);
        doc.line(currentX + 5, currentY + 30, currentX + boxWidth - 15, currentY + 30);
        
        currentX += boxWidth;
      });
      
      currentY += boxHeight + 5;
      
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
