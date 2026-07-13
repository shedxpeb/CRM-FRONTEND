'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Building, Phone, Mail, MapPin } from 'lucide-react';
import { Customer, CustomerStatus } from '@/features/customers';
import { getStatusVariant } from '@/features/customers/constants';

interface CustomerSummaryProps {
  customer: Customer;
  lastActivity?: Date;
  lastCommunication?: Date;
}

export const CustomerSummary = memo(function CustomerSummary({
  customer,
  lastActivity,
  lastCommunication,
}: CustomerSummaryProps) {
  const daysSince = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Customer Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Name & Status */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold">{customer.customerName}</h3>
            <p className="text-sm text-muted-foreground">{customer.companyName}</p>
          </div>
          <Badge variant={getStatusVariant(customer.status as CustomerStatus)} className="text-xs">
            {customer.status}
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground text-xs">Customer Since</p>
              <p className="font-medium">{customer.customerSince.toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground text-xs">Industry</p>
              <p className="font-medium">{customer.industry}</p>
            </div>
          </div>
        </div>

        {/* Contact Summary */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{customer.mobile}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{customer.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{customer.city}, {customer.state}</span>
          </div>
        </div>

        {/* Activity Indicators */}
        <div className="pt-3 border-t space-y-2">
          {lastActivity && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-xs">Last Activity</p>
                <p className="font-medium">
                  {daysSince(lastActivity) === 0 ? 'Today' : daysSince(lastActivity) === 1 ? 'Yesterday' : `${daysSince(lastActivity)} days ago`}
                </p>
              </div>
            </div>
          )}
          {lastCommunication && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-xs">Last Communication</p>
                <p className="font-medium">
                  {daysSince(lastCommunication) === 0 ? 'Today' : daysSince(lastCommunication) === 1 ? 'Yesterday' : `${daysSince(lastCommunication)} days ago`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Assigned Employee */}
        {customer.assignedEmployee && (
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground text-xs">Assigned To</p>
                <p className="font-medium">{customer.assignedEmployee}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
