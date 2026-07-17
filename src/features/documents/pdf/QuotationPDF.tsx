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
  quotation: Quotation;
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

  const tableData = quotation.materialSelections.map(selection => ({
    itemCode: selection.itemCode,
    itemName: selection.itemName,
    description: selection.customDescription || selection.specification || '-',
    quantity: selection.quantity?.toString() || '-',
    unit: selection.unit || '-',
    rate: selection.rate?.toFixed(2) || '-',
    amount: selection.amount?.toFixed(2) || '-',
    chargeability: selection.config?.chargeability || '-',
  }));

  // Calculate totals from pricing configuration
  const materialCost = quotation.pricingConfiguration?.materialRates?.reduce(
    (sum, m) => sum + (m.amount || 0),
    0
  ) || 0;
  const labourCost = quotation.pricingConfiguration?.labourCost || 0;
  const installationCost = quotation.pricingConfiguration?.installationCost || 0;
  const transportationCost = quotation.pricingConfiguration?.transportationCost || 0;
  const craneCost = quotation.pricingConfiguration?.craneCost || 0;
  const civilCost = quotation.pricingConfiguration?.civilCost || 0;
  const accommodationCost = quotation.pricingConfiguration?.accommodationCost || 0;
  const erectionCost = quotation.pricingConfiguration?.erectionCost || 0;
  const freightCost = quotation.pricingConfiguration?.freightCost || 0;
  const otherCosts = quotation.pricingConfiguration?.additionalServiceCosts?.reduce(
    (sum, s) => sum + (s.cost || 0),
    0
  ) || 0;

  let subtotal = materialCost + labourCost + installationCost + transportationCost + 
                 craneCost + civilCost + accommodationCost + erectionCost + freightCost + otherCosts;

  // Apply markup
  if (quotation.pricingConfiguration?.markupPercentage && quotation.pricingConfiguration.markupPercentage > 0) {
    subtotal = subtotal * (1 + quotation.pricingConfiguration.markupPercentage / 100);
  }

  // Apply discount
  let discountAmount = 0;
  if (quotation.pricingConfiguration?.discountType === 'percentage' && quotation.pricingConfiguration.discountValue) {
    discountAmount = subtotal * (quotation.pricingConfiguration.discountValue / 100);
  } else if (quotation.pricingConfiguration?.discountType === 'fixed' && quotation.pricingConfiguration.discountValue) {
    discountAmount = quotation.pricingConfiguration.discountValue;
  }

  const afterDiscount = subtotal - discountAmount;

  // Calculate GST
  let taxAmount = 0;
  const gstType = quotation.pricingConfiguration?.gstType || 'CGST';
  const gstRate = quotation.pricingConfiguration?.gstRate || 18;
  
  if (gstType === 'CGST' || gstType === 'SGST') {
    taxAmount = afterDiscount * (gstRate / 100);
  } else if (gstType === 'IGST') {
    taxAmount = afterDiscount * (gstRate / 100);
  }

  // Add cess
  if (quotation.pricingConfiguration?.cessRate && quotation.pricingConfiguration.cessRate > 0) {
    taxAmount += afterDiscount * (quotation.pricingConfiguration.cessRate / 100);
  }

  const grandTotal = afterDiscount + taxAmount;

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
              <Text style={styles.infoValue}>{quotation.customerName}</Text>
            </View>
            {quotation.customerAddress && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address:</Text>
                <Text style={styles.infoValue}>{quotation.customerAddress}</Text>
              </View>
            )}
            {quotation.customerPhone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoValue}>{quotation.customerPhone}</Text>
              </View>
            )}
            {quotation.customerEmail && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{quotation.customerEmail}</Text>
              </View>
            )}
            {quotation.customerGST && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>GST:</Text>
                <Text style={styles.infoValue}>{quotation.customerGST}</Text>
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
                  <Text style={styles.infoValue}>{quotation.leadNumber}</Text>
                </View>
              )}
              {quotation.proposalNumber && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Proposal #:</Text>
                  <Text style={styles.infoValue}>{quotation.proposalNumber}</Text>
                </View>
              )}
              {quotation.sourceEstimateNumber && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Estimate #:</Text>
                  <Text style={styles.infoValue}>{quotation.sourceEstimateNumber}</Text>
                </View>
              )}
              {quotation.projectName && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Project:</Text>
                  <Text style={styles.infoValue}>{quotation.projectName}</Text>
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
                  {new Date(quotation.validUntil).toLocaleDateString()}
                </Text>
              </View>
              {quotation.paymentTerms && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Payment Terms:</Text>
                  <Text style={styles.infoValue}>{quotation.paymentTerms}</Text>
                </View>
              )}
              {quotation.deliveryTerms && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Delivery Terms:</Text>
                  <Text style={styles.infoValue}>{quotation.deliveryTerms}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Technical Specifications */}
        {quotation.technicalSpecifications && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Specifications</Text>
            <View style={styles.specifications}>
              {quotation.technicalSpecifications.buildingLength && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Building Length:</Text>
                  <Text style={styles.specValue}>{quotation.technicalSpecifications.buildingLength}m</Text>
                </View>
              )}
              {quotation.technicalSpecifications.buildingWidth && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Building Width:</Text>
                  <Text style={styles.specValue}>{quotation.technicalSpecifications.buildingWidth}m</Text>
                </View>
              )}
              {quotation.technicalSpecifications.buildingHeight && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Building Height:</Text>
                  <Text style={styles.specValue}>{quotation.technicalSpecifications.buildingHeight}m</Text>
                </View>
              )}
              {quotation.technicalSpecifications.baySpacing && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Bay Spacing:</Text>
                  <Text style={styles.specValue}>{quotation.technicalSpecifications.baySpacing}m</Text>
                </View>
              )}
              {quotation.technicalSpecifications.roofSlope && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Roof Slope:</Text>
                  <Text style={styles.specValue}>{quotation.technicalSpecifications.roofSlope}°</Text>
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
          gstType={gstType}
          grandTotal={grandTotal}
          discountAmount={discountAmount}
          discountPercentage={quotation.pricingConfiguration?.discountType === 'percentage' ? quotation.pricingConfiguration.discountValue : undefined}
        />

        {/* Inclusions */}
        {quotation.inclusions && quotation.inclusions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inclusions</Text>
            {quotation.inclusions.map((inclusion, index) => (
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
            {quotation.exclusions.map((exclusion, index) => (
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
              <Text style={styles.termsText}>{quotation.termsAndConditions}</Text>
            </View>
          </View>
        )}

        {/* Notes */}
        {quotation.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{quotation.notes}</Text>
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
