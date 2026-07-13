/**
 * Document Table Component for PDF Generation
 * Shared table component for Estimate, Proposal, and Quotation
 * Supports automatic page breaks and repeating headers
 */

import { View, Text, StyleSheet } from '@react-pdf/renderer';

interface DocumentTableColumn {
  key: string;
  label: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

interface DocumentTableProps {
  columns: DocumentTableColumn[];
  data: any[];
  showHeader?: boolean;
  stripeRows?: boolean;
}

const styles = StyleSheet.create({
  table: {
    width: '100%',
    marginBottom: 15,
    border: '1 solid #e5e7eb',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
    borderBottom: '1 solid #1e40af',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5e7eb',
  },
  tableRowStriped: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottom: '1 solid #e5e7eb',
  },
  tableCell: {
    padding: 8,
    fontSize: 9,
  },
  tableCellHeader: {
    padding: 10,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
  },
  tableCellRight: {
    textAlign: 'right',
  },
  tableCellCenter: {
    textAlign: 'center',
  },
  emptyCell: {
    padding: 20,
    fontSize: 10,
    textAlign: 'center',
    color: '#6b7280',
  },
});

export function DocumentTable({
  columns,
  data,
  showHeader = true,
  stripeRows = true,
}: DocumentTableProps) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.table}>
        <Text style={styles.emptyCell}>No data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.table}>
      {showHeader && (
        <View style={styles.tableHeader}>
          {columns.map((column) => {
            const cellStyle: any = { ...styles.tableCellHeader };
            // Use flex proportions instead of percentage widths
            if (column.width && typeof column.width === 'number') {
              cellStyle.flex = column.width;
            } else if (column.width && typeof column.width === 'string') {
              // Convert percentage to flex proportion
              const percentage = parseFloat(column.width) / 100;
              cellStyle.flex = percentage;
            } else {
              cellStyle.flex = 1;
            }
            if (column.align === 'right') {
              cellStyle.textAlign = 'right';
            } else if (column.align === 'center') {
              cellStyle.textAlign = 'center';
            }
            
            return (
              <View key={column.key} style={cellStyle}>
                <Text>{column.label}</Text>
              </View>
            );
          })}
        </View>
      )}
      {data.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={stripeRows && rowIndex % 2 === 1 ? styles.tableRowStriped : styles.tableRow}
        >
          {columns.map((column) => {
            const cellStyle: any = { ...styles.tableCell };
            // Use flex proportions instead of percentage widths
            if (column.width && typeof column.width === 'number') {
              cellStyle.flex = column.width;
            } else if (column.width && typeof column.width === 'string') {
              // Convert percentage to flex proportion
              const percentage = parseFloat(column.width) / 100;
              cellStyle.flex = percentage;
            } else {
              cellStyle.flex = 1;
            }
            if (column.align === 'right') {
              cellStyle.textAlign = 'right';
            } else if (column.align === 'center') {
              cellStyle.textAlign = 'center';
            }
            
            return (
              <View key={column.key} style={cellStyle}>
                <Text>{row[column.key] || '-'}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
