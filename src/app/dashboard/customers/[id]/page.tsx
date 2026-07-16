'use client';

import { useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/layouts/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrackingEngine } from '@/components/tracking/TrackingEngine';
import { useCustomer } from '@/features/customers/hooks/useCustomers';
import { ROUTES } from '@/core/routes';
import {
  ArrowLeft, ChevronDown, ChevronRight, Building2, MapPin, Phone, Mail, User, ExternalLink, Pencil, Globe,
} from 'lucide-react';

function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold bg-muted/30 hover:bg-muted/50 transition-colors">
        {title}
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

function InfoGrid({ items }: { items: { label: string; value: React.ReactNode; icon?: React.ReactNode }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(item => (
        <div key={item.label} className="space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">{item.icon}{item.label}</p>
          <p className="text-sm font-medium">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function formatDate(value?: Date | string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  const { data: customerData, isLoading } = useCustomer(customerId);
  const customer = customerData?.data || null;

  const handleBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(ROUTES.customers);
    }
  }, [router]);

  if (!customer) {
    return (
      <MainLayout title="Customer Not Found">
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-destructive">{isLoading ? 'Loading...' : 'Customer not found'}</p>
          <Button variant="outline" size="sm" onClick={handleBack} className="ml-3"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2 flex-shrink-0 self-start">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold truncate">{customer.customerName}</h1>
              {customer.customerId != null && (
                <Badge variant="outline">CUS-{String(customer.customerId).padStart(6, '0')}</Badge>
              )}
              <Badge>{customer.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {customer.companyName}{customer.city ? ` · ${customer.city}` : ''}{customer.email ? ` · ${customer.email}` : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/customers/${customerId}/edit`)} className="gap-1.5">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </Button>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card><CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Status</p>
            <p className="text-sm font-medium mt-0.5">{customer.status}</p>
          </CardContent></Card>
          <Card><CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Mobile</p>
            <p className="text-sm font-medium mt-0.5">{customer.mobile || '-'}</p>
          </CardContent></Card>
          <Card><CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">City</p>
            <p className="text-sm font-medium mt-0.5">{customer.city || '-'}</p>
          </CardContent></Card>
          <Card><CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Customer Since</p>
            <p className="text-sm font-medium mt-0.5">{formatDate(customer.customerSince || customer.createdAt)}</p>
          </CardContent></Card>
        </div>

        {/* TRACKING */}
        <Section title="Tracking" defaultOpen={true}>
          <TrackingEngine entityType="customer" entityId={customerId} />
        </Section>

        {/* OVERVIEW */}
        <Section title="Overview" defaultOpen={false}>
          <InfoGrid items={[
            { label: 'Customer Name', value: customer.customerName, icon: <User className="w-3 h-3" /> },
            { label: 'Company', value: customer.companyName || '-', icon: <Building2 className="w-3 h-3" /> },
            { label: 'Mobile', value: customer.mobile || '-', icon: <Phone className="w-3 h-3" /> },
            { label: 'Email', value: customer.email || '-', icon: <Mail className="w-3 h-3" /> },
            { label: 'City', value: customer.city || '-', icon: <MapPin className="w-3 h-3" /> },
            { label: 'Status', value: customer.status },
            { label: 'Source', value: customer.source || '-' },
            { label: 'Since', value: formatDate(customer.customerSince || customer.createdAt) },
          ]} />
        </Section>

        {/* INFORMATION */}
        <Section title="Information" defaultOpen={false}>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Contact Details</h4>
              <InfoGrid items={[
                { label: 'Customer Name', value: customer.customerName, icon: <User className="w-3 h-3" /> },
                { label: 'Company Name', value: customer.companyName || '-' },
                { label: 'Mobile', value: customer.mobile || '-', icon: <Phone className="w-3 h-3" /> },
                { label: 'Alternate Mobile', value: customer.alternateMobile || '-' },
                { label: 'Email', value: customer.email || '-', icon: <Mail className="w-3 h-3" /> },
                { label: 'GST Number', value: customer.gstNumber || '-' },
                { label: 'PAN Number', value: customer.panNumber || '-' },
                { label: 'Industry', value: customer.industry || '-' },
                { label: 'Website', value: customer.website || '-', icon: <Globe className="w-3 h-3" /> },
              ]} />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Address</h4>
              <InfoGrid items={[
                { label: 'Address', value: customer.address || '-' },
                { label: 'City', value: customer.city || '-' },
                { label: 'State', value: customer.state || '-' },
                { label: 'Country', value: customer.country || '-' },
                { label: 'Pincode', value: customer.pincode || '-' },
              ]} />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Assignment</h4>
              <InfoGrid items={[
                { label: 'Assigned Employee', value: customer.assignedEmployee || customer.assignedEmployeeId || 'Unassigned' },
                { label: 'Source', value: customer.source || '-' },
              ]} />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Notes</h4>
              <p className="text-sm">{customer.notes || 'No notes'}</p>
            </div>
          </div>
        </Section>

        {/* RELATED RECORDS */}
        <Section title="Related Records" defaultOpen={false}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {customer.leadId && (
              <button onClick={() => router.push(ROUTES.leadsDetail(customer.leadId!))} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left">
                <User className="w-5 h-5 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Originating Lead</p>
                  <p className="text-xs text-muted-foreground truncate">View source lead</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              </button>
            )}
          </div>
        </Section>

        {/* DOCUMENTS */}
        <Section title="Documents" defaultOpen={false}>
          <p className="text-sm text-muted-foreground text-center py-4">No documents attached</p>
        </Section>

        {/* Activities live inside Tracking → Activity tab */}
      </div>
    </MainLayout>
  );
}
