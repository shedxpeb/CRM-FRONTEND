// Amount in Words Section Renderer
import jsPDF from 'jspdf';
import { PDFSection, PDFRenderContext, PDFRenderResult } from '../models/layout.types';

// Helper function to convert number to words (Indian system)
function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function convertLessThanThousand(n: number): string {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
  }
  
  function convert(n: number): string {
    if (n === 0) return '';
    
    const crore = Math.floor(n / 10000000);
    const lakh = Math.floor((n % 10000000) / 100000);
    const thousand = Math.floor((n % 100000) / 1000);
    const hundred = Math.floor((n % 1000) / 100);
    const remainder = n % 100;
    
    let result = '';
    if (crore > 0) result += convertLessThanThousand(crore) + ' Crore ';
    if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh ';
    if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand ';
    if (hundred > 0) result += convertLessThanThousand(hundred) + ' Hundred ';
    if (remainder > 0) result += convertLessThanThousand(remainder);
    
    return result.trim();
  }
  
  return convert(Math.floor(num)) + ' Rupees Only';
}

export function createAmountInWordsSection(): PDFSection {
  return {
    type: 'amount-in-words',
    priority: 6,
    render: (context: PDFRenderContext): PDFRenderResult => {
      const { doc, y, data, config } = context;
      const { purchaseOrder } = data;
      
      let currentY = y;
      
      // Section Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('AMOUNT IN WORDS', config.margins.left, currentY);
      
      currentY += 5;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(config.margins.left, currentY, doc.internal.pageSize.getWidth() - config.margins.right, currentY);
      
      currentY += 5;
      
      // Amount in words
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      
      const amountWords = numberToWords(purchaseOrder.grandTotal);
      const wordsLines = doc.splitTextToSize(amountWords, doc.internal.pageSize.getWidth() - config.margins.left - config.margins.right - 10);
      doc.text(wordsLines, config.margins.left + 10, currentY);
      
      currentY += wordsLines.length * 4 + 3;
      
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
