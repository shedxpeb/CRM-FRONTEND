'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { 
  Proposal, 
  Estimate,
  CreateProposalDto,
  TechnicalSpecifications,
} from '../types/peb-commercial';
import { useCustomerAutofill } from '../hooks/useCustomerAutofill';
import { TechnicalSpecsForm } from './TechnicalSpecsForm';

interface ProposalBuilderProps {
  estimate?: Estimate | null;
  proposal?: Proposal;
  lead?: {
    id: string;
    leadId: string;
    customerId?: string;
    customerName: string;
    companyName: string;
  };
  onSave: (proposal: CreateProposalDto) => void;
  onCancel: () => void;
}

interface ProposalPayload {
  proposalNumber: string;
  coverPage: {
    title: string;
    subtitle: string;
    preparedFor: string;
    preparedBy: string;
  };
  companyProfile: string;
  proposalConfiguration: {
    labourIncluded: boolean;
    installationIncluded: boolean;
    transportationIncluded: boolean;
    craneIncluded: boolean;
    civilWorkIncluded: boolean;
    accommodationIncluded: boolean;
    erectionIncluded: boolean;
    freightIncluded: boolean;
    includeTechnicalDrawings: boolean;
    include3DRenderings: boolean;
    includeMaterialSamples: boolean;
    includePastProjects: boolean;
  };
  commercialSummary?: string;
  timeline: Array<{
    phase: string;
    start: string;
    end: string;
  }>;
  technicalSpecifications: TechnicalSpecifications;
}

export function ProposalBuilder({
  estimate,
  proposal,
  lead,
  onSave,
  onCancel,
}: ProposalBuilderProps) {
  // Smart Autofill - fetch customer data and last quotation
  const autofillData = useCustomerAutofill(estimate?.customerId || lead?.customerId || '');

  const [doc, setDoc] = useState<ProposalPayload>(
    proposal ? {
      proposalNumber: proposal.proposalNumber,
      coverPage: {
        title: proposal.coverPage?.title || 'PROPOSAL',
        subtitle: proposal.coverPage?.subtitle || 'Pre-Engineered Building Solution',
        preparedFor: proposal.coverPage?.preparedFor || estimate?.customerName || '',
        preparedBy: proposal.coverPage?.preparedBy || 'Your Company Name',
      },
      companyProfile: proposal.companyProfile || '',
      proposalConfiguration: proposal.proposalConfiguration || {
        labourIncluded: false,
        installationIncluded: false,
        transportationIncluded: false,
        craneIncluded: false,
        civilWorkIncluded: false,
        accommodationIncluded: false,
        erectionIncluded: false,
        freightIncluded: false,
        includeTechnicalDrawings: false,
        include3DRenderings: false,
        includeMaterialSamples: false,
        includePastProjects: false,
      },
      commercialSummary: typeof proposal.commercialSummary === 'string'
        ? proposal.commercialSummary
        : (proposal.commercialSummary?.notes || ''),
      timeline: proposal.timeline?.milestones?.map(m => ({
        phase: m.milestone,
        start: new Date().toISOString(),
        end: new Date().toISOString(),
      })) || [],
      technicalSpecifications: estimate?.technicalSpecifications || {},
    } : {
      proposalNumber: `PROP-${Date.now()}`,
      coverPage: {
        title: 'PROPOSAL',
        subtitle: 'Pre-Engineered Building Solution',
        preparedFor: lead?.companyName || lead?.customerName || estimate?.customerName || '',
        preparedBy: 'Your Company Name',
      },
      companyProfile: '',
      proposalConfiguration: {
        labourIncluded: false,
        installationIncluded: false,
        transportationIncluded: false,
        craneIncluded: false,
        civilWorkIncluded: false,
        accommodationIncluded: false,
        erectionIncluded: false,
        freightIncluded: false,
        includeTechnicalDrawings: false,
        include3DRenderings: false,
        includeMaterialSamples: false,
        includePastProjects: false,
      },
      commercialSummary: '',
      timeline: [],
      technicalSpecifications: estimate?.technicalSpecifications || {},
    }
  );

  const addPhase = () =>
    setDoc({
      ...doc,
      timeline: [...doc.timeline, { phase: '', start: new Date().toISOString(), end: new Date().toISOString() }],
    });

  const handleSave = () => {
    const proposalDto: CreateProposalDto = {
      estimateId: estimate?.id || '',
      coverPage: doc.coverPage,
      companyProfile: doc.companyProfile,
      includeCommercialSummary: !!doc.commercialSummary,
      commercialSummary: doc.commercialSummary ? {
        notes: doc.commercialSummary,
        disclaimer: 'This is an indicative quotation. Final pricing will be provided in the formal quotation.',
      } : undefined,
      timeline: {
        estimatedDuration: doc.timeline.length * 7,
        unit: 'days',
        milestones: doc.timeline.map((t, i) => ({
          id: `temp-${i}`,
          milestone: t.phase,
          description: '',
        })),
      },
    };

    onSave(proposalDto);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Proposal Builder</h2>
          <p className="text-muted-foreground">
            From Estimate: {estimate?.estimateNumber || 'N/A'} | Customer: {estimate?.customerName || 'N/A'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Proposal
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="cover">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="cover">Cover</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="tech">Tech (read-only)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cover" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cover Page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={doc.coverPage.title}
                  onChange={(e) => setDoc({ ...doc, coverPage: { ...doc.coverPage, title: e.target.value } })}
                />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input
                  value={doc.coverPage.subtitle}
                  onChange={(e) => setDoc({ ...doc, coverPage: { ...doc.coverPage, subtitle: e.target.value } })}
                />
              </div>
              <div>
                <Label>Prepared for</Label>
                <Input
                  value={doc.coverPage.preparedFor}
                  onChange={(e) => setDoc({ ...doc, coverPage: { ...doc.coverPage, preparedFor: e.target.value } })}
                />
              </div>
              <div>
                <Label>Prepared by</Label>
                <Input
                  value={doc.coverPage.preparedBy}
                  onChange={(e) => setDoc({ ...doc, coverPage: { ...doc.coverPage, preparedBy: e.target.value } })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        
        <TabsContent value="content" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Company profile</Label>
                <Textarea
                  rows={4}
                  value={doc.companyProfile}
                  onChange={(e) =>
                    setDoc({
                      ...doc,
                      companyProfile: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Commercial summary</Label>
                <Textarea
                  rows={3}
                  value={doc.commercialSummary ?? ''}
                  onChange={(e) => setDoc({ ...doc, commercialSummary: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline" className="space-y-2">
          {doc.timeline.map((t, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 rounded-md border p-2 sm:grid-cols-4">
              <Input
                placeholder="Phase"
                value={t.phase}
                onChange={(e) =>
                  setDoc({
                    ...doc,
                    timeline: doc.timeline.map((x, idx) => (idx === i ? { ...x, phase: e.target.value } : x)),
                  })
                }
              />
              <Input
                type="date"
                value={t.start.slice(0, 10)}
                onChange={(e) =>
                  setDoc({
                    ...doc,
                    timeline: doc.timeline.map((x, idx) =>
                      idx === i ? { ...x, start: new Date(e.target.value).toISOString() } : x,
                    ),
                  })
                }
              />
              <Input
                type="date"
                value={t.end.slice(0, 10)}
                onChange={(e) =>
                  setDoc({
                    ...doc,
                    timeline: doc.timeline.map((x, idx) =>
                      idx === i ? { ...x, end: new Date(e.target.value).toISOString() } : x,
                    ),
                  })
                }
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDoc({ ...doc, timeline: doc.timeline.filter((_, idx) => idx !== i) })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="secondary" size="sm" onClick={addPhase}>
            <Plus className="mr-1 h-4 w-4" /> Add phase
          </Button>
        </TabsContent>
        
        <TabsContent value="tech">
          <TechnicalSpecsForm value={doc.technicalSpecifications} onChange={() => {}} readOnly />
          <p className="mt-2 text-xs text-muted-foreground">Inherited from estimate; edit in the estimate to change.</p>
        </TabsContent>
        
      </Tabs>
    </div>
  );
}
