'use client';

import { useState, memo, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Lead, LeadStatus } from '@/types/leads';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Phone, Mail, X, MoreVertical, Trash2, UserPlus, Mail as MailIcon } from 'lucide-react';

interface LeadCalendarViewProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

export const LeadCalendarView = memo(function LeadCalendarView({ leads, onLeadClick }: LeadCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'New': return 'bg-blue-500';
      case 'Contacted': return 'bg-yellow-500';
      case 'DesignPending':
      case 'BOQPending': return 'bg-indigo-500';
      case 'EstimateSent':
      case 'ProposalSent': return 'bg-purple-500';
      case 'Negotiation': return 'bg-orange-500';
      case 'Approved':
      case 'Converted': return 'bg-green-500';
      case 'Rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Create calendar days array - memoized to prevent recreation on every render
  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      days.push(date);
    }
    
    return days;
  }, [currentDate, daysInMonth, startingDayOfWeek]);

  // Pre-compute leads grouped by next follow-up date
  const leadsByDate = useMemo(() => {
    const grouped: Record<string, Lead[]> = {};
    
    leads.forEach(lead => {
      const date = lead.nextFollowUpDate || lead.createdAt;
      if (!date) return;
      const dateStr = new Date(date).toDateString();
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(lead);
    });
    
    return grouped;
  }, [leads]);

  const getLeadsForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return leadsByDate[dateStr] || [];
  };

  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentDate.getMonth() && 
                        today.getFullYear() === currentDate.getFullYear();

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-bold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <span className="text-sm text-muted-foreground">
                ({leads.length} leads)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-3">
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground p-1">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-12 bg-muted/10 rounded-md" />;
              }
              
              const dayLeads = getLeadsForDate(date);
              const isToday = date.toDateString() === today.toDateString();
              const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
              
              // Calculate status counts for hover
              const statusCounts = dayLeads.reduce((acc, lead) => {
                acc[lead.status] = (acc[lead.status] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);
              
              return (
                <div
                  key={date.toISOString()}
                  className={`h-20 border rounded-md p-1 cursor-pointer transition-all hover:shadow-md hover:scale-105 relative group ${
                    isSelected ? 'border-primary bg-primary/10 ring-2 ring-primary' : 
                    isToday ? 'border-primary bg-primary/5' : 'border-border bg-background hover:bg-muted/50'
                  }`}
                  onClick={() => dayLeads.length > 0 && setSelectedDate(date)}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-[9px] font-semibold ${isToday ? 'text-primary' : ''}`}>
                      {date.getDate()}
                    </span>
                    {dayLeads.length > 0 && (
                      <Badge variant="secondary" className="text-[7px] px-0.5 py-0 h-3">
                        {dayLeads.length}
                      </Badge>
                    )}
                  </div>
                  
                  {/* All leads as dots */}
                  <div className="flex flex-wrap gap-0.5 justify-center">
                    {dayLeads.slice(0, 5).map(lead => (
                      <div
                        key={lead.id}
                        className={`h-2 w-2 rounded-full ${getStatusColor(lead.status)}`}
                    
                        title={`${lead.customerName} - ${lead.status}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onLeadClick(lead);
                        }}
                      />
                    ))}
                    {dayLeads.length > 5 && (
                      <div className="h-0.5 w-0.5 rounded-full bg-muted-foreground" title={`${dayLeads.length - 5} more`} />
                    )}
                  </div>

                  {/* Hover tooltip with summary */}
                  {dayLeads.length > 0 && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-36 bg-background border rounded-lg shadow-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                      <div className="text-[10px] font-semibold mb-1.5">{dayLeads.length} leads</div>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {dayLeads.slice(0, 5).map(lead => (
                          <div key={lead.id} className="flex items-center gap-1.5 text-[8px]">
                            <div className={`h-1 w-1 rounded-full ${getStatusColor(lead.status)}`} />
                            <span className="truncate">{lead.customerName}</span>
                          </div>
                        ))}
                        {dayLeads.length > 5 && (
                          <div className="text-[8px] text-muted-foreground text-center">
                            +{dayLeads.length - 5} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Centered popup dialog for selected date */}
      <Dialog open={selectedDate !== null} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </DialogTitle>
          </DialogHeader>
          
          {/* Bulk action bar - appears when leads are selected */}
          {selectedLeads.size > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{selectedLeads.size} lead(s) selected</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedLeads(new Set())}>
                    Clear
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                  <Button variant="outline" size="sm">
                    <UserPlus className="h-4 w-4 mr-1" />
                    Convert to Customer
                  </Button>
                  <Button variant="outline" size="sm">
                    <MailIcon className="h-4 w-4 mr-1" />
                    Send Email
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {selectedDate && getLeadsForDate(selectedDate).map(lead => (
              <div
                key={lead.id}
                className={`p-3 rounded-lg transition-all ${
                  selectedLeads.has(lead.id) ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50 hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Select checkbox at start - fixed, outside scroll */}
                  <div className="shrink-0">
                    <Checkbox
                      checked={selectedLeads.has(lead.id)}
                      onCheckedChange={(checked) => {
                        const newSelected = new Set(selectedLeads);
                        if (checked) {
                          newSelected.add(lead.id);
                        } else {
                          newSelected.delete(lead.id);
                        }
                        setSelectedLeads(newSelected);
                      }}
                    />
                  </div>
                  
                  {/* Lead content - scrollable */}
                  <div 
                    className="flex-1 min-w-0 cursor-pointer overflow-x-auto"
                    onClick={() => {
                      onLeadClick(lead);
                      setSelectedDate(null);
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1 whitespace-nowrap">
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(lead.status)}`} />
                      <span className="font-semibold text-sm">{lead.customerName}</span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {lead.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span>{lead.companyName || lead.customerName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span>{lead.mobile || '-'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span>{lead.email || '-'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 3-dot action menu at end - fixed, outside scroll */}
                  <div className="shrink-0">
                    <button
                      className="p-1 hover:bg-muted rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle action menu click
                      }}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {selectedDate && getLeadsForDate(selectedDate).length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No leads on this date
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});
