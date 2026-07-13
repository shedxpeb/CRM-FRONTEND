/**
 * Document Totals Component for PDF Generation
 * Shared totals section for Estimate, Proposal, and Quotation
 */

import { View, Text, StyleSheet } from '@react-pdf/renderer';

interface DocumentTotalsProps {
  subtotal: number;
  discountAmount?: number;
  discountPercentage?: number;
  taxAmount: number;
  gstType: 'CGST' | 'SGST' | 'IGST' | 'CESS';
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  cessAmount?: number;
  grandTotal: number;
  amountInWords?: string;
  currency?: string;
}

const styles = StyleSheet.create({
  totalsContainer: {
    marginTop: 20,
    alignSelf: 'flex-end',
    width: '50%',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottom: '1 solid #e5e7eb',
  },
  totalsRowBold: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    marginTop: 4,
  },
  label: {
    fontSize: 10,
  },
  labelBold: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 10,
  },
  valueBold: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  amountInWords: {
    marginTop: 10,
    fontSize: 9,
    fontStyle: 'italic',
    color: '#6b7280',
  },
});

export function DocumentTotals({
  subtotal,
  discountAmount,
  discountPercentage,
  taxAmount,
  gstType,
  cgstAmount,
  sgstAmount,
  igstAmount,
  cessAmount,
  grandTotal,
  amountInWords,
  currency = '₹',
}: DocumentTotalsProps) {
  const formatCurrency = (amount: number) => `${currency}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <View style={styles.totalsContainer}>
      <View style={styles.totalsRow}>
        <Text style={styles.label}>Subtotal</Text>
        <Text style={styles.value}>{formatCurrency(subtotal)}</Text>
      </View>

      {discountAmount && discountAmount > 0 && (
        <View style={styles.totalsRow}>
          <Text style={styles.label}>
            Discount {discountPercentage ? `(${discountPercentage}%)` : ''}
          </Text>
          <Text style={styles.value}>-{formatCurrency(discountAmount)}</Text>
        </View>
      )}

      {gstType === 'CGST' && cgstAmount && (
        <>
          <View style={styles.totalsRow}>
            <Text style={styles.label}>CGST</Text>
            <Text style={styles.value}>{formatCurrency(cgstAmount)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.label}>SGST</Text>
            <Text style={styles.value}>{formatCurrency(sgstAmount || 0)}</Text>
          </View>
        </>
      )}

      {gstType === 'IGST' && igstAmount && (
        <View style={styles.totalsRow}>
          <Text style={styles.label}>IGST</Text>
          <Text style={styles.value}>{formatCurrency(igstAmount)}</Text>
        </View>
      )}

      {gstType === 'CESS' && cessAmount && (
        <View style={styles.totalsRow}>
          <Text style={styles.label}>CESS</Text>
          <Text style={styles.value}>{formatCurrency(cessAmount)}</Text>
        </View>
      )}

      <View style={styles.totalsRowBold}>
        <Text style={styles.labelBold}>Grand Total</Text>
        <Text style={styles.valueBold}>{formatCurrency(grandTotal)}</Text>
      </View>

      {amountInWords && (
        <Text style={styles.amountInWords}>
          Amount in words: {amountInWords}
        </Text>
      )}
    </View>
  );
}
