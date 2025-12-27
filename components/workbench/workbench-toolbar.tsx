'use client';

import { Paperclip, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModelDropdown } from '@/components/shared/model-dropdown';
import type { Prompt, Variable } from '@/types';

interface WorkbenchToolbarProps {
  prompt: Prompt;
  variables: Variable[];
  onModelChange: (modelId: string) => void;
  onImprovePrompt: () => void;
  onOpenTestCase: () => void;
}

export function WorkbenchToolbar({
  prompt,
  variables,
  onModelChange,
  onImprovePrompt,
  onOpenTestCase,
}: WorkbenchToolbarProps) {
  return (
    <div className="flex items-center gap-4 border-b border-border px-4 py-2 bg-muted/30">
      {/* Model Selector */}
      <ModelDropdown
        value={prompt.modelId}
        onChange={onModelChange}
        className="h-8 text-sm"
      />

      {/* Variables Count */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1 text-muted-foreground hover:text-foreground"
        onClick={onOpenTestCase}
      >
        <span className="font-mono">{'{}'}</span>
        <span>{variables.length}</span>
      </Button>

      {/* Attachments */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1 text-muted-foreground hover:text-foreground"
      >
        <Paperclip className="size-4" />
      </Button>

      {/* Examples */}
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground"
      >
        Examples
      </Button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Improve Prompt */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1 text-muted-foreground hover:text-foreground"
        onClick={onImprovePrompt}
      >
        <Sparkles className="size-4" />
        Improve prompt
      </Button>
    </div>
  );
}
