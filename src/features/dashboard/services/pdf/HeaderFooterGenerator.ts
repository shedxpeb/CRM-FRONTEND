import jsPDF from 'jspdf';
import { CompanyDetails, DashboardExportData } from '@/features/dashboard/types/pdf';

export class HeaderFooterGenerator {
  private doc: jsPDF;
  private companyDetails: CompanyDetails;
  private dashboardData: DashboardExportData;
  private readonly HEADER_HEIGHT = 18; // Reduced from 45 to 18 (60% reduction)
  private readonly FOOTER_HEIGHT = 15;
  private readonly CONTENT_TOP_MARGIN = 25; // Reduced from 55
  private readonly CONTENT_BOTTOM_MARGIN = 20; // Reduced from 30

  constructor(doc: jsPDF, companyDetails: CompanyDetails, dashboardData: DashboardExportData) {
    this.doc = doc;
    this.companyDetails = companyDetails;
    this.dashboardData = dashboardData;
  }

  generate(): void {
    const pageCount = this.doc.getNumberOfPages();
    
    // Skip cover page (page 1) for headers/footers
    for (let i = 2; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Add watermark first (behind content)
      this.addWatermark(i);
      
      // Add header
      this.addHeader();
      
      // Add footer
      this.addFooter(i, pageCount);
    }
  }

  private addHeader(): void {
    const pageWidth = this.doc.internal.pageSize.width;
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Thin header - just company name and line
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, 15, 190, 15);
    
    // Company name
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('PEB CRM Dashboard Report', 20, 12);
    
    // Reset text color
    this.doc.setTextColor(0, 0, 0);
  }

  private addFooter(currentPage: number, totalPages: number): void {
    const pageWidth = this.doc.internal.pageSize.width;
    const pageHeight = this.doc.internal.pageSize.height;
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    const footerY = pageHeight - this.FOOTER_HEIGHT;
    
    // Footer background
    this.doc.setFillColor(250, 250, 250);
    this.doc.rect(0, footerY, pageWidth, this.FOOTER_HEIGHT, 'F');
    
    // Bottom accent line
    this.doc.setFillColor(...primaryColor);
    this.doc.rect(0, pageHeight - 2, pageWidth, 2, 'F');
    
    // Footer content
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    
    // Left: Page X of Y
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...primaryColor);
    this.doc.text(`Page ${currentPage} of ${totalPages}`, 15, footerY + 10);
    
    // Center: Generated Date
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, footerY + 10, { align: 'center' });
    
    // Right: Report Period
    this.doc.text(`Period: ${this.formatFilter(this.dashboardData.filter)}`, pageWidth - 15, footerY + 10, { align: 'right' });
    
    // Company info (GST, CIN, Website) - below main footer
    this.doc.setFontSize(7);
    this.doc.setTextColor(80, 80, 80);
    this.doc.text(`GST: ${this.companyDetails.gst} | CIN: ${this.companyDetails.cin} | ${this.companyDetails.website}`, pageWidth / 2, footerY + 14, { align: 'center' });
    
    // Reset text color
    this.doc.setTextColor(0, 0, 0);
  }

  private addWatermark(pageNumber: number): void {
    const pageWidth = this.doc.internal.pageSize.width;
    const pageHeight = this.doc.internal.pageSize.height;
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Only add watermark to content pages (not cover page)
    if (pageNumber === 1) {
      return;
    }
    
    // Save current graphics state
    this.doc.saveGraphicsState();
    
    // Set very low opacity (3%)
    this.doc.setGState((this.doc as any).GState({ opacity: 0.03 }));
    
    // Watermark text
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(72);
    this.doc.setFont('helvetica', 'bold');
    
    // Rotate and center watermark
    const centerX = pageWidth / 2;
    const centerY = pageHeight / 2;
    
    // Add watermark text at 45-degree angle
    this.doc.text(
      'CONFIDENTIAL',
      centerX,
      centerY,
      {
        align: 'center',
        angle: 45,
      }
    );
    
    // Add company name below
    this.doc.setFontSize(48);
    this.doc.text(
      this.companyDetails.name,
      centerX,
      centerY + 40,
      {
        align: 'center',
        angle: 45,
      }
    );
    
    // Restore graphics state
    this.doc.restoreGraphicsState();
    
    // Reset text color
    this.doc.setTextColor(0, 0, 0);
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
