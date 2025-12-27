'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PromptEditor } from '@/components/workbench/prompt-editor';
import { usePromptStore } from '@/stores/prompt-store';
import { useWorkbenchStore } from '@/stores/workbench-store';

export default function PromptEditorPage() {
  const params = useParams();
  const router = useRouter();
  const promptId = params.promptId as string;

  const prompt = usePromptStore((state) => state.getPromptById(promptId));
  const isHydrated = usePromptStore((state) => state.isHydrated);
  const setActivePromptId = useWorkbenchStore((state) => state.setActivePromptId);
  const reset = useWorkbenchStore((state) => state.reset);

  // Set active prompt and reset workbench state
  useEffect(() => {
    setActivePromptId(promptId);
    reset();
  }, [promptId, setActivePromptId, reset]);

  // Loading state
  if (!isHydrated) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-2xl p-8">
          <div className="h-12 bg-muted rounded" />
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  // Prompt not found
  if (!prompt) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">Prompt not found</h1>
        <p className="text-muted-foreground">
          The prompt you're looking for doesn't exist or has been deleted.
        </p>
        <button
          onClick={() => router.push('/workbench')}
          className="text-primary hover:underline"
        >
          Go back to Workbench
        </button>
      </div>
    );
  }

  return <PromptEditor prompt={prompt} />;
}
