'use client';

import { MainLayout } from '@/layouts/MainLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { AnalyticsCharts } from '@/features/documents/components/AnalyticsCharts';
import { useDocumentStats, useDocuments } from '@/features/documents/hooks/useDocuments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  Clock, 
  BarChart3,
  Target,
  Users,
  Calendar,
} from 'lucide-react';

export function AnalyticsPage() {
  const { data: stats } = useDocumentStats();
  const { data: documentsResponse } = useDocuments({ page: 1, pageSize: 100 });

  const documents = (documentsResponse as any)?.data || [];
  
  const defaultStats = {
    totalEstimates: 0,
    totalProposals: 0,
    totalQuotations: 0,
    draftDocuments: 0,
    sentDocuments: 0,
    viewedDocuments: 0,
    acceptedDocuments: 0,
    rejectedDocuments: 0,
    expiredDocuments: 0,
    convertedDocuments: 0,
    pendingApprovals: 0,
    totalRevenuePipeline: 0,
    conversionRate: 0,
    averageDealSize: 0,
    monthlyDocuments: 0,
    monthlyRevenue: 0,
  };

  const safeStats = (stats as any) || defaultStats;

  // Mock chart data
  const chartData = [
    { month: 'Jan', documents: 12, revenue: 2500000, conversion: 25 },
    { month: 'Feb', documents: 15, revenue: 3200000, conversion: 28 },
    { month: 'Mar', documents: 18, revenue: 4100000, conversion: 30 },
    { month: 'Apr', documents: 14, revenue: 3800000, conversion: 27 },
    { month: 'May', documents: 20, revenue: 4500000, conversion: 32 },
    { month: 'Jun', documents: 22, revenue: 5200000, conversion: 35 },
  ];

  return (
    <MainLayout title="Analytics" subtitle="Document performance insights">
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <KPICard
            data={{
              title: 'Total Documents',
              value: (safeStats.totalEstimates + safeStats.totalProposals + safeStats.totalQuotations).toString(),
              change: 12,
              color: 'text-blue-600',
              icon: <FileText />,
            }}
          />
          <KPICard
            data={{
              title: 'Revenue Pipeline',
              value: `₹${(safeStats.totalRevenuePipeline / 1000000).toFixed(1)}M`,
              change: 8,
              color: 'text-green-600',
              icon: <DollarSign />,
            }}
          />
          <KPICard
            data={{
              title: 'Conversion Rate',
              value: `${safeStats.conversionRate}%`,
              change: 5,
              color: 'text-purple-600',
              icon: <Target />,
            }}
          />
          <KPICard
            data={{
              title: 'Avg Deal Size',
              value: `₹${(safeStats.averageDealSize / 1000).toFixed(0)}K`,
              change: 3,
              color: 'text-orange-600',
              icon: <TrendingUp />,
            }}
          />
        </div>

        {/* Document Type Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
          <KPICard
            data={{
              title: 'Estimates',
              value: safeStats.totalEstimates.toString(),
              change: 15,
              color: 'text-blue-600',
              icon: <FileText />,
            }}
          />
          <KPICard
            data={{
              title: 'Proposals',
              value: safeStats.totalProposals.toString(),
              change: 10,
              color: 'text-purple-600',
              icon: <FileText />,
            }}
          />
          <KPICard
            data={{
              title: 'Quotations',
              value: safeStats.totalQuotations.toString(),
              change: 8,
              color: 'text-green-600',
              icon: <FileText />,
            }}
          />
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <KPICard
            data={{
              title: 'Accepted',
              value: safeStats.acceptedDocuments.toString(),
              change: 12,
              color: 'text-green-600',
              icon: <CheckCircle />,
            }}
          />
          <KPICard
            data={{
              title: 'Pending',
              value: (safeStats.draftDocuments + safeStats.sentDocuments).toString(),
              change: -5,
              color: 'text-yellow-600',
              icon: <Clock />,
            }}
          />
          <KPICard
            data={{
              title: 'Converted',
              value: safeStats.convertedDocuments.toString(),
              change: 8,
              color: 'text-blue-600',
              icon: <CheckCircle />,
            }}
          />
          <KPICard
            data={{
              title: 'Pending Approvals',
              value: safeStats.pendingApprovals.toString(),
              change: -2,
              color: 'text-orange-600',
              icon: <Clock />,
            }}
          />
        </div>

        {/* Charts */}
        <AnalyticsCharts data={chartData} />

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Monthly Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{safeStats.monthlyDocuments}</p>
              <p className="text-sm text-gray-600 mt-1">Documents this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">₹{(safeStats.monthlyRevenue / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-gray-600 mt-1">Revenue this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-5 w-5" />
                Active Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {new Set(documents.map((d: any) => d.customerId)).size}
              </p>
              <p className="text-sm text-gray-600 mt-1">Unique customers</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600">Win Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {((safeStats.acceptedDocuments / (safeStats.totalEstimates + safeStats.totalProposals + safeStats.totalQuotations)) * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Time to Convert</p>
                <p className="text-2xl font-bold">14 days</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {((safeStats.viewedDocuments / safeStats.sentDocuments) * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Approval Rate</p>
                <p className="text-2xl font-bold text-purple-600">92%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
