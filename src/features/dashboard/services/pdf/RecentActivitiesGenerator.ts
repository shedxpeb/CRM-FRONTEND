import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DashboardExportData, CompanyDetails } from '@/features/dashboard/types/pdf';

export class RecentActivitiesGenerator {
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
    
    // Add Recent Activities section
    currentY = this.addRecentActivities(currentY);
    
    // Add Recent Leads section
    if (currentY > 180) {
      this.doc.addPage();
      currentY = 20;
    }
    currentY = this.addRecentLeads(currentY);
    
    // Add Recent Quotations section
    if (currentY > 180) {
      this.doc.addPage();
      currentY = 20;
    }
    currentY = this.addRecentQuotations(currentY);
  }

  private addPageHeader(y: number): number {
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Page title
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Recent Activities', 20, y);
    
    // Subtitle
    this.doc.setTextColor(80, 80, 80);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Latest Activities Overview', 20, y + 10);
    
    // Divider line
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(1);
    this.doc.line(20, y + 15, 190, y + 15);
    
    return y + 30;
  }

  private addRecentActivities(y: number): number {
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Section header
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Recent Activities', 20, y);
    
    // Divider
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, y + 5, 190, y + 5);
    
    // Recent activities table
    const activitiesData = [
      ['Activity', 'Type', 'Date', 'User'],
      ['New lead created: John Smith', 'Lead', '2024-01-15', 'Admin'],
      ['Quotation sent to ABC Corp', 'Quotation', '2024-01-15', 'Sales'],
      ['Project status updated to In Progress', 'Project', '2024-01-14', 'Manager'],
      ['Customer order received', 'Order', '2024-01-14', 'Sales'],
      ['Inventory stock updated', 'Inventory', '2024-01-13', 'Warehouse'],
    ];
    
    // Add activities table
    autoTable(this.doc, {
      head: [activitiesData[0]],
      body: activitiesData.slice(1),
      startY: y + 12,
      margin: { left: 20, right: 20 },
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineWidth: 0.1,
        lineColor: [200, 200, 200],
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold' },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
      },
    });
    
    const finalY = (this.doc as any).lastAutoTable?.finalY || y + 50;
    return finalY + 15;
  }

  private addRecentLeads(y: number): number {
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Section header
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Recent Leads', 20, y);
    
    // Divider
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, y + 5, 190, y + 5);
    
    // Recent leads table
    const leadsData = [
      ['Lead Name', 'Company', 'Status', 'Value', 'Date'],
      ['John Smith', 'ABC Corp', 'Qualified', '$50,000', '2024-01-15'],
      ['Jane Doe', 'XYZ Ltd', 'New', '$75,000', '2024-01-15'],
      ['Mike Johnson', 'Tech Solutions', 'Proposal', '$120,000', '2024-01-14'],
      ['Sarah Wilson', 'Global Inc', 'Negotiation', '$200,000', '2024-01-14'],
      ['Tom Brown', 'StartUp Co', 'Won', '$45,000', '2024-01-13'],
    ];
    
    // Add leads table
    autoTable(this.doc, {
      head: [leadsData[0]],
      body: leadsData.slice(1),
      startY: y + 12,
      margin: { left: 20, right: 20 },
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineWidth: 0.1,
        lineColor: [200, 200, 200],
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold' },
        1: { halign: 'left' },
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'center' },
      },
      didParseCell: (data: any) => {
        // Color code status column
        if (data.section === 'body' && data.column.index === 2) {
          const value = String(data.cell.raw).toLowerCase();
          if (value === 'won' || value === 'qualified') {
            data.cell.styles.textColor = [34, 139, 34] as [number, number, number]; // Green
          } else if (value === 'new') {
            data.cell.styles.textColor = [108, 117, 125] as [number, number, number]; // Gray
          } else if (value === 'proposal' || value === 'negotiation') {
            data.cell.styles.textColor = [255, 165, 0] as [number, number, number]; // Orange
          }
        }
      },
    });
    
    const finalY = (this.doc as any).lastAutoTable?.finalY || y + 50;
    return finalY + 15;
  }

  private addRecentQuotations(y: number): number {
    const primaryColor = this.companyDetails.brandingColors.primary;
    
    // Section header
    this.doc.setTextColor(...primaryColor);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Recent Quotations', 20, y);
    
    // Divider
    this.doc.setDrawColor(...primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, y + 5, 190, y + 5);
    
    // Recent quotations table
    const quotationsData = [
      ['Quote #', 'Customer', 'Amount', 'Status', 'Date'],
      ['QT-001', 'ABC Corp', '$50,000', 'Sent', '2024-01-15'],
      ['QT-002', 'XYZ Ltd', '$75,000', 'Accepted', '2024-01-15'],
      ['QT-003', 'Tech Solutions', '$120,000', 'Draft', '2024-01-14'],
      ['QT-004', 'Global Inc', '$200,000', 'Sent', '2024-01-14'],
      ['QT-005', 'StartUp Co', '$45,000', 'Rejected', '2024-01-13'],
    ];
    
    // Add quotations table
    autoTable(this.doc, {
      head: [quotationsData[0]],
      body: quotationsData.slice(1),
      startY: y + 12,
      margin: { left: 20, right: 20 },
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineWidth: 0.1,
        lineColor: [200, 200, 200],
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold' },
        1: { halign: 'left' },
        2: { halign: 'right' },
        3: { halign: 'center' },
        4: { halign: 'center' },
      },
      didParseCell: (data: any) => {
        // Color code status column
        if (data.section === 'body' && data.column.index === 3) {
          const value = String(data.cell.raw).toLowerCase();
          if (value === 'accepted') {
            data.cell.styles.textColor = [34, 139, 34] as [number, number, number]; // Green
          } else if (value === 'rejected') {
            data.cell.styles.textColor = [220, 53, 69] as [number, number, number]; // Red
          } else if (value === 'sent') {
            data.cell.styles.textColor = [255, 165, 0] as [number, number, number]; // Orange
          } else if (value === 'draft') {
            data.cell.styles.textColor = [108, 117, 125] as [number, number, number]; // Gray
          }
        }
      },
    });
    
    const finalY = (this.doc as any).lastAutoTable?.finalY || y + 50;
    return finalY + 15;
  }
}
