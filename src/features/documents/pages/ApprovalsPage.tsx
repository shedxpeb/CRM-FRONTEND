'use client';

import { useState } from 'react';
import { MainLayout } from '@/layouts/MainLayout';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { DataTable } from '@/components/data-table/DataTable';
import { usePendingApprovals, useApprovalDecision } from '@/features/documents/hooks/useDocuments';
import { DocumentApproval } from '@/features/documents/types';
import { APPROVAL_STATUS_BADGE_VARIANTS } from '@/features/documents/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export function ApprovalsPage() {
  const { data: approvals, isLoading, refetch } = usePendingApprovals();
  const approvalDecision = useApprovalDecision();
  
  const [selectedApproval, setSelectedApproval] = useState<DocumentApproval | null>(null);
  const [isDecisionDialogOpen, setIsDecisionDialogOpen] = useState(false);
  const [decisionNotes, setDecisionNotes] = useState('');

  const handleApprove = (approval: DocumentApproval) => {
    setSelectedApproval(approval);
    setDecisionNotes('');
    setIsDecisionDialogOpen(true);
  };

  const handleReject = (approval: DocumentApproval) => {
    setSelectedApproval(approval);
    setDecisionNotes('');
    setIsDecisionDialogOpen(true);
  };

  const handleDecisionSubmit = async (decision: 'Approved' | 'Rejected') => {
    if (selectedApproval) {
      await approvalDecision.mutateAsync({
        approvalId: selectedApproval.id,
        decision,
        notes: decisionNotes,
      });
      setIsDecisionDialogOpen(false);
      setSelectedApproval(null);
      refetch();
    }
  };

  const columns = [
    {
      key: 'approvalNumber',
      label: 'Approval #',
      sortable: true,
    },
    {
      key: 'documentNumber',
      label: 'Document #',
      sortable: true,
    },
    {
      key: 'documentType',
      label: 'Document Type',
      sortable: true,
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'currentStep',
      label: 'Step',
      sortable: true,
      render: (value: number, row: DocumentApproval) => `${value} / ${row.totalSteps}`,
    },
    {
      key: 'currentApproverName',
      label: 'Current Approver',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <Badge variant={APPROVAL_STATUS_BADGE_VARIANTS[value as keyof typeof APPROVAL_STATUS_BADGE_VARIANTS]}>
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
      render: (_: any, row: DocumentApproval) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleApprove(row)}
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleReject(row)}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout title="Approvals" subtitle="Manage document approvals">
      <StandardPageLayout
        title="Approvals"
        subtitle="Manage document approvals"
        kpiCards={
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 shrink-0">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground truncate">Pending Approvals</p>
                  <p className="text-2xl font-bold">{(approvals as DocumentApproval[] | undefined)?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        }
        kpiGridClassName="grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={(approvals as DocumentApproval[] | undefined) || []}
              columns={columns as any}
              loading={isLoading}
              emptyMessage="No pending approvals"
            />
          </CardContent>
        </Card>
      </StandardPageLayout>

      <Dialog open={isDecisionDialogOpen} onOpenChange={setIsDecisionDialogOpen}>
        <DialogContent className="sm:max-w-lg w-[95vw]">
          <DialogHeader>
            <DialogTitle>
              {selectedApproval ? `Approval Decision for ${selectedApproval.documentNumber}` : 'Approval Decision'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium">Document: {selectedApproval?.documentNumber}</p>
              <p className="text-sm text-gray-600">Type: {selectedApproval?.documentType}</p>
              <p className="text-sm text-gray-600">Amount: ₹{selectedApproval?.amount?.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Current Step: {selectedApproval?.currentStep} / {selectedApproval?.totalSteps}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Input
                placeholder="Enter decision notes"
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDecisionDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDecisionSubmit('Rejected')}
                disabled={approvalDecision.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => handleDecisionSubmit('Approved')}
                disabled={approvalDecision.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
