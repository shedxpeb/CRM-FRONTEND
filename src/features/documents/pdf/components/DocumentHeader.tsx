/**
 * Document Header Component for PDF Generation
 * Shared header for Estimate, Proposal, and Quotation
 */

import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';

interface DocumentHeaderProps {
  companyName: string;
  companyLogo?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyGST?: string;
  documentType: 'Estimate' | 'Proposal' | 'Quotation' | 'Invoice';
  documentNumber: string;
  documentDate: Date;
  validUntil?: Date;
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #000',
    paddingBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: 'contain',
  },
  companyInfo: {
    flex: 1,
    marginLeft: 20,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companyAddress: {
    fontSize: 9,
    marginBottom: 2,
  },
  companyContact: {
    fontSize: 9,
    marginBottom: 2,
  },
  companyGST: {
    fontSize: 9,
  },
  documentInfo: {
    textAlign: 'right',
    minWidth: 150,
  },
  documentType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e40af',
  },
  documentNumber: {
    fontSize: 10,
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 10,
    marginBottom: 4,
  },
  validUntil: {
    fontSize: 10,
    color: '#dc2626',
  },
});

export function DocumentHeader({
  companyName,
  companyLogo,
  companyAddress,
  companyPhone,
  companyEmail,
  companyGST,
  documentType,
  documentNumber,
  documentDate,
  validUntil,
}: DocumentHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        {companyLogo && (
          <Image src={companyLogo} style={styles.logo} />
        )}
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{companyName}</Text>
          {companyAddress && <Text style={styles.companyAddress}>{companyAddress}</Text>}
          {companyPhone && <Text style={styles.companyContact}>Phone: {companyPhone}</Text>}
          {companyEmail && <Text style={styles.companyContact}>Email: {companyEmail}</Text>}
          {companyGST && <Text style={styles.companyGST}>GST: {companyGST}</Text>}
        </View>
        <View style={styles.documentInfo}>
          <Text style={styles.documentType}>{documentType}</Text>
          <Text style={styles.documentNumber}>#{documentNumber}</Text>
          <Text style={styles.documentDate}>
            Date: {documentDate.toLocaleDateString('en-IN')}
          </Text>
          {validUntil && (
            <Text style={styles.validUntil}>
              Valid Until: {validUntil.toLocaleDateString('en-IN')}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
