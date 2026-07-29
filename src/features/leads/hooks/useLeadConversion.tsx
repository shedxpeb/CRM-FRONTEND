'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Lead } from '@/types/leads';
import { useConvertLeadToCustomer } from '@/features/customers/hooks/useCustomers';
import { isLeadConverted } from '@/features/leads/constants';
import { toast } from '@/components/ui/toast';
import { ROUTES } from '@/core/routes';
import dynamic from 'next/dynamic';

const LeadToCustomerConversionDialog = dynamic(
  () => import('@/features/leads/components/LeadToCustomerConversionDialog').then((m) => ({ default: m.LeadToCustomerConversionDialog })),
  { ssr: false },
);

const ALL_LEAD_QUERIES = [
  'leads',
  'leads-kanban',
  'leads-calendar',
  'leads-stats',
  'dashboard',
  'customers',
  'customers-stats',
  'customers-stats',
];

export function useLeadConversion() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const convertLeadMutation = useConvertLeadToCustomer();

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openConversionModal = useCallback(
    (lead: Lead) => {
      if (isLeadConverted(lead)) {
        if (lead.customerId) {
          toast.info('This lead is already converted. Opening customer...');
          router.push(ROUTES.customersDetail(lead.customerId));
        } else {
          toast.info('This lead has already been converted to a customer.');
        }
        return;
      }
      setSelectedLead(lead);
      setIsOpen(true);
    },
    [router],
  );

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setSelectedLead(null);
  }, []);

  const handleCustomerCreated = useCallback(
    (customer: any) => {
      const customerData = customer?.data ?? customer;
      const customerName = customerData?.customerName ?? 'Customer';

      // Optimistic: update the lead query data immediately
      if (selectedLead) {
        const now = new Date().toISOString();
        queryClient.setQueryData(['lead', selectedLead.id], (old: any) => ({
          ...old,
          data: {
            ...old?.data,
            status: 'Converted',
            isConverted: true,
            customerId: customerData?.id,
            convertedDate: now,
          },
        }));

        // Optimistic: update the lead in the list cache
        queryClient.setQueriesData({ queryKey: ['leads'] }, (old: any) => {
          if (!old?.data?.rows) return old;
          return {
            ...old,
            data: {
              ...old.data,
              rows: old.data.rows.map((r: any) =>
                r.id === selectedLead.id
                  ? { ...r, status: 'Converted', isConverted: true, customerId: customerData?.id, convertedDate: now }
                  : r,
              ),
            },
          };
        });

        // Optimistic: update kanban cache
        queryClient.setQueriesData({ queryKey: ['leads-kanban'] }, (old: any) => {
          if (!old?.data?.columns) return old;
          return {
            ...old,
            data: {
              ...old.data,
              columns: old.data.columns.map((col: any) => ({
                ...col,
                cards: col.cards.map((card: any) =>
                  card.id === selectedLead.id
                    ? { ...card, status: 'Converted', isConverted: true, customerId: customerData?.id, convertedDate: now }
                    : card,
                ),
              })),
            },
          };
        });

        // Optimistic: update tracking cache
        queryClient.setQueryData(
          ['tracking', 'lead', selectedLead.id, 'all'],
          (old: any) => {
            if (!old?.data) return old;
            return {
              ...old,
              data: {
                ...old.data,
                currentStatus: 'Converted',
                progress: 100,
              },
            };
          },
        );
      }

      // Background invalidation for consistency
      for (const key of ALL_LEAD_QUERIES) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      if (selectedLead) {
        queryClient.invalidateQueries({ queryKey: ['lead', selectedLead.id] });
        queryClient.invalidateQueries({ queryKey: ['tracking', 'lead', selectedLead.id, 'all'] });
      }

      toast.success(`Customer "${customerName}" created`);
      closeModal();
    },
    [selectedLead, closeModal, queryClient],
  );

  const ConversionDialog = useMemo(() => {
    if (!isOpen || !selectedLead) return null;
    return (
      <LeadToCustomerConversionDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
        lead={selectedLead}
        onCustomerCreated={handleCustomerCreated}
      />
    );
  }, [isOpen, selectedLead, closeModal, handleCustomerCreated]);

  return {
    selectedLead,
    isOpen,
    openConversionModal,
    closeModal,
    handleCustomerCreated,
    ConversionDialog,
    isConverting: convertLeadMutation.isPending,
  };
}
