'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CustomerForm } from '@/features/customers/components/CustomerForm';
import { Lead } from '@/types/leads';
import { Customer } from '@/features/customers/types';
import { useConvertLeadToCustomer } from '@/features/customers/hooks/useCustomers';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface LeadToCustomerConversionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead;
  onCustomerCreated?: (customer: Customer) => void;
}

type ConversionStep = 'confirm' | 'form' | 'complete';

export function LeadToCustomerConversionDialog({
  open,
  onOpenChange,
  lead,
  onCustomerCreated,
}: LeadToCustomerConversionDialogProps) {
  const [step, setStep] = useState<ConversionStep>('confirm');
  const [createdCustomer, setCreatedCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState<string | null>(null);

  const convertLeadMutation = useConvertLeadToCustomer();

  const mapSource = (s: string) => ({ ColdCall: 'Cold Call', SocialMedia: 'Social Media', TradeShow: 'Trade Show' }[s] || s);

  const handleConfirm = () => {
    setStep('form');
    setError(null);
  };

  const handleCancel = () => {
    setStep('confirm');
    setCreatedCustomer(null);
    setError(null);
    onOpenChange(false);
  };

  const handleCustomerSubmit = async (customerData: Partial<Customer>) => {
    try {
      setError(null);

      const customerPayload = {
        leadId: lead.id,
        customerName: customerData.customerName || '',
        companyName: customerData.companyName || '',
        mobile: customerData.mobile || '',
        alternateMobile: customerData.alternateMobile,
        email: customerData.email,
        gstNumber: customerData.gstNumber,
        panNumber: customerData.panNumber,
        source: customerData.source || 'Website',
        address: customerData.address,
        city: customerData.city,
        state: customerData.state,
        pincode: customerData.pincode,
        industry: customerData.industry,
        businessType: customerData.businessType,
        website: customerData.website,
        assignedEmployeeId: customerData.assignedEmployeeId,
        notes: customerData.notes,
      };

      const customerResult = await convertLeadMutation.mutateAsync(customerPayload as any);
      const resultData = (customerResult as any)?.data;
      const customer = resultData?.customer ?? resultData ?? customerResult;

      setCreatedCustomer(customer as Customer);
      setStep('complete');
      onCustomerCreated?.(customer as Customer);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to convert lead to customer. Please try again.');
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setCreatedCustomer(null);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            Convert Lead to Customer
          </DialogTitle>
        </DialogHeader>

        {step === 'confirm' && (
          <div className="py-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Lead Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Customer Name:</span>
                  <p className="font-medium">{lead.customerName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Company:</span>
                  <p className="font-medium">{lead.companyName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Mobile:</span>
                  <p className="font-medium">{lead.mobile}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{lead.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">City:</span>
                  <p className="font-medium">{lead.city}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">State:</span>
                  <p className="font-medium">{lead.state}</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-900">
                  <p className="font-semibold mb-1">Conversion Details</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-800">
                    <li>Customer details will be pre-filled from this lead</li>
                    <li>You can edit any field before saving</li>
                    <li>Lead status will be updated to "Converted"</li>
                    <li>Lead will be linked to the new customer</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleConfirm}>
                Continue to Customer Form
              </Button>
            </div>
          </div>
        )}

        {step === 'form' && (
          <div className="py-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2 mb-4">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <CustomerForm
              initialData={{
                customerName: lead.customerName,
                companyName: lead.companyName,
                mobile: lead.mobile,
                alternateMobile: lead.alternateMobile,
                email: lead.email,
                gstNumber: lead.gstNumber,
                panNumber: lead.panNumber,
                website: lead.website,
                industry: lead.industry as any,
                businessType: lead.businessType as any,
                address: [lead.addressLine1, lead.addressLine2, lead.area].filter(Boolean).join(', '),
                city: lead.city,
                state: lead.state,
                pincode: lead.pincode,
                source: mapSource(lead.source) as any,
                assignedEmployee: lead.assignedTo,
                assignedEmployeeId: lead.assignedToId,
                notes: lead.remarks,
                leadId: lead.id,
              }}
              onSubmit={handleCustomerSubmit}
              onCancel={handleCancel}
              isLoading={convertLeadMutation.isPending}
              error={error}
              isEditMode={false}
            />
          </div>
        )}

        {step === 'complete' && createdCustomer && (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Customer Created Successfully</h3>
              <p className="text-muted-foreground">
                {createdCustomer.customerName} - {createdCustomer.companyName}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Customer ID: {createdCustomer.customerId}
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-md p-3 text-left">
              <p className="text-sm text-green-700">
                ✓ Lead status updated to "Converted"<br />
                ✓ Lead linked to customer<br />
                ✓ Customer ready for project creation
              </p>
            </div>
            <Button onClick={handleClose} className="mt-4">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
