'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  User, 
  X,
  CheckCheck,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TaskNotification {
  id: string;
  type: 'Task Assigned' | 'Task Updated' | 'Task Due Today' | 'Task Due Tomorrow' | 'Task Completed' | 'Task Reopened' | 'Task Mention';
  taskId: string;
  taskTitle: string;
  message: string;
  createdAt: Date;
  read: boolean;
  userId: string;
}

interface NotificationCenterProps {
  notifications: TaskNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onNotificationClick: (notification: TaskNotification) => void;
  currentUserId?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  onNotificationClick,
  currentUserId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: TaskNotification['type']) => {
    switch (type) {
      case 'Task Assigned':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'Task Updated':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'Task Due Today':
      case 'Task Due Tomorrow':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'Task Completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Task Reopened':
        return <Clock className="h-4 w-4 text-purple-600" />;
      case 'Task Mention':
        return <User className="h-4 w-4 text-cyan-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: TaskNotification['type']) => {
    switch (type) {
      case 'Task Assigned':
        return 'border-l-blue-500';
      case 'Task Updated':
        return 'border-l-yellow-500';
      case 'Task Due Today':
      case 'Task Due Tomorrow':
        return 'border-l-orange-500';
      case 'Task Completed':
        return 'border-l-green-500';
      case 'Task Reopened':
        return 'border-l-purple-500';
      case 'Task Mention':
        return 'border-l-cyan-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const sortedNotifications = [...notifications].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  return (
    <>
      {/* Bell Button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notification Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} unread
                  </Badge>
                )}
              </DialogTitle>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMarkAllAsRead}
                    className="h-8 text-xs"
                  >
                    <CheckCheck className="h-3.5 w-3.5 mr-1" />
                    Mark all read
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="h-8 text-xs text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Clear all
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[60vh]">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={cn(
                      'cursor-pointer transition-colors hover:bg-muted/50 border-l-4',
                      getNotificationColor(notification.type),
                      !notification.read && 'bg-muted/30'
                    )}
                    onClick={() => {
                      onNotificationClick(notification);
                      if (!notification.read) {
                        onMarkAsRead(notification.id);
                      }
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {notification.type}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(notification.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="truncate">{notification.taskTitle}</span>
                            <span className="whitespace-nowrap">
                              {notification.createdAt.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
