'use client';

import { useCallback, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/layouts/MainLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/loading/CardSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { TrackingEngine } from '@/components/tracking/TrackingEngine';
import { ActivityAuditLog } from '@/components/tracking/ActivityAuditLog';
import { TaskDetailPage } from '@/features/task-management/components/TaskDetailPage';
import { TaskForm } from '@/features/task-management/components/TaskForm';
import { CompleteTaskDialog } from '@/features/task-management/components/CompleteTaskDialog';
import {
  useTask,
  useUpdateTask,
  useDeleteTask,
  useCompleteTask,
} from '@/features/task-management/hooks/useTaskManagement';
import { CompleteTaskDto, CreateTaskDto, UpdateTaskDto } from '@/features/task-management/types';
import { ROUTES } from '@/core/routes';
import { AlertTriangle } from 'lucide-react';

const CURRENT_USER_ID = 'user-1';
const CURRENT_USER_NAME = 'Current User';

export default function TaskManagementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const { data: task, isLoading, error } = useTask(taskId);
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const completeMutation = useCompleteTask();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(ROUTES.tasks);
    }
  }, [router]);

  const handleEditSubmit = (data: CreateTaskDto) => {
    updateMutation.mutate(
      { id: taskId, data: data as UpdateTaskDto },
      {
        onSuccess: () => setIsEditDialogOpen(false),
      }
    );
  };

  const handleCompleteSubmit = (data: CompleteTaskDto) => {
    completeMutation.mutate(
      { id: taskId, data },
      {
        onSuccess: () => setIsCompleteDialogOpen(false),
      }
    );
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(taskId, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        router.push(ROUTES.tasks);
      },
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <CardSkeleton count={4} />
      </MainLayout>
    );
  }

  if (error || !task) {
    return (
      <MainLayout>
        <ErrorState
          title="Task not found"
          message="The selected task could not be loaded."
          retryLabel="Back to Task Management"
          onRetry={() => router.push(ROUTES.tasks)}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <TaskDetailPage
          task={task}
          onBack={handleBack}
          onEdit={() => setIsEditDialogOpen(true)}
          onComplete={() => setIsCompleteDialogOpen(true)}
          onDelete={() => setIsDeleteDialogOpen(true)}
          isAdmin
          currentUserId={CURRENT_USER_ID}
          currentUserName={CURRENT_USER_NAME}
        />

        <TrackingEngine entityType="task" entityId={taskId} />

        <div className="border rounded-lg bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Activities & Audit Log</h3>
          <ActivityAuditLog entityType="task" entityId={taskId} />
        </div>
      </div>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            task={task}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Complete Task Dialog */}
      <CompleteTaskDialog
        open={isCompleteDialogOpen}
        onOpenChange={setIsCompleteDialogOpen}
        onSubmit={handleCompleteSubmit}
        isLoading={completeMutation.isPending}
        existingBeforeImages={task.completionProof?.beforeImages || []}
        existingChecklist={task.checklist || []}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <DialogTitle>Delete task</DialogTitle>
            </div>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{' '}
            <span className="font-medium text-foreground">{task.title}</span>? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
