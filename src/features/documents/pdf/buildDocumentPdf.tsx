import type { ReactElement } from 'react';
import {
  AnyCommercialDocument,
  getDocumentNumber,
  getDocumentType,
  isApiDocument,
  isEstimate,
  isProposal,
  isQuotation,
} from '../utils/documentHelpers';
import { EstimatePDF } from './EstimatePDF';
import { ProposalPDF } from './ProposalPDF';
import { QuotationPDF } from './QuotationPDF';
import { InvoicePDF } from './InvoicePDF';

export interface CompanyPdfProps {
  companyName: string;
  companyLogo?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyGST?: string;
}

export function mapCompanyToPdfProps(company?: {
  companyName?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  mobile?: string;
  email?: string;
  gstNumber?: string;
}): CompanyPdfProps {
  const addressParts = [company?.address, company?.city, company?.state, company?.postalCode].filter(Boolean);
  return {
    companyName: company?.companyName ?? 'PEB Solutions',
    companyAddress: addressParts.join(', ') || undefined,
    companyPhone: company?.mobile,
    companyEmail: company?.email,
    companyGST: company?.gstNumber,
  };
}

export function getPdfAuthorizedBy(document: AnyCommercialDocument): string | undefined {
  if ('createdBy' in document && document.createdBy) return document.createdBy;
  if ('salesExecutive' in document && document.salesExecutive) return document.salesExecutive;
  return undefined;
}

export function getPdfFilename(document: AnyCommercialDocument): string {
  const type = getDocumentType(document);
  const number = getDocumentNumber(document);
  return `${type}-${number}.pdf`.replace(/\s+/g, '_');
}

export function buildDocumentPdfElement(
  document: AnyCommercialDocument,
  company: CompanyPdfProps,
  authorizedBy?: string,
  authorizedDesignation = 'Authorized Signatory'
): ReactElement {
  const common = {
    ...company,
    authorizedBy: authorizedBy ?? getPdfAuthorizedBy(document),
    authorizedDesignation,
  };

  if (isEstimate(document)) {
    return <EstimatePDF estimate={document} {...common} />;
  }
  if (isProposal(document)) {
    return <ProposalPDF proposal={document} {...common} />;
  }
  if (isQuotation(document)) {
    return <QuotationPDF quotation={document} {...common} />;
  }
  if (isApiDocument(document) && document.documentType === 'Invoice') {
    return <InvoicePDF invoice={document} {...common} />;
  }

  throw new Error(`PDF generation is not supported for this document type.`);
}
