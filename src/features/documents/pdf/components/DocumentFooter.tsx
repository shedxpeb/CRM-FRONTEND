/**
 * Document Footer Component for PDF Generation
 * Shared footer for Estimate, Proposal, and Quotation
 */

import { View, Text, StyleSheet } from '@react-pdf/renderer';

interface DocumentFooterProps {
  pageNumber: number;
  totalPages: number;
  companyName: string;
  terms?: string[];
}

const styles = StyleSheet.create({
  footer: {
    marginTop: 20,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderTop: '1 solid #d1d5db',
  },
  footerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  footerLeft: {
    fontSize: 8,
  },
  footerRight: {
    fontSize: 8,
  },
  terms: {
    fontSize: 7,
    color: '#6b7280',
    marginBottom: 2,
  },
  pageNumber: {
    fontSize: 8,
    textAlign: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTop: '1 solid #e5e7eb',
  },
});

export function DocumentFooter({
  pageNumber,
  totalPages,
  companyName,
  terms,
}: DocumentFooterProps) {
  return (
    <View style={styles.footer}>
      <View style={styles.footerTop}>
        <Text style={styles.footerLeft}>{companyName}</Text>
        <Text style={styles.footerRight}>
          Generated on {new Date().toLocaleDateString('en-IN')}
        </Text>
      </View>
      {terms && terms.length > 0 && (
        <View>
          {terms.slice(0, 2).map((term, index) => (
            <Text key={index} style={styles.terms}>
              {index + 1}. {term}
            </Text>
          ))}
        </View>
      )}
      <Text style={styles.pageNumber}>
        Page {pageNumber} of {totalPages}
      </Text>
    </View>
  );
}
