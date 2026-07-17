'use client';

import { MainLayout } from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import {
  FileText,
  Download,
  FileSpreadsheet,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
} from 'lucide-react';
import { useProjectsStats } from '@/features/projects/hooks/useProjects';
import { toast } from '@/components/ui/toast';

export default function ProjectReportsPage() {
  const [reportType, setReportType] = useState('project-summary');
  const [dateRange, setDateRange] = useState('30');
  const [format, setFormat] = useState('pdf');
  const { data: statsResponse, isLoading, isError } = useProjectsStats(true);
  const stats = (statsResponse as any)?.data?.data ?? (statsResponse as any)?.data ?? null;

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
    {
      label: 'Total Projects',
      value: isLoading ? '…' : String(stats?.totalProjects ?? 0),
      color: 'text-blue-600',
    },
    {
      label: 'Active Projects',
      value: isLoading ? '…' : String(stats?.activeProjects ?? 0),
      color: 'text-green-600',
    },
    {
      label: 'Delayed Projects',
      value: isLoading ? '…' : String(stats?.delayedProjects ?? 0),
      color: 'text-red-600',
    },
    {
      label: 'Completed',
      value: isLoading ? '…' : String(stats?.completedProjects ?? 0),
      color: 'text-purple-600',
    },
  ];

  const handleGenerate = () => {
    toast.error('Report generation is not available yet. Use project list export for raw data.');
  };

  return (
    <MainLayout title="Project Reports" subtitle="Generate and view project analytics">
      <div className="space-y-6">
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

              <Button onClick={handleGenerate}>
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Report file generation is not available yet. KPI cards below use live project stats.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {quickStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                {isError && (
                  <p className="text-xs text-destructive mt-1">Stats unavailable</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Available Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-blue-100">{report.icon}</div>
                    <Button variant="ghost" size="sm" onClick={handleGenerate}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-base mb-2">{report.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={handleGenerate}>
                      <FileText className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={handleGenerate}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
