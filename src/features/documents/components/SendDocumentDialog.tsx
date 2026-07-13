'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Estimate, Proposal, Quotation } from '../types/peb-commercial';
import { Mail, MessageSquare, Link, Send, FileText } from 'lucide-react';

interface SendDocumentDialogProps {
  document: Estimate | Proposal | Quotation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendDocumentDialog({ document, open, onOpenChange }: SendDocumentDialogProps) {
  const [sending, setSending] = useState(false);
  const [emailData, setEmailData] = useState({
    to: '',
    cc: '',
    subject: '',
    body: '',
  });
  const [whatsappData, setWhatsAppData] = useState({
    to: '',
    template: '',
    message: '',
  });
  const [shareLink, setShareLink] = useState('');

  const handleSendEmail = async () => {
    setSending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSending(false);
    alert('Email sent successfully (mock)');
    onOpenChange(false);
  };

  const handleSendWhatsApp = async () => {
    setSending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSending(false);
    alert('WhatsApp message sent successfully (mock)');
    onOpenChange(false);
  };

  const handleGenerateShareLink = async () => {
    setSending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShareLink(`https://peb-crm.com/share/${document?.id || 'doc'}`);
    setSending(false);
  };

  const getDocumentNumber = () => {
    if (!document) return '';
    const doc = document as any;
    return doc.estimateNumber || doc.proposalNumber || doc.quotationNumber || '';
  };

  const getDocumentType = () => {
    if (!document) return '';
    const doc = document as any;
    if (doc.estimateNumber) return 'Estimate';
    if (doc.proposalNumber) return 'Proposal';
    if (doc.quotationNumber) return 'Quotation';
    return 'Document';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send {getDocumentType()} {getDocumentNumber()}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              WhatsApp
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email-to">To</Label>
              <Input
                id="email-to"
                placeholder="recipient@example.com"
                value={emailData.to}
                onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-cc">CC</Label>
              <Input
                id="email-cc"
                placeholder="cc@example.com"
                value={emailData.cc}
                onChange={(e) => setEmailData({ ...emailData, cc: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                placeholder={`${getDocumentType()} ${getDocumentNumber()}`}
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-body">Message</Label>
              <Textarea
                id="email-body"
                placeholder="Enter your message..."
                rows={6}
                value={emailData.body}
                onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">PDF will be attached automatically</span>
            </div>
            <Button onClick={handleSendEmail} disabled={sending || !emailData.to} className="w-full">
              {sending ? 'Sending...' : 'Send Email'}
            </Button>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp-to">Phone Number</Label>
              <Input
                id="whatsapp-to"
                placeholder="+91 98765 43210"
                value={whatsappData.to}
                onChange={(e) => setWhatsAppData({ ...whatsappData, to: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp-template">Template</Label>
              <Input
                id="whatsapp-template"
                placeholder="Select template"
                value={whatsappData.template}
                onChange={(e) => setWhatsAppData({ ...whatsappData, template: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp-message">Message</Label>
              <Textarea
                id="whatsapp-message"
                placeholder="Enter your message..."
                rows={6}
                value={whatsappData.message}
                onChange={(e) => setWhatsAppData({ ...whatsappData, message: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">PDF will be attached automatically</span>
            </div>
            <Button onClick={handleSendWhatsApp} disabled={sending || !whatsappData.to} className="w-full">
              {sending ? 'Sending...' : 'Send WhatsApp'}
            </Button>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
