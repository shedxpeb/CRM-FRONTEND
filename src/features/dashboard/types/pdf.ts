export interface CompanyDetails {
  logo?: string; // Base64 image data
  name: string;
  address: string;
  phone: string;
  email: string;
  gst: string;
  cin: string; // Corporate Identification Number
  website: string;
  brandingColors: {
    primary: [number, number, number]; // RGB values
    secondary: [number, number, number];
    accent: [number, number, number];
  };
}

// Comparison data for previous period
export interface ComparisonData {
  previousRevenue: string;
  previousLeads: number;
  previousProjects: number;
  previousCustomers: number;
  previousQuotations: number;
  previousInventory: string;
  revenueChangePercent: string;
  leadsChangePercent: string;
  projectsChangePercent: string;
  customersChangePercent: string;
  quotationsChangePercent: string;
  inventoryChangePercent: string;
}

// Record counts for metadata
export interface RecordCounts {
  leads: number;
  projects: number;
  customers: number;
  quotations: number;
  inventory: number;
  activities: number;
}

// Export data interface - separate from visual dashboard
// This allows data source to be switched from mock data to API without changing export logic
export interface DashboardExportData {
  kpis: {
    revenue: string;
    expectedRevenue: string;
    wonValue: string;
    activeProjects: number;
    leads: number;
    quotations: number;
    customers: number;
    inventory: string;
    revenueGrowth: string; // Percentage
    conversionRate: string; // Percentage
    topPerformingStage: string;
    // Enhanced KPI data for executive summary
    revenueChange: string; // "+12.5%" or "-5.2%"
    leadsChange: string;
    projectsChange: string;
    quotationsChange: string;
    customersChange: string;
    inventoryChange: string;
  };
  comparisonData: ComparisonData;
  recordCounts: RecordCounts;
  charts: ChartData[];
  tables: TableData[];
  filter: DateRange;
  generatedBy: string;
  generatedOn: string;
  exportVersion: string;
  system: string;
}

export interface ChartData {
  element: HTMLElement;
  title: string;
  description?: string;
  type: 'sales-pipeline' | 'revenue-trend' | 'quotation-status' | 'inventory-analytics' | 'project-pipeline';
}

export interface TableData {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  useLandscape?: boolean; // For wide tables
  showTotals?: boolean;
  showSummary?: boolean;
  columnStyles?: {
    [key: number]: {
      cellWidth?: number | 'auto';
      halign?: 'left' | 'center' | 'right';
      fontStyle?: 'normal' | 'bold' | 'italic';
      textColor?: [number, number, number];
      fillColor?: [number, number, number];
    };
  };
}

export type DateRange = 
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'last_quarter'
  | 'this_year'
  | 'last_year'
  | 'all_time';

export type ExportStatus = 'idle' | 'preparing' | 'rendering' | 'generating' | 'ready' | 'error';

export type ExportType = 'pdf' | 'excel' | 'csv';
