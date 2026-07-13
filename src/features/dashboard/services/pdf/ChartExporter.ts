import jsPDF from 'jspdf';
import { toPng, toSvg } from 'html-to-image';
import { ChartData } from '@/features/dashboard/types/pdf';
import { ProgressTracker } from './ProgressTracker';

export class ChartExporter {
  private doc: jsPDF;
  private progress: ProgressTracker;
  private currentY: number;
  private readonly CHART_HEIGHT = 120; // Increased height for better visibility
  private readonly CHART_WIDTH = 130; // Width for each chart in 2-per-page layout
  private readonly TOP_MARGIN = 25;
  private readonly BOTTOM_MARGIN = 20;
  private readonly CHARTS_PER_PAGE = 2;
  private readonly DPI_SCALE = 4; // 4x scale for 300 DPI equivalent

  constructor(doc: jsPDF, progress: ProgressTracker) {
    this.doc = doc;
    this.progress = progress;
    this.currentY = this.TOP_MARGIN;
  }

  async export(charts: ChartData[]): Promise<void> {
    // Skip if no charts
    if (charts.length === 0) {
      return;
    }

    // Switch to landscape orientation for charts
    this.doc.addPage([297, 210]); // A4 Landscape
    this.currentY = this.TOP_MARGIN;

    let chartsOnCurrentPage = 0;
    let successfulExports = 0;

    for (let i = 0; i < charts.length; i++) {
      this.progress.update('rendering', `Rendering Chart ${i + 1} of ${charts.length}...`, 30 + (i / charts.length) * 40);
      
      const chart = charts[i];
      
      try {
        // Validate chart element exists
        if (!chart.element || !document.body.contains(chart.element)) {
          this.addChartPlaceholder(chart.title, 'Chart element not available');
          chartsOnCurrentPage++;
          continue;
        }

        // Wait for chart animation to complete before capturing
        await this.waitForChartAnimation(chart.element);
        
        // Validate chart is rendered (has content)
        if (!this.isChartRendered(chart.element)) {
          this.addChartPlaceholder(chart.title, 'Chart still loading');
          chartsOnCurrentPage++;
          continue;
        }
        
        // Validate chart has meaningful data
        if (!this.hasMeaningfulData(chart.element)) {
          this.addChartPlaceholder(chart.title, 'No data available');
          chartsOnCurrentPage++;
          continue;
        }
        
        // Try SVG export first (better quality for Recharts)
        let imgData: string | null = null;
        try {
          imgData = await this.convertChartToSVG(chart.element);
        } catch (svgError) {
          // SVG export failed, will fallback to PNG
        }
        
        // Fallback to PNG if SVG fails
        if (!imgData) {
          imgData = await this.convertChartToPNG(chart.element);
        }
        
        // Validate image data
        if (!imgData || imgData.length < 1000) {
          this.addChartPlaceholder(chart.title, 'Failed to capture chart');
          chartsOnCurrentPage++;
          continue;
        }
        
        // Add chart to PDF with validation
        this.addChartToPDF(imgData, chart.title, chartsOnCurrentPage, chart.description);
        chartsOnCurrentPage++;
        successfulExports++;
        
        // Check if we need a new page after adding this chart
        if (chartsOnCurrentPage >= this.CHARTS_PER_PAGE && i < charts.length - 1) {
          this.doc.addPage([297, 210]); // New landscape page
          this.currentY = this.TOP_MARGIN;
          chartsOnCurrentPage = 0;
        }
      } catch (error) {
        this.addChartPlaceholder(chart.title, 'Chart rendering failed');
        chartsOnCurrentPage++;
      }
    }

    // Chart export complete
  }

  private async waitForChartAnimation(element: HTMLElement): Promise<void> {
    // Wait for chart animations to complete with staggered timing
    // First wait for initial render
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Then wait for any animations (typically 800-1200ms total)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Final wait to ensure stability
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  private isChartRendered(element: HTMLElement): boolean {
    // Check if element has visible content
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return false;
    }
    
    // Check if element has child nodes (charts typically have SVG or canvas)
    if (element.children.length === 0) {
      return false;
    }
    
    // Check for common chart indicators
    const hasSvg = element.querySelector('svg');
    const hasCanvas = element.querySelector('canvas');
    const hasContent = element.textContent && element.textContent.trim().length > 0;
    
    return !!(hasSvg || hasCanvas || hasContent);
  }

  private hasMeaningfulData(element: HTMLElement): boolean {
    // Check if chart has actual data points
    const svg = element.querySelector('svg');
    if (!svg) return false;
    
    // Check for data elements (bars, lines, paths, etc.)
    const dataElements = svg.querySelectorAll('path, rect, circle, line, polygon');
    if (dataElements.length < 5) return false; // Minimum data points
    
    // Check for text labels (axis labels, data labels)
    const textElements = svg.querySelectorAll('text');
    if (textElements.length < 3) return false; // Minimum labels
    
    return true;
  }

  private async convertChartToSVG(element: HTMLElement): Promise<string | null> {
    try {
      // Try SVG export first (better quality for Recharts)
      const svgData = await toSvg(element, {
        quality: 1,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });
      
      // Convert SVG to PNG for PDF compatibility
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      return new Promise((resolve) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width * this.DPI_SCALE;
          canvas.height = img.height * this.DPI_SCALE;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/png', 1.0));
          } else {
            resolve(null);
          }
          
          URL.revokeObjectURL(url);
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(null);
        };
        
        img.src = url;
      });
    } catch (error) {
      return null;
    }
  }

  private async convertChartToPNG(element: HTMLElement): Promise<string> {
    // Use high DPI scale for PNG export
    return await toPng(element, {
      quality: 1, // Maximum quality
      pixelRatio: this.DPI_SCALE, // 4x scale for 300 DPI equivalent
      backgroundColor: '#ffffff', // White background
      cacheBust: true, // Prevent caching issues
      skipFonts: false, // Include fonts for text rendering
    });
  }

  private addChartToPDF(imgData: string, title: string, chartIndex: number, description?: string): void {
    const pageWidth = 297; // A4 Landscape width in mm
    const pageHeight = 210; // A4 Landscape height in mm
    const availableHeight = pageHeight - this.TOP_MARGIN - this.BOTTOM_MARGIN;
    
    // Calculate position based on chart index (0 = left, 1 = right)
    const isLeftChart = chartIndex === 0;
    const chartX = isLeftChart ? 20 : pageWidth / 2 + 10;
    const chartY = this.currentY;
    
    // Add section title
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(title, chartX, chartY);
    
    // Add description if provided
    let yOffset = 8;
    if (description) {
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(80, 80, 80);
      this.doc.text(description, chartX, chartY + yOffset);
      yOffset += 6;
    }
    
    // Add chart image with auto-resize to fit
    const imgHeight = this.CHART_HEIGHT;
    const imgWidth = this.CHART_WIDTH;
    this.doc.addImage(imgData, 'PNG', chartX, chartY + yOffset, imgWidth, imgHeight);
    
    // Only update Y position after both charts on the page
    if (!isLeftChart) {
      this.currentY += imgHeight + yOffset + 20; // Add spacing after second chart
    }
  }

  private addChartPlaceholder(title: string, reason: string): void {
    const pageWidth = 297; // A4 Landscape width
    const pageHeight = 210; // A4 Landscape height
    const availableHeight = pageHeight - this.TOP_MARGIN - this.BOTTOM_MARGIN;
    
    // Calculate position based on current chart index
    const chartX = this.currentY > this.TOP_MARGIN ? pageWidth / 2 + 10 : 20;
    const chartY = this.currentY > this.TOP_MARGIN ? this.currentY : this.TOP_MARGIN;
    
    // Add placeholder box
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(chartX, chartY, this.CHART_WIDTH, this.CHART_HEIGHT, 3, 3, 'S');
    
    // Add placeholder text
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(title, chartX + 10, chartY + this.CHART_HEIGHT / 2 - 5);
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(150, 150, 150);
    this.doc.text(`[${reason}]`, chartX + 10, chartY + this.CHART_HEIGHT / 2 + 10);
  }
}
