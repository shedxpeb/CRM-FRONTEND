/**
 * Invoice PDF Document
 * Tax invoice layout — distinct from Quotation (payment demand vs commercial offer)
 */

import { Page, Text, View, Document as PdfDocument, StyleSheet } from '@react-pdf/renderer';
import { DocumentHeader } from './components/DocumentHeader';
import { DocumentFooter } from './components/DocumentFooter';
import { DocumentTable } from './components/DocumentTable';
import { DocumentTotals } from './components/DocumentTotals';
import { DocumentSignature } from './components/DocumentSignature';
import type { Document as InvoiceDocument } from '../types';
import type { DocumentLineItem } from '../types';

interface InvoicePDFProps {
  invoice: InvoiceDocument;
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
    color: '#b45309',
    borderBottom: '1 solid #e5e7eb',
    paddingBottom: 5,
  },
  customerInfo: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#fffbeb',
    border: '1 solid #fcd34d',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    fontWeight: 'bold',
    width: 110,
  },
  infoValue: {
    flex: 1,
  },
  invoiceMeta: {
    padding: 12,
    backgroundColor: '#fef3c7',
    border: '1 solid #f59e0b',
    marginBottom: 15,
  },
  notes: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f9fafb',
    border: '1 solid #e5e7eb',
  },
  terms: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f0fdf4',
    border: '1 solid #86efac',
  },
});

export function InvoicePDF({
  invoice,
  companyName,
  companyLogo,
  companyAddress,
  companyPhone,
  companyEmail,
  companyGST,
  authorizedBy,
  authorizedDesignation,
}: InvoicePDFProps) {
  const tableColumns = [
    { key: 'description', label: 'Description', width: 0.40 },
    { key: 'quantity', label: 'Qty', width: 0.10, align: 'center' as const },
    { key: 'unit', label: 'Unit', width: 0.10, align: 'center' as const },
    { key: 'rate', label: 'Rate (₹)', width: 0.15, align: 'right' as const },
    { key: 'amount', label: 'Amount (₹)', width: 0.15, align: 'right' as const },
    { key: 'taxRate', label: 'Tax %', width: 0.10, align: 'right' as const },
  ];

  const tableData = invoice.lineItems.map((item: DocumentLineItem) => ({
    description: item.description,
    quantity: item.quantity.toString(),
    unit: item.unit,
    rate: item.rate.toFixed(2),
    amount: item.amount.toFixed(2),
    taxRate: item.taxRate ? `${item.taxRate}%` : '-',
  }));

  return (
    <PdfDocument>
      <Page size="A4" style={styles.page}>
        <DocumentHeader
          companyName={companyName}
          companyLogo={companyLogo}
          companyAddress={companyAddress}
          companyPhone={companyPhone}
          companyEmail={companyEmail}
          companyGST={companyGST}
          documentType="Invoice"
          documentNumber={invoice.documentNumber}
          documentDate={invoice.createdAt || new Date()}
          validUntil={invoice.validUntil}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <View style={styles.customerInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Customer:</Text>
              <Text style={styles.infoValue}>{invoice.customerName}</Text>
            </View>
            {invoice.customerAddress && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address:</Text>
                <Text style={styles.infoValue}>{invoice.customerAddress}</Text>
              </View>
            )}
            {invoice.customerGST && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>GSTIN:</Text>
                <Text style={styles.infoValue}>{invoice.customerGST}</Text>
              </View>
            )}
          </View>
        </View>

        {(invoice.projectName || invoice.convertedFrom) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reference</Text>
            <View style={styles.invoiceMeta}>
              {invoice.projectName && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Project:</Text>
                  <Text style={styles.infoValue}>{invoice.projectName}</Text>
                </View>
              )}
              {invoice.convertedFrom && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Source:</Text>
                  <Text style={styles.infoValue}>{invoice.convertedFrom} #{invoice.convertedDocumentId}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice Line Items</Text>
          <DocumentTable columns={tableColumns} data={tableData} />
        </View>

        <DocumentTotals
          subtotal={invoice.subtotal}
          discountAmount={invoice.discountAmount}
          discountPercentage={invoice.discountPercentage}
          taxAmount={invoice.taxAmount}
          gstType={invoice.gstType}
          cgstAmount={invoice.cgstAmount}
          sgstAmount={invoice.sgstAmount}
          igstAmount={invoice.igstAmount}
          grandTotal={invoice.totalAmount}
        />

        <View style={styles.invoiceMeta}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Terms:</Text>
            <Text style={styles.infoValue}>{invoice.paymentTerms}</Text>
          </View>
          {invoice.deliveryTerms && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Delivery Terms:</Text>
              <Text style={styles.infoValue}>{invoice.deliveryTerms}</Text>
            </View>
          )}
        </View>

        {invoice.termsAndConditions && (
          <View style={styles.terms}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Terms & Conditions</Text>
            <Text style={{ fontSize: 9 }}>{invoice.termsAndConditions}</Text>
          </View>
        )}

        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Notes</Text>
            <Text style={{ fontSize: 9 }}>{invoice.notes}</Text>
          </View>
        )}

        <DocumentSignature
          authorizedBy={authorizedBy}
          authorizedDesignation={authorizedDesignation}
          terms={[
            'This is a tax invoice for goods/services rendered.',
            'Payment is due as per the payment terms stated above.',
            'Please quote invoice number on all remittances.',
          ]}
          paymentTerms={invoice.paymentTerms}
        />

        <DocumentFooter pageNumber={1} totalPages={1} companyName={companyName} />
      </Page>
    </PdfDocument>
  );
}
