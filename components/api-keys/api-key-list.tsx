'use client';

import { Trash2, Check, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/stores/settings-store';
import { formatDate } from '@/hooks/use-greeting';
import { toast } from 'sonner';
import type { APIKey } from '@/types';

interface ApiKeyItemProps {
  apiKey: APIKey;
  onDelete: () => void;
  onSetActive: () => void;
}

function ApiKeyItem({ apiKey, onDelete, onSetActive }: ApiKeyItemProps) {
  const maskedKey = `${apiKey.key.slice(0, 10)}...${apiKey.key.slice(-4)}`;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Key className="size-4 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{apiKey.name}</h3>
              {apiKey.isActive && (
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              {maskedKey}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Added {formatDate(apiKey.createdAt)}
              {apiKey.lastUsedAt && ` • Last used ${formatDate(apiKey.lastUsedAt)}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!apiKey.isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSetActive}
            >
              <Check className="size-4 mr-1" />
              Set Active
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onDelete}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function ApiKeyList() {
  const apiKeys = useSettingsStore((state) => state.apiKeys);
  const removeApiKey = useSettingsStore((state) => state.removeApiKey);
  const setActiveApiKey = useSettingsStore((state) => state.setActiveApiKey);
  const isHydrated = useSettingsStore((state) => state.isHydrated);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      removeApiKey(id);
      toast.success('API key deleted');
    }
  };

  const handleSetActive = (id: string) => {
    setActiveApiKey(id);
    toast.success('API key set as active');
  };

  if (!isHydrated) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (apiKeys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Key className="size-12 opacity-50 mb-4" />
        <p className="font-medium">No API keys</p>
        <p className="text-sm">Add an OpenRouter API key to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {apiKeys.map((apiKey) => (
        <ApiKeyItem
          key={apiKey.id}
          apiKey={apiKey}
          onDelete={() => handleDelete(apiKey.id, apiKey.name)}
          onSetActive={() => handleSetActive(apiKey.id)}
        />
      ))}
    </div>
  );
}
