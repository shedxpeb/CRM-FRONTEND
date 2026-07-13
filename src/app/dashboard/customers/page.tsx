'use client';

import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/layouts/MainLayout';
import { DataTable, Column } from '@/components/data-table/DataTable';
import { KPICard } from '@/components/dashboard/KPICard';
import { StandardPageLayout } from '@/components/layout/StandardPageLayout';
import { FilterConfig } from '@/components/layout/FilterBar';
import { CustomerViewDrawer } from '@/features/customers/components/CustomerViewDrawer';
import { getCustomerCustomFieldValue } from '@/features/customers/components/CustomerCustomFields';
const CustomerForm = lazy(() => import('@/features/customers/components/CustomerForm').then(m => ({ default: m.CustomerForm })));
const CustomerRowActions = lazy(() => import('@/features/customers/components/CustomerRowActions').then(m => ({ default: m.CustomerRowActions })));
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Customer, CustomerStatus } from '@/features/customers';
import { getStatusVariant } from '@/features/customers/constants';
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useCustomerActivities,
  useCustomerConfiguration,
} from '@/features/customers/hooks/useCustomers';
import { customersApi } from '@/features/customers';
import { ROUTES } from '@/core/routes';
import { useDebounce } from '@/shared/hooks/useDebounce';
import {
  Users,
  UserCheck,
  UserPlus,
  DollarSign,
  Plus,
  Download,
} from 'lucide-react';

export default function CustomersPage() {
  const router = useRouter();
  const customerConfig = useCustomerConfiguration();

  // Search and filter state with debounce
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'all'>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');

  // React Query hooks - single source of truth for server data
  // Fetch all customers once without filters, then filter client-side
  const { data: allCustomersResponse, isLoading, error } = useCustomers({ page: 1, pageSize: 1000 });

  const customerFilterOptions = useMemo(() => {
    const cities = new Set<string>();
    const states = new Set<string>();
    for (const customer of allCustomersResponse?.data?.rows ?? []) {
      if (customer.city) cities.add(customer.city);
      if (customer.state) states.add(customer.state);
    }
    return {
      cities: [...cities].sort(),
      states: [...states].sort(),
    };
  }, [allCustomersResponse?.data?.rows]);

  const filteredCustomers = useMemo(() => {
    if (!allCustomersResponse?.data?.rows) return [];
    const q = debouncedSearch.toLowerCase();
    return allCustomersResponse.data.rows.filter((customer: Customer) => {
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      const matchesCity = cityFilter === 'all' || customer.city === cityFilter;
      const matchesState = stateFilter === 'all' || customer.state === stateFilter;
      const matchesSearch = !debouncedSearch ||
        customer.customerName.toLowerCase().includes(q) ||
        customer.companyName.toLowerCase().includes(q) ||
        customer.email?.toLowerCase().includes(q) ||
        customer.mobile.includes(debouncedSearch) ||
        customer.city?.toLowerCase().includes(q) ||
        customer.gstNumber?.toLowerCase().includes(q) ||
        customer.customerId.toString().includes(debouncedSearch);
      return matchesStatus && matchesCity && matchesState && matchesSearch;
    });
  }, [allCustomersResponse?.data?.rows, statusFilter, cityFilter, stateFilter, debouncedSearch]);
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  // UI state only - no server data in useState
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [formError, setFormError] = useState<string | null>(null);

  const customers = filteredCustomers;

  const selectedCustomer = useMemo(
    () => (selectedCustomerId ? allCustomersResponse?.data?.rows?.find((c) => c.id === selectedCustomerId) ?? null : null),
    [allCustomersResponse?.data?.rows, selectedCustomerId]
  );

  const { data: viewedActivities } = useCustomerActivities(selectedCustomerId ?? '');

  // Combine stats and KPI data computation to reduce re-renders
  const { filteredStats, kpiData } = useMemo(() => {
    const now = new Date();
    let total = 0;
    let active = 0;
    let newThisMonth = 0;
    let totalRevenue = 0;
    for (const c of customers) {
      total++;
      if (c.status === 'Active') active++;
      const customerDate = new Date(c.customerSince);
      if (customerDate.getMonth() === now.getMonth() && customerDate.getFullYear() === now.getFullYear()) {
        newThisMonth++;
      }
      totalRevenue += c.totalRevenue || 0;
    }
    const stats = { total, active, newThisMonth, totalRevenue };
    
    const kpi = [
      { title: 'Total Customers', value: String(stats.total), change: 0, icon: <Users className="h-5 w-5 text-blue-600" />, color: 'text-blue-600' },
      { title: 'Active Customers', value: String(stats.active), change: 0, icon: <UserCheck className="h-5 w-5 text-green-600" />, color: 'text-green-600' },
      { title: 'New This Month', value: String(stats.newThisMonth), change: 0, icon: <UserPlus className="h-5 w-5 text-purple-600" />, color: 'text-purple-600' },
      { title: 'Total Revenue', value: `₹${(stats.totalRevenue / 10000000).toFixed(1)}Cr`, change: 0, icon: <DollarSign className="h-5 w-5 text-green-700" />, color: 'text-green-700' },
    ];
    
    return { filteredStats: stats, kpiData: kpi };
  }, [customers]);

  const tableFilterKey = useMemo(
    () => [debouncedSearch, statusFilter, cityFilter, stateFilter].join('|'),
    [debouncedSearch, statusFilter, cityFilter, stateFilter]
  );

  // Filter configuration for FilterBar
  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      key: 'status',
      label: 'Status',
      value: statusFilter,
      onChange: (value: string) => setStatusFilter(value as CustomerStatus | 'all'),
      options: [{ value: 'all', label: 'All Status' }, ...customerConfig.statuses.map((s) => ({ value: s, label: s }))],
    },
    {
      key: 'city',
      label: 'City',
      value: cityFilter,
      onChange: setCityFilter,
      options: [
        { value: 'all', label: 'All Cities' },
        ...customerFilterOptions.cities.map((city) => ({ value: city, label: city })),
      ],
    },
    {
      key: 'state',
      label: 'State',
      value: stateFilter,
      onChange: setStateFilter,
      options: [
        { value: 'all', label: 'All States' },
        ...customerFilterOptions.states.map((state) => ({ value: state, label: state })),
      ],
    },
  ], [statusFilter, cityFilter, stateFilter, customerFilterOptions, customerConfig.statuses]);

  const handleClearFilters = useCallback(() => {
    setStatusFilter('all');
    setCityFilter('all');
    setStateFilter('all');
    setSearchQuery('');
  }, []);

  // Memoized table columns
  const baseColumns: Column<Customer>[] = useMemo(() => [
    {
      key: 'customerId',
      label: 'ID',
      sortable: true,
      className: 'w-[70px]',
      render: (value) => <span className="font-mono text-xs text-muted-foreground">#{value}</span>,
    },
    {
      key: 'customerName',
      label: 'Customer Name',
      sortable: true,
      className: 'min-w-[140px] max-w-[200px]',
      render: (_, row) => (
        <div className="min-w-0">
          <p className="font-medium text-xs truncate">{row.customerName}</p>
          <p className="text-[11px] text-muted-foreground truncate">{row.companyName}</p>
        </div>
      ),
    },
    {
      key: 'mobile',
      label: 'Mobile',
      className: 'hidden md:table-cell min-w-[100px]',
      headerClassName: 'hidden md:table-cell',
      render: (value) => <span className="text-xs">{value}</span>,
    },
    {
      key: 'email',
      label: 'Email',
      className: 'hidden lg:table-cell min-w-[120px] max-w-[160px]',
      headerClassName: 'hidden lg:table-cell',
      render: (value) => <span className="text-xs truncate block">{value}</span>,
    },
    {
      key: 'gstNumber',
      label: 'GST',
      className: 'hidden xl:table-cell',
      headerClassName: 'hidden xl:table-cell',
      render: (value) => (
        <span className="text-xs font-mono">{value || '-'}</span>
      ),
    },
    {
      key: 'city',
      label: 'City',
      sortable: true,
      className: 'hidden sm:table-cell',
      headerClassName: 'hidden sm:table-cell',
    },
    {
      key: 'state',
      label: 'State',
      sortable: true,
      className: 'hidden lg:table-cell',
      headerClassName: 'hidden lg:table-cell',
    },
    {
      key: 'totalProjects',
      label: 'Projects',
      sortable: true,
      className: 'hidden xl:table-cell',
      headerClassName: 'hidden xl:table-cell',
      render: (_, row) => (
        <span className="text-xs">
          {row.activeProjects}/{row.totalProjects}
        </span>
      ),
    },
    {
      key: 'totalRevenue',
      label: 'Revenue',
      sortable: true,
      className: 'hidden 2xl:table-cell',
      headerClassName: 'hidden 2xl:table-cell',
      render: (value) => (
        <span className="text-xs font-medium">
          ₹{(value / 100000).toFixed(1)}L
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <Badge variant={getStatusVariant(value as CustomerStatus)}>
          {value}
        </Badge>
      ),
    },
  ], []);

  const settingsCustomColumnDefs = useMemo(
    () =>
      customerConfig.customFields.map((field) => ({
        key: field.key as keyof Customer,
        label: field.label,
        sortable: true,
        className: 'min-w-[100px] max-w-[130px] hidden 2xl:table-cell',
        headerClassName: 'hidden 2xl:table-cell',
        render: (_: unknown, row: Customer) => (
          <span className="text-xs truncate block">
            {getCustomerCustomFieldValue(row, field.key)?.toString() ?? '-'}
          </span>
        ),
      })),
    [customerConfig.customFields]
  );

  const columns = useMemo(
    () => [...baseColumns, ...settingsCustomColumnDefs],
    [baseColumns, settingsCustomColumnDefs]
  );

  // Memoized handlers using React Query mutations
  const handleCreateCustomer = useCallback((data: Partial<Customer>) => {
    setFormError(null);
    createMutation.mutate(data as any, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        setFormError(null);
      },
      onError: (error: any) => {
        setFormError(error.message || 'Failed to create customer. Please try again.');
      },
    });
  }, [createMutation]);

  const handleEditCustomer = useCallback((data: Partial<Customer>) => {
    if (!selectedCustomer) return;
    setFormError(null);
    updateMutation.mutate(
      { id: selectedCustomer.id, data: data as any },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setSelectedCustomerId(null);
          setFormError(null);
        },
        onError: (error: any) => {
          setFormError(error.message || 'Failed to update customer. Please try again.');
        },
      }
    );
  }, [selectedCustomer, updateMutation]);

  const handleDeleteCustomer = useCallback((customer: Customer) => {
    if (confirm(`Delete customer "${customer.customerName}"?`)) {
      deleteMutation.mutate(customer.id);
    }
  }, [deleteMutation]);

  const handleRowClick = useCallback((row: Customer) => {
    setSelectedCustomerId(row.id);
    setIsViewDrawerOpen(true);
  }, []);

  const handleViewDetails = useCallback((customer: Customer) => {
    router.push(ROUTES.customersDetail(customer.id));
  }, [router]);

  const handleEditFromRow = useCallback((customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setIsEditDialogOpen(true);
  }, []);

  const handleEditFromDrawer = useCallback((customer: Customer) => {
    setIsViewDrawerOpen(false);
    setSelectedCustomerId(customer.id);
    setIsEditDialogOpen(true);
  }, []);

  const handleStatusChange = useCallback((customer: Customer, status: CustomerStatus) => {
    updateMutation.mutate({ id: customer.id, data: { status } });
  }, [updateMutation]);

  const handleExport = useCallback(async () => {
    try {
      const response = await customersApi.export();
      const rows = response?.data?.rows ?? filteredCustomers;
      const headers = ['ID', 'Customer Name', 'Company Name', 'Mobile', 'Email', 'City', 'State', 'Status'];
      const csvRows = rows.map((c) => [
        c.customerId,
        c.customerName,
        c.companyName,
        c.mobile,
        c.email,
        c.city,
        c.state,
        c.status,
      ]);
      const csvContent = [headers, ...csvRows].map((row) => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Failed to export customers. Please try again.');
    }
  }, [filteredCustomers]);

  // Loading state - only show full loading screen on initial load
  if (isLoading && !allCustomersResponse) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Loading customers...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <p className="text-sm text-destructive">Failed to load customers</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <StandardPageLayout
        title="Customers"
        subtitle="Manage your customer database"
        headerActions={
          <Button onClick={() => setIsCreateDialogOpen(true)} className="h-9">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        }
        kpiCards={
          <>
            <KPICard data={kpiData[0]} />
            <KPICard data={kpiData[1]} />
            <KPICard data={kpiData[2]} />
            <KPICard data={kpiData[3]} />
          </>
        }
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name, company, mobile, email, city, GST, or customer code..."
        filters={filterConfigs}
        onClearFilters={handleClearFilters}
        filterMode="popover"
        toolbarActions={
          <Button variant="outline" size="sm" onClick={handleExport} className="h-9 gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        }
        className="gap-4 sm:gap-6"
      >
        <div className="min-w-0">
        <DataTable
          key={tableFilterKey}
          columns={columns}
          data={customers}
          showToolbar={false}
          compact
          onRowClick={handleRowClick}
          enableSelection={true}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          rowIdKey="id"
          emptyMessage="No customers found. Adjust your filters or add a new customer."
          rowActions={(row) => (
            <CustomerRowActions
              customer={row as Customer}
              onEdit={handleEditFromRow}
              onDelete={handleDeleteCustomer}
              onViewDetails={handleViewDetails}
              onStatusChange={handleStatusChange}
            />
          )}
        />
        </div>
      </StandardPageLayout>

      <CustomerViewDrawer
        customer={selectedCustomer}
        open={isViewDrawerOpen}
        onOpenChange={setIsViewDrawerOpen}
        onEdit={handleEditFromDrawer}
        activities={viewedActivities?.data ?? []}
      />

      {/* Create Customer Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Customer</DialogTitle>
          </DialogHeader>
          <Suspense fallback={<div className="flex items-center justify-center h-32">Loading form...</div>}>
            <CustomerForm
              onSubmit={handleCreateCustomer}
              onCancel={() => {
                setIsCreateDialogOpen(false);
                setFormError(null);
              }}
              isLoading={createMutation.isPending}
              error={formError}
              isEditMode={false}
            />
          </Suspense>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <Suspense fallback={<div className="flex items-center justify-center h-32">Loading form...</div>}>
              <CustomerForm
                initialData={selectedCustomer}
                onSubmit={handleEditCustomer}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setSelectedCustomerId(null);
                  setFormError(null);
                }}
                isLoading={updateMutation.isPending}
                error={formError}
                isEditMode={true}
              />
            </Suspense>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
