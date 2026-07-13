/**
 * Communication Module Types
 * Frontend-only architecture for CRM Communication Center
 * Prepared for future backend integration
 */

export type CommunicationType = 'whatsapp' | 'email' | 'call' | 'meeting' | 'note';

export type CommunicationStatus = 'sent' | 'received' | 'read' | 'pending';

export interface Communication {
  id: string;
  customerId: string;
  type: CommunicationType;
  status: CommunicationStatus;
  subject?: string;
  message: string;
  sender: string;
  senderId: string;
  recipient: string;
  recipientId: string;
  timestamp: Date;
  projectId?: string; // Direct link to Project for hierarchy
  metadata?: {
    duration?: number; // for calls/meetings
    attachmentUrl?: string;
    relatedTo?: {
      type: 'project' | 'quotation' | 'estimate' | 'proposal';
      id: string;
      name: string;
    };
  };
}

export interface Conversation {
  customerId: string;
  customerName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  type: CommunicationType;
}

export interface CommunicationFilter {
  type?: CommunicationType;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}
