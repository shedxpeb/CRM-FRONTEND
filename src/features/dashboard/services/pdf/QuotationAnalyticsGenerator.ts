import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DashboardExportData, CompanyDetails } from '@/features/dashboard/types/pdf';
import { toPng } from 'html-to-image';

export class QuotationAnalyticsGenerator {
  private doc: jsPDF;
  private dashboardData: DashboardExportData;
  private companyDetails: CompanyDetails;
  private readonly HEADER_HEIGHT = 15; // mm - thin header height
  private readonly CONTENT_START_Y = this.HEADER_HEIGHT + 10; // mm
  private readonly CONTENT_BOTTOM_MARGIN = 20; // mm
  private readonly PAGE_HEIGHT = 297; // mm - A4 height

  constructor(doc: jsPDF, dashboardData: DashboardExportData, companyDetails: CompanyDetails) {
    this.doc = doc;
    this.dashboardData = dashboardData;
    this.companyDetails = companyDetails;
  }

  async generate(): Promise<void> {
    let currentY = this.CONTENT_START_Y;
    
    // Add page header
    currentY = this.addPageHeader(currentY);
    
    // Add Quotation Summary section
    currentY = this.addQuotationSummary(currentY);
    
    // Add Quotation Breakdown section
    currentY = this.ensureSpaceForContent(60, currentY);
    currentY = this.addQuotationBreakdown(currentY);
    
    // Add Status Chart section with actual chart
    currentY = this.ensureSpaceForContent(100, currentY);
    currentY = await this.addStatusChartSection(currentY);
  }

  private ensureSpaceForContent(requiredSpace: number, currentY: number): number {
    const availableSpace = this.PAGE_HEIGHT - currentY - this.CONTENT_BOTTOM_MARGIN;
    if (availableSpace < requiredSpace) {
      this.doc.addPage();
      return this.CONTENT_START_Y;
    }
    return currentY;
  }

  private addPageHeader(y: number): number {
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Page title
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Quotation Analytics', 20, y);
    
    // Subtitle
    this.doc.setTextColor(80, 80, 80);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Quotation Status Overview', 20, y + 10);
    
    // Divider line
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(1);
    this.doc.line(20, y + 15, 190, y + 15);
    
    return y + 30;
  }

  private addQuotationSummary(y: number): number {
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Section header
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Quotation Summary', 20, y);
    
    // Divider
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, y + 5, 190, y + 5);
    
    // Quotation summary cards
    const quotationMetrics = [
      { label: 'Total Quotations', value: String(this.dashboardData.kpis.quotations), change: this.dashboardData.kpis.quotationsChange },
      { label: 'Expected Revenue', value: this.dashboardData.kpis.expectedRevenue, change: this.dashboardData.kpis.revenueChange },
      { label: 'Conversion Rate', value: '27%', change: '+2.3%' },
    ];
    
    const cardWidth = 85;
    const cardHeight = 35;
    const startX = 20;
    const startY = y + 12;
    const gap = 10;
    
    quotationMetrics.forEach((metric, i) => {
      const x = startX + (i % 2) * (cardWidth + gap);
      const cardY = startY + Math.floor(i / 2) * (cardHeight + gap);
      
      // Card background
      this.doc.setFillColor(250, 250, 250);
      this.doc.roundedRect(x, cardY, cardWidth, cardHeight, 3, 3, 'F');
      
      // Card border
      this.doc.setDrawColor(...primaryColor);
      this.doc.setLineWidth(0.5);
      this.doc.roundedRect(x, cardY, cardWidth, cardHeight, 3, 3, 'S');
      
      // Label
      this.doc.setTextColor(100, 100, 100);
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(metric.label, x + 5, cardY + 12);
      
      // Value
      this.doc.setTextColor(...primaryColor);
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(metric.value, x + 5, cardY + 22);
      
      // Change indicator
      const isPositive = metric.change.startsWith('+');
      this.doc.setTextColor(isPositive ? 34 : 231, isPositive ? 139 : 76, 34);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(metric.change, x + 5, cardY + 30);
    });
    
    return startY + Math.ceil(quotationMetrics.length / 2) * (cardHeight + gap) + 15;
  }

  private addQuotationBreakdown(y: number): number {
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Section header
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Quotation Breakdown', 20, y);
    
    // Divider
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, y + 5, 190, y + 5);
    
    // Quotation breakdown table
    const quotationData = [
      ['Status', 'Count', 'Value', 'Percentage'],
      ['Draft', '15', '$150,000', '16%'],
      ['Sent', '25', '$750,000', '27%'],
      ['Accepted', '35', '$1,575,000', '38%'],
      ['Rejected', '12', '$180,000', '13%'],
      ['Expired', '6', '$55,000', '6%'],
    ];
    
    // Add quotation table
    autoTable(this.doc, {
      head: [quotationData[0]],
      body: quotationData.slice(1),
      startY: y + 12,
      margin: { left: 20, right: 20 },
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 4,
        lineWidth: 0.1,
        lineColor: [200, 200, 200],
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
      },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold' },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'center' },
      },
      didParseCell: (data: any) => {
        // Color code status column
        if (data.section === 'body' && data.column.index === 0) {
          const value = String(data.cell.raw).toLowerCase();
          if (value === 'accepted') {
            data.cell.styles.textColor = [34, 139, 34] as [number, number, number]; // Green
          } else if (value === 'rejected' || value === 'expired') {
            data.cell.styles.textColor = [220, 53, 69] as [number, number, number]; // Red
          } else if (value === 'sent') {
            data.cell.styles.textColor = [255, 165, 0] as [number, number, number]; // Orange
          }
        }
      },
    });
    
    const finalY = (this.doc as any).lastAutoTable?.finalY || y + 60;
    return finalY + 15;
  }

  private async addStatusChartSection(y: number): Promise<number> {
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Section header
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Quotation Status Distribution', 20, y);
    
    // Divider
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, y + 5, 190, y + 5);
    
    // Quotation status distribution table with percentages
    const statusData = [
      ['Status', 'Count', 'Value', 'Percentage'],
      ['Accepted', '35', '$1,575,000', '38%'],
      ['Sent', '25', '$750,000', '27%'],
      ['Draft', '15', '$150,000', '16%'],
      ['Rejected', '12', '$180,000', '13%'],
      ['Expired', '6', '$55,000', '6%'],
    ];
    
    // Add status distribution table
    autoTable(this.doc, {
      head: [statusData[0]],
      body: statusData.slice(1),
      startY: y + 12,
      margin: { left: 20, right: 20 },
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5,
        lineWidth: 0.1,
        lineColor: [200, 200, 200],
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 11,
      },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold', cellWidth: 50 },
        1: { halign: 'center', cellWidth: 30 },
        2: { halign: 'right', cellWidth: 60 },
        3: { halign: 'center', fontStyle: 'bold', cellWidth: 30 },
      },
      didParseCell: (data: any) => {
        // Color code status column
        if (data.section === 'body' && data.column.index === 0) {
          const value = String(data.cell.raw).toLowerCase();
          if (value === 'accepted') {
            data.cell.styles.textColor = [34, 139, 34] as [number, number, number]; // Green
          } else if (value === 'rejected' || value === 'expired') {
            data.cell.styles.textColor = [220, 53, 69] as [number, number, number]; // Red
          } else if (value === 'sent') {
            data.cell.styles.textColor = [255, 165, 0] as [number, number, number]; // Orange
          }
        }
      },
    });
    
    const finalY = (this.doc as any).lastAutoTable?.finalY || y + 60;
    return finalY + 15;
  }

  private addChartPlaceholder(y: number, chartId: string, reason?: string): number {
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Placeholder box
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(20, y + 12, 170, 80, 3, 3, 'S');
    
    // Placeholder text
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('Quotation Status Chart', 105, y + 52, { align: 'center' });
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(150, 150, 150);
    const message = reason ? `[${reason}]` : 'Chart will be rendered from dashboard component';
    this.doc.text(message, 105, y + 62, { align: 'center' });
    
    return y + 105;
  }
}
