'use client';

import { useRouter } from 'next/navigation';
import type { Prompt } from '@/types';
import { formatDate } from '@/hooks/use-greeting';

interface PromptListItemProps {
  prompt: Prompt;
}

export function PromptListItem({ prompt }: PromptListItemProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/workbench/${prompt.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="flex flex-col gap-1 px-6 py-5 cursor-pointer rounded-lg border border-border bg-card hover:border-foreground/20 transition-all duration-200 hover:shadow-sm"
    >
      <h3 className="text-base font-medium text-foreground">{prompt.name}</h3>
      <p className="text-sm text-muted-foreground">
        {formatDate(prompt.updatedAt || prompt.createdAt)} by {prompt.author}
      </p>
    </div>
  );
}
