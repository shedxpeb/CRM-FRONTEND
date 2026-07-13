import { useMemo } from 'react';
import { useCustomer } from '@/features/customers/hooks/useCustomers';
import { useQuotations } from './useQuotation';

export function useCustomerAutofill(customerId: string) {
  const { data: customerResponse } = useCustomer(customerId);
  const customer = customerResponse?.data;
  const { data: quotations } = useQuotations({ customerId });

  return useMemo(() => {
    if (!customer) return null;

    const lastQuotation = quotations?.[0];

    return {
      // Basic Info
      companyName: customer.companyName,
      contactPerson: customer.customerName,
      phone: customer.mobile,
      email: customer.email,

      // Address
      siteAddress: customer.address,
      city: customer.city,
      state: customer.state,
      pincode: customer.pincode,

      // Business
      gstNumber: customer.gstNumber,
      panNumber: customer.panNumber,

      // Pricing Intelligence
      lastQuotationAmount: lastQuotation?.grandTotal,
      lastQuotationDate: lastQuotation?.createdAt,
      preferredPaymentTerms: (customer as { paymentTerms?: string }).paymentTerms || '30% advance, 60% before dispatch, 10% on erection',
    };
  }, [customer, quotations]);
}
