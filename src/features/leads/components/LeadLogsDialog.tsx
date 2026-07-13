'use client';

import { useState, memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Lead, LeadActivity } from '@/types/leads';
import { 
  FileText,
  Search,
  Plus,
  Edit,
  Phone,
  Send,
  UserCheck,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter
} from 'lucide-react';

interface LeadLogsDialogProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock activity logs - replace with API call
const mockActivities: LeadActivity[] = [
  {
    id: '1',
    leadId: '1',
    type: 'created',
    description: 'Lead created from website enquiry',
    performedBy: 'Admin',
    performedAt: new Date('2024-05-28T10:30:00'),
  },
  {
    id: '2',
    leadId: '1',
    type: 'assigned',
    description: 'Lead assigned to Vikram Singh',
    performedBy: 'Admin',
    performedAt: new Date('2024-05-28T10:35:00'),
    metadata: { assignedTo: 'Vikram Singh' },
  },
  {
    id: '3',
    leadId: '1',
    type: 'followup',
    description: 'Initial follow-up call completed - Customer interested in PEB structure',
    performedBy: 'Vikram Singh',
    performedAt: new Date('2024-05-29T14:00:00'),
    metadata: { callDuration: '15 min', outcome: 'Interested', notes: 'Budget approved' },
  },
  {
    id: '4',
    leadId: '1',
    type: 'updated',
    description: 'Updated project height from 10m to 12m',
    performedBy: 'Vikram Singh',
    performedAt: new Date('2024-05-29T14:30:00'),
    metadata: { field: 'height', oldValue: '10m', newValue: '12m' },
  },
  {
    id: '5',
    leadId: '1',
    type: 'status_changed',
    description: 'Status changed from New to Contacted',
    performedBy: 'Vikram Singh',
    performedAt: new Date('2024-05-30T09:00:00'),
    metadata: { oldStatus: 'New', newStatus: 'Contacted' },
  },
  {
    id: '6',
    leadId: '1',
    type: 'document_sent',
    description: 'Company brochure and PEB catalog sent via email',
    performedBy: 'Vikram Singh',
    performedAt: new Date('2024-05-30T11:00:00'),
    metadata: { documentType: 'Brochure', sentVia: 'Email' },
  },
  {
    id: '7',
    leadId: '1',
    type: 'followup',
    description: 'Second follow-up - Discussed technical requirements',
    performedBy: 'Vikram Singh',
    performedAt: new Date('2024-06-01T15:30:00'),
    metadata: { callDuration: '25 min', outcome: 'Very Interested' },
  },
];

export const LeadLogsDialog = memo(function LeadLogsDialog({ lead, open, onOpenChange }: LeadLogsDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const getActivityIcon = (type: LeadActivity['type']) => {
    switch (type) {
      case 'created': return <Plus className="h-4 w-4" />;
      case 'updated': return <Edit className="h-4 w-4" />;
      case 'followup': return <Phone className="h-4 w-4" />;
      case 'document_sent': return <Send className="h-4 w-4" />;
      case 'assigned': return <UserCheck className="h-4 w-4" />;
      case 'converted': return <CheckCircle className="h-4 w-4" />;
      case 'status_changed': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: LeadActivity['type']) => {
    switch (type) {
      case 'created': return 'bg-blue-500/15 text-blue-600 border-blue-500/25';
      case 'updated': return 'bg-yellow-500/15 text-yellow-600 border-yellow-500/25';
      case 'followup': return 'bg-green-500/15 text-green-600 border-green-500/25';
      case 'document_sent': return 'bg-purple-500/15 text-purple-600 border-purple-500/25';
      case 'assigned': return 'bg-cyan-500/15 text-cyan-600 border-cyan-500/25';
      case 'converted': return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25';
      case 'status_changed': return 'bg-orange-500/15 text-orange-600 border-orange-500/25';
      default: return 'bg-gray-500/15 text-gray-600 border-gray-500/25';
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const filteredActivities = mockActivities.filter((activity) => {
    const matchesSearch = searchQuery
      ? activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.performedBy.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    const matchesFilter = filterType === 'all' || activity.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Activity Logs - Lead #{lead.leadNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search activities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 text-sm rounded-md border border-input bg-background"
                  >
                    <option value="all">All Activities</option>
                    <option value="created">Created</option>
                    <option value="updated">Updated</option>
                    <option value="followup">Follow-ups</option>
                    <option value="document_sent">Documents</option>
                    <option value="assigned">Assigned</option>
                    <option value="status_changed">Status Changes</option>
                    <option value="converted">Converted</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {filteredActivities.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">No activities found</p>
                  </div>
                ) : (
                  filteredActivities.map((activity, index) => (
                    <div key={activity.id} className="flex gap-4">
                      {/* Icon */}
                      <div className="flex flex-col items-center">
                        <div className={`p-2.5 rounded-lg border ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        {index !== filteredActivities.length - 1 && (
                          <div className="w-0.5 h-full bg-border mt-2" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.description}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-xs text-muted-foreground">
                                by <span className="font-medium">{activity.performedBy}</span>
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {activity.type.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatTimeAgo(activity.performedAt)}
                            </p>
                            <p className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">
                              {formatDateTime(activity.performedAt)}
                            </p>
                          </div>
                        </div>

                        {/* Metadata */}
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(activity.metadata).map(([key, value], index) => (
                                <div key={`${key}-${index}`} className="text-xs">
                                  <span className="font-medium text-muted-foreground">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                                  </span>{' '}
                                  <span className="text-foreground">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Summary */}
              {filteredActivities.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Total Activities: {filteredActivities.length}</span>
                    <span>Last Activity: {formatTimeAgo(filteredActivities[0].performedAt)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
});
