'use client';

import { useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/layouts/MainLayout';
import { CustomerForm } from '@/features/customers/components/CustomerForm';
import { useCustomer, useUpdateCustomer } from '@/features/customers/hooks/useCustomers';
import type { UpdateCustomerDto } from '@/features/customers/types';
import { ROUTES } from '@/core/routes';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  const { data: customerRes, isLoading, isError } = useCustomer(customerId);
  const updateCustomer = useUpdateCustomer();

  const customer = customerRes?.data;

  const handleSubmit = useCallback(
    async (values: unknown) => {
      await updateCustomer.mutateAsync({ id: customerId, data: values as UpdateCustomerDto });
      router.push(ROUTES.customersDetail(customerId));
    },
    [customerId, router, updateCustomer],
  );

  return (
    <MainLayout title="Edit Customer" currentPath="/dashboard/customers">
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.customersDetail(customerId))} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">Loading customer…</p>}
      {isError && <p className="text-sm text-destructive">Customer not found or failed to load.</p>}
      {customer && (
        <CustomerForm
          initialData={customer}
          isEditMode
          isLoading={updateCustomer.isPending}
          error={updateCustomer.error ? 'Update failed' : undefined}
          onCancel={() => router.push(ROUTES.customersDetail(customerId))}
          onSubmit={handleSubmit}
        />
      )}
    </MainLayout>
  );
}
