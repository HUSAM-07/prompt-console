'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSettingsStore } from '@/stores/settings-store';
import { DEFAULT_MODELS } from '@/lib/constants';
import { toast } from 'sonner';

export function SettingsForm() {
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const isHydrated = useSettingsStore((state) => state.isHydrated);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ userName: e.target.value });
  };

  const handleThemeChange = (value: 'light' | 'dark' | 'system') => {
    updateSettings({ theme: value });
    // Apply theme to document
    if (value === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (value === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    toast.success('Theme updated');
  };

  const handleModelChange = (value: string) => {
    updateSettings({ defaultModelId: value });
    toast.success('Default model updated');
  };

  const handleAutoSaveChange = (checked: boolean) => {
    updateSettings({ autoSaveEnabled: checked });
    toast.success(`Auto-save ${checked ? 'enabled' : 'disabled'}`);
  };

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Your personal settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={settings.userName}
              onChange={handleNameChange}
              placeholder="Your name"
            />
            <p className="text-xs text-muted-foreground">
              This name will be shown in greetings and as the author of prompts
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how Prompt Console looks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={settings.theme} onValueChange={handleThemeChange}>
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Default Model */}
      <Card>
        <CardHeader>
          <CardTitle>Default Model</CardTitle>
          <CardDescription>
            The model used for new prompts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select value={settings.defaultModelId} onValueChange={handleModelChange}>
              <SelectTrigger id="model">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Auto-save Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Auto-save</CardTitle>
          <CardDescription>
            Automatically save your work
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Auto-save</Label>
              <p className="text-xs text-muted-foreground">
                Automatically save changes as you type
              </p>
            </div>
            <Switch
              checked={settings.autoSaveEnabled}
              onCheckedChange={handleAutoSaveChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
