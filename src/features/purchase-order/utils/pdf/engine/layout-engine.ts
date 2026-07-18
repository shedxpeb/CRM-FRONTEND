// PDF Layout Engine
import jsPDF from 'jspdf';
import { PDFLayoutConfig, PDFSection, PDFRenderContext, PDFRenderResult } from '../models/layout.types';

export class PDFLayoutEngine {
  private doc: jsPDF;
  private config: PDFLayoutConfig;
  private sections: PDFSection[] = [];
  private currentPage: number = 1;
  private totalPages: number = 1;

  constructor(config: PDFLayoutConfig) {
    this.config = config;
    this.doc = new jsPDF({
      orientation: config.orientation,
      unit: config.unit,
      format: config.format,
    });
  }

  addSection(section: PDFSection): void {
    this.sections.push(section);
  }

  addSections(sections: PDFSection[]): void {
    this.sections.push(...sections);
  }

  private getContext(data: any, y: number = this.config.margins.top): PDFRenderContext {
    const pageWidth = this.doc.internal.pageSize.getWidth();
    const pageHeight = this.doc.internal.pageSize.getHeight();
    
    return {
      doc: this.doc,
      y,
      pageWidth,
      pageHeight,
      contentWidth: pageWidth - this.config.margins.left - this.config.margins.right,
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      data,
      config: this.config,
    };
  }

  private checkPageBreak(context: PDFRenderContext, requiredHeight: number): boolean {
    const availableSpace = context.pageHeight - context.y - this.config.margins.bottom;
    return requiredHeight > availableSpace;
  }

  private addNewPage(context: PDFRenderContext): PDFRenderContext {
    this.doc.addPage();
    this.currentPage++;
    this.totalPages = Math.max(this.totalPages, this.currentPage);
    
    return {
      ...context,
      y: this.config.margins.top,
      currentPage: this.currentPage,
      totalPages: this.totalPages,
    };
  }

  render(data: any): jsPDF {
    let context = this.getContext(data);
    
    // Sort sections by priority if specified
    const sortedSections = [...this.sections].sort((a, b) => {
      const priorityA = a.priority ?? 0;
      const priorityB = b.priority ?? 0;
      return priorityA - priorityB;
    });

    for (const section of sortedSections) {
      const result = section.render(context);
      
      // Handle page breaks if needed
      if (result.newPage) {
        context = this.addNewPage(context);
      }
      
      // Update Y position
      context.y = result.nextY;
    }

    // Update total pages and add footers
    this.totalPages = this.currentPage;
    this.addFootersToAllPages();

    return this.doc;
  }

  private addFootersToAllPages(): void {
    for (let i = 1; i <= this.totalPages; i++) {
      this.doc.setPage(i);
      this.renderFooter(i, this.totalPages);
    }
  }

  private renderFooter(pageNumber: number, totalPages: number): void {
    const footerY = this.doc.internal.pageSize.getHeight() - this.config.margins.bottom;
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    
    // Separator line
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.3);
    this.doc.line(
      this.config.margins.left,
      footerY - 12,
      this.doc.internal.pageSize.getWidth() - this.config.margins.right,
      footerY - 12
    );
    
    // Page number
    this.doc.text(
      `Page ${pageNumber} of ${totalPages}`,
      this.doc.internal.pageSize.getWidth() - this.config.margins.right,
      footerY - 4,
      { align: 'right' }
    );
  }

  getDocument(): jsPDF {
    return this.doc;
  }
}
