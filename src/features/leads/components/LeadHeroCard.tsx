'use client';

import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Ruler,
  User,
  Hash,
  Copy,
} from 'lucide-react';
import { Lead, LeadPriority, LeadStatus } from '@/types/leads';
import { cn } from '@/lib/utils';
import { componentTextSizes } from '@/lib/design-system';

function getStatusVariant(status: LeadStatus) {
  if (status === 'New') return 'info';
  if (status === 'Contacted') return 'warning';
  if (status === 'Converted' || status === 'Approved') return 'success';
  if (status === 'Rejected') return 'destructive';
  return 'secondary';
}

function getPriorityVariant(priority: LeadPriority) {
  if (priority === 'Urgent') return 'destructive';
  if (priority === 'High') return 'warning';
  if (priority === 'Medium') return 'info';
  return 'secondary';
}

function formatDate(value?: Date | string | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

interface LeadHeroCardProps {
  lead: Lead;
  compact?: boolean;
}

export const LeadHeroCard = memo(function LeadHeroCard({ lead, compact = false }: LeadHeroCardProps) {
  const area = lead.width && lead.length ? lead.width * lead.length : undefined;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {lead.companyName.charAt(0)}
        </div>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-sm font-semibold truncate">{lead.companyName}</span>
          <Badge variant={getStatusVariant(lead.status)} className="text-xs flex-shrink-0">
            {lead.status}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground hidden md:inline flex-shrink-0">
          {lead.mobile}
        </span>
        <div className="hidden lg:flex items-center gap-4 ml-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-blue-600">{lead.projectType}</span>
          </div>
          <div className="flex items-center gap-2">
            <Ruler className="h-3.5 w-3.5 text-green-600" />
            <span className="text-xs font-semibold text-green-600">{lead.structureType}</span>
          </div>
          {area !== undefined && (
            <div className="flex items-center gap-2">
              <Hash className="h-3.5 w-3.5 text-purple-600" />
              <span className="text-xs font-semibold text-purple-600">{area} sqm</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="border-2">
      <div className="p-6">
        <div className="flex items-start gap-6 mb-6">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {lead.companyName.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h2 className={cn(componentTextSizes.pageHeader.title, 'font-bold')}>
                {lead.companyName}
              </h2>
              <Badge variant={getStatusVariant(lead.status)}>{lead.status}</Badge>
              <Badge variant={getPriorityVariant(lead.priority)}>{lead.priority} Priority</Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{lead.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{lead.mobile}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(lead.mobile)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="break-all">{lead.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{lead.city}, {lead.state}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Lead ID: <span className="font-mono font-medium text-foreground">#{lead.leadNumber}</span>
              {lead.assignedTo && (
                <> · Assigned to <span className="font-medium text-foreground">{lead.assignedTo}</span></>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Project Type</p>
            <p className="text-sm font-semibold">{lead.projectType}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Structure Type</p>
            <p className="text-sm font-semibold">{lead.structureType}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Area</p>
            <p className="text-sm font-semibold">{area !== undefined ? `${area} sqm` : '-'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Next Follow-up
            </p>
            <p className="text-sm font-semibold">{formatDate(lead.nextFollowUpDate)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
});
