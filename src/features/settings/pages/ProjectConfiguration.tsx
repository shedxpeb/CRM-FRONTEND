'use client';

import { useState } from 'react';
import { useProjectConfiguration } from '../hooks/useSettings';
import { SettingsLayout } from '../components/SettingsLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, FolderKanban, Target, CheckCircle } from 'lucide-react';
import type { ProjectConfiguration } from '../types';

export function ProjectConfiguration() {
  const { data: projectConfig, isLoading } = useProjectConfiguration();
  const [formData, setFormData] = useState<Partial<ProjectConfiguration>>(projectConfig || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleChange = (field: keyof ProjectConfiguration, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <SettingsLayout>
        <div className="text-center py-8">Loading...</div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Project Configuration</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="types">
            <TabsList>
              <TabsTrigger value="types">
                <FolderKanban className="h-4 w-4 mr-2" />
                Project Types
              </TabsTrigger>
              <TabsTrigger value="stages">
                <Target className="h-4 w-4 mr-2" />
                Stages
              </TabsTrigger>
              <TabsTrigger value="statuses">
                <CheckCircle className="h-4 w-4 mr-2" />
                Statuses
              </TabsTrigger>
              <TabsTrigger value="completion">
                <CheckCircle className="h-4 w-4 mr-2" />
                Completion Rules
              </TabsTrigger>
              <TabsTrigger value="aftersales">
                <CheckCircle className="h-4 w-4 mr-2" />
                After-sales Rules
              </TabsTrigger>
            </TabsList>

            <TabsContent value="types" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Project Types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Configure project types (comma-separated)</Label>
                    <textarea
                      className="w-full min-h-[100px] p-3 border rounded-md"
                      value={formData.projectTypes?.join(', ') || 'Residential,Commercial,Industrial,Renovation'}
                      onChange={(e) => handleChange('projectTypes', e.target.value.split(',').map(s => s.trim()))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stages" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Project Stages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Configure project stages (comma-separated)</Label>
                    <textarea
                      className="w-full min-h-[100px] p-3 border rounded-md"
                      value={formData.stages?.join(', ') || 'Inquiry,Site Visit,Design,Quotation,Agreement,Execution,Handover'}
                      onChange={(e) => handleChange('stages', e.target.value.split(',').map(s => s.trim()))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="statuses" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Project Statuses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Configure project statuses (comma-separated)</Label>
                    <textarea
                      className="w-full min-h-[100px] p-3 border rounded-md"
                      value={formData.statuses?.join(', ') || 'Pending,In Progress,Completed,On Hold,Cancelled'}
                      onChange={(e) => handleChange('statuses', e.target.value.split(',').map(s => s.trim()))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completion" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Completion Rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Configure completion rules (comma-separated)</Label>
                    <textarea
                      className="w-full min-h-[100px] p-3 border rounded-md"
                      value={formData.completionRules?.join(', ') || '100% Payment,Final Inspection,Documentation Handover'}
                      onChange={(e) => handleChange('completionRules', e.target.value.split(',').map(s => s.trim()))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="aftersales" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">After-sales Rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Configure after-sales rules (comma-separated)</Label>
                    <textarea
                      className="w-full min-h-[100px] p-3 border rounded-md"
                      value={formData.afterSalesRules?.join(', ') || 'Warranty Period,Maintenance Schedule,Feedback Collection'}
                      onChange={(e) => handleChange('afterSalesRules', e.target.value.split(',').map(s => s.trim()))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </SettingsLayout>
  );
}
