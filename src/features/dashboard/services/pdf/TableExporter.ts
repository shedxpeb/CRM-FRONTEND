import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TableData, CompanyDetails } from '@/features/dashboard/types/pdf';
import { ProgressTracker } from './ProgressTracker';

export class TableExporter {
  private doc: jsPDF;
  private progress: ProgressTracker;
  private currentY: number;
  private companyDetails: CompanyDetails;
  private readonly TOP_MARGIN = 20;
  private readonly BOTTOM_MARGIN = 20;
  private readonly TABLE_MARGIN = 15;

  constructor(doc: jsPDF, progress: ProgressTracker, companyDetails: CompanyDetails) {
    this.doc = doc;
    this.progress = progress;
    this.currentY = this.TOP_MARGIN;
    this.companyDetails = companyDetails;
  }

  async export(tables: TableData[]): Promise<void> {
    // Skip if no tables
    if (tables.length === 0) {
      return;
    }

    for (let i = 0; i < tables.length; i++) {
      this.progress.update('generating', `Building Table ${i + 1} of ${tables.length}...`, 70 + (i / tables.length) * 20);
      
      const table = tables[i];
      
      // Validate table data
      if (!table.headers || table.headers.length === 0) {
        continue;
      }
      
      if (!table.rows || table.rows.length === 0) {
        this.addEmptyTablePlaceholder(table.title);
        continue;
      }
      
      this.addTableToPDF(table);
    }
  }

  private addTableToPDF(table: TableData): void {
    const primaryColor = this.companyDetails.brandingColors.primary;
    const secondaryColor = this.companyDetails.brandingColors.secondary;
    const accentColor = this.companyDetails.brandingColors.accent;
    
    // Check if table should use landscape orientation
    const isLandscape = table.useLandscape || table.headers.length > 6;
    
    if (isLandscape) {
      // Add new landscape page for wide tables
      this.doc.addPage([297, 210]); // A4 Landscape: width=297mm, height=210mm
      this.currentY = this.TOP_MARGIN;
    }

    // Add section title with branding
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(table.title, this.TABLE_MARGIN, this.currentY);
    
    // Add divider line
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.TABLE_MARGIN, this.currentY + 3, this.doc.internal.pageSize.width - this.TABLE_MARGIN, this.currentY + 3);
    
    this.currentY += 12;
    
    // Process table data for status badges and currency formatting
    let processedBody = this.processTableData(table.rows);
    
    // Add totals row if enabled
    if (table.showTotals) {
      processedBody = this.addTotalsRow(table, processedBody);
    }
    
    // Add summary row if enabled
    if (table.showSummary) {
      processedBody = this.addSummaryRow(table, processedBody);
    }
    
    // Determine column styles based on data type
    const columnStyles = this.determineColumnStyles(table, primaryColor, accentColor);
    
    // Add table with enterprise styling
    autoTable(this.doc, {
      head: [table.headers],
      body: processedBody,
      startY: this.currentY,
      margin: { top: 0, left: this.TABLE_MARGIN, right: this.TABLE_MARGIN, bottom: this.BOTTOM_MARGIN },
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 4,
        lineWidth: 0.1,
        lineColor: [200, 200, 200],
        fontStyle: 'normal',
        overflow: 'linebreak', // Auto-wrap long text
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'left',
        lineWidth: 0.2,
        lineColor: [150, 150, 150],
      },
      alternateRowStyles: {
        fillColor: [245, 250, 248], // Subtle alternating color
      },
      columnStyles: columnStyles,
      didParseCell: (data: any) => {
        // Style totals and summary rows
        if (data.section === 'body') {
          const rowIndex = data.row.index;
          const isTotalsRow = table.showTotals && rowIndex === processedBody.length - (table.showSummary ? 2 : 1);
          const isSummaryRow = table.showSummary && rowIndex === processedBody.length - 1;
          
          if (isTotalsRow || isSummaryRow) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = isTotalsRow ? [240, 240, 240] : [230, 230, 250];
            data.cell.styles.textColor = [0, 0, 0];
          }
        }
      },
      didDrawPage: (data: any) => {
        // Add table footer on each page
        this.addTableFooter(data, table.title);
      },
      // Ensure proper page breaks
      rowPageBreak: 'auto',
      // Horizontal page break if needed
      horizontalPageBreak: true,
    });
    
    // Update currentY position
    const finalY = (this.doc as any).lastAutoTable?.finalY || this.currentY;
    this.currentY = finalY + 15;
    
    // Reset to portrait if we were in landscape
    if (isLandscape) {
      this.doc.addPage();
      this.currentY = this.TOP_MARGIN;
    }
  }

  private addTotalsRow(table: TableData, body: (string | number)[][]): (string | number)[][] {
    // Calculate totals for numeric columns
    const totalsRow: (string | number)[] = ['Total'];
    
    for (let col = 1; col < table.headers.length; col++) {
      let total = 0;
      let isNumeric = true;
      
      for (const row of body) {
        const value = row[col];
        if (typeof value === 'number') {
          total += value;
        } else if (typeof value === 'string') {
          // Try to parse currency values
          const numValue = parseFloat(value.replace(/[$,]/g, ''));
          if (!isNaN(numValue)) {
            total += numValue;
          } else {
            isNumeric = false;
            break;
          }
        } else {
          isNumeric = false;
          break;
        }
      }
      
      if (isNumeric && total > 0) {
        totalsRow.push(`$${total.toLocaleString()}`);
      } else {
        totalsRow.push('');
      }
    }
    
    return [...body, totalsRow];
  }

  private addSummaryRow(table: TableData, body: (string | number)[][]): (string | number)[][] {
    // Add summary row with count
    const summaryRow: (string | number)[] = ['Summary'];
    const rowCount = body.length - (table.showTotals ? 1 : 0);
    
    for (let col = 1; col < table.headers.length; col++) {
      summaryRow.push(`(${rowCount} records)`);
    }
    
    return [...body, summaryRow];
  }

  private processTableData(rows: (string | number)[][]): (string | number)[][] {
    return rows.map(row => {
      return row.map(cell => {
        const cellStr = String(cell);
        
        // Format currency values
        if (cellStr.startsWith('$') || cellStr.match(/^\$[\d,]+\.?\d*$/)) {
          return cellStr; // Already formatted
        }
        
        // Detect currency-like values and format them
        if (typeof cell === 'number' && cell > 1000) {
          return `$${cell.toLocaleString()}`;
        }
        
        // Add status badge styling (will be handled by columnStyles)
        return cellStr;
      });
    });
  }

  private determineColumnStyles(table: TableData, primaryColor: number[], accentColor: number[]): any {
    const styles: any = {};
    
    // If custom column styles are provided, use them
    if (table.columnStyles) {
      Object.assign(styles, table.columnStyles);
    }
    
    // Auto-detect status columns and apply badge styling
    table.headers.forEach((header, index) => {
      const headerLower = header.toLowerCase();
      
      // Status column - center align with color coding
      if (headerLower.includes('status')) {
        styles[index] = {
          halign: 'center',
          fontStyle: 'bold',
          cellWidth: 'auto',
          ...this.getStatusCellStyle(table.rows[0]?.[index] || ''),
        };
      }
      
      // Amount/Price columns - right align
      if (headerLower.includes('amount') || headerLower.includes('price') || headerLower.includes('value') || headerLower.includes('revenue')) {
        styles[index] = {
          halign: 'right',
          fontStyle: 'bold',
          textColor: primaryColor,
        };
      }
      
      // Date columns - center align
      if (headerLower.includes('date') || headerLower.includes('created') || headerLower.includes('updated')) {
        styles[index] = {
          halign: 'center',
        };
      }
      
      // ID columns - center align with monospace-like appearance
      if (headerLower.includes('#') || headerLower.includes('id') || headerLower.includes('number')) {
        styles[index] = {
          halign: 'center',
          fontStyle: 'bold',
        };
      }
    });
    
    return styles;
  }

  private getStatusCellStyle(status: string | number): any {
    const statusStr = String(status).toLowerCase();
    
    // Status badge colors
    if (statusStr.includes('won') || statusStr.includes('approved') || statusStr.includes('completed') || statusStr.includes('active')) {
      return {
        textColor: [34, 139, 34], // Green
        fillColor: [235, 250, 235],
      };
    }
    
    if (statusStr.includes('pending') || statusStr.includes('in progress') || statusStr.includes('processing')) {
      return {
        textColor: [255, 165, 0], // Orange
        fillColor: [255, 250, 235],
      };
    }
    
    if (statusStr.includes('lost') || statusStr.includes('rejected') || statusStr.includes('cancelled') || statusStr.includes('inactive')) {
      return {
        textColor: [220, 53, 69], // Red
        fillColor: [250, 235, 235],
      };
    }
    
    if (statusStr.includes('draft') || statusStr.includes('new')) {
      return {
        textColor: [108, 117, 125], // Gray
        fillColor: [245, 245, 245],
      };
    }
    
    // Default status style
    return {
      textColor: [0, 0, 0],
      fillColor: [250, 250, 250],
    };
  }

  private addTableFooter(data: any, tableTitle: string): void {
    const pageWidth = this.doc.internal.pageSize.width;
    const pageHeight = this.doc.internal.pageSize.height;
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Add subtle footer line
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.TABLE_MARGIN, pageHeight - 20, pageWidth - this.TABLE_MARGIN, pageHeight - 20);
    
    // Add table title and page info
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    
    this.doc.text(tableTitle, this.TABLE_MARGIN, pageHeight - 15);
    this.doc.text(`Page ${data.pageNumber}`, pageWidth - this.TABLE_MARGIN, pageHeight - 15, { align: 'right' });
  }

  private addEmptyTablePlaceholder(title: string): void {
    const pageHeight = 297;
    const availableHeight = pageHeight - this.TOP_MARGIN - this.BOTTOM_MARGIN;
    
    // Check if we need a new page
    if (this.currentY + 50 > availableHeight) {
      this.doc.addPage();
      this.currentY = this.TOP_MARGIN;
    }
    
    // Add section title
    this.doc.setTextColor(...this.companyDetails.brandingColors.primary);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.TABLE_MARGIN, this.currentY);
    this.currentY += 12;
    
    // Add placeholder box
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(this.TABLE_MARGIN, this.currentY, 180, 40, 3, 3, 'S');
    
    // Add placeholder text
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(150, 150, 150);
    this.doc.text('No data available for this table', this.TABLE_MARGIN + 10, this.currentY + 20);
    
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Data may not exist for the selected period', this.TABLE_MARGIN + 10, this.currentY + 30);
    
    this.currentY += 50;
  }
}
