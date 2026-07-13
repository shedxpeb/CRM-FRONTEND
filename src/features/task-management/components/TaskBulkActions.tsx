'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Task, TaskStatus, TaskPriority } from '../types';
import {
  CheckSquare,
  Trash2,
  User,
  Tag,
  Download,
  Archive,
  AlertTriangle,
} from 'lucide-react';

interface TaskBulkActionsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTasks: Task[];
  onBulkComplete: (taskIds: string[]) => void;
  onBulkDelete: (taskIds: string[]) => void;
  onBulkAssign: (taskIds: string[], userId: string) => void;
  onBulkChangePriority: (taskIds: string[], priority: TaskPriority) => void;
  onBulkChangeStatus: (taskIds: string[], status: TaskStatus) => void;
  onBulkExport: (taskIds: string[]) => void;
  onBulkArchive: (taskIds: string[]) => void;
  employees: Array<{ id: string; name: string }>;
}

type BulkAction = 'complete' | 'delete' | 'assign' | 'changePriority' | 'changeStatus' | 'export' | 'archive';

export const TaskBulkActions: React.FC<TaskBulkActionsProps> = ({
  isOpen,
  onClose,
  selectedTasks,
  onBulkComplete,
  onBulkDelete,
  onBulkAssign,
  onBulkChangePriority,
  onBulkChangeStatus,
  onBulkExport,
  onBulkArchive,
  employees,
}) => {
  const [selectedAction, setSelectedAction] = useState<BulkAction | null>(null);
  const [targetUserId, setTargetUserId] = useState('');
  const [targetPriority, setTargetPriority] = useState<TaskPriority | ''>('');
  const [targetStatus, setTargetStatus] = useState<TaskStatus | ''>('');

  const taskIds = selectedTasks.map(task => task.id);

  const handleActionSelect = (action: BulkAction) => {
    setSelectedAction(action);
  };

  const handleExecute = () => {
    switch (selectedAction) {
      case 'complete':
        onBulkComplete(taskIds);
        break;
      case 'delete':
        onBulkDelete(taskIds);
        break;
      case 'assign':
        if (targetUserId) {
          onBulkAssign(taskIds, targetUserId);
        }
        break;
      case 'changePriority':
        if (targetPriority) {
          onBulkChangePriority(taskIds, targetPriority);
        }
        break;
      case 'changeStatus':
        if (targetStatus) {
          onBulkChangeStatus(taskIds, targetStatus);
        }
        break;
      case 'export':
        onBulkExport(taskIds);
        break;
      case 'archive':
        onBulkArchive(taskIds);
        break;
    }
    handleClose();
  };

  const handleClose = () => {
    setSelectedAction(null);
    setTargetUserId('');
    setTargetPriority('');
    setTargetStatus('');
    onClose();
  };

  const renderActionContent = () => {
    switch (selectedAction) {
      case 'assign':
        return (
          <div className="space-y-4">
            <div>
              <Label>Assign To</Label>
              <Select value={targetUserId} onValueChange={setTargetUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              This will reassign {selectedTasks.length} task(s) to the selected employee.
            </p>
          </div>
        );

      case 'changePriority':
        return (
          <div className="space-y-4">
            <div>
              <Label>New Priority</Label>
              <Select value={targetPriority} onValueChange={(value) => setTargetPriority(value as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              This will change the priority of {selectedTasks.length} task(s).
            </p>
          </div>
        );

      case 'changeStatus':
        return (
          <div className="space-y-4">
            <div>
              <Label>New Status</Label>
              <Select value={targetStatus} onValueChange={(value) => setTargetStatus(value as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Reopened">Reopened</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              This will change the status of {selectedTasks.length} task(s).
            </p>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-4">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto" />
            <p className="text-center text-sm">
              Are you sure you want to mark {selectedTasks.length} task(s) as completed?
            </p>
            <p className="text-center text-xs text-muted-foreground">
              This action cannot be undone.
            </p>
          </div>
        );

      case 'delete':
        return (
          <div className="space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
            <p className="text-center text-sm">
              Are you sure you want to delete {selectedTasks.length} task(s)?
            </p>
            <p className="text-center text-xs text-muted-foreground">
              This action cannot be undone.
            </p>
          </div>
        );

      case 'archive':
        return (
          <div className="space-y-4">
            <Archive className="h-12 w-12 text-blue-500 mx-auto" />
            <p className="text-center text-sm">
              Are you sure you want to archive {selectedTasks.length} task(s)?
            </p>
            <p className="text-center text-xs text-muted-foreground">
              Archived tasks will be hidden from the main view.
            </p>
          </div>
        );

      case 'export':
        return (
          <div className="space-y-4">
            <Download className="h-12 w-12 text-green-500 mx-auto" />
            <p className="text-center text-sm">
              Export {selectedTasks.length} task(s) to CSV
            </p>
            <p className="text-center text-xs text-muted-foreground">
              The exported file will include all task details.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const isExecuteDisabled = () => {
    if (selectedAction === 'assign') return !targetUserId;
    if (selectedAction === 'changePriority') return !targetPriority;
    if (selectedAction === 'changeStatus') return !targetStatus;
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {selectedAction ? (
              <span className="flex items-center gap-2">
                {selectedAction === 'complete' && <CheckSquare className="h-5 w-5" />}
                {selectedAction === 'delete' && <Trash2 className="h-5 w-5" />}
                {selectedAction === 'assign' && <User className="h-5 w-5" />}
                {selectedAction === 'changePriority' && <Tag className="h-5 w-5" />}
                {selectedAction === 'changeStatus' && <Tag className="h-5 w-5" />}
                {selectedAction === 'export' && <Download className="h-5 w-5" />}
                {selectedAction === 'archive' && <Archive className="h-5 w-5" />}
                {selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1)} {selectedTasks.length} Task(s)
              </span>
            ) : (
              'Bulk Actions'
            )}
          </DialogTitle>
        </DialogHeader>

        {!selectedAction ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                {selectedTasks.length} task(s) selected
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => handleActionSelect('complete')}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Complete
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => handleActionSelect('assign')}
              >
                <User className="h-4 w-4 mr-2" />
                Assign
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => handleActionSelect('changePriority')}
              >
                <Tag className="h-4 w-4 mr-2" />
                Change Priority
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => handleActionSelect('changeStatus')}
              >
                <Tag className="h-4 w-4 mr-2" />
                Change Status
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => handleActionSelect('export')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => handleActionSelect('archive')}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
            </div>

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => handleActionSelect('delete')}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected Tasks
            </Button>
          </div>
        ) : (
          <div className="py-4">
            {renderActionContent()}
          </div>
        )}

        <DialogFooter>
          {selectedAction && (
            <>
              <Button variant="outline" onClick={() => setSelectedAction(null)}>
                Back
              </Button>
              <Button
                onClick={handleExecute}
                disabled={isExecuteDisabled()}
                variant={selectedAction === 'delete' ? 'destructive' : 'default'}
              >
                Confirm
              </Button>
            </>
          )}
          {!selectedAction && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
