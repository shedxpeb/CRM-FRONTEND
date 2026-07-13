'use client';

import { useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { FileText, Download, FileSpreadsheet, Calendar, Filter, BarChart3, PieChart, TrendingUp } from 'lucide-react';

export default function ProjectReportsPage() {
  const [reportType, setReportType] = useState('project-summary');
  const [dateRange, setDateRange] = useState('30');
  const [format, setFormat] = useState('pdf');

  const availableReports = [
    {
      id: 'project-summary',
      name: 'Project Summary Report',
      description: 'Overview of all projects with status, progress, and health metrics',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      id: 'milestone-report',
      name: 'Milestone Report',
      description: 'Track milestone completion and delays across all projects',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      id: 'budget-report',
      name: 'Budget vs Actual Report',
      description: 'Compare budgeted costs with actual spending by project',
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      id: 'resource-report',
      name: 'Resource Utilization Report',
      description: 'Analyze team workload and resource allocation',
      icon: <PieChart className="h-5 w-5" />,
    },
    {
      id: 'delay-report',
      name: 'Delayed Projects Report',
      description: 'Identify projects with timeline delays and critical issues',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      id: 'profit-report',
      name: 'Profit Margin Report',
      description: 'Analyze profitability across all completed projects',
      icon: <TrendingUp className="h-5 w-5" />,
    },
  ];

  const quickStats = [
    { label: 'Total Projects', value: '25', change: '+3', color: 'text-blue-600' },
    { label: 'Active Projects', value: '18', change: '+2', color: 'text-green-600' },
    { label: 'Delayed Projects', value: '3', change: '-1', color: 'text-red-600' },
    { label: 'Completed This Month', value: '2', change: '+1', color: 'text-purple-600' },
  ];

  return (
    <MainLayout title="Project Reports" subtitle="Generate and view project analytics">
      <div className="space-y-6">
        {/* Report Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Report Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableReports.map((report) => (
                      <SelectItem key={report.id} value={report.id}>
                        {report.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>

              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>

              <Button>
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {quickStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <span className={`text-sm ${stat.color}`}>{stat.change}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Available Reports */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Available Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-blue-100">
                      {report.icon}
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-base mb-2">{report.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Project Summary - Last 30 Days</p>
                    <p className="text-xs text-muted-foreground">Generated on Jun 2, 2026</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Budget vs Actual - Q1 2026</p>
                    <p className="text-xs text-muted-foreground">Generated on May 15, 2026</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Milestone Report - April 2026</p>
                    <p className="text-xs text-muted-foreground">Generated on Apr 30, 2026</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
