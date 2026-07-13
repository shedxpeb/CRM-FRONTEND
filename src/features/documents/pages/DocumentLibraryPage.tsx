'use client';

import { useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { DataTable } from '@/components/data-table/DataTable';
import { useDocuments } from '@/features/documents/hooks/useDocuments';
import { Document } from '@/features/documents/types';
import { DOCUMENT_STATUS_BADGE_VARIANTS } from '@/features/documents/constants';
import { FilterConfig } from '@/components/layout/FilterBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, Download, Eye, FileText, File, FileSpreadsheet } from 'lucide-react';

export function DocumentLibraryPage() {
  const { data: documentsResponse, isLoading } = useDocuments({ page: 1, pageSize: 100 });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Estimate' | 'Proposal' | 'Quotation'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const documents = (documentsResponse as any)?.data || [];

  const filteredDocuments = documents.filter((doc: Document) => {
    const matchesSearch = searchTerm
      ? doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    const matchesType = filterType === 'all' || doc.documentType === filterType;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const columns = [
    {
      key: 'documentNumber',
      label: 'Document #',
      sortable: true,
    },
    {
      key: 'documentType',
      label: 'Type',
      sortable: true,
      render: (value: string) => {
        const Icon = value === 'Estimate' ? FileText : value === 'Proposal' ? File : FileSpreadsheet;
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span>{value}</span>
          </div>
        );
      },
    },
    {
      key: 'customerName',
      label: 'Customer',
      sortable: true,
    },
    {
      key: 'projectName',
      label: 'Project',
      sortable: true,
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <Badge variant={DOCUMENT_STATUS_BADGE_VARIANTS[value as keyof typeof DOCUMENT_STATUS_BADGE_VARIANTS]}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value: Date) => value ? new Date(value).toLocaleDateString() : '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Document) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {}}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {}}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      key: 'type',
      label: 'Type',
      value: filterType,
      onChange: (value) => setFilterType(value as any),
      options: [
        { value: 'all', label: 'All Types' },
        { value: 'Estimate', label: 'Estimates' },
        { value: 'Proposal', label: 'Proposals' },
        { value: 'Quotation', label: 'Quotations' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      value: filterStatus,
      onChange: setFilterStatus,
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'Draft', label: 'Draft' },
        { value: 'Sent', label: 'Sent' },
        { value: 'Viewed', label: 'Viewed' },
        { value: 'Accepted', label: 'Accepted' },
        { value: 'Rejected', label: 'Rejected' },
        { value: 'Expired', label: 'Expired' },
        { value: 'Converted', label: 'Converted' },
      ],
    },
  ];

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterStatus('all');
  };

  const kpiCards = (
    <>
      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-2xl font-bold text-blue-600">
          {filteredDocuments.filter((d: Document) => d.documentType === 'Estimate').length}
        </p>
        <p className="text-sm text-gray-600">Estimates</p>
      </div>
      <div className="bg-purple-50 rounded-lg p-4">
        <p className="text-2xl font-bold text-purple-600">
          {filteredDocuments.filter((d: Document) => d.documentType === 'Proposal').length}
        </p>
        <p className="text-sm text-gray-600">Proposals</p>
      </div>
      <div className="bg-green-50 rounded-lg p-4">
        <p className="text-2xl font-bold text-green-600">
          {filteredDocuments.filter((d: Document) => d.documentType === 'Quotation').length}
        </p>
        <p className="text-sm text-gray-600">Quotations</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-2xl font-bold text-gray-600">
          {filteredDocuments.reduce((sum: number, d: Document) => sum + d.totalAmount, 0).toLocaleString()}
        </p>
        <p className="text-sm text-gray-600">Total Value (₹)</p>
      </div>
    </>
  );

  return (
    <MainLayout title="Document Library" subtitle="Browse and manage all documents">
      <StandardPageLayout
        title="Document Library"
        subtitle="Browse and manage all documents"
        kpiCards={kpiCards}
        kpiGridClassName="grid-cols-2 sm:grid-cols-4"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search documents..."
        filters={filterConfigs}
        onClearFilters={handleClearFilters}
        filterMode="popover"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              All Documents ({filteredDocuments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredDocuments}
              columns={columns as any}
              loading={isLoading}
              emptyMessage="No documents found"
            />
          </CardContent>
        </Card>
      </StandardPageLayout>
    </MainLayout>
  );
}
