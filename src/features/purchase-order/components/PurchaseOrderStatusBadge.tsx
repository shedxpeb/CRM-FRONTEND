'use client';
import { Badge } from '@/components/ui/badge';
import { PO_STATUS_CONFIG } from '../constants';

interface Props {
  status: string;
  className?: string;
}

export function PurchaseOrderStatusBadge({ status, className }: Props) {
  const config = PO_STATUS_CONFIG[status as keyof typeof PO_STATUS_CONFIG];
  if (!config) return <Badge variant="outline" className={className}>{status}</Badge>;
  return <Badge variant={config.variant} className={className}>{config.label}</Badge>;
}
