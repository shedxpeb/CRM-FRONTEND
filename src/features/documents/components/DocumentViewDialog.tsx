'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Estimate, Proposal, Quotation } from '../types/peb-commercial';
import { DOCUMENT_STATUS_BADGE_VARIANTS } from '../constants';
import {
  FileText,
  File,
  FileSpreadsheet,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Package,
} from 'lucide-react';

interface DocumentViewDialogProps {
  document: Estimate | Proposal | Quotation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentViewDialog({ document, open, onOpenChange }: DocumentViewDialogProps) {
  if (!document) return null;

  const getDocumentType = () => {
    const doc = document as any;
    if (doc.estimateNumber) return { type: 'Estimate', number: doc.estimateNumber, icon: <FileText className="h-5 w-5" /> };
    if (doc.proposalNumber) return { type: 'Proposal', number: doc.proposalNumber, icon: <File className="h-5 w-5" /> };
    if (doc.quotationNumber) return { type: 'Quotation', number: doc.quotationNumber, icon: <FileSpreadsheet className="h-5 w-5" /> };
    return { type: 'Unknown', number: '-', icon: <FileText className="h-5 w-5" /> };
  };

  const docInfo = getDocumentType();

  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {docInfo.icon}
            {docInfo.number} - {docInfo.type}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={DOCUMENT_STATUS_BADGE_VARIANTS[document.status as keyof typeof DOCUMENT_STATUS_BADGE_VARIANTS]}>
                    {document.status}
                  </Badge>
                  {document.approvalStatus && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      {document.approvalStatus === 'Approved' ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {document.approvalStatus}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Version {document.version}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer Name</p>
                  <p className="font-medium">{document.customerName}</p>
                </div>
                {document.customerEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{document.customerEmail}</p>
                  </div>
                )}
                {document.customerPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{document.customerPhone}</p>
                  </div>
                )}
                {document.customerAddress && (
                  <div className="flex items-center gap-2 md:col-span-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{document.customerAddress}</p>
                  </div>
                )}
                {document.customerGST && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">GST Number</p>
                    <p className="font-medium">{document.customerGST}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Project Information */}
          {(document.leadId || document.projectId) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Project Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {document.leadId && (
                    <div>
                      <p className="text-sm text-muted-foreground">Lead Number</p>
                      <p className="font-medium">{document.leadNumber}</p>
                    </div>
                  )}
                  {document.projectId && (
                    <div>
                      <p className="text-sm text-muted-foreground">Project Name</p>
                      <p className="font-medium">{document.projectName}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Material Selections (for Estimate/Proposal/Quotation) */}
          {'materialSelections' in document && document.materialSelections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Material Selections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">Item</th>
                        <th className="text-left py-2 px-3">Code</th>
                        <th className="text-right py-2 px-3">Qty</th>
                        <th className="text-right py-2 px-3">Unit</th>
                        <th className="text-right py-2 px-3">Rate</th>
                        <th className="text-right py-2 px-3">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {document.materialSelections.map((item: any) => (
                        <tr key={item.id || `${item.itemName}-${item.itemCode}`} className="border-b">
                          <td className="py-2 px-3 font-medium">{item.itemName}</td>
                          <td className="py-2 px-3 text-muted-foreground">{item.itemCode}</td>
                          <td className="py-2 px-3 text-right">{item.quantity || '-'}</td>
                          <td className="py-2 px-3 text-right">{item.unit || '-'}</td>
                          <td className="py-2 px-3 text-right">{formatCurrency(item.rate)}</td>
                          <td className="py-2 px-3 text-right font-medium">{formatCurrency((item.quantity || 0) * (item.rate || 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scope Configuration */}
          {'scopeConfiguration' in document && document.scopeConfiguration && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Scope Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(document.scopeConfiguration as any).map(([key, value]: [string, any]) => {
                    if (key === 'additionalServices') return null;
                    return (
                      <div key={key} className="p-3 border rounded-lg">
                        <p className="font-medium capitalize text-sm">{key}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>State: {value?.state}</span>
                          <span>•</span>
                          <span>Requirement: {value?.requirement}</span>
                          <span>•</span>
                          <span>Chargeability: {value?.chargeability}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inclusions */}
          {'inclusions' in document && document.inclusions && document.inclusions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Inclusions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {document.inclusions.map((item: string) => (
                    <li key={`inclusion-${item}`}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Exclusions */}
          {'exclusions' in document && document.exclusions && document.exclusions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Exclusions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {document.exclusions.map((item: string) => (
                    <li key={`exclusion-${item}`}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Technical Specifications */}
          {'technicalSpecifications' in document && document.technicalSpecifications && Object.keys(document.technicalSpecifications).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Technical Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(document.technicalSpecifications as any).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground capitalize">{key}</span>
                      <span className="text-sm font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Document Created</p>
                    <p className="text-xs text-muted-foreground">{formatDate(document.createdAt)}</p>
                  </div>
                </div>
                {(document as any).sentAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Sent to Customer</p>
                      <p className="text-xs text-muted-foreground">{formatDate((document as any).sentAt)}</p>
                    </div>
                  </div>
                )}
                {(document as any).convertedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                    <div>
                      <p className="text-sm font-medium">Converted to {(document as any).convertedToProposalId ? 'Proposal' : 'Next Stage'}</p>
                      <p className="text-xs text-muted-foreground">{formatDate((document as any).convertedAt)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-xs text-muted-foreground">{formatDate(document.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Summary (if available) */}
          {('totalAmount' in document || 'grandTotal' in document) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Pricing Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {('subtotal' in document) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatCurrency(document.subtotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t text-lg font-semibold">
                    <span>Total Amount</span>
                    <span className="text-green-600">{formatCurrency((document as any).totalAmount || (document as any).grandTotal)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Terms & Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Terms & Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-medium">{formatDate(document.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updated At</p>
                  <p className="font-medium">{formatDate(document.updatedAt)}</p>
                </div>
              </div>
              {document.notes && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{document.notes}</p>
                </div>
              )}
              {document.internalNotes && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Internal Notes</p>
                  <p className="text-sm">{document.internalNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
