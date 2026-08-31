'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { useCompany } from '@/features/settings/hooks/useSettings';
import { apiClient } from '@/core/api';
import type { Company } from '@/features/settings/types';
import { DocumentPdfPreviewDialog } from '../components/DocumentPdfPreviewDialog';
import { AnyCommercialDocument, getDocumentNumber, getDocumentType } from '../utils/documentHelpers';
import {
  createDocumentPdfPreviewUrl,
  downloadDocumentPdf,
  getPdfFilename,
  mapCompanyToPdfProps,
} from '../pdf/documentPdfService';

export function useDocumentPdfActions() {
  const { data: company } = useCompany();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState('Document PDF');
  const [previewDocument, setPreviewDocument] = useState<AnyCommercialDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const previewUrlRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const companyPdfProps = useMemo(
    () =>
      mapCompanyToPdfProps({
        companyName: (company as Company | undefined)?.companyName,
        address: (company as Company | undefined)?.address,
        city: (company as Company | undefined)?.city,
        state: (company as Company | undefined)?.state,
        postalCode: (company as Company | undefined)?.postalCode,
        mobile: (company as Company | undefined)?.mobile,
        email: (company as Company | undefined)?.email,
        gstNumber: (company as Company | undefined)?.gstNumber,
      }),
    [company]
  );

  const revokePreviewUrl = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
  }, []);

  const closePreview = useCallback(() => {
    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setPreviewOpen(false);
    revokePreviewUrl();
    setPreviewDocument(null);
  }, [revokePreviewUrl]);

  const handlePreviewOpenChange = useCallback(
    (open: boolean) => {
      if (!open) closePreview();
      else setPreviewOpen(true);
    },
    [closePreview]
  );

  // ─── Client-side PDF (existing React-PDF flow) ──────────────────────────

  const previewPdf = useCallback(
    async (document: AnyCommercialDocument) => {
      setLoading(true);
      setPreviewOpen(true);
      setPreviewDocument(document);
      setPreviewTitle(`${getDocumentType(document)} ${getDocumentNumber(document)}`);
      revokePreviewUrl();
      try {
        const url = await createDocumentPdfPreviewUrl(document, companyPdfProps);
        previewUrlRef.current = url;
        setPreviewUrl(url);
      } catch (error) {
        setPreviewUrl(null);
      } finally {
        setLoading(false);
      }
    },
    [companyPdfProps, revokePreviewUrl]
  );

  const downloadPdf = useCallback(
    async (document: AnyCommercialDocument) => {
      setDownloading(true);
      try {
        await downloadDocumentPdf(document, companyPdfProps);
      } catch (error) {
        // Failed to download PDF
      } finally {
        setDownloading(false);
      }
    },
    [companyPdfProps]
  );

  // ─── Server-side PDF (backend Playwright + Handlebars) ─────────────────

  const generateServerPdf = useCallback(async (document: AnyCommercialDocument): Promise<Blob | null> => {
    const doc = document as unknown as Record<string, unknown>;
    const id = doc.id as string;
    if (!id) return null;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoading(true);
      const response = await apiClient.get(`/quotations/${id}/pdf`, {
        responseType: 'blob',
        signal: controller.signal as any,
      });

      // response.data is already a Blob from axios responseType: 'blob'
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: 'application/pdf' });
      return blob;
    } catch (error: any) {
      if (error?.name === 'CanceledError' || error?.name === 'AbortError') {
        return null;
      }
      throw error;
    } finally {
      abortControllerRef.current = null;
      setLoading(false);
    }
  }, []);

  const previewServerPdf = useCallback(
    async (document: AnyCommercialDocument) => {
      setPreviewOpen(true);
      setPreviewDocument(document);
      setPreviewTitle(`Quotation ${(document as unknown as Record<string, unknown>).quotationNumber || getDocumentNumber(document)}`);
      revokePreviewUrl();

      try {
        const blob = await generateServerPdf(document);
        if (blob) {
          const url = URL.createObjectURL(blob);
          previewUrlRef.current = url;
          setPreviewUrl(url);
        }
      } catch (error) {
        setPreviewUrl(null);
      }
    },
    [generateServerPdf, revokePreviewUrl]
  );

  const downloadServerPdf = useCallback(
    async (document: AnyCommercialDocument) => {
      setDownloading(true);
      try {
        // Reuse existing blob if preview is open for same document
        if (previewUrlRef.current && previewDocument?.id === document.id) {
          const link = window.document.createElement('a');
          link.href = previewUrlRef.current;
          link.download = `${(document as unknown as Record<string, unknown>).quotationNumber || 'quotation'}.pdf`;
          link.click();
        } else {
          const blob = await generateServerPdf(document);
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = window.document.createElement('a');
            link.href = url;
            link.download = `${(document as unknown as Record<string, unknown>).quotationNumber || 'quotation'}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
          }
        }
      } catch (error) {
        // Failed to download PDF
      } finally {
        setDownloading(false);
      }
    },
    [generateServerPdf, previewDocument]
  );

  const downloadPreviewPdf = useCallback(async () => {
    if (!previewDocument) return;
    setDownloading(true);
    try {
      if (previewUrlRef.current) {
        const link = window.document.createElement('a');
        link.href = previewUrlRef.current;
        link.download = getPdfFilename(previewDocument);
        link.click();
      } else {
        await downloadDocumentPdf(previewDocument, companyPdfProps);
      }
    } catch (error) {
      // Failed to download PDF
    } finally {
      setDownloading(false);
    }
  }, [previewDocument, companyPdfProps]);

  const PdfPreviewDialog = (
    <DocumentPdfPreviewDialog
      open={previewOpen}
      onOpenChange={handlePreviewOpenChange}
      title={previewTitle}
      pdfUrl={previewUrl}
      loading={loading}
      onDownload={previewDocument ? downloadPreviewPdf : undefined}
      downloading={downloading}
    />
  );

  return {
    previewPdf,
    downloadPdf,
    previewServerPdf,
    downloadServerPdf,
    generateServerPdf,
    PdfPreviewDialog,
    pdfLoading: loading,
    pdfDownloading: downloading,
  };
}
