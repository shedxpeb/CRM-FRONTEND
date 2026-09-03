/**
 * Quotation PDF Document
 * Generates professional PDF for Quotations using @react-pdf/renderer
 */

import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { DocumentHeader } from './components/DocumentHeader';
import { DocumentFooter } from './components/DocumentFooter';
import { DocumentTable } from './components/DocumentTable';
import { DocumentTotals } from './components/DocumentTotals';
import { DocumentSignature } from './components/DocumentSignature';
import { Quotation } from '../types/peb-commercial';

interface QuotationPDFProps {
  quotation: any;
  companyName: string;
  companyLogo?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyGST?: string;
  authorizedBy?: string;
  authorizedDesignation?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e40af',
    borderBottom: '1 solid #e5e7eb',
    paddingBottom: 5,
  },
  customerInfo: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f9fafb',
    border: '1 solid #e5e7eb',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    fontWeight: 'bold',
    width: 100,
  },
  infoValue: {
    flex: 1,
  },
  projectInfo: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f9fafb',
    border: '1 solid #e5e7eb',
  },
  specifications: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f9fafb',
    border: '1 solid #e5e7eb',
  },
  specRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  specLabel: {
    fontWeight: 'bold',
    width: 150,
  },
  specValue: {
    flex: 1,
  },
  validityInfo: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#fef3c7',
    border: '1 solid #f59e0b',
  },
  notes: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#fef3c7',
    border: '1 solid #f59e0b',
  },
  notesTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notesText: {
    fontSize: 9,
  },
  terms: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f0fdf4',
    border: '1 solid #86efac',
  },
  termsTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  termsText: {
    fontSize: 9,
    lineHeight: 1.4,
  },
});

export function QuotationPDF({
  quotation,
  companyName,
  companyLogo,
  companyAddress,
  companyPhone,
  companyEmail,
  companyGST,
  authorizedBy,
  authorizedDesignation,
}: QuotationPDFProps) {
  // Helper to convert object arrays to strings for backward compatibility
  const normalizeStringArray = (arr: any[]): string[] => {
    return (arr || []).map((item: any) => {
      if (typeof item === 'string') return item;
      if (typeof item === 'number') return String(item);
      if (item === null || item === undefined) return '';
      // Handle object with description/name
      const desc = item.description || item.name || item.itemName || 'Accessory';
      const qty = item.quantity ? ` (${item.quantity})` : '';
      return String(desc + qty);
    });
  };

  // Prepare table data
  const tableColumns = [
    { key: 'itemCode', label: 'Item Code', width: 0.12 },
    { key: 'itemName', label: 'Item Name', width: 0.28 },
    { key: 'description', label: 'Description', width: 0.18 },
    { key: 'quantity', label: 'Qty', width: 0.07, align: 'center' as const },
    { key: 'unit', label: 'Unit', width: 0.07, align: 'center' as const },
    { key: 'rate', label: 'Rate (₹)', width: 0.10, align: 'right' as const },
    { key: 'amount', label: 'Amount (₹)', width: 0.08, align: 'right' as const },
    { key: 'chargeability', label: 'Charge', width: 0.10, align: 'center' as const },
  ];

  const tableData = (quotation.lineItems || []).map((item: any) => ({
    itemCode: String(item.itemCode || ''),
    itemName: String(item.itemName || ''),
    description: String(item.description || '-'),
    quantity: String(item.quantity?.toString() || '-'),
    unit: String(item.unit || '-'),
    rate: String(item.rate?.toFixed(2) || '-'),
    amount: String(item.amount?.toFixed(2) || '-'),
    chargeability: String('-'),
  }));

  // Use stored pricing totals from the quotation
  const materialCost = quotation.subtotal || 0;
  const labourCost = 0;
  const installationCost = 0;
  const transportationCost = 0;
  const craneCost = 0;
  const civilCost = 0;
  const accommodationCost = 0;
  const erectionCost = 0;
  const freightCost = 0;
  const otherCosts = 0;

  // Use stored pricing from the quotation (backend calculates)
  const subtotal = quotation.subtotal || materialCost;
  const discountAmount = quotation.discountAmount || 0;
  const afterDiscount = subtotal - discountAmount;
  const gstRate = quotation.gstRate || 18;
  const taxAmount = quotation.taxAmount || (afterDiscount * gstRate / 100);
  const grandTotal = quotation.grandTotal || afterDiscount + taxAmount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <DocumentHeader
          companyName={companyName}
          companyLogo={companyLogo}
          companyAddress={companyAddress}
          companyPhone={companyPhone}
          companyEmail={companyEmail}
          companyGST={companyGST}
          documentType="Quotation"
          documentNumber={quotation.quotationNumber}
          documentDate={quotation.createdAt || new Date()}
        />

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.customerInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Customer:</Text>
              <Text style={styles.infoValue}>{String(quotation.customerName || '')}</Text>
            </View>
            {quotation.customerAddress && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address:</Text>
                <Text style={styles.infoValue}>{String(quotation.customerAddress)}</Text>
              </View>
            )}
            {quotation.customerPhone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoValue}>{String(quotation.customerPhone)}</Text>
              </View>
            )}
            {quotation.customerEmail && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{String(quotation.customerEmail)}</Text>
              </View>
            )}
            {quotation.customerGST && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>GST:</Text>
                <Text style={styles.infoValue}>{String(quotation.customerGST)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Project Information */}
        {(quotation.projectName || quotation.leadNumber) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project Information</Text>
            <View style={styles.projectInfo}>
              {quotation.leadNumber && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Lead #:</Text>
                  <Text style={styles.infoValue}>{String(quotation.leadNumber)}</Text>
                </View>
              )}
              {quotation.proposalNumber && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Proposal #:</Text>
                  <Text style={styles.infoValue}>{String(quotation.proposalNumber)}</Text>
                </View>
              )}
              {quotation.sourceEstimateNumber && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Estimate #:</Text>
                  <Text style={styles.infoValue}>{String(quotation.sourceEstimateNumber)}</Text>
                </View>
              )}
              {quotation.projectName && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Project:</Text>
                  <Text style={styles.infoValue}>{String(quotation.projectName)}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Validity Information */}
        {quotation.validUntil && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Validity Information</Text>
            <View style={styles.validityInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Valid Until:</Text>
                <Text style={styles.infoValue}>
                  {String(new Date(quotation.validUntil).toLocaleDateString())}
                </Text>
              </View>
              {(quotation as any).paymentTermsOverride && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Payment Terms:</Text>
                  <Text style={styles.infoValue}>{String((quotation as any).paymentTermsOverride)}</Text>
                </View>
              )}
              {(quotation as any).deliveryOverride && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Delivery Terms:</Text>
                  <Text style={styles.infoValue}>{String((quotation as any).deliveryOverride)}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Building Specification */}
        {quotation.buildingSpec && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Building Specification</Text>
            <View style={styles.specifications}>
              {quotation.buildingSpec.width && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Width:</Text>
                  <Text style={styles.specValue}>{String(quotation.buildingSpec.width)}</Text>
                </View>
              )}
              {quotation.buildingSpec.length && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Length:</Text>
                  <Text style={styles.specValue}>{String(quotation.buildingSpec.length)}</Text>
                </View>
              )}
              {quotation.buildingSpec.clearHeight && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Clear Height:</Text>
                  <Text style={styles.specValue}>{String(quotation.buildingSpec.clearHeight)}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Material Selection Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Material Selection</Text>
          <DocumentTable columns={tableColumns} data={tableData} />
        </View>

        {/* Totals */}
        <DocumentTotals
          subtotal={subtotal}
          taxAmount={taxAmount}
          gstType={quotation.gstType || 'CGST'}
          grandTotal={grandTotal}
          discountAmount={discountAmount}
          discountPercentage={quotation.discountPercentage}
        />

        {/* Inclusions */}
        {quotation.inclusions && quotation.inclusions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inclusions</Text>
            {normalizeStringArray(quotation.inclusions).map((inclusion: string, index: number) => (
              <Text key={index} style={{ fontSize: 9, marginBottom: 2 }}>
                • {inclusion}
              </Text>
            ))}
          </View>
        )}

        {/* Exclusions */}
        {quotation.exclusions && quotation.exclusions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Exclusions</Text>
            {normalizeStringArray(quotation.exclusions).map((exclusion: string, index: number) => (
              <Text key={index} style={{ fontSize: 9, marginBottom: 2 }}>
                • {exclusion}
              </Text>
            ))}
          </View>
        )}

        {/* Terms & Conditions */}
        {quotation.termsAndConditions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terms & Conditions</Text>
            <View style={styles.terms}>
              <Text style={styles.termsText}>{String(quotation.termsAndConditions)}</Text>
            </View>
          </View>
        )}

        {/* Notes */}
        {quotation.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{String(quotation.notes)}</Text>
          </View>
        )}

        {/* Signature */}
        <DocumentSignature
          authorizedBy={authorizedBy}
          authorizedDesignation={authorizedDesignation}
          terms={[
            'This quotation is valid until the specified date.',
            'Prices are subject to change without prior notice.',
            'This quotation does not constitute a binding contract.',
          ]}
          paymentTerms={quotation.paymentTerms || 'As per agreement'}
        />

        <DocumentFooter
          pageNumber={1}
          totalPages={1}
          companyName={companyName}
        />
      </Page>
    </Document>
  );
}
