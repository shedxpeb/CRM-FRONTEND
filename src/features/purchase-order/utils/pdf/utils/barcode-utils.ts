// Barcode and QR Code Utilities
import jsPDF from 'jspdf';

export function generateBarcode(doc: jsPDF, text: string, x: number, y: number): void {
  // Simple barcode representation using text
  doc.setFont('courier', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(0, 0, 0);
  
  // Create a simple barcode-like pattern
  const barcodeWidth = 40;
  const barcodeHeight = 8;
  const startX = x - barcodeWidth;
  
  // Draw barcode lines
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  
  let currentX = startX;
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const pattern = charCode % 3;
    
    if (pattern === 0) {
      doc.line(currentX, y, currentX, y + barcodeHeight);
      currentX += 1;
    } else if (pattern === 1) {
      doc.line(currentX, y, currentX + 2, y + barcodeHeight);
      currentX += 3;
    } else {
      doc.line(currentX, y, currentX + 1, y + barcodeHeight);
      currentX += 2;
    }
  }
  
  // Add text below barcode
  doc.setFont('courier', 'normal');
  doc.setFontSize(6);
  doc.text(text, x - barcodeWidth / 2, y + barcodeHeight + 3, { align: 'center' });
}

export function generateQRCode(doc: jsPDF, data: string, x: number, y: number, size: number = 30): void {
  // Simple QR code placeholder
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(x, y, size, size);
  
  // Add some QR-like patterns
  const cellSize = size / 7;
  doc.setFillColor(0, 0, 0);
  
  // Corner squares
  doc.rect(x, y, cellSize * 3, cellSize * 3, 'F');
  doc.rect(x + cellSize * 4, y, cellSize * 3, cellSize * 3, 'F');
  doc.rect(x, y + cellSize * 4, cellSize * 3, cellSize * 3, 'F');
  
  // Random pattern
  for (let i = 0; i < 10; i++) {
    const px = x + Math.floor(Math.random() * 5) * cellSize;
    const py = y + Math.floor(Math.random() * 5) * cellSize;
    doc.rect(px, py, cellSize, cellSize, 'F');
  }
  
  // Label
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text('Scan to View', x + size / 2, y + size + 4, { align: 'center' });
}
