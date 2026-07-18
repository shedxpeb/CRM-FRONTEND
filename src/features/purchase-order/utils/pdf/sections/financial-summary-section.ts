// Financial Summary Section Renderer
import jsPDF from 'jspdf';
import { PDFSection, PDFRenderContext, PDFRenderResult } from '../models/layout.types';

export function createFinancialSummarySection(): PDFSection {
  return {
    type: 'financial-summary',
    priority: 5,
    render: (context: PDFRenderContext): PDFRenderResult => {
      const { doc, y, data, config } = context;
      const { purchaseOrder } = data;
      
      const summaryX = doc.internal.pageSize.getWidth() - config.margins.right - 80;
      let currentY = y;
      
      // Section Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('FINANCIAL SUMMARY', config.margins.left, currentY);
      
      currentY += 5;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(config.margins.left, currentY, doc.internal.pageSize.getWidth() - config.margins.right, currentY);
      
      currentY += 8;
      
      // Summary items
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      
      const summaryData = [
        { label: 'Subtotal', value: purchaseOrder.subtotal },
        { label: 'Discount', value: purchaseOrder.discount },
        { label: 'Tax', value: purchaseOrder.tax },
        { label: 'Freight', value: purchaseOrder.freight },
        { label: 'Packing', value: purchaseOrder.packing },
        { label: 'Other Charges', value: purchaseOrder.otherCharges },
        { label: 'Round Off', value: purchaseOrder.roundOff },
      ];
      
      summaryData.forEach((item) => {
        doc.text(item.label, summaryX, currentY);
        doc.text(`₹${item.value.toFixed(2)}`, doc.internal.pageSize.getWidth() - config.margins.right, currentY, { align: 'right' });
        currentY += 4;
      });
      
      // Grand Total with border
      currentY += 3;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(summaryX, currentY, doc.internal.pageSize.getWidth() - config.margins.right, currentY);
      
      currentY += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Grand Total', summaryX, currentY);
      doc.text(`₹${purchaseOrder.grandTotal.toFixed(2)}`, doc.internal.pageSize.getWidth() - config.margins.right, currentY, { align: 'right' });
      
      currentY += 8;
      doc.setLineWidth(0.5);
      doc.line(summaryX, currentY, doc.internal.pageSize.getWidth() - config.margins.right, currentY);
      
      return {
        nextY: currentY + 6,
        height: currentY - y + 6,
      };
    },
  };
}
