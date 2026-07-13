'use client';

import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Hash,
  Copy,
  ExternalLink,
  DollarSign,
  FolderKanban,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { Customer } from '@/features/customers';

interface CustomerHeroCardProps {
  customer: Customer;
  metrics: {
    totalRevenue: number;
    activeProjects: number;
    completedProjects: number;
    pendingQuotations: number;
  };
  compact?: boolean;
  status?: string;
}

export const CustomerHeroCard = memo(function CustomerHeroCard({
  customer,
  metrics,
  compact = false,
  status,
}: CustomerHeroCardProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {customer.companyName.charAt(0)}
        </div>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-sm font-semibold truncate">{customer.companyName}</span>
          {status && (
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {status}
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground hidden md:inline flex-shrink-0">
          {customer.mobile}
        </span>
        <div className="hidden lg:flex items-center gap-4 ml-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5 text-green-600" />
            <span className="text-xs font-semibold text-green-600">₹{(metrics.totalRevenue / 100000).toFixed(1)}L</span>
          </div>
          <div className="flex items-center gap-2">
            <FolderKanban className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-blue-600">{metrics.activeProjects}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-xs font-semibold text-amber-600">{metrics.pendingQuotations}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-2">
      <div className="p-6">
        {/* Top Section: Name, Contact, Location */}
        <div className="flex items-start gap-6 mb-6">
          {/* Avatar */}
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {customer.companyName.charAt(0)}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            {/* Company Name */}
            <h2 className="text-2xl font-bold mb-2">{customer.companyName}</h2>

            {/* Contact Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span>{customer.customerName}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2 group">
                <Phone className="h-4 w-4" />
                <span>{customer.mobile}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => copyToClipboard(customer.mobile, 'Phone')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <span>•</span>
              <div className="flex items-center gap-2 group">
                <Mail className="h-4 w-4" />
                <span>{customer.email}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => copyToClipboard(customer.email, 'Email')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Location + GST Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {customer.city}, {customer.state}
                </span>
              </div>
              {customer.gstNumber && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-2 group">
                    <Hash className="h-4 w-4" />
                    <span className="font-mono text-xs">GST: {customer.gstNumber}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(customer.gstNumber!, 'GST')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Financial Metrics */}
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950 rounded-lg">
            <DollarSign className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-lg font-bold text-green-600">
                ₹{(metrics.totalRevenue / 100000).toFixed(1)}L
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <FolderKanban className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-xs text-muted-foreground">Active Projects</p>
              <p className="text-lg font-bold text-blue-600">{metrics.activeProjects}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-lg font-bold text-emerald-600">{metrics.completedProjects}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950 rounded-lg">
            <FileText className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-xs text-muted-foreground">Pending Quotes</p>
              <p className="text-lg font-bold text-amber-600">{metrics.pendingQuotations}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
});
