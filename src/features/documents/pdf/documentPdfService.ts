import type { AnyCommercialDocument } from '../utils/documentHelpers';
import {
  buildDocumentPdfElement,
  CompanyPdfProps,
  getPdfAuthorizedBy,
  getPdfFilename,
  mapCompanyToPdfProps,
} from './buildDocumentPdf';

export { mapCompanyToPdfProps, getPdfFilename, getPdfAuthorizedBy };

export async function generateDocumentPdfBlob(
  document: AnyCommercialDocument,
  company?: CompanyPdfProps,
  authorizedDesignation?: string
): Promise<Blob> {
  const { pdf } = await import('@react-pdf/renderer');
  const props = company ?? mapCompanyToPdfProps();
  const element = buildDocumentPdfElement(
    document,
    props,
    getPdfAuthorizedBy(document),
    authorizedDesignation
  );
  return pdf(element as Parameters<typeof pdf>[0]).toBlob();
}

export async function downloadDocumentPdf(
  document: AnyCommercialDocument,
  company?: CompanyPdfProps,
  authorizedDesignation?: string
): Promise<void> {
  const blob = await generateDocumentPdfBlob(document, company, authorizedDesignation);
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = getPdfFilename(document);
  link.click();
  URL.revokeObjectURL(url);
}

export async function createDocumentPdfPreviewUrl(
  document: AnyCommercialDocument,
  company?: CompanyPdfProps,
  authorizedDesignation?: string
): Promise<string> {
  const blob = await generateDocumentPdfBlob(document, company, authorizedDesignation);
  return URL.createObjectURL(blob);
}
