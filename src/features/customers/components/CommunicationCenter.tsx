'use client';

import { memo, useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { BackendPendingError } from '@/core/api/capabilities';

interface CommunicationCenterProps {
  customerId: string;
  customerName: string;
}

/**
 * Direct messaging UI for customers.
 * Backend communications API is not available yet — send attempts surface a clear error
 * instead of persisting fake local messages.
 */
export const CommunicationCenter = memo(function CommunicationCenter({
  customerId,
  customerName,
}: CommunicationCenterProps) {
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [error]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);
    setError(null);
    try {
      void customerId;
      throw new BackendPendingError('communications');
    } catch (err) {
      setError(
        err instanceof BackendPendingError
          ? 'Messaging is not available yet.'
          : err instanceof Error
            ? err.message
            : 'Failed to send message',
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Direct Message</CardTitle>
          <div className="text-xs text-muted-foreground">{customerName}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] overflow-y-auto mb-4 border rounded-lg p-4 bg-muted/30">
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm text-center px-4">
            {error || 'No messages yet. Messaging will be available when the communications API is enabled.'}
          </div>
          <div ref={messagesEndRef} />
        </div>
        <div className="flex gap-2">
          <Input
            placeholder={`Message to ${customerName}...`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                void handleSendMessage();
              }
            }}
            className="flex-1"
            aria-label={`Message to ${customerName}`}
            disabled={isSending}
          />
          <Button size="sm" onClick={() => void handleSendMessage()} disabled={isSending || !newMessage.trim()} aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
