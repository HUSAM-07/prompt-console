'use client';

import * as React from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettingsStore, validateApiKey } from '@/stores/settings-store';
import { toast } from 'sonner';

export function ApiKeyForm() {
  const [name, setName] = React.useState('');
  const [key, setKey] = React.useState('');
  const [isValidating, setIsValidating] = React.useState(false);

  const addApiKey = useSettingsStore((state) => state.addApiKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !key.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsValidating(true);

    try {
      const isValid = await validateApiKey(key);

      if (!isValid) {
        toast.error('Invalid API key. Please check and try again.');
        setIsValidating(false);
        return;
      }

      addApiKey(name, key);
      toast.success('API key added successfully');

      // Reset form
      setName('');
      setKey('');
    } catch (error) {
      toast.error('Failed to validate API key');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="My OpenRouter Key"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="key">API Key</Label>
        <Input
          id="key"
          type="password"
          placeholder="sk-or-v1-..."
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Get your API key from{' '}
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            OpenRouter
          </a>
        </p>
      </div>

      <Button type="submit" disabled={isValidating} className="w-full">
        {isValidating ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Validating...
          </>
        ) : (
          <>
            <Plus className="size-4 mr-2" />
            Add API Key
          </>
        )}
      </Button>
    </form>
  );
}
