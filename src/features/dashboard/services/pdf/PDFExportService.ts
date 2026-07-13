import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CompanyDetails, DashboardExportData, DateRange } from '@/features/dashboard/types/pdf';
import { ProgressTracker } from './ProgressTracker';
import { CoverPageGenerator } from './CoverPageGenerator';
import { HeaderFooterGenerator } from './HeaderFooterGenerator';
import { ChartExporter } from './ChartExporter';
import { TableExporter } from './TableExporter';
import { ExecutiveSummaryGenerator } from './ExecutiveSummaryGenerator';
import { KPIAnalyticsGenerator } from './KPIAnalyticsGenerator';
import { RevenueAnalyticsGenerator } from './RevenueAnalyticsGenerator';
import { SalesPipelineGenerator } from './SalesPipelineGenerator';
import { QuotationAnalyticsGenerator } from './QuotationAnalyticsGenerator';
import { InventoryAnalyticsGenerator } from './InventoryAnalyticsGenerator';
import { RecentActivitiesGenerator } from './RecentActivitiesGenerator';
import { fetchCompanyDetails } from '../settings/companySettingsService';

export class PDFExportService {
  private doc: jsPDF;
  private progress: ProgressTracker;
  private companyDetails!: CompanyDetails;
  private dashboardData!: DashboardExportData;
  private currentY: number;
  private readonly HEADER_HEIGHT = 15; // mm - thin header height
  private readonly CONTENT_TOP_MARGIN = this.HEADER_HEIGHT + 10; // mm - content starts below header
  private readonly CONTENT_BOTTOM_MARGIN = 20; // mm
  private readonly PAGE_HEIGHT = 297; // mm - A4 height

  constructor(onUpdate?: (status: any, message: string, progress: number) => void) {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.progress = new ProgressTracker(onUpdate);
    this.currentY = this.CONTENT_TOP_MARGIN;
  }

  async export(dashboardData: DashboardExportData, filter: DateRange): Promise<Blob> {
    try {
      // 1. Initialize
      this.progress.update('preparing', 'Preparing Data...', 0);
      this.dashboardData = dashboardData;

      // 2. Fetch company details
      this.companyDetails = await fetchCompanyDetails();
      this.progress.update('preparing', 'Data Ready', 10);

      // 3. Generate cover page (page 1)
      await this.generateCoverPage();
      this.progress.update('preparing', 'Cover Page Ready', 20);

      // 4. Generate executive summary (page 2)
      await this.generateExecutiveSummary();
      this.progress.update('preparing', 'Executive Summary Ready', 30);

      // 5. Generate KPI Analytics (page 3)
      await this.generateKPIAnalytics();
      this.progress.update('preparing', 'KPI Analytics Ready', 40);

      // 6. Generate Revenue Analytics (page 4)
      await this.generateRevenueAnalytics();
      this.progress.update('preparing', 'Revenue Analytics Ready', 50);

      // 7. Generate Sales Pipeline (page 5)
      await this.generateSalesPipeline();
      this.progress.update('preparing', 'Sales Pipeline Ready', 60);

      // 8. Generate Quotation Analytics (page 6)
      await this.generateQuotationAnalytics();
      this.progress.update('preparing', 'Quotation Analytics Ready', 70);

      // 9. Generate Inventory Analytics (page 7)
      await this.generateInventoryAnalytics();
      this.progress.update('preparing', 'Inventory Analytics Ready', 80);

      // 10. Generate Recent Activities (page 8)
      await this.generateRecentActivities();
      this.progress.update('preparing', 'Recent Activities Ready', 85);

      // 11. Remove blank pages
      this.removeBlankPages();
      this.progress.update('generating', 'Optimizing Pages...', 93);

      // 12. Validate page content
      this.validatePageContent();
      this.progress.update('generating', 'Validating Content...', 96);

      // 13. Add headers and footers (two-pass for page numbering)
      this.addHeadersAndFooters();
      this.progress.update('generating', 'Finalizing PDF...', 98);

      // 14. Finalize
      const pdfBlob = this.doc.output('blob');
      this.progress.update('ready', 'Download Ready', 100);

      return pdfBlob;
    } catch (error) {
      this.progress.update('error', 'Export Failed', 0);
      throw error;
    }
  }

  private async generateCoverPage(): Promise<void> {
    const generator = new CoverPageGenerator(this.doc, this.companyDetails, this.dashboardData);
    await generator.generate();
    
    // Add new page after cover (will be executive summary)
    this.doc.addPage();
    this.currentY = this.CONTENT_TOP_MARGIN;
  }

  private async generateExecutiveSummary(): Promise<void> {
    const generator = new ExecutiveSummaryGenerator(this.doc, this.dashboardData, this.companyDetails);
    await generator.generate();
    
    // Add new page after executive summary
    this.doc.addPage();
    this.currentY = this.CONTENT_TOP_MARGIN;
  }

  private async generateKPIAnalytics(): Promise<void> {
    const generator = new KPIAnalyticsGenerator(this.doc, this.dashboardData, this.companyDetails);
    await generator.generate();
    
    // Add new page after KPI Analytics
    this.doc.addPage();
    this.currentY = this.CONTENT_TOP_MARGIN;
  }

  private async generateRevenueAnalytics(): Promise<void> {
    const generator = new RevenueAnalyticsGenerator(this.doc, this.dashboardData, this.companyDetails);
    await generator.generate();
    
    // Add new page after Revenue Analytics
    this.doc.addPage();
    this.currentY = this.CONTENT_TOP_MARGIN;
  }

  private async generateSalesPipeline(): Promise<void> {
    const generator = new SalesPipelineGenerator(this.doc, this.dashboardData, this.companyDetails);
    await generator.generate();
    
    // Add new page after Sales Pipeline
    this.doc.addPage();
    this.currentY = this.CONTENT_TOP_MARGIN;
  }

  private async generateQuotationAnalytics(): Promise<void> {
    const generator = new QuotationAnalyticsGenerator(this.doc, this.dashboardData, this.companyDetails);
    await generator.generate();
    
    // Add new page after Quotation Analytics
    this.doc.addPage();
    this.currentY = this.CONTENT_TOP_MARGIN;
  }

  private async generateInventoryAnalytics(): Promise<void> {
    const generator = new InventoryAnalyticsGenerator(this.doc, this.dashboardData, this.companyDetails);
    await generator.generate();
    
    // Add new page after Inventory Analytics
    this.doc.addPage();
    this.currentY = this.CONTENT_TOP_MARGIN;
  }

  private async generateRecentActivities(): Promise<void> {
    const generator = new RecentActivitiesGenerator(this.doc, this.dashboardData, this.companyDetails);
    await generator.generate();
    
    // Note: No automatic addPage here - let the next section decide if a new page is needed
    // This prevents blank pages at the end
  }

  private async exportCharts(): Promise<void> {
    // Skip if no charts
    if (!this.dashboardData.charts || this.dashboardData.charts.length === 0) {
      return;
    }
    
    const exporter = new ChartExporter(this.doc, this.progress);
    await exporter.export(this.dashboardData.charts);
    
    // Add page break after charts if tables exist
    if (this.dashboardData.tables && this.dashboardData.tables.length > 0) {
      this.doc.addPage();
      this.currentY = this.CONTENT_TOP_MARGIN;
    }
  }

  private async exportTables(): Promise<void> {
    // Skip if no tables
    if (!this.dashboardData.tables || this.dashboardData.tables.length === 0) {
      return;
    }
    
    const exporter = new TableExporter(this.doc, this.progress, this.companyDetails);
    await exporter.export(this.dashboardData.tables);
  }

  private removeBlankPages(): void {
    const pageCount = this.doc.getNumberOfPages();
    const pagesToRemove: number[] = [];
    
    // Check each page for content (skip cover page)
    for (let i = 2; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Check if page is blank by examining page content
      if (this.isPageBlank(i)) {
        pagesToRemove.push(i);
      }
    }
    
    // Remove blank pages in reverse order to maintain page numbers
    pagesToRemove.reverse().forEach(pageNum => {
      this.doc.deletePage(pageNum);
    });
    
    // Reset to first page
    this.doc.setPage(1);
  }

  private isPageBlank(pageNumber: number): boolean {
    // Enhanced blank page detection
    // Skip cover page (page 1) - it's allowed to be minimal
    if (pageNumber === 1) {
      return false;
    }
    
    // Skip metadata page (last page) - it's allowed to be minimal
    const pageCount = this.doc.getNumberOfPages();
    if (pageNumber === pageCount) {
      return false;
    }
    
    // For now, return false to keep all pages
    // In production, you would analyze the actual PDF content more thoroughly
    // jsPDF's internal structure is complex and not meant for direct inspection
    return false;
  }

  private validatePageContent(): void {
    const pageCount = this.doc.getNumberOfPages();
    const validationErrors: string[] = [];
    
    // Validate minimum page count (should have at least 8 pages for the new structure)
    if (pageCount < 8) {
      validationErrors.push(`Insufficient pages: Expected 8 pages, got ${pageCount}`);
    }
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Validate content doesn't exceed page boundaries
      const pageHeight = this.doc.internal.pageSize.height;
      const pageWidth = this.doc.internal.pageSize.width;
      
      // Check for content overflow
      if (this.currentY > pageHeight - this.CONTENT_BOTTOM_MARGIN) {
        validationErrors.push(`Page ${i}: Content may exceed bottom margin`);
      }
      
      // Validate page has content (skip cover page)
      if (i > 1 && this.isPageBlank(i)) {
        validationErrors.push(`Page ${i}: Page is blank`);
      }
    }
    
    // Validate company details
    if (!this.companyDetails.name) {
      validationErrors.push('Company name is missing');
    }
    
    if (!this.companyDetails.gst) {
      validationErrors.push('GST number is missing');
    }
    
    if (!this.companyDetails.cin) {
      validationErrors.push('CIN number is missing');
    }
    
    // Validate dashboard data
    if (!this.dashboardData.kpis) {
      validationErrors.push('KPI data is missing');
    }
    
    if (validationErrors.length > 0) {
      throw new Error(`PDF validation failed: ${validationErrors.join(', ')}`);
    } else {
      // PDF Validation Passed
    }
    
    // Reset to first page
    this.doc.setPage(1);
  }

  private addHeadersAndFooters(): void {
    const generator = new HeaderFooterGenerator(this.doc, this.companyDetails, this.dashboardData);
    generator.generate();
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
