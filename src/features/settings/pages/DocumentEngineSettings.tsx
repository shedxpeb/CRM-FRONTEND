'use client';

import { useState } from 'react';
import { useDocumentSettings, useUpdateDocumentSettings } from '../hooks/useSettings';
import { SettingsLayout } from '../components/SettingsLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, FileText, Hash, Calendar, Building2, Settings as SettingsIcon } from 'lucide-react';
import type { DocumentSettings } from '../types';

export function DocumentEngineSettings() {
  const { data: docSettings, isLoading } = useDocumentSettings();
  const updateDocSettings = useUpdateDocumentSettings();
  const [formData, setFormData] = useState<Partial<DocumentSettings>>(docSettings || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDocSettings.mutate(formData);
  };

  const handleChange = (field: keyof DocumentSettings, value: unknown) => {
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
          <h2 className="text-lg font-semibold">Document Engine Settings</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="numbering">
            <TabsList>
              <TabsTrigger value="numbering">
                <Hash className="h-4 w-4 mr-2" />
                Numbering
              </TabsTrigger>
              <TabsTrigger value="terms">
                <FileText className="h-4 w-4 mr-2" />
                Terms & Conditions
              </TabsTrigger>
              <TabsTrigger value="bank">
                <Building2 className="h-4 w-4 mr-2" />
                Bank Details
              </TabsTrigger>
              <TabsTrigger value="gst">
                <SettingsIcon className="h-4 w-4 mr-2" />
                GST Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="numbering" className="space-y-6">
              {/* Estimate Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Estimate Numbering</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="estPrefix">Prefix</Label>
                      <Input
                        id="estPrefix"
                        value={formData.estimateNumbering?.prefix || 'EST'}
                        onChange={(e) => handleChange('estimateNumbering', { ...formData.estimateNumbering, prefix: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="estSuffix">Suffix</Label>
                      <Input
                        id="estSuffix"
                        value={formData.estimateNumbering?.suffix || ''}
                        onChange={(e) => handleChange('estimateNumbering', { ...formData.estimateNumbering, suffix: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="estStartNumber">Start Number</Label>
                      <Input
                        id="estStartNumber"
                        type="number"
                        value={formData.estimateNumbering?.startNumber || 1}
                        onChange={(e) => handleChange('estimateNumbering', { ...formData.estimateNumbering, startNumber: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="estFinancialYear">Financial Year</Label>
                      <Input
                        id="estFinancialYear"
                        value={formData.estimateNumbering?.financialYear || '2026-2027'}
                        onChange={(e) => handleChange('estimateNumbering', { ...formData.estimateNumbering, financialYear: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="estNumberFormat">Number Format</Label>
                    <Input
                      id="estNumberFormat"
                      value={formData.estimateNumbering?.format || '{PREFIX}-{FY}-{NUMBER}'}
                      onChange={(e) => handleChange('estimateNumbering', { ...formData.estimateNumbering, format: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Proposal Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Proposal Numbering</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="propPrefix">Prefix</Label>
                      <Input
                        id="propPrefix"
                        value={formData.proposalNumbering?.prefix || 'PRO'}
                        onChange={(e) => handleChange('proposalNumbering', { ...formData.proposalNumbering, prefix: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="propSuffix">Suffix</Label>
                      <Input
                        id="propSuffix"
                        value={formData.proposalNumbering?.suffix || ''}
                        onChange={(e) => handleChange('proposalNumbering', { ...formData.proposalNumbering, suffix: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="propStartNumber">Start Number</Label>
                      <Input
                        id="propStartNumber"
                        type="number"
                        value={formData.proposalNumbering?.startNumber || 1}
                        onChange={(e) => handleChange('proposalNumbering', { ...formData.proposalNumbering, startNumber: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="propFinancialYear">Financial Year</Label>
                      <Input
                        id="propFinancialYear"
                        value={formData.proposalNumbering?.financialYear || '2026-2027'}
                        onChange={(e) => handleChange('proposalNumbering', { ...formData.proposalNumbering, financialYear: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quotation Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quotation Numbering</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quoPrefix">Prefix</Label>
                      <Input
                        id="quoPrefix"
                        value={formData.quotationNumbering?.prefix || 'QUO'}
                        onChange={(e) => handleChange('quotationNumbering', { ...formData.quotationNumbering, prefix: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="quoSuffix">Suffix</Label>
                      <Input
                        id="quoSuffix"
                        value={formData.quotationNumbering?.suffix || ''}
                        onChange={(e) => handleChange('quotationNumbering', { ...formData.quotationNumbering, suffix: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quoStartNumber">Start Number</Label>
                      <Input
                        id="quoStartNumber"
                        type="number"
                        value={formData.quotationNumbering?.startNumber || 1}
                        onChange={(e) => handleChange('quotationNumbering', { ...formData.quotationNumbering, startNumber: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="quoFinancialYear">Financial Year</Label>
                      <Input
                        id="quoFinancialYear"
                        value={formData.quotationNumbering?.financialYear || '2026-2027'}
                        onChange={(e) => handleChange('quotationNumbering', { ...formData.quotationNumbering, financialYear: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="terms" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Default Terms & Conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="defaultTerms">Terms</Label>
                    <textarea
                      id="defaultTerms"
                      className="w-full min-h-[150px] p-3 border rounded-md"
                      value={formData.defaultTerms || ''}
                      onChange={(e) => handleChange('defaultTerms', e.target.value)}
                      placeholder="Enter default terms and conditions..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="defaultConditions">Conditions</Label>
                    <textarea
                      id="defaultConditions"
                      className="w-full min-h-[100px] p-3 border rounded-md"
                      value={formData.defaultConditions || ''}
                      onChange={(e) => handleChange('defaultConditions', e.target.value)}
                      placeholder="Enter default conditions..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bank" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Bank Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={formData.bankDetails?.bankName || ''}
                      onChange={(e) => handleChange('bankDetails', { ...formData.bankDetails, bankName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={formData.bankDetails?.accountNumber || ''}
                      onChange={(e) => handleChange('bankDetails', { ...formData.bankDetails, accountNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountType">Account Type</Label>
                    <Input
                      id="accountType"
                      value={formData.bankDetails?.accountType || ''}
                      onChange={(e) => handleChange('bankDetails', { ...formData.bankDetails, accountType: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ifscCode">IFSC Code</Label>
                    <Input
                      id="ifscCode"
                      value={formData.bankDetails?.ifscCode || ''}
                      onChange={(e) => handleChange('bankDetails', { ...formData.bankDetails, ifscCode: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="branchName">Branch Name</Label>
                    <Input
                      id="branchName"
                      value={formData.bankDetails?.branchName || ''}
                      onChange={(e) => handleChange('bankDetails', { ...formData.bankDetails, branchName: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gst" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">GST Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="gstin">GSTIN</Label>
                    <Input
                      id="gstin"
                      value={formData.gstDetails?.gstin || ''}
                      onChange={(e) => handleChange('gstDetails', { ...formData.gstDetails, gstin: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gstType">GST Type</Label>
                    <Select
                      value={formData.gstDetails?.gstType || 'CGST'}
                      onValueChange={(value) => handleChange('gstDetails', { ...formData.gstDetails, gstType: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CGST">CGST</SelectItem>
                        <SelectItem value="SGST">SGST</SelectItem>
                        <SelectItem value="IGST">IGST</SelectItem>
                        <SelectItem value="CESS">CESS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cgstRate">CGST Rate (%)</Label>
                      <Input
                        id="cgstRate"
                        type="number"
                        value={formData.gstDetails?.cgstRate || 9}
                        onChange={(e) => handleChange('gstDetails', { ...formData.gstDetails, cgstRate: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sgstRate">SGST Rate (%)</Label>
                      <Input
                        id="sgstRate"
                        type="number"
                        value={formData.gstDetails?.sgstRate || 9}
                        onChange={(e) => handleChange('gstDetails', { ...formData.gstDetails, sgstRate: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="igstRate">IGST Rate (%)</Label>
                      <Input
                        id="igstRate"
                        type="number"
                        value={formData.gstDetails?.igstRate || 18}
                        onChange={(e) => handleChange('gstDetails', { ...formData.gstDetails, igstRate: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cessRate">CESS Rate (%)</Label>
                      <Input
                        id="cessRate"
                        type="number"
                        value={formData.gstDetails?.cessRate || 0}
                        onChange={(e) => handleChange('gstDetails', { ...formData.gstDetails, cessRate: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={updateDocSettings.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateDocSettings.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </SettingsLayout>
  );
}
