'use client';

import {
  DocumentPrintModel,
  PrintCompanyInfo,
  getDefaultSignatureTerms,
} from '@/features/documents/utils/documentPrintData';
import './document-print.css';

function formatCurrency(amount?: number | string) {
  if (amount === undefined || amount === null || amount === '-') return '-';
  const num = typeof amount === 'string' ? Number(amount) : amount;
  if (Number.isNaN(num)) return String(amount);
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(date?: Date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function FieldRow({ label, value }: { label: string; value?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-[9pt] mb-1">
      <span className="font-semibold min-w-[110px]">{label}:</span>
      <span className="flex-1 break-words">{value}</span>
    </div>
  );
}

interface DocumentPrintViewProps {
  model: DocumentPrintModel;
  company: PrintCompanyInfo;
  authorizedBy?: string;
  authorizedDesignation?: string;
  mode?: 'print' | 'preview';
}

export function DocumentPrintView({ model, company, authorizedBy, authorizedDesignation, mode = 'print' }: DocumentPrintViewProps) {
  const typeClass = `document-print-type-${model.documentType.toLowerCase()}`;
  const signatureTerms = getDefaultSignatureTerms(model.documentType);

  return (
    <div
      className={`${mode === 'print' ? 'document-print-root' : 'document-print-preview border rounded-lg bg-white shadow-sm my-4'} ${typeClass}`}
      id={mode === 'print' ? 'document-print-source' : undefined}
    >
      <div className="document-print-page">
        {/* Company Header */}
        <header className="document-print-header document-print-section">
          <div className="flex-1">
            <div className="document-print-company-name document-print-accent">{company.name}</div>
            {company.legalName && <div className="text-[9pt] text-gray-600">{company.legalName}</div>}
            <div className="text-[9pt] mt-1">
              {[company.address, company.city, company.state, company.postalCode].filter(Boolean).join(', ')}
            </div>
            {company.phone && <div className="text-[9pt]">Phone: {company.phone}</div>}
            {company.email && <div className="text-[9pt]">Email: {company.email}</div>}
            {company.gst && <div className="text-[9pt]">GSTIN: {company.gst}</div>}
            {company.website && <div className="text-[9pt]">{company.website}</div>}
          </div>
          <div>
            <div className="document-print-doc-type document-print-accent">{model.documentType}</div>
            <div className="text-[10pt] text-right font-mono">#{model.documentNumber}</div>
            <div className="text-[9pt] text-right">Date: {formatDate(model.documentDate)}</div>
            {model.validUntil && (
              <div className="text-[9pt] text-right text-red-700">
                {model.documentType === 'Invoice' ? 'Due Date' : 'Valid Until'}: {formatDate(model.validUntil)}
              </div>
            )}
            {model.version && <div className="text-[9pt] text-right">Version: v{model.version}</div>}
            <div className="text-[9pt] text-right">Status: {model.status}</div>
          </div>
        </header>

        {/* Customer + Project */}
        <section className="document-print-section document-print-grid-2">
          <div className="document-print-box">
            <div className="document-print-section-title">Customer Information</div>
            <FieldRow label="Customer" value={model.customerName} />
            <FieldRow label="Address" value={model.customerAddress} />
            <FieldRow label="Phone" value={model.customerPhone} />
            <FieldRow label="Email" value={model.customerEmail} />
            <FieldRow label="GSTIN" value={model.customerGst} />
          </div>
          <div className="document-print-box">
            <div className="document-print-section-title">Project Information</div>
            <FieldRow label="Project" value={model.projectName} />
            <FieldRow label="Lead #" value={model.leadNumber} />
            {model.sourceDocumentLabel && (
              <FieldRow label={model.sourceDocumentLabel} value={model.sourceDocumentNumber} />
            )}
            {model.proposalSections?.proposalNumber && (
              <FieldRow label="Proposal #" value={model.proposalSections.proposalNumber} />
            )}
            {model.proposalSections?.estimateNumber && (
              <FieldRow label="Estimate #" value={model.proposalSections.estimateNumber} />
            )}
            {model.quotationSections?.sourceEstimateNumber && (
              <FieldRow label="Estimate #" value={model.quotationSections.sourceEstimateNumber} />
            )}
            {model.invoiceSections?.convertedFrom && (
              <FieldRow label="Converted From" value={`${model.invoiceSections.convertedFrom} ${model.invoiceSections.convertedDocumentId ?? ''}`} />
            )}
            <FieldRow label="Prepared By" value={model.createdBy} />
          </div>
        </section>

        {/* Document Metadata — type-specific */}
        {model.documentType === 'Estimate' && model.estimateSections && (
          <section className="document-print-section">
            <div className="document-print-section-title">Estimate Scope Summary</div>
            <div className="document-print-grid-2">
              {model.estimateSections.technicalSpecs.length > 0 && (
                <div className="document-print-box">
                  <div className="font-semibold text-[9pt] mb-2">Technical Specifications</div>
                  {model.estimateSections.technicalSpecs.map((s) => (
                    <FieldRow key={s.label} label={s.label} value={s.value} />
                  ))}
                </div>
              )}
              <div className="document-print-box">
                <div className="font-semibold text-[9pt] mb-2">Scope Configuration</div>
                {model.estimateSections.scopeItems.map((item) => (
                  <FieldRow key={item.name} label={item.name} value={item.state} />
                ))}
              </div>
            </div>
          </section>
        )}

        {model.documentType === 'Proposal' && model.proposalSections && (
          <section className="document-print-section">
            <div className="document-print-section-title">Proposal Presentation</div>
            {model.proposalSections.companyProfile && (
              <div className="document-print-box mb-3">
                <div className="font-semibold text-[9pt] mb-1">Company Profile</div>
                <p className="text-[9pt] whitespace-pre-wrap">{model.proposalSections.companyProfile}</p>
              </div>
            )}
            {model.proposalSections.projectOverview && (
              <div className="document-print-box mb-3">
                <div className="font-semibold text-[9pt] mb-1">Project Overview</div>
                <p className="text-[9pt] whitespace-pre-wrap">{model.proposalSections.projectOverview}</p>
              </div>
            )}
            {model.proposalSections.scopeOfWork && (
              <div className="document-print-box mb-3">
                <div className="font-semibold text-[9pt] mb-1">Scope of Work</div>
                <p className="text-[9pt] whitespace-pre-wrap">{model.proposalSections.scopeOfWork}</p>
              </div>
            )}
            {model.proposalSections.timeline && (
              <div className="document-print-box mb-3">
                <div className="font-semibold text-[9pt] mb-1">Project Timeline</div>
                <p className="text-[9pt]">{model.proposalSections.timeline}</p>
              </div>
            )}
            <div className="document-print-box">
              <div className="font-semibold text-[9pt] mb-2">Scope Configuration</div>
              {model.proposalSections.scopeItems.map((item) => (
                <FieldRow key={item.name} label={item.name} value={item.state} />
              ))}
            </div>
          </section>
        )}

        {model.documentType === 'Quotation' && model.quotationSections && (
          <section className="document-print-section">
            <div className="document-print-section-title">Quotation Commercial Terms</div>
            <div className="document-print-grid-2">
              <div className="document-print-box">
                <FieldRow label="Validity" value={model.quotationSections.validityLabel} />
                <FieldRow label="Payment Terms" value={model.paymentTerms} />
                <FieldRow label="Delivery Terms" value={model.deliveryTerms} />
              </div>
              {model.quotationSections.costBreakdown.length > 0 && (
                <div className="document-print-box">
                  <div className="font-semibold text-[9pt] mb-2">Cost Breakdown</div>
                  {model.quotationSections.costBreakdown.map((row) => (
                    <div key={row.label} className="flex justify-between text-[9pt] mb-1">
                      <span>{row.label}</span>
                      <span className="font-medium">{formatCurrency(row.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {model.documentType === 'Invoice' && (
          <section className="document-print-section">
            <div className="document-print-section-title">Invoice Details</div>
            <div className="document-print-box">
              <FieldRow label="Payment Terms" value={model.paymentTerms} />
              <FieldRow label="Delivery Terms" value={model.deliveryTerms} />
              <FieldRow label="Due Date" value={formatDate(model.invoiceSections?.dueDate)} />
              <FieldRow label="GST Type" value={model.gstType} />
            </div>
          </section>
        )}

        {/* Item Table */}
        <section className="document-print-section">
          <div className="document-print-section-title">
            {model.documentType === 'Estimate' ? 'Material Selection' :
             model.documentType === 'Proposal' ? 'Proposed Materials & Scope Items' :
             model.documentType === 'Invoice' ? 'Invoice Line Items' : 'Quoted Items & Services'}
          </div>
          <table className="document-print-table">
            <thead>
              <tr>
                <th>#</th>
                {model.lineItems.some((i) => i.itemCode) && <th>Code</th>}
                <th>Description</th>
                <th className="num">Qty</th>
                <th>Unit</th>
                {model.showRates && <th className="num">Rate</th>}
                {model.showRates && <th className="num">Amount</th>}
                {model.documentType === 'Proposal' && <th>State</th>}
                {model.documentType === 'Quotation' && <th>Charge</th>}
              </tr>
            </thead>
            <tbody>
              {model.lineItems.length > 0 ? (
                model.lineItems.map((item, index) => (
                  <tr key={item.id ?? index}>
                    <td>{index + 1}</td>
                    {model.lineItems.some((i) => i.itemCode) && <td>{item.itemCode || '-'}</td>}
                    <td>{item.description}{item.extra ? ` (${item.extra})` : ''}</td>
                    <td className="num">{item.quantity}</td>
                    <td>{item.unit}</td>
                    {model.showRates && <td className="num">{formatCurrency(item.rate)}</td>}
                    {model.showRates && <td className="num">{formatCurrency(item.amount)}</td>}
                    {model.documentType === 'Proposal' && <td>{item.extra || '-'}</td>}
                    {model.documentType === 'Quotation' && <td>{item.extra || '-'}</td>}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center text-gray-500">No line items recorded</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Commercial / Tax / Discount / Grand Total — type-specific */}
        {(model.documentType === 'Quotation' || model.documentType === 'Invoice' ||
          (model.documentType === 'Estimate' && model.estimateSections?.includePricing) ||
          (model.documentType === 'Proposal' && model.proposalSections?.indicativeTotal)) && (
          <section className="document-print-section">
            <div className="document-print-section-title">
              {model.documentType === 'Proposal' ? 'Indicative Commercial Summary' :
               model.documentType === 'Estimate' ? 'Estimate Pricing Summary' :
               model.documentType === 'Invoice' ? 'Invoice Summary' : 'Commercial Summary'}
            </div>
            <div className="document-print-totals">
              {model.subtotal !== undefined && (
                <div className="document-print-totals-row">
                  <span>Subtotal</span>
                  <span>{formatCurrency(model.subtotal)}</span>
                </div>
              )}
              {model.discountAmount !== undefined && model.discountAmount > 0 && (
                <div className="document-print-totals-row">
                  <span>Discount{model.discountPercentage ? ` (${model.discountPercentage}%)` : ''}</span>
                  <span>-{formatCurrency(model.discountAmount)}</span>
                </div>
              )}
              {model.documentType === 'Invoice' && model.invoiceSections?.taxLines.map((line) => (
                <div key={line.label} className="document-print-totals-row">
                  <span>{line.label}</span>
                  <span>{formatCurrency(line.amount)}</span>
                </div>
              ))}
              {model.documentType === 'Quotation' && model.taxAmount !== undefined && (
                <>
                  {model.cgstAmount !== undefined && model.cgstAmount > 0 && (
                    <div className="document-print-totals-row">
                      <span>CGST</span>
                      <span>{formatCurrency(model.cgstAmount)}</span>
                    </div>
                  )}
                  {model.sgstAmount !== undefined && model.sgstAmount > 0 && (
                    <div className="document-print-totals-row">
                      <span>SGST</span>
                      <span>{formatCurrency(model.sgstAmount)}</span>
                    </div>
                  )}
                  {model.igstAmount !== undefined && model.igstAmount > 0 && (
                    <div className="document-print-totals-row">
                      <span>IGST</span>
                      <span>{formatCurrency(model.igstAmount)}</span>
                    </div>
                  )}
                  {!model.cgstAmount && !model.sgstAmount && !model.igstAmount && (
                    <div className="document-print-totals-row">
                      <span>Tax ({model.gstType})</span>
                      <span>{formatCurrency(model.taxAmount)}</span>
                    </div>
                  )}
                </>
              )}
              {model.documentType === 'Estimate' && model.taxAmount !== undefined && model.taxAmount > 0 && (
                <div className="document-print-totals-row">
                  <span>Tax</span>
                  <span>{formatCurrency(model.taxAmount)}</span>
                </div>
              )}
              <div className="document-print-totals-row grand">
                <span>{model.documentType === 'Invoice' ? 'Amount Due' : 'Grand Total'}</span>
                <span>{formatCurrency(model.grandTotal)}</span>
              </div>
              {model.amountInWords && (
                <div className="px-3 py-2 text-[8pt] italic text-gray-600 border-t">
                  Amount in words: {model.amountInWords}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Inclusions / Exclusions for Estimate & Proposal */}
        {((model.estimateSections?.inclusions.length ?? 0) > 0 || (model.proposalSections?.inclusions.length ?? 0) > 0) && (
          <section className="document-print-section document-print-grid-2">
            <div>
              <div className="document-print-section-title">Inclusions</div>
              <ul className="document-print-list">
                {(model.estimateSections?.inclusions ?? model.proposalSections?.inclusions ?? []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            {(model.estimateSections?.exclusions.length ?? model.proposalSections?.exclusions.length ?? 0) > 0 && (
              <div>
                <div className="document-print-section-title">Exclusions</div>
                <ul className="document-print-list">
                  {(model.estimateSections?.exclusions ?? model.proposalSections?.exclusions ?? []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Terms & Conditions */}
        {model.termsAndConditions && (
          <section className="document-print-section">
            <div className="document-print-section-title">Terms & Conditions</div>
            <div className="document-print-box text-[9pt] whitespace-pre-wrap">{model.termsAndConditions}</div>
          </section>
        )}

        {/* Notes */}
        {model.notes && (
          <section className="document-print-section">
            <div className="document-print-section-title">Notes</div>
            <div className="document-print-box text-[9pt] whitespace-pre-wrap">{model.notes}</div>
          </section>
        )}

        {/* Payment Terms block for non-invoice when set */}
        {model.paymentTerms && model.documentType !== 'Invoice' && model.documentType !== 'Quotation' && (
          <section className="document-print-section">
            <div className="document-print-section-title">Payment Terms</div>
            <div className="document-print-box text-[9pt]">{model.paymentTerms}</div>
          </section>
        )}

        {/* Signature Section */}
        <section className="document-print-section">
          <div className="document-print-section-title">Authorization</div>
          <ul className="document-print-list mb-4">
            {signatureTerms.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ul>
          <div className="document-print-signature">
            <div>
              <div className="document-print-signature-line">
                <div className="font-semibold">Authorized Signatory</div>
                {authorizedBy && <div>{authorizedBy}</div>}
                {authorizedDesignation && <div className="text-gray-500">{authorizedDesignation}</div>}
              </div>
            </div>
            <div>
              <div className="document-print-signature-line">
                <div className="font-semibold">Customer Acceptance</div>
                <div className="text-gray-500">Name & Signature</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="document-print-footer">
          <span>{company.name} — {model.documentType} {model.documentNumber}</span>
          <span>Generated {new Date().toLocaleDateString('en-IN')}</span>
        </footer>
      </div>
    </div>
  );
}

export function companyToPrintInfo(company: {
  companyName: string;
  legalCompanyName?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  mobile?: string;
  email?: string;
  gstNumber?: string;
  website?: string;
}): PrintCompanyInfo {
  return {
    name: company.companyName,
    legalName: company.legalCompanyName,
    address: company.address,
    city: company.city,
    state: company.state,
    postalCode: company.postalCode,
    phone: company.mobile,
    email: company.email,
    gst: company.gstNumber,
    website: company.website,
  };
}
