/**
 * Estimate PDF Document
 * Generates professional PDF for Estimates using @react-pdf/renderer
 */

import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { DocumentHeader } from './components/DocumentHeader';
import { DocumentFooter } from './components/DocumentFooter';
import { DocumentTable } from './components/DocumentTable';
import { DocumentTotals } from './components/DocumentTotals';
import { DocumentSignature } from './components/DocumentSignature';
import { Estimate } from '../types/peb-commercial';

interface EstimatePDFProps {
  estimate: Estimate;
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
});

export function EstimatePDF({
  estimate,
  companyName,
  companyLogo,
  companyAddress,
  companyPhone,
  companyEmail,
  companyGST,
  authorizedBy,
  authorizedDesignation,
}: EstimatePDFProps) {
  // Prepare table data
  const tableColumns = [
    { key: 'itemCode', label: 'Item Code', width: 0.15 },
    { key: 'itemName', label: 'Item Name', width: 0.30 },
    { key: 'description', label: 'Description', width: 0.20 },
    { key: 'quantity', label: 'Qty', width: 0.08, align: 'center' as const },
    { key: 'unit', label: 'Unit', width: 0.08, align: 'center' as const },
    { key: 'rate', label: 'Rate (₹)', width: 0.10, align: 'right' as const },
    { key: 'amount', label: 'Amount (₹)', width: 0.09, align: 'right' as const },
  ];

  const tableData = estimate.materialSelections.map(selection => ({
    itemCode: selection.itemCode,
    itemName: selection.itemName,
    description: selection.customDescription || selection.specification || '-',
    quantity: selection.quantity?.toString() || '-',
    unit: selection.unit || '-',
    rate: selection.rate?.toFixed(2) || '-',
    amount: selection.amount?.toFixed(2) || '-',
  }));

  // Calculate totals
  const subtotal = estimate.materialSelections.reduce((sum, item) => sum + (item.amount || 0), 0);
  const taxAmount = 0; // Calculate based on GST rates
  const grandTotal = estimate.totalAmount || subtotal + taxAmount;

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
          documentType="Estimate"
          documentNumber={estimate.estimateNumber}
          documentDate={estimate.createdAt || new Date()}
        />

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.customerInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Customer:</Text>
              <Text style={styles.infoValue}>{estimate.customerName}</Text>
            </View>
            {estimate.customerAddress && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address:</Text>
                <Text style={styles.infoValue}>{estimate.customerAddress}</Text>
              </View>
            )}
            {estimate.customerPhone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoValue}>{estimate.customerPhone}</Text>
              </View>
            )}
            {estimate.customerEmail && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{estimate.customerEmail}</Text>
              </View>
            )}
            {estimate.customerGST && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>GST:</Text>
                <Text style={styles.infoValue}>{estimate.customerGST}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Project Information */}
        {(estimate.projectName || estimate.leadNumber) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project Information</Text>
            <View style={styles.projectInfo}>
              {estimate.leadNumber && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Lead #:</Text>
                  <Text style={styles.infoValue}>{estimate.leadNumber}</Text>
                </View>
              )}
              {estimate.projectName && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Project:</Text>
                  <Text style={styles.infoValue}>{estimate.projectName}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Technical Specifications */}
        {estimate.technicalSpecifications && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Specifications</Text>
            <View style={styles.specifications}>
              {estimate.technicalSpecifications.buildingLength && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Building Length:</Text>
                  <Text style={styles.specValue}>{estimate.technicalSpecifications.buildingLength}m</Text>
                </View>
              )}
              {estimate.technicalSpecifications.buildingWidth && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Building Width:</Text>
                  <Text style={styles.specValue}>{estimate.technicalSpecifications.buildingWidth}m</Text>
                </View>
              )}
              {estimate.technicalSpecifications.buildingHeight && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Building Height:</Text>
                  <Text style={styles.specValue}>{estimate.technicalSpecifications.buildingHeight}m</Text>
                </View>
              )}
              {estimate.technicalSpecifications.baySpacing && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Bay Spacing:</Text>
                  <Text style={styles.specValue}>{estimate.technicalSpecifications.baySpacing}m</Text>
                </View>
              )}
              {estimate.technicalSpecifications.roofSlope && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Roof Slope:</Text>
                  <Text style={styles.specValue}>{estimate.technicalSpecifications.roofSlope}°</Text>
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
        {estimate.includePricing && (
          <DocumentTotals
            subtotal={subtotal}
            taxAmount={taxAmount}
            gstType="CGST"
            grandTotal={grandTotal}
          />
        )}

        {/* Inclusions */}
        {estimate.inclusions && estimate.inclusions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inclusions</Text>
            {estimate.inclusions.map((inclusion, index) => (
              <Text key={index} style={{ fontSize: 9, marginBottom: 2 }}>
                • {inclusion}
              </Text>
            ))}
          </View>
        )}

        {/* Exclusions */}
        {estimate.exclusions && estimate.exclusions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Exclusions</Text>
            {estimate.exclusions.map((exclusion, index) => (
              <Text key={index} style={{ fontSize: 9, marginBottom: 2 }}>
                • {exclusion}
              </Text>
            ))}
          </View>
        )}

        {/* Notes */}
        {estimate.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{estimate.notes}</Text>
          </View>
        )}

        {/* Signature */}
        <DocumentSignature
          authorizedBy={authorizedBy}
          authorizedDesignation={authorizedDesignation}
          terms={[
            'This estimate is valid for 30 days from the date of issue.',
            'Prices are subject to change without prior notice.',
            'This estimate does not constitute a contract.',
          ]}
          paymentTerms="50% advance, 50% on completion"
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
