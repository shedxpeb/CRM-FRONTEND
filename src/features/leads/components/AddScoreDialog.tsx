'use client';

import { useState, memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lead } from '@/types/leads';
import { TrendingUp, Info } from 'lucide-react';

interface AddScoreDialogProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (score: number) => void;
}

export const AddScoreDialog = memo(function AddScoreDialog({ lead, open, onOpenChange, onSubmit }: AddScoreDialogProps) {
  const [score, setScore] = useState(50);

  const getScoreLabel = (score: number) => {
    if (score >= 90) return { label: 'Hot Lead', color: 'text-red-600' };
    if (score >= 70) return { label: 'Warm Lead', color: 'text-orange-600' };
    if (score >= 50) return { label: 'Moderate Lead', color: 'text-yellow-600' };
    if (score >= 30) return { label: 'Cool Lead', color: 'text-blue-600' };
    return { label: 'Cold Lead', color: 'text-gray-600' };
  };

  const scoreInfo = getScoreLabel(score);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(score);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Add Lead Score - #{lead.leadNumber}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{lead.customerName}</p>
                  <p className="text-xs text-muted-foreground">{lead.companyName}</p>
                  <p className="text-xs text-muted-foreground">{lead.projectTitle}</p>
                </div>
              </CardContent>
            </Card>

            {/* Score Input */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Lead Score (0-100)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => setScore(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className={`text-2xl font-bold ${scoreInfo.color}`}>
                    {score}
                  </span>
                </div>
              </div>

              {/* Score Label */}
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className={`text-lg font-bold ${scoreInfo.color}`}>
                  {scoreInfo.label}
                </p>
              </div>

              {/* Score Guidelines */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-xs font-medium">Scoring Guidelines</p>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-red-600 font-medium">90-100: Hot Lead</span>
                      <span className="text-muted-foreground">Ready to convert, budget approved</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-orange-600 font-medium">70-89: Warm Lead</span>
                      <span className="text-muted-foreground">Interested, negotiations ongoing</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-yellow-600 font-medium">50-69: Moderate Lead</span>
                      <span className="text-muted-foreground">Engaged, evaluating options</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600 font-medium">30-49: Cool Lead</span>
                      <span className="text-muted-foreground">Initial contact, gathering info</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">0-29: Cold Lead</span>
                      <span className="text-muted-foreground">New lead, qualification pending</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Score Buttons */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Quick Select</label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { value: 10, label: 'Cold' },
                    { value: 30, label: 'Cool' },
                    { value: 50, label: 'Moderate' },
                    { value: 70, label: 'Warm' },
                    { value: 90, label: 'Hot' },
                  ].map((item, index) => (
                    <Button
                      key={`${item.value}-${index}`}
                      type="button"
                      variant={score === item.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setScore(item.value)}
                      className="text-xs"
                    >
                      {item.value} - {item.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Update Score
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});
