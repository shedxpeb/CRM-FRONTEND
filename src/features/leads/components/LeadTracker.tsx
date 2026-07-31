'use client';

import { memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Lead } from '@/types/leads';
import { getLeadStatusVariant, getLeadPriorityVariant } from '@/features/leads/constants';
import { 
  Clock,
  Calendar,
  User,
  Phone,
  Mail,
  Building2,
  TrendingUp,
  Timer
} from 'lucide-react';
import dayjs from 'dayjs';

interface LeadTrackerProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LeadTracker = memo(function LeadTracker({ lead, open, onOpenChange }: LeadTrackerProps) {
  const getDaysInStatus = () => {
    if (!lead.createdAt) return 0;
    const now = new Date();
    const created = new Date(lead.createdAt);
    const diff = now.getTime() - created.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const daysInStatus = getDaysInStatus();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Lead Tracker - #{lead.leadNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-base">Current Status</h3>
                <div className="flex gap-2">
                  <Badge variant={getLeadStatusVariant(lead.status)}>{lead.status}</Badge>
                  <Badge variant={getLeadPriorityVariant(lead.priority)}>{lead.priority}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Timer className="h-4 w-4" />
                    <span>Days in Pipeline</span>
                  </div>
                  <p className="text-2xl font-bold">{daysInStatus}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>Source</span>
                  </div>
                  <p className="text-sm font-medium">{lead.source}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-base mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Customer Name</p>
                  <p className="font-medium">{lead.customerName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Company</p>
                  <p className="font-medium">{lead.companyName}</p>
                </div>
                <div className="space-y-1 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{lead.mobile}</p>
                </div>
                <div className="space-y-1 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{lead.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Info */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-base mb-4">Project Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Project Title</p>
                  <p className="font-medium">{lead.projectTitle}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Project Type</p>
                    <p className="font-medium">{lead.projectType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Structure Type</p>
                    <p className="font-medium">{lead.structureType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Dimensions</p>
                    <p className="font-medium">
                      {lead.width || '-'} × {lead.length || '-'} × {lead.height || '-'} m
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-base mb-4">Key Dates</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-blue-500/15 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-xs text-muted-foreground">
                      {lead.createdAt && dayjs(lead.createdAt).isValid() ? dayjs(lead.createdAt).format('DD/MM/YYYY') : '-'}
                    </p>
                  </div>
                </div>
                
                {lead.lastFollowUp && (
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-green-500/15 rounded-lg flex items-center justify-center">
                      <Phone className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Last Follow-up</p>
                      <p className="text-xs text-muted-foreground">
                        {dayjs(lead.lastFollowUp).isValid() ? dayjs(lead.lastFollowUp).format('DD/MM/YYYY') : '-'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
});
