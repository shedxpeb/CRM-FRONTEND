'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectMilestone } from '@/features/projects/types';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface MilestoneTrackerProps {
  milestones: ProjectMilestone[];
}

// Move helper functions outside component to prevent recreation
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getMilestoneIcon = (status: string) => {
  switch (status) {
    case 'Completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'In Progress':
      return <Clock className="h-4 w-4 text-blue-600" />;
    case 'Delayed':
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
};

const getMilestoneStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-700';
    case 'In Progress':
      return 'bg-blue-100 text-blue-700';
    case 'Delayed':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export const MilestoneTracker = React.memo(function MilestoneTracker({ milestones }: MilestoneTrackerProps) {

  const completedCount = milestones.filter((m) => m.status === 'Completed').length;
  const progress = (completedCount / milestones.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>Milestone Tracker</span>
          <Badge variant="outline">{completedCount}/{milestones.length} Completed</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Overall Progress</span>
            <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Milestones List */}
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`p-2 rounded-full ${getMilestoneStatusColor(milestone.status)}`}>
                  {getMilestoneIcon(milestone.status)}
                </div>
                {index < milestones.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-200 mt-2" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">{milestone.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        Planned: {formatDate(milestone.plannedDate)}
                      </span>
                      {milestone.actualDate && (
                        <span className="text-xs text-muted-foreground">
                          | Actual: {formatDate(milestone.actualDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className={getMilestoneStatusColor(milestone.status)}>
                    {milestone.status}
                  </Badge>
                </div>
                {milestone.delay && milestone.delay !== 0 && (
                  <p className={`text-xs mt-1 ${milestone.delay > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {milestone.delay > 0 ? `Delayed by ${milestone.delay} days` : `Completed ${Math.abs(milestone.delay)} days early`}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
