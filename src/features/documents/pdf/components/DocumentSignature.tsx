/**
 * Document Signature Component for PDF Generation
 * Shared signature section for Estimate, Proposal, and Quotation
 */

import { View, Text, StyleSheet, Image } from '@react-pdf/renderer';

interface DocumentSignatureProps {
  authorizedBy?: string;
  authorizedDesignation?: string;
  customerSignature?: boolean;
  terms?: string[];
  paymentTerms?: string;
}

const styles = StyleSheet.create({
  signatureSection: {
    marginTop: 30,
    marginBottom: 40,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  signatureBlock: {
    width: '45%',
  },
  signatureLine: {
    borderBottom: '1 solid #000',
    marginBottom: 5,
    marginTop: 40,
  },
  signatureLabel: {
    fontSize: 9,
    textAlign: 'center',
  },
  signatureName: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  signatureDesignation: {
    fontSize: 8,
    textAlign: 'center',
    color: '#6b7280',
  },
  termsSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  termsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  termItem: {
    fontSize: 8,
    marginBottom: 3,
    flexDirection: 'row',
  },
  termNumber: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  paymentTermsSection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f9fafb',
    border: '1 solid #e5e7eb',
  },
  paymentTermsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  paymentTermsText: {
    fontSize: 9,
  },
});

export function DocumentSignature({
  authorizedBy,
  authorizedDesignation,
  customerSignature = true,
  terms,
  paymentTerms,
}: DocumentSignatureProps) {
  return (
    <View style={styles.signatureSection}>
      {terms && terms.length > 0 && (
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          {terms.map((term, index) => (
            <View key={index} style={styles.termItem}>
              <Text style={styles.termNumber}>{index + 1}.</Text>
              <Text style={{ fontSize: 8 }}>{term}</Text>
            </View>
          ))}
        </View>
      )}

      {paymentTerms && (
        <View style={styles.paymentTermsSection}>
          <Text style={styles.paymentTermsTitle}>Payment Terms</Text>
          <Text style={styles.paymentTermsText}>{paymentTerms}</Text>
        </View>
      )}

      <View style={styles.signatureRow}>
        <View style={styles.signatureBlock}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Authorized Signatory</Text>
          {authorizedBy && <Text style={styles.signatureName}>{authorizedBy}</Text>}
          {authorizedDesignation && (
            <Text style={styles.signatureDesignation}>{authorizedDesignation}</Text>
          )}
        </View>

        {customerSignature && (
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Customer Signature</Text>
            <Text style={styles.signatureName}>&nbsp;</Text>
            <Text style={styles.signatureDesignation}>&nbsp;</Text>
          </View>
        )}
      </View>
    </View>
  );
}
