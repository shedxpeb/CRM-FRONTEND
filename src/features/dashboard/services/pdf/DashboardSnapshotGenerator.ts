import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DashboardExportData, CompanyDetails } from '@/features/dashboard/types/pdf';

export class DashboardSnapshotGenerator {
  private doc: jsPDF;
  private dashboardData: DashboardExportData;
  private companyDetails: CompanyDetails;

  constructor(doc: jsPDF, dashboardData: DashboardExportData, companyDetails: CompanyDetails) {
    this.doc = doc;
    this.dashboardData = dashboardData;
    this.companyDetails = companyDetails;
  }

  async generate(): Promise<void> {
    let currentY = 20;
    
    // Add page header
    currentY = this.addPageHeader(currentY);
    
    // Add KPI Grid
    currentY = this.addKPIGrid(currentY);
    
    // Check if we need a new page for pipeline summary
    if (currentY > 180) {
      this.doc.addPage();
      currentY = 20;
    }
    
    // Add Pipeline Summary
    currentY = this.addPipelineSummary(currentY);
    
    // Check if we need a new page for revenue summary
    if (currentY > 180) {
      this.doc.addPage();
      currentY = 20;
    }
    
    // Add Revenue Summary
    currentY = this.addRevenueSummary(currentY);
  }

  private addPageHeader(y: number): number {
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Page title
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Dashboard Snapshot', 20, y);
    
    // Subtitle
    this.doc.setTextColor(80, 80, 80);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Key Metrics Overview', 20, y + 10);
    
    // Divider line
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, y + 15, 190, y + 15);
    
    return y + 25;
  }

  private addKPIGrid(y: number): number {
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Section header
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('KPI Grid', 20, y);
    
    // Divider
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(0.3);
    this.doc.line(20, y + 5, 190, y + 5);
    
    const kpis = [
      { label: 'Revenue', value: this.dashboardData.kpis.revenue, change: this.dashboardData.kpis.revenueChange, icon: '$' },
      { label: 'Expected Revenue', value: this.dashboardData.kpis.expectedRevenue, change: this.dashboardData.kpis.revenueChange, icon: '$' },
      { label: 'Won Value', value: this.dashboardData.kpis.wonValue, change: this.dashboardData.kpis.revenueChange, icon: '$' },
      { label: 'Active Projects', value: String(this.dashboardData.kpis.activeProjects), change: this.dashboardData.kpis.projectsChange, icon: '#' },
      { label: 'Leads', value: String(this.dashboardData.kpis.leads), change: this.dashboardData.kpis.leadsChange, icon: '#' },
      { label: 'Quotations', value: String(this.dashboardData.kpis.quotations), change: this.dashboardData.kpis.quotationsChange, icon: '#' },
      { label: 'Customers', value: String(this.dashboardData.kpis.customers), change: this.dashboardData.kpis.customersChange, icon: '#' },
      { label: 'Inventory', value: this.dashboardData.kpis.inventory, change: this.dashboardData.kpis.inventoryChange, icon: '$' },
    ];
    
    const cardWidth = 85;
    const cardHeight = 28;
    const startX = 20;
    const startY = y + 10;
    const gap = 8;
    
    kpis.forEach((kpi, i) => {
      const x = startX + (i % 2) * (cardWidth + gap);
      const cardY = startY + Math.floor(i / 2) * (cardHeight + gap);
      
      // Card background
      this.doc.setFillColor(250, 250, 250);
      this.doc.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, 'F');
      
      // Card border
      this.doc.setDrawColor(...primaryColor);
      this.doc.setLineWidth(0.3);
      this.doc.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, 'S');
      
      // Icon background
      this.doc.setFillColor(...primaryColor);
      this.doc.roundedRect(x + 4, cardY + 4, 18, 18, 2, 2, 'F');
      
      // Icon
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(kpi.icon, x + 13, cardY + 16, { align: 'center' });
      
      // Label
      this.doc.setTextColor(100, 100, 100);
      this.doc.setFontSize(7);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(kpi.label, x + 26, cardY + 10);
      
      // Value
      this.doc.setTextColor(...primaryColor);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(kpi.value, x + 26, cardY + 18);
      
      // Change indicator
      const isPositive = kpi.change.startsWith('+');
      this.doc.setTextColor(isPositive ? 34 : 231, isPositive ? 139 : 76, 34);
      this.doc.setFontSize(6);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(kpi.change, x + 26, cardY + 24);
    });
    
    return startY + Math.ceil(kpis.length / 2) * (cardHeight + gap) + 15;
  }

  private addPipelineSummary(y: number): number {
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Section header
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Pipeline Summary', 20, y);
    
    // Divider
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(0.3);
    this.doc.line(20, y + 5, 190, y + 5);
    
    // Pipeline data
    const pipelineData = [
      ['Stage', 'Count', 'Value', 'Conversion'],
      ['New Leads', '45', '$450,000', '100%'],
      ['Qualified', '32', '$640,000', '71%'],
      ['Proposal', '24', '$720,000', '53%'],
      ['Negotiation', '18', '$900,000', '40%'],
      ['Won', '12', '$600,000', '27%'],
    ];
    
    // Add pipeline table
    autoTable(this.doc, {
      head: [pipelineData[0]],
      body: pipelineData.slice(1),
      startY: y + 12,
      margin: { left: 20, right: 20 },
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
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
    });
    
    const finalY = (this.doc as any).lastAutoTable?.finalY || y + 50;
    return finalY + 15;
  }

  private addRevenueSummary(y: number): number {
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Section header
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Revenue Summary', 20, y);
    
    // Divider
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(0.3);
    this.doc.line(20, y + 5, 190, y + 5);
    
    // Revenue data
    const revenueData = [
      ['Category', 'Current', 'Previous', 'Change %'],
      ['Total Revenue', this.dashboardData.kpis.revenue, this.dashboardData.comparisonData.previousRevenue, this.dashboardData.comparisonData.revenueChangePercent],
      ['Expected Revenue', this.dashboardData.kpis.expectedRevenue, '$4,200,000', '+8.5%'],
      ['Won Value', this.dashboardData.kpis.wonValue, '$3,800,000', '+12.3%'],
      ['Pipeline Value', '$2,710,000', '$2,400,000', '+12.9%'],
    ];
    
    // Add revenue table
    autoTable(this.doc, {
      head: [revenueData[0]],
      body: revenueData.slice(1),
      startY: y + 12,
      margin: { left: 20, right: 20 },
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3,
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
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'center', fontStyle: 'bold' },
      },
      didParseCell: (data: any) => {
        // Color code the change column
        if (data.section === 'body' && data.column.index === 3) {
          const value = String(data.cell.raw);
          if (value.startsWith('+')) {
            data.cell.styles.textColor = [34, 139, 34]; // Green
          } else if (value.startsWith('-')) {
            data.cell.styles.textColor = [220, 53, 69]; // Red
          }
        }
      },
    });
    
    const finalY = (this.doc as any).lastAutoTable?.finalY || y + 50;
    return finalY + 15;
  }
}
