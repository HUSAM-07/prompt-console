'use client';

import { usePromptStore } from '@/stores/prompt-store';
import { PromptListItem } from './prompt-list-item';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export function PromptList() {
  const prompts = usePromptStore((state) => state.prompts);
  const isHydrated = usePromptStore((state) => state.isHydrated);

  if (!isHydrated) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted/30 rounded-lg border border-border/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground py-16 px-12 border border-border/50 rounded-lg bg-card/50">
        <FileText className="size-12 opacity-50" />
        <div className="text-center">
          <h3 className="font-medium text-foreground">No prompts yet</h3>
          <p className="text-sm">
            Create your first prompt to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {prompts.map((prompt) => (
        <PromptListItem key={prompt.id} prompt={prompt} />
      ))}
    </div>
  );
}
