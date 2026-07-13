'use client';

import { useState } from 'react';
import { useSecuritySettings } from '../hooks/useSettings';
import { SettingsLayout } from '../components/SettingsLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Shield, Lock, Key, AlertTriangle } from 'lucide-react';
import type { SecuritySettings } from '../types';

export function SecuritySettings() {
  const { data: securityConfig, isLoading } = useSecuritySettings();
  const [formData, setFormData] = useState<Partial<SecuritySettings>>(securityConfig || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleChange = (field: keyof SecuritySettings, value: unknown) => {
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
          <h2 className="text-lg font-semibold">Security Settings</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="password">
            <TabsList>
              <TabsTrigger value="password">
                <Lock className="h-4 w-4 mr-2" />
                Password Policy
              </TabsTrigger>
              <TabsTrigger value="session">
                <Shield className="h-4 w-4 mr-2" />
                Session Settings
              </TabsTrigger>
              <TabsTrigger value="2fa">
                <Key className="h-4 w-4 mr-2" />
                Two-Factor Auth
              </TabsTrigger>
            </TabsList>

            <TabsContent value="password" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Password Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="minLength">Minimum Password Length</Label>
                    <Input
                      id="minLength"
                      type="number"
                      value={formData.passwordPolicy?.minLength || 8}
                      onChange={(e) => handleChange('passwordPolicy', { ...formData.passwordPolicy, minLength: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="requireUppercase">Require Uppercase Letters</Label>
                    <Select
                      value={formData.passwordPolicy?.requireUppercase ? 'true' : 'false'}
                      onValueChange={(value) => handleChange('passwordPolicy', { ...formData.passwordPolicy, requireUppercase: value === 'true' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="requireLowercase">Require Lowercase Letters</Label>
                    <Select
                      value={formData.passwordPolicy?.requireLowercase ? 'true' : 'false'}
                      onValueChange={(value) => handleChange('passwordPolicy', { ...formData.passwordPolicy, requireLowercase: value === 'true' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="requireNumbers">Require Numbers</Label>
                    <Select
                      value={formData.passwordPolicy?.requireNumbers ? 'true' : 'false'}
                      onValueChange={(value) => handleChange('passwordPolicy', { ...formData.passwordPolicy, requireNumbers: value === 'true' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                    <Select
                      value={formData.passwordPolicy?.requireSpecialChars ? 'true' : 'false'}
                      onValueChange={(value) => handleChange('passwordPolicy', { ...formData.passwordPolicy, requireSpecialChars: value === 'true' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                    <Input
                      id="passwordExpiry"
                      type="number"
                      value={formData.passwordPolicy?.expiryDays || 90}
                      onChange={(e) => handleChange('passwordPolicy', { ...formData.passwordPolicy, expiryDays: parseInt(e.target.value) })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="session" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Session Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={formData.sessionTimeout || 30}
                      onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={formData.maxLoginAttempts || 5}
                      onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                    <Input
                      id="lockoutDuration"
                      type="number"
                      value={formData.lockoutDuration || 30}
                      onChange={(e) => handleChange('lockoutDuration', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ipRestrictions">IP Restrictions (comma-separated)</Label>
                    <textarea
                      id="ipRestrictions"
                      className="w-full min-h-[80px] p-3 border rounded-md"
                      value={formData.ipRestrictions?.join(', ') || ''}
                      onChange={(e) => handleChange('ipRestrictions', e.target.value.split(',').map(s => s.trim()))}
                      placeholder="192.168.1.1, 10.0.0.1"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="2fa" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="twoFactorEnabled">Enable Two-Factor Authentication</Label>
                    <Select
                      value={formData.twoFactorEnabled ? 'true' : 'false'}
                      onValueChange={(value) => handleChange('twoFactorEnabled', value === 'true')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
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
