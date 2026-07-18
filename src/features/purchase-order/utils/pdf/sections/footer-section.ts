// Corporate Footer Section Renderer
import jsPDF from 'jspdf';
import { PDFSection, PDFRenderContext, PDFRenderResult } from '../models/layout.types';
import { generateQRCode } from '../utils/barcode-utils';

export function createFooterSection(): PDFSection {
  return {
    type: 'footer',
    priority: 10,
    render: (context: PDFRenderContext): PDFRenderResult => {
      const { doc, y, data, config } = context;
      const { organization, purchaseOrder } = data;
      
      const footerY = doc.internal.pageSize.getHeight() - config.margins.bottom;
      
      // Separator line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(config.margins.left, footerY - 15, doc.internal.pageSize.getWidth() - config.margins.right, footerY - 15);
      
      // Company information
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      
      const companyInfo = `${organization.name} | ${organization.address}, ${organization.city} - ${organization.pincode} | ${organization.website} | ${organization.email} | ${organization.phone}`;
      doc.text(companyInfo, config.margins.left, footerY - 10);
      
      const taxInfo = `GST: ${organization.gst} | PAN: ${organization.pan}`;
      doc.text(taxInfo, config.margins.left, footerY - 6);
      
      // QR Code for PO
      generateQRCode(doc, purchaseOrder.poNumber, doc.internal.pageSize.getWidth() - config.margins.right - 35, footerY - 20, 30);
      
      // Page number and generation info
      doc.text(`Page ${context.currentPage} of ${context.totalPages} | Generated Automatically`, doc.internal.pageSize.getWidth() - config.margins.right, footerY - 3, { align: 'right' });
      
      return {
        nextY: footerY,
        height: 15,
      };
    },
  };
}
