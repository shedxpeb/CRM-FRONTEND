'use client';

import { memo } from 'react';
import { Invoice } from '@/features/finance/types';
import { formatCurrency, getInvoiceStatusVariant } from '@/features/finance/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  EntityViewDrawer,
  EntityViewHeader,
  EntityViewBadges,
  EntityViewKpiStrip,
  EntityViewBody,
  EntityViewSection,
  EntityViewFieldGrid,
  EntityViewField,
  EntityViewFooter,
  formatDrawerDate,
  formatDrawerDateTime,
} from '@/components/drawer/EntityViewDrawer';
import { User, Building2, FileText, ExternalLink, IndianRupee, Clock, CheckCircle } from 'lucide-react';

interface InvoiceViewDrawerProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InvoiceViewDrawer = memo(function InvoiceViewDrawer({ invoice, open, onOpenChange }: InvoiceViewDrawerProps) {
  const router = useRouter();

  if (!invoice) return null;

  return (
    <EntityViewDrawer open={open} onOpenChange={onOpenChange}>
      <EntityViewHeader
        title={invoice.invoiceNumber}
        subtitle={invoice.customerName}
        onClose={() => onOpenChange(false)}
      />

      <EntityViewBody>
        <EntityViewBadges>
          <Badge variant={getInvoiceStatusVariant(invoice.status)}>{invoice.status}</Badge>
          {invoice.gstType && <Badge variant="outline">{invoice.gstType}</Badge>}
        </EntityViewBadges>

        <EntityViewKpiStrip
          items={[
            { label: 'Total Amount', value: formatCurrency(invoice.totalAmount), icon: <IndianRupee className="h-4 w-4 text-blue-600" />, accentClassName: 'text-blue-600' },
            { label: 'Paid', value: formatCurrency(invoice.paidAmount), icon: <CheckCircle className="h-4 w-4 text-green-600" />, accentClassName: 'text-green-600' },
            { label: 'Pending', value: formatCurrency(invoice.pendingAmount), icon: <Clock className="h-4 w-4 text-amber-600" />, accentClassName: 'text-amber-600' },
            { label: 'Due Date', value: formatDrawerDate(invoice.dueDate), icon: <Clock className="h-4 w-4 text-purple-600" />, accentClassName: 'text-purple-600' },
          ]}
        />

        <EntityViewSection title="Customer Information" icon={<User className="h-4 w-4" />}>
          <EntityViewFieldGrid>
            <EntityViewField label="Customer Name" value={invoice.customerName} />
            <EntityViewField label="Customer ID" value={invoice.customerId} />
            <EntityViewField label="Address" value={invoice.customerAddress} />
            <EntityViewField label="GST" value={invoice.customerGST} />
          </EntityViewFieldGrid>
          {invoice.customerId && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => router.push(`/dashboard/customers/${invoice.customerId}`)}
            >
              View Customer
              <ExternalLink className="h-3 w-3 ml-1.5" />
            </Button>
          )}
        </EntityViewSection>

        {invoice.projectName && (
          <EntityViewSection title="Project Information" icon={<Building2 className="h-4 w-4" />}>
            <EntityViewFieldGrid>
              <EntityViewField label="Project Name" value={invoice.projectName} />
              <EntityViewField label="Project ID" value={invoice.projectId} />
            </EntityViewFieldGrid>
            {invoice.projectId && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => router.push(`/dashboard/projects/${invoice.projectId}`)}
              >
                View Project
                <ExternalLink className="h-3 w-3 ml-1.5" />
              </Button>
            )}
          </EntityViewSection>
        )}

        {invoice.sourceType && invoice.sourceType !== 'Manual' && (
          <EntityViewSection title="Source Document" icon={<FileText className="h-4 w-4" />}>
            <EntityViewField label="Source" value={`${invoice.sourceType} → Invoice`} />
            {invoice.sourceId && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  const basePath = '/dashboard/documents';
                  const pathMap: Record<string, string> = {
                    Estimate: `${basePath}/estimates/${invoice.sourceId}`,
                    Proposal: `${basePath}/proposals/${invoice.sourceId}`,
                    Quotation: `${basePath}/quotations/${invoice.sourceId}`,
                    Project: `/dashboard/projects/${invoice.sourceId}`,
                  };
                  router.push(pathMap[invoice.sourceType] || basePath);
                }}
              >
                View Source
                <ExternalLink className="h-3 w-3 ml-1.5" />
              </Button>
            )}
          </EntityViewSection>
        )}

        <EntityViewSection title="Line Items" icon={<FileText className="h-4 w-4" />}>
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Rate</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems?.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{item.description}</td>
                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.rate)}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </EntityViewSection>

        <EntityViewSection title="Payment Terms">
          <EntityViewFieldGrid>
            <EntityViewField label="Due Date" value={formatDrawerDate(invoice.dueDate)} />
            <EntityViewField label="Payment Terms" value={invoice.paymentTerms} />
          </EntityViewFieldGrid>
        </EntityViewSection>

        <EntityViewSection title="GST Information">
          <EntityViewFieldGrid>
            <EntityViewField label="GST Type" value={invoice.gstType} />
            <EntityViewField label="CGST" value={formatCurrency(invoice.cgstAmount || 0)} />
            <EntityViewField label="SGST" value={formatCurrency(invoice.sgstAmount || 0)} />
            <EntityViewField label="IGST" value={formatCurrency(invoice.igstAmount || 0)} />
            <EntityViewField label="CESS" value={formatCurrency(invoice.cessAmount || 0)} />
            <EntityViewField label="Total GST" value={formatCurrency(invoice.taxAmount || 0)} />
          </EntityViewFieldGrid>
        </EntityViewSection>

        <EntityViewSection title="Amount Summary">
          <EntityViewFieldGrid>
            <EntityViewField label="Subtotal" value={formatCurrency(invoice.subtotal)} />
            <EntityViewField label="Tax Amount" value={formatCurrency(invoice.taxAmount)} />
            <EntityViewField label="Total Amount" value={formatCurrency(invoice.totalAmount)} />
            <EntityViewField label="Paid Amount" value={formatCurrency(invoice.paidAmount)} />
            <EntityViewField label="Pending Amount" value={formatCurrency(invoice.pendingAmount)} />
          </EntityViewFieldGrid>
        </EntityViewSection>

        <EntityViewSection title="Timestamps">
          <EntityViewFieldGrid>
            {invoice.createdAt && <EntityViewField label="Created" value={formatDrawerDateTime(invoice.createdAt)} />}
            {invoice.sentAt && <EntityViewField label="Sent" value={formatDrawerDateTime(invoice.sentAt)} />}
            {invoice.viewedAt && <EntityViewField label="Viewed" value={formatDrawerDateTime(invoice.viewedAt)} />}
            {invoice.paidAt && <EntityViewField label="Paid" value={formatDrawerDateTime(invoice.paidAt)} />}
          </EntityViewFieldGrid>
        </EntityViewSection>
      </EntityViewBody>

      <EntityViewFooter onClose={() => onOpenChange(false)} />
    </EntityViewDrawer>
  );
});
