'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, ExternalLink, Printer, RefreshCw } from 'lucide-react';
import { fetchPdfBlob, getPdfUrl } from '../utils/format';
import { toast } from '@/components/ui/toast';

interface Props {
  poId: string;
  poNumber: string;
  revision?: number;
  vendorName?: string;
  status?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PurchaseOrderPdfViewer({ poId, poNumber, open, onOpenChange }: Props) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  const cleanupBlobUrl = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!open || !poId) return;
    setLoading(true);
    setError(null);
    cleanupBlobUrl();
    setPdfUrl(null);

    let cancelled = false;

    const loadPdf = async () => {
      try {
        const blob = await fetchPdfBlob(poId);
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setPdfUrl(url);
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load PDF');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [open, poId, cleanupBlobUrl]);

  useEffect(() => {
    if (!open) {
      cleanupBlobUrl();
      setPdfUrl(null);
      setError(null);
    }
  }, [open, cleanupBlobUrl]);

  const handleDownload = useCallback(() => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${poNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('PDF downloaded');
  }, [pdfUrl, poNumber]);

  const handlePrint = useCallback(() => {
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      iframe.contentWindow.print();
    }
  }, []);

  const handleOpenInNewTab = useCallback(() => {
    const url = getPdfUrl(poId);
    window.open(url, '_blank');
  }, [poId]);

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    setPdfUrl(null);
    cleanupBlobUrl();

    let cancelled = false;
    fetchPdfBlob(poId)
      .then((blob) => {
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setPdfUrl(url);
        setLoading(false);
      })
      .catch((err: any) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load PDF');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [poId, cleanupBlobUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex flex-row items-center justify-between">
          <div>
            <DialogTitle>PDF Preview &mdash; {poNumber}</DialogTitle>
            <DialogDescription>Purchase order PDF document</DialogDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
              disabled={loading || !!error}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={loading || !!error || !pdfUrl}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={loading || !!error || !pdfUrl}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </DialogHeader>
        <div className="px-6 pb-6">
          {loading && (
            <div className="space-y-3">
              <Skeleton className="h-[70vh] w-full" />
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" onClick={handleRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          )}
          {pdfUrl && !loading && !error && (
            <iframe
              ref={iframeRef}
              src={pdfUrl}
              className="w-full h-full border-0"
              style={{ minHeight: '70vh' }}
              title={`PDF Preview - ${poNumber}`}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
