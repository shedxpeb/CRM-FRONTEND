// Address Blocks Section Renderer
import jsPDF from 'jspdf';
import { PDFSection, PDFRenderContext, PDFRenderResult } from '../models/layout.types';

export function createAddressBlocksSection(): PDFSection {
  return {
    type: 'address-blocks',
    priority: 2,
    render: (context: PDFRenderContext): PDFRenderResult => {
      const { doc, y, data, config, contentWidth } = context;
      const { organization, vendor, project } = data;
      
      let currentY = y;
      const columnWidth = contentWidth / 3;
      const leftX = config.margins.left;
      const centerX = config.margins.left + columnWidth;
      const rightX = config.margins.left + 2 * columnWidth;
      
      // Section Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('PARTIES', config.margins.left, currentY);
      
      currentY += 5;
      
      // Separator line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(config.margins.left, currentY, doc.internal.pageSize.getWidth() - config.margins.right, currentY);
      
      currentY += 5;
      
      // Left Column - Buyer Entity
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text('BUYER', leftX, currentY);
      
      currentY += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);
      
      const buyerFields = [
        { label: 'Company', value: organization.name },
        { label: 'GST', value: organization.gst },
        { label: 'Address', value: `${organization.address}, ${organization.city} - ${organization.pincode}` },
        { label: 'Contact', value: organization.phone },
        { label: 'Email', value: organization.email },
      ];
      
      buyerFields.forEach((field) => {
        if (field.value) {
          doc.text(`${field.label}: ${field.value}`, leftX, currentY);
          currentY += 3;
        }
      });
      
      // Reset Y for center column
      const leftEndY = currentY;
      currentY = y + 10;
      
      // Center Column - Ship To
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text('SHIP TO', centerX, currentY);
      
      currentY += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);
      
      const shipToFields = [
        { label: 'Company', value: project?.name || organization.name },
        { label: 'Project', value: project?.code || 'Main Project' },
        { label: 'Address', value: project?.address || organization.address },
        { label: 'Contact', value: project?.deliveryContact || organization.phone },
        { label: 'Email', value: project?.email || organization.email },
      ];
      
      shipToFields.forEach((field) => {
        if (field.value) {
          doc.text(`${field.label}: ${field.value}`, centerX, currentY);
          currentY += 3;
        }
      });
      
      // Reset Y for right column
      const centerEndY = currentY;
      currentY = y + 10;
      
      // Right Column - Supplier
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text('SUPPLIER', rightX, currentY);
      
      currentY += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);
      
      const supplierFields = [
        { label: 'Vendor', value: vendor.name },
        { label: 'Vendor Code', value: vendor.code },
        { label: 'GST', value: vendor.gst },
        { label: 'Address', value: `${vendor.address}, ${vendor.city} - ${vendor.pincode}` },
        { label: 'Contact', value: vendor.contactPerson },
        { label: 'Phone', value: vendor.phone },
        { label: 'Email', value: vendor.email },
      ];
      
      supplierFields.forEach((field) => {
        if (field.value) {
          doc.text(`${field.label}: ${field.value}`, rightX, currentY);
          currentY += 3;
        }
      });
      
      const rightEndY = currentY;
      
      // Calculate the maximum height among the three columns
      const maxHeight = Math.max(leftEndY, centerEndY, rightEndY);
      
      // Separator line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(config.margins.left, maxHeight + 3, doc.internal.pageSize.getWidth() - config.margins.right, maxHeight + 3);
      
      return {
        nextY: maxHeight + 6,
        height: maxHeight - y + 6,
      };
    },
  };
}
