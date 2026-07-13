'use client';

import { useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { FileText, Download, FileSpreadsheet, File, Calendar, Filter } from 'lucide-react';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('stock-summary');
  const [dateRange, setDateRange] = useState('30');
  const [format, setFormat] = useState('pdf');

  const reports = [
    { id: 'stock-summary', name: 'Stock Summary', description: 'Overview of all inventory items and stock levels' },
    { id: 'stock-valuation', name: 'Stock Valuation', description: 'Total value of inventory by category and warehouse' },
    { id: 'item-movement', name: 'Item Movement', description: 'Track stock movements for specific items' },
    { id: 'warehouse-report', name: 'Warehouse Report', description: 'Stock levels and occupancy by warehouse' },
    { id: 'supplier-report', name: 'Supplier Report', description: 'Purchase history and supplier performance' },
    { id: 'consumption-report', name: 'Consumption Report', description: 'Material consumption by project' },
    { id: 'shortage-report', name: 'Material Shortage', description: 'Items below minimum stock levels' },
    { id: 'reservation-report', name: 'Reservation Report', description: 'Reserved stock by project and status' },
  ];

  const handleExport = () => {
    // Export logic would go here
  };

  return (
    <MainLayout title="Inventory Reports" subtitle="Generate and export inventory reports">
      <div className="space-y-6">
        {/* Report Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Report Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reports.map((report) => (
                      <SelectItem key={report.id} value={report.id}>
                        {report.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last 1 year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Export Format</label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">From Date</label>
                  <Input type="date" value="" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">To Date</label>
                  <Input type="date" value="" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Reports */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Available Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reports.map((report) => (
              <Card
                key={report.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  reportType === report.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setReportType(report.id)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {report.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{report.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Export Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {dateRange === 'custom' ? 'Custom range' : `Last ${dateRange} days`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {reports.find((r) => r.id === reportType)?.name}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <File className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" size="sm">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export {format.toUpperCase()}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reports Generated This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">24</p>
              <p className="text-sm text-muted-foreground mt-1">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Most Downloaded Report</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">Stock Summary</p>
              <p className="text-sm text-muted-foreground mt-1">8 downloads this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Last Export</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">Stock Valuation</p>
              <p className="text-sm text-muted-foreground mt-1">2 hours ago by John Doe</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
