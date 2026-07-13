'use client';

import { useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { DataTable } from '@/components/data-table/DataTable';
import { useDocumentVersions, useCreateVersion } from '@/features/documents/hooks/useDocuments';
import { DocumentVersion } from '@/features/documents/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { GitBranch, Plus, Eye } from 'lucide-react';

export function VersionHistoryPage() {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>('');
  const { data: versions, isLoading, refetch } = useDocumentVersions(selectedDocumentId);
  const createVersion = useCreateVersion();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [changeDescription, setChangeDescription] = useState('');

  const handleCreateVersion = async () => {
    if (selectedDocumentId && changeDescription) {
      await createVersion.mutateAsync({
        documentId: selectedDocumentId,
        changeDescription,
      });
      setIsCreateDialogOpen(false);
      setChangeDescription('');
      refetch();
    }
  };

  const columns = [
    {
      key: 'version',
      label: 'Version',
      sortable: true,
      render: (value: number) => `v${value}`,
    },
    {
      key: 'documentNumber',
      label: 'Document #',
      sortable: true,
    },
    {
      key: 'documentType',
      label: 'Type',
      sortable: true,
    },
    {
      key: 'changeDescription',
      label: 'Change Description',
      sortable: true,
    },
    {
      key: 'changedBy',
      label: 'Changed By',
      sortable: true,
    },
    {
      key: 'changedAt',
      label: 'Changed At',
      sortable: true,
      render: (value: Date) => value ? new Date(value).toLocaleString() : '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: DocumentVersion) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {}}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <MainLayout title="Version History" subtitle="View document version history">
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 max-w-lg xl:max-w-xl">
            <Input
              placeholder="Enter Document ID to view versions"
              value={selectedDocumentId}
              onChange={(e) => setSelectedDocumentId(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            disabled={!selectedDocumentId}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Version
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Document Versions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={(versions as DocumentVersion[] | undefined) || []}
              columns={columns as any}
              loading={isLoading}
              emptyMessage={selectedDocumentId ? 'No versions found for this document' : 'Enter a Document ID to view versions'}
            />
          </CardContent>
        </Card>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Version</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Document ID</label>
                <Input value={selectedDocumentId} disabled />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Change Description *</label>
                <Input
                  placeholder="Describe the changes made"
                  value={changeDescription}
                  onChange={(e) => setChangeDescription(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateVersion}
                  disabled={!changeDescription || createVersion.isPending}
                >
                  {createVersion.isPending ? 'Creating...' : 'Create Version'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
