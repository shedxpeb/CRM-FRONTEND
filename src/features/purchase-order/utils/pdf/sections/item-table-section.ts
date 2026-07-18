// Item Table Section Renderer (SAP-style)
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDFSection, PDFRenderContext, PDFRenderResult } from '../models/layout.types';

export function createItemTableSection(): PDFSection {
  return {
    type: 'item-table',
    priority: 4,
    render: (context: PDFRenderContext): PDFRenderResult => {
      const { doc, y, data, config } = context;
      const { items } = data;
      
      // Section Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('ITEM DETAILS', config.margins.left, y);
      
      const headerY = y + 5;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(config.margins.left, headerY, doc.internal.pageSize.getWidth() - config.margins.right, headerY);
      
      // Prepare table data
      const tableData = items.map((item, index) => [
        index + 1,
        item.itemCode,
        item.itemName,
        item.hsnCode || '-',
        item.quantity,
        item.unit,
        `₹${item.rate.toFixed(2)}`,
        item.discountType === 'Percentage' ? `${item.discount}%` : `₹${item.discount.toFixed(2)}`,
        item.gstRate ? `${item.gstRate}%` : '0%',
        `₹${item.gstAmount.toFixed(2)}`,
        `₹${item.total.toFixed(2)}`,
      ]);
      
      autoTable(doc, {
        startY: headerY + 3,
        head: [['Sr', 'Code', 'Description', 'HSN', 'Qty', 'Unit', 'Rate', 'Disc', 'GST%', 'Tax', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'center',
          cellPadding: 2,
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 2,
          valign: 'middle',
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 18 },
          2: { cellWidth: 45 },
          3: { cellWidth: 12 },
          4: { cellWidth: 10, halign: 'center' },
          5: { cellWidth: 12, halign: 'center' },
          6: { cellWidth: 18, halign: 'right' },
          7: { cellWidth: 15, halign: 'right' },
          8: { cellWidth: 10, halign: 'center' },
          9: { cellWidth: 18, halign: 'right' },
          10: { cellWidth: 18, halign: 'right' },
        },
        styles: {
          overflow: 'linebreak',
          cellWidth: 'auto',
        },
        didDrawPage: (data) => {
          // Add page number on table pages
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
          doc.text(`Page ${currentPage}`, doc.internal.pageSize.getWidth() - config.margins.right, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
        },
      });
      
      const finalY = (doc as any).lastAutoTable.finalY;
      
      return {
        nextY: finalY + 5,
        height: finalY - y + 5,
      };
    },
  };
}
