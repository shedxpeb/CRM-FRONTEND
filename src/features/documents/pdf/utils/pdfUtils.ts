/**
 * PDF Generation Utilities
 * Helper functions for PDF document generation
 */

/**
 * Convert number to words (Indian numbering system)
 * @param amount - The amount to convert
 * @returns Amount in words
 */
export function numberToWords(amount: number): string {
  // Simplified implementation - can be enhanced with full number-to-words library
  if (amount === 0) return 'Zero Rupees Only';
  
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  // This is a simplified version - for production, use a proper library like number-to-words
  return `${amount.toLocaleString('en-IN')} Rupees Only`;
}

/**
 * Format date for PDF
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDateForPDF(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Calculate GST amount
 * @param amount - Base amount
 * @param gstRate - GST percentage
 * @param gstType - GST type (CGST, SGST, IGST, CESS)
 * @returns GST amount
 */
export function calculateGST(amount: number, gstRate: number, gstType: 'CGST' | 'SGST' | 'IGST' | 'CESS'): number {
  if (gstType === 'IGST' || gstType === 'CESS') {
    return (amount * gstRate) / 100;
  }
  // CGST and SGST are half of the total GST
  return (amount * gstRate) / 200;
}

/**
 * Calculate discount amount
 * @param amount - Base amount
 * @param discountType - Discount type (percentage or fixed)
 * @param discountValue - Discount value
 * @returns Discount amount
 */
export function calculateDiscount(
  amount: number,
  discountType: 'percentage' | 'fixed' | 'none',
  discountValue?: number
): number {
  if (discountType === 'none' || !discountValue) return 0;
  
  if (discountType === 'percentage') {
    return (amount * discountValue) / 100;
  }
  
  return discountValue;
}

/**
 * Format currency for PDF
 * @param amount - Amount to format
 * @param currency - Currency symbol (default: ₹)
 * @returns Formatted currency string
 */
export function formatCurrencyForPDF(amount: number, currency: string = '₹'): string {
  return `${currency}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
