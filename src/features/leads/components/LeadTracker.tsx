'use client';

import { memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Lead } from '@/types/leads';
import { 
  Clock,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  Building2,
  TrendingUp,
  Timer,
  AlertCircle
} from 'lucide-react';

interface LeadTrackerProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LeadTracker = memo(function LeadTracker({ lead, open, onOpenChange }: LeadTrackerProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'info';
      case 'Contacted': return 'warning';
      case 'Converted':
      case 'Approved': return 'success';
      case 'Rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'destructive';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      default: return 'secondary';
    }
  };

  const getDaysInStatus = () => {
    if (!lead.createdAt) return 0;
    const now = new Date();
    const created = new Date(lead.createdAt);
    const diff = now.getTime() - created.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getNextFollowUpDays = () => {
    if (!lead.nextFollowUpDate) return null;
    const now = new Date();
    const followUp = new Date(lead.nextFollowUpDate);
    const diff = followUp.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysInStatus = getDaysInStatus();
  const followUpDays = getNextFollowUpDays();
  const isOverdue = followUpDays !== null && followUpDays < 0;

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
                  <Badge variant={getStatusColor(lead.status)}>{lead.status}</Badge>
                  <Badge variant={getPriorityColor(lead.priority)}>{lead.priority}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Timer className="h-4 w-4" />
                    <span>Days in Pipeline</span>
                  </div>
                  <p className="text-2xl font-bold">{daysInStatus}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Next Follow-up</span>
                  </div>
                  <p className={`text-2xl font-bold ${isOverdue ? 'text-destructive' : ''}`}>
                    {followUpDays !== null ? `${followUpDays} days` : 'N/A'}
                  </p>
                  {isOverdue && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Overdue
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Assigned To</span>
                  </div>
                  <p className="text-sm font-medium">{lead.assignedTo || 'Unassigned'}</p>
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
                <div className="space-y-1 flex items-start gap-2 md:col-span-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{lead.addressLine1 || lead.addressLine2}</p>
                    <p className="text-sm text-muted-foreground">{lead.city}, {lead.state}</p>
                  </div>
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
                      {lead.createdAt ? (lead.createdAt instanceof Date ? lead.createdAt : new Date(lead.createdAt)).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      }) : '-'}
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
                        {(lead.lastFollowUp instanceof Date ? lead.lastFollowUp : new Date(lead.lastFollowUp)).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                )}
                
                {lead.nextFollowUpDate && (
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      isOverdue ? 'bg-destructive/15' : 'bg-orange-500/15'
                    }`}>
                      <Clock className={`h-4 w-4 ${isOverdue ? 'text-destructive' : 'text-orange-500'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Next Follow-up</p>
                      <p className={`text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {(lead.nextFollowUpDate instanceof Date ? lead.nextFollowUpDate : new Date(lead.nextFollowUpDate)).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
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
