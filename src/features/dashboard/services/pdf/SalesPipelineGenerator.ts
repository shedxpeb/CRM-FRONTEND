import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DashboardExportData, CompanyDetails } from '@/features/dashboard/types/pdf';
import { toPng } from 'html-to-image';

export class SalesPipelineGenerator {
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
    
    // Add Pipeline Summary section
    currentY = this.addPipelineSummary(currentY);
    
    // Add Pipeline Breakdown section
    currentY = this.ensureSpaceForContent(60, currentY);
    currentY = this.addPipelineBreakdown(currentY);
    
    // Funnel chart section removed - data is already in Pipeline Breakdown table
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
    this.doc.text('Sales Pipeline', 20, y);
    
    // Subtitle
    this.doc.setTextColor(80, 80, 80);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Sales Funnel Analysis', 20, y + 10);
    
    // Divider line
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(1);
    this.doc.line(20, y + 15, 190, y + 15);
    
    return y + 30;
  }

  private addPipelineSummary(y: number): number {
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Section header
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Pipeline Summary', 20, y);
    
    // Divider
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, y + 5, 190, y + 5);
    
    // Pipeline summary cards
    const pipelineMetrics = [
      { label: 'Total Leads', value: String(this.dashboardData.kpis.leads), change: this.dashboardData.kpis.leadsChange },
      { label: 'Conversion Rate', value: this.dashboardData.kpis.conversionRate, change: 'N/A' },
      { label: 'Top Stage', value: this.dashboardData.kpis.topPerformingStage, change: 'N/A' },
    ];
    
    const cardWidth = 85;
    const cardHeight = 35;
    const startX = 20;
    const startY = y + 12;
    const gap = 10;
    
    pipelineMetrics.forEach((metric, i) => {
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
      if (metric.change !== 'N/A') {
        const isPositive = metric.change.startsWith('+');
        this.doc.setTextColor(isPositive ? 34 : 231, isPositive ? 139 : 76, 34);
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(metric.change, x + 5, cardY + 30);
      }
    });
    
    return startY + Math.ceil(pipelineMetrics.length / 2) * (cardHeight + gap) + 15;
  }

  private addPipelineBreakdown(y: number): number {
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Section header
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Pipeline Breakdown', 20, y);
    
    // Divider
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, y + 5, 190, y + 5);
    
    // Pipeline breakdown table
    const pipelineData = [
      ['Stage', 'Count', 'Value', 'Conversion Rate'],
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
    });
    
    const finalY = (this.doc as any).lastAutoTable?.finalY || y + 60;
    return finalY + 15;
  }

  private async addFunnelChartSection(y: number): Promise<number> {
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Section header
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Sales Funnel Chart', 20, y);
    
    // Divider
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, y + 5, 190, y + 5);
    
    // Find sales funnel chart element
    const salesFunnelChart = this.dashboardData.charts.find(c => c.type === 'sales-pipeline');
    
    if (salesFunnelChart && salesFunnelChart.element) {
      try {
        // Wait for chart animation
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Convert chart to PNG with high resolution
        const imgData = await toPng(salesFunnelChart.element, {
          quality: 1,
          pixelRatio: 3, // 3x scale for high resolution
          backgroundColor: '#ffffff',
          cacheBust: true,
        });
        
        // Validate image data
        if (imgData && imgData.length > 1000) {
          // Add chart image to PDF
          const chartWidth = 170;
          const chartHeight = 80;
          this.doc.addImage(imgData, 'PNG', 20, y + 12, chartWidth, chartHeight);
          // Sales funnel chart rendered successfully
          return y + 105;
        } else {
          return this.addChartPlaceholder(y, 'sales-funnel');
        }
      } catch (error) {
        return this.addChartPlaceholder(y, 'sales-funnel', 'Chart rendering failed');
      }
    } else {
      return this.addChartPlaceholder(y, 'sales-funnel', 'Chart not available');
    }
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
    this.doc.text('Sales Funnel Chart', 105, y + 52, { align: 'center' });
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(150, 150, 150);
    const message = reason ? `[${reason}]` : 'Chart will be rendered from dashboard component';
    this.doc.text(message, 105, y + 62, { align: 'center' });
    
    return y + 105;
  }
}
