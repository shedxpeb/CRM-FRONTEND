'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

interface DocumentPdfPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  pdfUrl: string | null;
  loading?: boolean;
  onDownload?: () => void;
  downloading?: boolean;
}

export function DocumentPdfPreviewDialog({
  open,
  onOpenChange,
  title,
  pdfUrl,
  loading = false,
  onDownload,
  downloading = false,
}: DocumentPdfPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-3 shrink-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 px-6 pb-2">
          {loading ? (
            <div className="flex items-center justify-center h-full min-h-[320px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              title={title}
              className="w-full h-full min-h-[480px] border rounded-md bg-muted/30"
            />
          ) : (
            <div className="flex items-center justify-center h-full min-h-[320px] text-sm text-muted-foreground">
              Unable to load PDF preview.
            </div>
          )}
        </div>
        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onDownload && (
            <Button onClick={onDownload} disabled={downloading || loading || !pdfUrl}>
              {downloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              Download PDF
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
