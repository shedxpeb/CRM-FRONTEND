import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DashboardExportData, CompanyDetails } from '@/features/dashboard/types/pdf';

export class KPIAnalyticsGenerator {
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
    
    // Add KPI Analytics section
    currentY = this.addKPIAnalytics(currentY);
    
    // Add Performance Metrics section
    if (currentY > 180) {
      this.doc.addPage();
      currentY = 20;
    }
    currentY = this.addPerformanceMetrics(currentY);
    
    // Add Conversion Metrics section
    if (currentY > 180) {
      this.doc.addPage();
      currentY = 20;
    }
    currentY = this.addConversionMetrics(currentY);
  }

  private addPageHeader(y: number): number {
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Page title
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('KPI Analytics', 20, y);
    
    // Subtitle
    this.doc.setTextColor(80, 80, 80);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Key Performance Indicators Overview', 20, y + 10);
    
    // Divider line
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(1);
    this.doc.line(20, y + 15, 190, y + 15);
    
    return y + 30;
  }

  private addKPIAnalytics(y: number): number {
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Section header
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Primary KPIs', 20, y);
    
    // Divider
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, y + 5, 190, y + 5);
    
    // KPI data table
    const kpiData = [
      ['KPI', 'Current Value', 'Change', 'Trend'],
      ['Total Revenue', this.dashboardData.kpis.revenue, this.dashboardData.kpis.revenueChange, this.getTrend(this.dashboardData.kpis.revenueChange)],
      ['Expected Revenue', this.dashboardData.kpis.expectedRevenue, this.dashboardData.kpis.revenueChange, this.getTrend(this.dashboardData.kpis.revenueChange)],
      ['Won Value', this.dashboardData.kpis.wonValue, this.dashboardData.kpis.revenueChange, this.getTrend(this.dashboardData.kpis.revenueChange)],
      ['Active Projects', String(this.dashboardData.kpis.activeProjects), this.dashboardData.kpis.projectsChange, this.getTrend(this.dashboardData.kpis.projectsChange)],
      ['Active Leads', String(this.dashboardData.kpis.leads), this.dashboardData.kpis.leadsChange, this.getTrend(this.dashboardData.kpis.leadsChange)],
      ['Quotations', String(this.dashboardData.kpis.quotations), this.dashboardData.kpis.quotationsChange, this.getTrend(this.dashboardData.kpis.quotationsChange)],
      ['Customers', String(this.dashboardData.kpis.customers), this.dashboardData.kpis.customersChange, this.getTrend(this.dashboardData.kpis.customersChange)],
      ['Inventory', this.dashboardData.kpis.inventory, this.dashboardData.kpis.inventoryChange, this.getTrend(this.dashboardData.kpis.inventoryChange)],
    ];
    
    // Add KPI table
    autoTable(this.doc, {
      head: [kpiData[0]],
      body: kpiData.slice(1),
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
        1: { halign: 'right', fontStyle: 'bold', textColor: primaryColor },
        2: { halign: 'center' },
        3: { halign: 'center' },
      },
      didParseCell: (data: any) => {
        // Color code the change column
        if (data.section === 'body' && data.column.index === 2) {
          const value = String(data.cell.raw);
          if (value.startsWith('+')) {
            data.cell.styles.textColor = [34, 139, 34] as [number, number, number]; // Green
          } else if (value.startsWith('-')) {
            data.cell.styles.textColor = [220, 53, 69] as [number, number, number]; // Red
          }
        }
      },
    });
    
    const finalY = (this.doc as any).lastAutoTable?.finalY || y + 80;
    return finalY + 15;
  }

  private addPerformanceMetrics(y: number): number {
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Section header
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Performance Metrics', 20, y);
    
    // Divider
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, y + 5, 190, y + 5);
    
    // Performance metrics
    const metrics = [
      { label: 'Revenue Growth', value: this.dashboardData.kpis.revenueGrowth, status: 'positive' },
      { label: 'Conversion Rate', value: this.dashboardData.kpis.conversionRate, status: 'neutral' },
      { label: 'Top Performing Stage', value: this.dashboardData.kpis.topPerformingStage, status: 'neutral' },
    ];
    
    let metricY = y + 15;
    
    metrics.forEach((metric) => {
      // Metric label
      this.doc.setTextColor(100, 100, 100);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(metric.label + ':', 20, metricY);
      
      // Metric value
      this.doc.setTextColor(...primaryColor);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(metric.value, 80, metricY);
      
      // Status indicator
      const statusColor: [number, number, number] = metric.status === 'positive' ? [34, 139, 34] : [108, 117, 125];
      this.doc.setFillColor(...statusColor);
      this.doc.circle(170, metricY - 3, 3, 'F');
      
      metricY += 15;
    });
    
    return metricY + 10;
  }

  private addConversionMetrics(y: number): number {
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Section header
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Conversion Metrics', 20, y);
    
    // Divider
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, y + 5, 190, y + 5);
    
    // Conversion data table
    const conversionData = [
      ['Stage', 'Count', 'Conversion Rate', 'Value'],
      ['Leads', String(this.dashboardData.kpis.leads), '100%', '-'],
      ['Qualified', '32', '71%', '$640,000'],
      ['Proposal', '24', '53%', '$720,000'],
      ['Negotiation', '18', '40%', '$900,000'],
      ['Won', '12', '27%', '$600,000'],
    ];
    
    // Add conversion table
    autoTable(this.doc, {
      head: [conversionData[0]],
      body: conversionData.slice(1),
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
        2: { halign: 'center' },
        3: { halign: 'right' },
      },
    });
    
    const finalY = (this.doc as any).lastAutoTable?.finalY || y + 60;
    return finalY + 15;
  }

  private getTrend(change: string): string {
    if (change.startsWith('+')) return '↑';
    if (change.startsWith('-')) return '↓';
    return '→';
  }
}
