'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { purchaseOrderApi, PurchaseOrder } from '@/features/purchase-order';
import { vendorApi } from '@/features/vendor';
import { ShoppingCart, Truck, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function PurchaseDashboardPage() {
  const { data: poStats } = useQuery({
    queryKey: ['po-stats'],
    queryFn: () => purchaseOrderApi.getStats(),
  });

  const { data: vendorStats } = useQuery({
    queryKey: ['vendor-stats'],
    queryFn: () => vendorApi.getStats(),
  });

  const { data: recentPOs } = useQuery({
    queryKey: ['recent-pos'],
    queryFn: () => purchaseOrderApi.getAll({ page: 1, pageSize: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
  });

  const { data: pendingPOs } = useQuery({
    queryKey: ['pending-pos'],
    queryFn: () => purchaseOrderApi.getAll({ 
      page: 1, 
      pageSize: 5, 
      filter: { status: 'PendingApproval' },
      sortBy: 'createdAt', 
      sortOrder: 'desc' 
    }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Purchase Dashboard</h1>
        <p className="text-muted-foreground">Overview of your procurement activities</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {vendorStats?.active || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total POs</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{poStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {poStats?.approved || 0} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{poStats?.pendingApproval || 0}</div>
            <p className="text-xs text-muted-foreground">
              {poStats?.draft || 0} draft
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchase Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{((poStats?.totalPurchase || 0) / 100000).toFixed(1)}L
            </div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>PO Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="text-sm">Draft</span>
                </div>
                <span className="font-medium">{poStats?.draft || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="text-sm">Pending Approval</span>
                </div>
                <span className="font-medium">{poStats?.pendingApproval || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-sm">Approved</span>
                </div>
                <span className="font-medium">{poStats?.approved || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400" />
                  <span className="text-sm">Sent</span>
                </div>
                <span className="font-medium">{poStats?.sent || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-sm">Active Vendors</span>
                </div>
                <span className="font-medium">{vendorStats?.active || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="text-sm">Inactive Vendors</span>
                </div>
                <span className="font-medium">{vendorStats?.inactive || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Purchase Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPOs?.data.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No purchase orders yet</p>
          ) : (
            <div className="space-y-4">
              {recentPOs?.data.map((po: PurchaseOrder) => (
                <div key={po.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="space-y-1">
                    <p className="font-medium">{po.poNumber}</p>
                    <p className="text-sm text-muted-foreground">{po.vendorName}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium">₹{po.grandTotal.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(po.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Approval */}
      {pendingPOs && pendingPOs.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingPOs.data.map((po: PurchaseOrder) => (
                <div key={po.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="space-y-1">
                    <p className="font-medium">{po.poNumber}</p>
                    <p className="text-sm text-muted-foreground">{po.vendorName}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium">₹{po.grandTotal.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(po.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
