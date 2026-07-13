'use client';

import { useState } from 'react';
import { useFinanceConfiguration } from '../hooks/useSettings';
import { SettingsLayout } from '../components/SettingsLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, DollarSign, Receipt, CreditCard } from 'lucide-react';
import type { FinanceConfiguration } from '../types';

export function FinanceConfiguration() {
  const { data: financeConfig, isLoading } = useFinanceConfiguration();
  const [formData, setFormData] = useState<Partial<FinanceConfiguration>>(financeConfig || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleChange = (field: keyof FinanceConfiguration, value: unknown) => {
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
          <h2 className="text-lg font-semibold">Finance Configuration</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">
                <DollarSign className="h-4 w-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="taxes">
                <Receipt className="h-4 w-4 mr-2" />
                Taxes
              </TabsTrigger>
              <TabsTrigger value="payment">
                <CreditCard className="h-4 w-4 mr-2" />
                Payment Methods
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      value={formData.currency || 'INR'}
                      onChange={(e) => handleChange('currency', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="financialYear">Financial Year</Label>
                    <Input
                      id="financialYear"
                      value={formData.financialYear || '2026-2027'}
                      onChange={(e) => handleChange('financialYear', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="taxes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">GST Rates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Configure GST rates (comma-separated)</Label>
                    <textarea
                      className="w-full min-h-[100px] p-3 border rounded-md"
                      value={formData.gstRates?.join(', ') || '0,5,12,18,28'}
                      onChange={(e) => handleChange('gstRates', e.target.value.split(',').map(s => parseFloat(s.trim())))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Payment Methods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Configure payment methods (comma-separated)</Label>
                    <textarea
                      className="w-full min-h-[100px] p-3 border rounded-md"
                      value={formData.paymentMethods?.join(', ') || 'Cash,UPI,NEFT,RTGS,IMPS,Cheque,Card'}
                      onChange={(e) => handleChange('paymentMethods', e.target.value.split(',').map(s => s.trim()))}
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
