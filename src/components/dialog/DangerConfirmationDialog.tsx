'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DangerConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  isDeleting?: boolean;
  title: string;
  entityName: string;
  consequences: string[];
  additionalInfo?: string;
  confirmText?: string;
}

export function DangerConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
  title,
  entityName,
  consequences,
  additionalInfo,
  confirmText = 'I understand the consequences of this action.',
}: DangerConfirmationDialogProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = async () => {
    if (!isConfirmed) return;
    await onConfirm();
    onOpenChange(false);
    setIsConfirmed(false);
  };

  const handleClose = () => {
    if (!isDeleting) {
      onOpenChange(false);
      setIsConfirmed(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <DialogTitle className="text-destructive">{title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <DialogDescription className="text-base">
            You are about to delete <span className="font-semibold">{entityName}</span>. This action
            cannot be undone.
          </DialogDescription>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">This will:</p>
            <ul className="space-y-1.5">
              {consequences.map((consequence, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-destructive mt-0.5">•</span>
                  <span>{consequence}</span>
                </li>
              ))}
            </ul>
          </div>

          {additionalInfo && (
            <div className="p-3 rounded-md bg-muted/50 border">
              <p className="text-xs text-muted-foreground">{additionalInfo}</p>
            </div>
          )}

          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="confirm-delete"
              checked={isConfirmed}
              onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
              disabled={isDeleting}
            />
            <label
              htmlFor="confirm-delete"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              {confirmText}
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmed || isDeleting}
            className="flex-1"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Pre-configured dialogs for common entities
export function DeleteLeadDialog(props: Omit<DangerConfirmationDialogProps, 'title' | 'consequences'>) {
  return (
    <DangerConfirmationDialog
      {...props}
      title="Delete Lead"
      consequences={[
        'Permanently remove this lead from the system',
        'Delete all associated activities, notes, and attachments',
        'Remove lead from any linked projects or quotations',
        'Clear all follow-up schedules and reminders',
        'Archive lead data for audit purposes (no recovery possible)',
      ]}
      additionalInfo="Related projects and quotations will be preserved but will no longer reference this lead."
    />
  );
}

export function DeleteCustomerDialog(props: Omit<DangerConfirmationDialogProps, 'title' | 'consequences'>) {
  return (
    <DangerConfirmationDialog
      {...props}
      title="Delete Customer"
      consequences={[
        'Permanently remove this customer from the system',
        'Delete all customer contact information and history',
        'Remove customer from all associated projects',
        'Cancel all pending quotations and proposals',
        'Clear all billing and payment records',
        'Archive customer data for compliance purposes',
      ]}
      additionalInfo="Projects will be preserved but marked as 'Unassigned'. Financial records will be archived for audit compliance."
    />
  );
}

export function DeleteProjectDialog(props: Omit<DangerConfirmationDialogProps, 'title' | 'consequences'>) {
  return (
    <DangerConfirmationDialog
      {...props}
      title="Delete Project"
      consequences={[
        'Permanently remove this project from the system',
        'Delete all project specifications and technical data',
        'Cancel all associated quotations, proposals, and estimates',
        'Remove all project tasks, milestones, and timelines',
        'Clear all project-related inventory allocations',
        'Archive project data for audit purposes',
      ]}
      additionalInfo="Related documents will be archived. Customer records will remain intact."
    />
  );
}

export function DeleteInventoryDialog(props: Omit<DangerConfirmationDialogProps, 'title' | 'consequences'>) {
  return (
    <DangerConfirmationDialog
      {...props}
      title="Delete Inventory Item"
      consequences={[
        'Permanently remove this inventory item',
        'Delete all stock movement history',
        'Remove item from all pending orders and allocations',
        'Clear reorder settings and warehouse assignments',
        'Archive inventory data for audit purposes',
      ]}
      additionalInfo="Item Master reference will be preserved. This only affects this specific inventory record."
    />
  );
}

export function DeleteDocumentDialog(props: Omit<DangerConfirmationDialogProps, 'title' | 'consequences'>) {
  return (
    <DangerConfirmationDialog
      {...props}
      title="Delete Document"
      consequences={[
        'Permanently remove this document',
        'Delete all document versions and history',
        'Remove document from all approval workflows',
        'Clear all document permissions and sharing settings',
        'Archive document metadata for audit purposes',
      ]}
      additionalInfo="Related projects and customers will remain intact. Only this document will be deleted."
    />
  );
}
