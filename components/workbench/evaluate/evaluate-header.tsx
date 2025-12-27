'use client';

import * as React from 'react';
import { Play, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface EvaluateHeaderProps {
  showPrompt: boolean;
  showIdealOutputs: boolean;
  isRunningAll: boolean;
  runProgress: { completed: number; total: number };
  onToggleShowPrompt: (show: boolean) => void;
  onToggleShowIdealOutputs: (show: boolean) => void;
  onRunAll: () => void;
  onCancel: () => void;
  className?: string;
}

export function EvaluateHeader({
  showPrompt,
  showIdealOutputs,
  isRunningAll,
  runProgress,
  onToggleShowPrompt,
  onToggleShowIdealOutputs,
  onRunAll,
  onCancel,
  className,
}: EvaluateHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-3 border-b border-border bg-background',
        className
      )}
    >
      {/* Toggle switches */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch
            id="show-prompt"
            checked={showPrompt}
            onCheckedChange={onToggleShowPrompt}
            disabled={isRunningAll}
          />
          <Label
            htmlFor="show-prompt"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Show Prompt
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="show-ideal"
            checked={showIdealOutputs}
            onCheckedChange={onToggleShowIdealOutputs}
            disabled={isRunningAll}
          />
          <Label
            htmlFor="show-ideal"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Show Ideal Outputs
          </Label>
        </div>
      </div>

      {/* Run All button */}
      <div className="flex items-center gap-2">
        {isRunningAll && runProgress.total > 0 && (
          <span className="text-sm text-muted-foreground">
            {runProgress.completed}/{runProgress.total}
          </span>
        )}

        {isRunningAll ? (
          <Button variant="outline" onClick={onCancel}>
            <X className="size-4 mr-1" />
            Cancel
          </Button>
        ) : (
          <Button
            onClick={onRunAll}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            <Play className="size-4 mr-1" />
            Run All
            <span className="ml-2 text-xs opacity-70">⌘ + ↵</span>
          </Button>
        )}
      </div>
    </div>
  );
}
