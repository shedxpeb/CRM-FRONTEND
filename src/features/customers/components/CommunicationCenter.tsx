'use client';

import { useState, memo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { Communication } from '@/features/customers/types/communication';

interface CommunicationCenterProps {
  customerId: string;
  customerName: string;
}

// Mock data for frontend-only mode
const initialCommunications: Communication[] = [
  {
    id: '1',
    customerId: '1',
    type: 'whatsapp',
    status: 'sent',
    message: 'Hi, I wanted to follow up on the quotation we sent last week.',
    sender: 'Rahul Sharma',
    senderId: 'EMP001',
    recipient: 'ABC Construction',
    recipientId: 'CUST001',
    timestamp: new Date('2024-01-20T10:30:00'),
  },
  {
    id: '2',
    customerId: '1',
    type: 'whatsapp',
    status: 'received',
    message: 'Thank you for the quotation. We will review it and get back to you.',
    sender: 'ABC Construction',
    senderId: 'CUST001',
    recipient: 'Rahul Sharma',
    recipientId: 'EMP001',
    timestamp: new Date('2024-01-19T14:15:00'),
  },
  {
    id: '3',
    customerId: '1',
    type: 'whatsapp',
    status: 'sent',
    message: 'Great! Let me know if you have any questions.',
    sender: 'Rahul Sharma',
    senderId: 'EMP001',
    recipient: 'ABC Construction',
    recipientId: 'CUST001',
    timestamp: new Date('2024-01-18T11:00:00'),
  },
];

export const CommunicationCenter = memo(function CommunicationCenter({
  customerId,
  customerName,
}: CommunicationCenterProps) {
  const [messages, setMessages] = useState<Communication[]>(initialCommunications);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newComm: Communication = {
        id: Date.now().toString(),
        customerId,
        type: 'whatsapp',
        status: 'sent',
        message: newMessage,
        sender: 'Rahul Sharma',
        senderId: 'EMP001',
        recipient: customerName,
        recipientId: customerId,
        timestamp: new Date(),
      };
      setMessages([...messages, newComm]);
      setNewMessage('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Direct Message</CardTitle>
          <div className="text-xs text-muted-foreground">
            {customerName}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] overflow-y-auto mb-4 border rounded-lg p-4 bg-gray-50">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No messages yet
              </div>
            ) : (
              messages.map((comm) => (
                <div
                  key={comm.id}
                  className={`flex gap-3 ${comm.status === 'sent' ? 'justify-end' : 'justify-start'}`}
                >
                  {comm.status === 'received' && (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold text-sm flex-shrink-0">
                      {comm.sender.charAt(0)}
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg p-4 shadow-sm ${
                      comm.status === 'sent'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold">{comm.sender}</span>
                      <span className="text-xs opacity-70">
                        {comm.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{comm.message}</p>
                    {comm.subject && (
                      <p className="text-xs font-semibold mt-2 opacity-90">{comm.subject}</p>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        {/* Message Input */}
        <div className="flex gap-2">
          <Input
            placeholder={`Message to ${customerName}...`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            className="flex-1"
          />
          <Button size="sm" onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
