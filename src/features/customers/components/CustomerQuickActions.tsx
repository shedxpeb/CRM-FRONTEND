'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileText, Send, DollarSign, Plus, MoreHorizontal, Mail, MessageSquare, FileSpreadsheet } from 'lucide-react';

interface CustomerQuickActionsProps {
  onCreateEstimate?: () => void;
  onCreateProposal?: () => void;
  onCreateQuotation?: () => void;
}

export const CustomerQuickActions = memo(function CustomerQuickActions({
  onCreateEstimate,
  onCreateProposal,
  onCreateQuotation,
}: CustomerQuickActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Primary Action - Most Prominent */}
      <Button
        variant="default"
        size="default"
        onClick={onCreateEstimate}
        disabled={!onCreateEstimate}
        className="gap-2 font-semibold"
      >
        <Plus className="h-4 w-4" />
        New Estimate
      </Button>

      {/* Secondary Actions - Smaller */}
      <Button
        variant="outline"
        size="sm"
        onClick={onCreateProposal}
        disabled={!onCreateProposal}
        className="gap-2"
      >
        <FileText className="h-4 w-4" />
        Proposal
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onCreateQuotation}
        disabled={!onCreateQuotation}
        className="gap-2"
      >
        <DollarSign className="h-4 w-4" />
        Quotation
      </Button>

      {/* More Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1">
            <MoreHorizontal className="h-4 w-4" />
            More
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </DropdownMenuItem>
          <DropdownMenuItem>
            <MessageSquare className="h-4 w-4 mr-2" />
            Send WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});
