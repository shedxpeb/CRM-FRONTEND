import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DashboardExportData, CompanyDetails } from '@/features/dashboard/types/pdf';

export class ExecutiveSummaryGenerator {
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
    
    // Add KPI cards section
    currentY = this.addKPICards(currentY);
    
    // Check if we need a new page for comparison section
    if (currentY > 180) {
      this.doc.addPage();
      currentY = 20;
    }
    
    // Add comparison section
    currentY = this.addComparisonSection(currentY);
    
    // Check if we need a new page for business insights
    if (currentY > 200) {
      this.doc.addPage();
      currentY = 20;
    }
    
    // Add business insights section
    currentY = this.addBusinessInsights(currentY);
    
    // Add detailed metrics section
    if (currentY > 220) {
      this.doc.addPage();
      currentY = 20;
    }
    currentY = this.addDetailedMetrics(currentY);
  }

  private addPageHeader(y: number): number {
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Page title
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Executive Summary', 20, y);
    
    // Subtitle
    this.doc.setTextColor(80, 80, 80);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Business Operations Overview', 20, y + 10);
    
    // Divider line
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(1);
    this.doc.line(20, y + 15, 190, y + 15);
    
    return y + 30;
  }

  private addKPICards(y: number): number {
    const primaryColor = this.companyDetails.brandingColors.primary;
    const accentColor = this.companyDetails.brandingColors.accent;
    
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
    const cardHeight = 30;
    const startX = 20;
    const startY = y;
    const gap = 8;
    
    kpis.forEach((kpi, i) => {
      const x = startX + (i % 2) * (cardWidth + gap);
      const cardY = startY + Math.floor(i / 2) * (cardHeight + gap);
      
      // Card background with subtle gradient effect
      this.doc.setFillColor(250, 250, 250);
      this.doc.roundedRect(x, cardY, cardWidth, cardHeight, 3, 3, 'F');
      
      // Card border
      this.doc.setDrawColor(...primaryColor);
      this.doc.setLineWidth(0.3);
      this.doc.roundedRect(x, cardY, cardWidth, cardHeight, 3, 3, 'S');
      
      // Icon background
      this.doc.setFillColor(...primaryColor);
      this.doc.roundedRect(x + 5, cardY + 5, 20, 20, 2, 2, 'F');
      
      // Icon
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(kpi.icon, x + 15, cardY + 18, { align: 'center' });
      
      // Label
      this.doc.setTextColor(100, 100, 100);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(kpi.label, x + 30, cardY + 12);
      
      // Value
      this.doc.setTextColor(...primaryColor);
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(kpi.value, x + 30, cardY + 20);
      
      // Change indicator
      const isPositive = kpi.change.startsWith('+');
      this.doc.setTextColor(isPositive ? 34 : 231, isPositive ? 139 : 76, 34);
      this.doc.setFontSize(7);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(kpi.change, x + 30, cardY + 26);
    });
    
    return startY + Math.ceil(kpis.length / 2) * (cardHeight + gap) + 15;
  }

  private addBusinessInsights(y: number): number {
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Section header
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Key Business Insights', 20, y);
    
    // Divider
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, y + 5, 190, y + 5);
    
    // Generate insights dynamically from actual data
    const insights = this.generateDynamicInsights();
    
    let insightY = y + 15;
    
    insights.forEach((insight: string) => {
      // Bullet point
      this.doc.setFillColor(...primaryColor);
      this.doc.circle(25, insightY - 2, 2, 'F');
      
      // Insight text
      this.doc.setTextColor(60, 60, 60);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(insight, 32, insightY);
      
      insightY += 12;
    });
    
    return insightY + 10;
  }

  private generateDynamicInsights(): string[] {
    const insights: string[] = [];
    const kpis = this.dashboardData.kpis;
    const comparison = this.dashboardData.comparisonData;
    
    // Revenue insight
    const revenueChange = parseFloat(comparison.revenueChangePercent.replace('%', ''));
    if (revenueChange > 0) {
      insights.push(`Revenue increased by ${comparison.revenueChangePercent} compared to previous period`);
    } else if (revenueChange < 0) {
      insights.push(`Revenue decreased by ${comparison.revenueChangePercent} compared to previous period`);
    }
    
    // Lead conversion insight
    insights.push(`Lead conversion rate is ${kpis.conversionRate}, with ${kpis.leads} active leads`);
    
    // Top performing stage
    insights.push(`${kpis.topPerformingStage} stage showing highest conversion rates`);
    
    // Project insight
    const projectChange = parseFloat(comparison.projectsChangePercent.replace('%', ''));
    if (projectChange > 0) {
      insights.push(`Active projects grew by ${comparison.projectsChangePercent} to ${kpis.activeProjects}`);
    }
    
    // Customer insight
    const customerChange = parseFloat(comparison.customersChangePercent.replace('%', ''));
    if (customerChange > 0) {
      insights.push(`Customer base expanded by ${comparison.customersChangePercent} to ${kpis.customers}`);
    }
    
    // Quotation insight
    insights.push(`${kpis.quotations} quotations generated with expected revenue of ${kpis.expectedRevenue}`);
    
    return insights;
  }

  private addComparisonSection(y: number): number {
    const primaryColor = this.companyDetails.brandingColors.primary;
    const comparison = this.dashboardData.comparisonData;
    
    // Section header
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Period Comparison', 20, y);
    
    // Divider
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, y + 5, 190, y + 5);
    
    // Comparison table
    const comparisonData = [
      ['Metric', 'Current Period', 'Previous Period', 'Change'],
      ['Revenue', this.dashboardData.kpis.revenue, comparison.previousRevenue, comparison.revenueChangePercent],
      ['Leads', String(this.dashboardData.kpis.leads), String(comparison.previousLeads), comparison.leadsChangePercent],
      ['Projects', String(this.dashboardData.kpis.activeProjects), String(comparison.previousProjects), comparison.projectsChangePercent],
      ['Customers', String(this.dashboardData.kpis.customers), String(comparison.previousCustomers), comparison.customersChangePercent],
      ['Quotations', String(this.dashboardData.kpis.quotations), String(comparison.previousQuotations), comparison.quotationsChangePercent],
      ['Inventory', this.dashboardData.kpis.inventory, comparison.previousInventory, comparison.inventoryChangePercent],
    ];
    
    // Add comparison table using AutoTable
    autoTable(this.doc, {
      head: [comparisonData[0]],
      body: comparisonData.slice(1),
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

  private addDetailedMetrics(y: number): number {
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Section header
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Detailed Metrics', 20, y);
    
    // Divider
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, y + 5, 190, y + 5);
    
    let metricY = y + 15;
    
    const metrics = [
      { label: 'Revenue Growth', value: this.dashboardData.kpis.revenueGrowth },
      { label: 'Conversion Rate', value: this.dashboardData.kpis.conversionRate },
      { label: 'Top Performing Stage', value: this.dashboardData.kpis.topPerformingStage },
      { label: 'Report Period', value: this.formatFilter(this.dashboardData.filter) },
    ];
    
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
      
      metricY += 12;
    });
    
    return metricY;
  }

  private formatFilter(filter: string): string {
    const filterMap: Record<string, string> = {
      'today': 'Today',
      'this_week': 'This Week',
      'this_month': 'This Month',
      'last_month': 'Last Month',
      'this_quarter': 'This Quarter',
      'last_quarter': 'Last Quarter',
      'this_year': 'This Year',
      'last_year': 'Last Year',
      'all_time': 'All Time',
    };
    return filterMap[filter] || filter;
  }
}
