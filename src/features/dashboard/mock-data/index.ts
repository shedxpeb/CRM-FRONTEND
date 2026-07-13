/**
 * Dashboard Mock Data
 * Structured for future API integration
 * All data is frontend-only mock data
 */

import {
  DashboardKPIs,
  SalesFunnelData,
  RevenueTrendData,
  QuotationStatusData,
  ProjectPipelineData,
  InventoryAnalyticsData,
  Activity,
  RecentQuotation,
  RecentLead,
} from '../types';

// ============================================================================
// Executive KPI Mock Data
// ============================================================================

export const mockExecutiveKPIs: DashboardKPIs = {
  revenue: 4558000,
  expectedRevenue: 3970000,
  wonValue: 890000,
  activeProjects: 63,
  leads: 156,
  quotations: 93,
  customers: 89,
  inventoryValue: 485000,
};

// ============================================================================
// Sales Funnel Mock Data
// ============================================================================

export const mockSalesFunnel: SalesFunnelData[] = [
  { name: 'Lead', value: 156, color: '#3b82f6' },
  { name: 'Qualified', value: 89, color: '#10b981' },
  { name: 'Quotation', value: 62, color: '#f59e0b' },
  { name: 'Negotiation', value: 45, color: '#ef4444' },
  { name: 'Won', value: 28, color: '#8b5cf6' },
];

// ============================================================================
// Revenue Trend Mock Data (12 Months)
// ============================================================================

export const mockRevenueTrend12Months: RevenueTrendData[] = [
  { name: 'Jul 2025', revenue: 185000 },
  { name: 'Aug 2025', revenue: 210000 },
  { name: 'Sep 2025', revenue: 245000 },
  { name: 'Oct 2025', revenue: 278000 },
  { name: 'Nov 2025', revenue: 320000 },
  { name: 'Dec 2025', revenue: 355000 },
  { name: 'Jan 2026', revenue: 390000 },
  { name: 'Feb 2026', revenue: 425000 },
  { name: 'Mar 2026', revenue: 460000 },
  { name: 'Apr 2026', revenue: 495000 },
  { name: 'May 2026', revenue: 530000 },
  { name: 'Jun 2026', revenue: 565000 },
];

// ============================================================================
// Quotation Status Mock Data
// ============================================================================

export const mockQuotationStatus: QuotationStatusData[] = [
  { name: 'Draft', value: 12, color: '#6b7280' },
  { name: 'Sent', value: 28, color: '#3b82f6' },
  { name: 'Approved', value: 45, color: '#10b981' },
  { name: 'Rejected', value: 8, color: '#ef4444' },
];

// ============================================================================
// Project Pipeline Mock Data
// ============================================================================

export const mockProjectPipeline: ProjectPipelineData[] = [
  { stage: 'Planning', count: 8, value: 450000, percentage: '13.3', color: '#3b82f6' },
  { stage: 'Design', count: 12, value: 680000, percentage: '20.0', color: '#10b981' },
  { stage: 'Procurement', count: 15, value: 890000, percentage: '25.0', color: '#f59e0b' },
  { stage: 'Fabrication', count: 18, value: 1200000, percentage: '30.0', color: '#ef4444' },
  { stage: 'Installation', count: 10, value: 750000, percentage: '16.7', color: '#8b5cf6' },
  { stage: 'Completed', count: 5, value: 890000, percentage: '8.3', color: '#06b6d4' },
];

// ============================================================================
// Inventory Analytics Mock Data
// ============================================================================

export const mockInventoryAnalytics: InventoryAnalyticsData[] = [
  { name: 'Available', value: 450, color: '#10b981' },
  { name: 'Reserved', value: 120, color: '#3b82f6' },
  { name: 'Low Stock', value: 35, color: '#ef4444' },
];

export const mockInventoryTotalValue = 485000;

// ============================================================================
// Recent Activities Mock Data
// ============================================================================

export const mockRecentActivities: Activity[] = [
  {
    id: '1',
    type: 'lead',
    title: 'New Lead Added',
    description: 'ABC Construction - Warehouse Expansion Project',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    user: 'Vikram Singh',
    status: 'New',
  },
  {
    id: '2',
    type: 'project',
    title: 'Project Phase Completed',
    description: 'Warehouse Project - Design Phase Done',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    user: 'John Doe',
    status: 'Design',
  },
  {
    id: '3',
    type: 'quotation',
    title: 'Quotation Approved',
    description: 'QT-2026-001 - $45,000 - ABC Construction',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    user: 'Jane Smith',
    status: 'Approved',
  },
  {
    id: '4',
    type: 'project',
    title: 'Procurement Started',
    description: 'Factory Shed Project - Materials Ordered',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    user: 'Mike Johnson',
    status: 'Procurement',
  },
  {
    id: '5',
    type: 'lead',
    title: 'Lead Converted to Customer',
    description: 'XYZ Industries - Won Deal',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    user: 'Sneha Reddy',
    status: 'Won',
  },
];

// ============================================================================
// Recent Quotations Mock Data
// ============================================================================

export const mockRecentQuotations: RecentQuotation[] = [
  {
    id: '1',
    quotationNumber: 'QT-2026-001',
    customerName: 'ABC Construction',
    amount: 45000,
    status: 'Approved',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    quotationNumber: 'QT-2026-002',
    customerName: 'XYZ Industries',
    amount: 62000,
    status: 'Sent',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    quotationNumber: 'QT-2026-003',
    customerName: 'DEF Builders',
    amount: 38000,
    status: 'Draft',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    quotationNumber: 'QT-2026-004',
    customerName: 'GHI Structures',
    amount: 75000,
    status: 'Sent',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: '5',
    quotationNumber: 'QT-2026-005',
    customerName: 'MNO Steel Works',
    amount: 52000,
    status: 'Approved',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

// ============================================================================
// Recent Leads Mock Data
// ============================================================================

export const mockRecentLeads: RecentLead[] = [
  {
    id: '1',
    companyName: 'ABC Construction',
    projectTitle: 'Warehouse Expansion',
    source: 'Website',
    assignedTo: 'Vikram Singh',
    status: 'New',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    companyName: 'XYZ Industries',
    projectTitle: 'Factory Shed',
    source: 'Referral',
    assignedTo: 'Sneha Reddy',
    status: 'Qualified',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    companyName: 'DEF Builders',
    projectTitle: 'Industrial Shed',
    source: 'Cold Call',
    assignedTo: 'Rajesh Kumar',
    status: 'Quotation',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    companyName: 'GHI Structures',
    projectTitle: 'Commercial Complex',
    source: 'Email',
    assignedTo: 'Neha Gupta',
    status: 'Negotiation',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: '5',
    companyName: 'MNO Steel Works',
    projectTitle: 'Residential Building',
    source: 'Social Media',
    assignedTo: 'Anita Desai',
    status: 'Won',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

// ============================================================================
// Complete Dashboard Mock Data (for easy import)
// ============================================================================

export const mockDashboardData = {
  executiveKPIs: mockExecutiveKPIs,
  salesFunnel: mockSalesFunnel,
  revenueTrend12Months: mockRevenueTrend12Months,
  quotationStatus: mockQuotationStatus,
  projectPipeline: mockProjectPipeline,
  inventoryAnalytics: mockInventoryAnalytics,
  inventoryTotalValue: mockInventoryTotalValue,
  recentActivities: mockRecentActivities,
  recentQuotations: mockRecentQuotations,
  recentLeads: mockRecentLeads,
};
