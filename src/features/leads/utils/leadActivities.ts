import { Lead, LeadActivity } from '@/types/leads';

/**
 * Generate lead activities from lead data
 * This is a client-side utility for displaying activity history
 * In production, this should come from the backend
 */
export function getLeadActivities(leadId: string, lead?: Lead): LeadActivity[] {
  const activities: LeadActivity[] = [
    {
      id: `${leadId}-created`,
      leadId,
      type: 'created',
      description: 'Lead created',
      performedBy: lead?.createdBy || 'System',
      performedAt: lead?.createdAt ? new Date(lead.createdAt) : new Date(),
    },
  ];

  if (lead?.assignedTo) {
    activities.push({
      id: `${leadId}-assigned`,
      leadId,
      type: 'assigned',
      description: `Lead assigned to ${lead.assignedTo}`,
      performedBy: 'System',
      performedAt: lead.createdAt ? new Date(lead.createdAt) : new Date(),
      metadata: { assignedTo: lead.assignedTo },
    });
  }

  if (lead?.lastFollowUp) {
    activities.push({
      id: `${leadId}-followup`,
      leadId,
      type: 'followup',
      description: 'Follow-up completed',
      performedBy: lead.assignedTo || 'Sales Team',
      performedAt: new Date(lead.lastFollowUp),
    });
  }

  if (lead?.customerId) {
    activities.push({
      id: `${leadId}-converted`,
      leadId,
      type: 'converted',
      description: 'Lead converted to customer',
      performedBy: lead.assignedTo || 'Sales Team',
      performedAt: lead.convertedDate ? new Date(lead.convertedDate) : new Date(),
      metadata: { customerId: lead.customerId },
    });
  }

  if (lead?.updatedAt) {
    activities.push({
      id: `${leadId}-updated`,
      leadId,
      type: 'updated',
      description: 'Lead details updated',
      performedBy: lead.updatedBy || lead.assignedTo || 'System',
      performedAt: new Date(lead.updatedAt),
    });
  }

  return activities.sort(
    (a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
  );
}
