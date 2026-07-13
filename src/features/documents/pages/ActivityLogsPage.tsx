'use client';

import { useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { DocumentActivityTimeline } from '@/features/documents/components/DocumentActivityTimeline';
import { useDocumentActivities } from '@/features/documents/hooks/useDocuments';
import { DocumentActivity } from '@/features/documents/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, Search, Filter } from 'lucide-react';

export function ActivityLogsPage() {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>('1');
  const { data: activities, isLoading } = useDocumentActivities(selectedDocumentId);
  
  const [searchTerm, setSearchTerm] = useState('');

  const safeActivities: DocumentActivity[] = (activities as DocumentActivity[] | undefined) ?? [];

  const filteredActivities = searchTerm
    ? safeActivities.filter((activity) =>
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.performedBy.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : safeActivities;

  return (
    <MainLayout title="Activity Logs" subtitle="View document activity history">
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 max-w-lg xl:max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Document ID"
              value={selectedDocumentId}
              onChange={(e) => setSelectedDocumentId(e.target.value)}
              className="w-40"
            />
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentActivityTimeline activities={filteredActivities} />
          </CardContent>
        </Card>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-2">Activity Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-bold">{safeActivities.length}</p>
              <p className="text-xs text-gray-600">Total Activities</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {safeActivities.filter((a) => a.type.includes('created')).length}
              </p>
              <p className="text-xs text-gray-600">Created</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {safeActivities.filter((a) => a.type.includes('updated')).length}
              </p>
              <p className="text-xs text-gray-600">Updated</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {safeActivities.filter((a) => a.type.includes('sent')).length}
              </p>
              <p className="text-xs text-gray-600">Sent</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
