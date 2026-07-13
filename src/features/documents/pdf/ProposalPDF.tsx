/**
 * Proposal PDF Document
 * Generates professional PDF for Proposals using @react-pdf/renderer
 */

import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { DocumentHeader } from './components/DocumentHeader';
import { DocumentFooter } from './components/DocumentFooter';
import { DocumentTable } from './components/DocumentTable';
import { DocumentSignature } from './components/DocumentSignature';
import { Proposal } from '../types/peb-commercial';

interface ProposalPDFProps {
  proposal: Proposal;
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
  scopeConfig: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f0fdf4',
    border: '1 solid #86efac',
  },
  scopeItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  scopeName: {
    fontWeight: 'bold',
    width: 120,
  },
  scopeStatus: {
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
  timeline: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#eff6ff',
    border: '1 solid #bfdbfe',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineNumber: {
    fontWeight: 'bold',
    width: 30,
  },
  timelineText: {
    flex: 1,
  },
  content: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#faf5ff',
    border: '1 solid #e9d5ff',
  },
  contentTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contentText: {
    fontSize: 9,
    lineHeight: 1.4,
  },
});

export function ProposalPDF({
  proposal,
  companyName,
  companyLogo,
  companyAddress,
  companyPhone,
  companyEmail,
  companyGST,
  authorizedBy,
  authorizedDesignation,
}: ProposalPDFProps) {
  // Prepare table data
  const tableColumns = [
    { key: 'itemCode', label: 'Item Code', width: 0.15 },
    { key: 'itemName', label: 'Item Name', width: 0.30 },
    { key: 'description', label: 'Description', width: 0.20 },
    { key: 'quantity', label: 'Qty', width: 0.08, align: 'center' as const },
    { key: 'unit', label: 'Unit', width: 0.08, align: 'center' as const },
    { key: 'state', label: 'State', width: 0.09, align: 'center' as const },
    { key: 'requirement', label: 'Req', width: 0.10, align: 'center' as const },
  ];

  const tableData = proposal.materialSelections.map(selection => ({
    itemCode: selection.itemCode,
    itemName: selection.itemName,
    description: selection.customDescription || selection.specification || '-',
    quantity: selection.quantity?.toString() || '-',
    unit: selection.unit || '-',
    state: selection.config?.state || '-',
    requirement: selection.config?.requirement || '-',
  }));

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
          documentType="Proposal"
          documentNumber={proposal.proposalNumber}
          documentDate={proposal.createdAt || new Date()}
        />

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.customerInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Customer:</Text>
              <Text style={styles.infoValue}>{proposal.customerName}</Text>
            </View>
            {proposal.customerAddress && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address:</Text>
                <Text style={styles.infoValue}>{proposal.customerAddress}</Text>
              </View>
            )}
            {proposal.customerPhone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoValue}>{proposal.customerPhone}</Text>
              </View>
            )}
            {proposal.customerEmail && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{proposal.customerEmail}</Text>
              </View>
            )}
            {proposal.customerGST && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>GST:</Text>
                <Text style={styles.infoValue}>{proposal.customerGST}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Project Information */}
        {(proposal.projectName || proposal.leadNumber) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project Information</Text>
            <View style={styles.projectInfo}>
              {proposal.leadNumber && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Lead #:</Text>
                  <Text style={styles.infoValue}>{proposal.leadNumber}</Text>
                </View>
              )}
              {proposal.estimateNumber && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Estimate #:</Text>
                  <Text style={styles.infoValue}>{proposal.estimateNumber}</Text>
                </View>
              )}
              {proposal.projectName && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Project:</Text>
                  <Text style={styles.infoValue}>{proposal.projectName}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Technical Specifications */}
        {proposal.technicalSpecifications && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Specifications</Text>
            <View style={styles.specifications}>
              {proposal.technicalSpecifications.buildingLength && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Building Length:</Text>
                  <Text style={styles.specValue}>{proposal.technicalSpecifications.buildingLength}m</Text>
                </View>
              )}
              {proposal.technicalSpecifications.buildingWidth && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Building Width:</Text>
                  <Text style={styles.specValue}>{proposal.technicalSpecifications.buildingWidth}m</Text>
                </View>
              )}
              {proposal.technicalSpecifications.buildingHeight && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Building Height:</Text>
                  <Text style={styles.specValue}>{proposal.technicalSpecifications.buildingHeight}m</Text>
                </View>
              )}
              {proposal.technicalSpecifications.baySpacing && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Bay Spacing:</Text>
                  <Text style={styles.specValue}>{proposal.technicalSpecifications.baySpacing}m</Text>
                </View>
              )}
              {proposal.technicalSpecifications.roofSlope && (
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Roof Slope:</Text>
                  <Text style={styles.specValue}>{proposal.technicalSpecifications.roofSlope}°</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Scope Configuration */}
        {proposal.scopeConfiguration && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scope Configuration</Text>
            <View style={styles.scopeConfig}>
              <View style={styles.scopeItem}>
                <Text style={styles.scopeName}>Labour:</Text>
                <Text style={styles.scopeStatus}>{proposal.scopeConfiguration.labour?.state || '-'}</Text>
              </View>
              <View style={styles.scopeItem}>
                <Text style={styles.scopeName}>Installation:</Text>
                <Text style={styles.scopeStatus}>{proposal.scopeConfiguration.installation?.state || '-'}</Text>
              </View>
              <View style={styles.scopeItem}>
                <Text style={styles.scopeName}>Transportation:</Text>
                <Text style={styles.scopeStatus}>{proposal.scopeConfiguration.transportation?.state || '-'}</Text>
              </View>
              <View style={styles.scopeItem}>
                <Text style={styles.scopeName}>Crane:</Text>
                <Text style={styles.scopeStatus}>{proposal.scopeConfiguration.crane?.state || '-'}</Text>
              </View>
              <View style={styles.scopeItem}>
                <Text style={styles.scopeName}>Civil Work:</Text>
                <Text style={styles.scopeStatus}>{proposal.scopeConfiguration.civilWork?.state || '-'}</Text>
              </View>
              <View style={styles.scopeItem}>
                <Text style={styles.scopeName}>Accommodation:</Text>
                <Text style={styles.scopeStatus}>{proposal.scopeConfiguration.accommodation?.state || '-'}</Text>
              </View>
              <View style={styles.scopeItem}>
                <Text style={styles.scopeName}>Erection:</Text>
                <Text style={styles.scopeStatus}>{proposal.scopeConfiguration.erection?.state || '-'}</Text>
              </View>
              <View style={styles.scopeItem}>
                <Text style={styles.scopeName}>Freight:</Text>
                <Text style={styles.scopeStatus}>{proposal.scopeConfiguration.freight?.state || '-'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Material Selection Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Material Selection</Text>
          <DocumentTable columns={tableColumns} data={tableData} />
        </View>

        {/* Timeline */}
        {proposal.timeline && proposal.timeline.milestones && proposal.timeline.milestones.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project Timeline</Text>
            <View style={styles.timeline}>
              <Text style={{ fontSize: 9, marginBottom: 8 }}>
                Estimated Duration: {proposal.timeline.estimatedDuration} {proposal.timeline.unit}
              </Text>
              {proposal.timeline.milestones.map((milestone, index) => (
                <View key={index} style={styles.timelineItem}>
                  <Text style={styles.timelineNumber}>{index + 1}.</Text>
                  <Text style={styles.timelineText}>
                    {milestone.milestone}: {milestone.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Company Profile */}
        {proposal.companyProfile && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Company Profile</Text>
            <View style={styles.content}>
              <Text style={styles.contentText}>{proposal.companyProfile}</Text>
            </View>
          </View>
        )}

        {/* Project Overview */}
        {proposal.projectOverview && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project Overview</Text>
            <View style={styles.content}>
              <Text style={styles.contentText}>{proposal.projectOverview}</Text>
            </View>
          </View>
        )}

        {/* Scope of Work */}
        {proposal.scopeOfWork && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scope of Work</Text>
            <View style={styles.content}>
              <Text style={styles.contentText}>{proposal.scopeOfWork}</Text>
            </View>
          </View>
        )}

        {/* Inclusions */}
        {proposal.inclusions && proposal.inclusions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inclusions</Text>
            {proposal.inclusions.map((inclusion, index) => (
              <Text key={index} style={{ fontSize: 9, marginBottom: 2 }}>
                • {inclusion}
              </Text>
            ))}
          </View>
        )}

        {/* Exclusions */}
        {proposal.exclusions && proposal.exclusions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Exclusions</Text>
            {proposal.exclusions.map((exclusion, index) => (
              <Text key={index} style={{ fontSize: 9, marginBottom: 2 }}>
                • {exclusion}
              </Text>
            ))}
          </View>
        )}

        {/* Notes */}
        {proposal.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{proposal.notes}</Text>
          </View>
        )}

        {/* Signature */}
        <DocumentSignature
          authorizedBy={authorizedBy}
          authorizedDesignation={authorizedDesignation}
          terms={[
            'This proposal is valid for 30 days from the date of issue.',
            'This proposal does not constitute a binding contract.',
            'Final pricing will be provided in the formal quotation.',
          ]}
          paymentTerms="As per quotation"
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
