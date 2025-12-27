'use client';

import { useRouter } from 'next/navigation';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePromptStore } from '@/stores/prompt-store';
import { formatDate } from '@/hooks/use-greeting';

export default function WorkbenchListPage() {
  const router = useRouter();
  const prompts = usePromptStore((state) => state.prompts);
  const createPrompt = usePromptStore((state) => state.createPrompt);
  const isHydrated = usePromptStore((state) => state.isHydrated);

  const handleNewPrompt = () => {
    const newPrompt = createPrompt();
    router.push(`/workbench/${newPrompt.id}`);
  };

  const handlePromptClick = (id: string) => {
    router.push(`/workbench/${id}`);
  };

  if (!isHydrated) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Workbench</h1>
          <Button onClick={handleNewPrompt}>
            <Plus className="size-4 mr-2" />
            New Prompt
          </Button>
        </div>

        {/* Prompt List */}
        {prompts.length === 0 ? (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <FileText className="size-12 opacity-50" />
              <div className="text-center">
                <h3 className="font-medium text-foreground">No prompts yet</h3>
                <p className="text-sm">
                  Create your first prompt to get started
                </p>
              </div>
              <Button onClick={handleNewPrompt} className="mt-4">
                <Plus className="size-4 mr-2" />
                Create Prompt
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {prompts.map((prompt) => (
              <Card
                key={prompt.id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handlePromptClick(prompt.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{prompt.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(prompt.updatedAt || prompt.createdAt)} by{' '}
                      {prompt.author}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{prompt.messages.length} messages</span>
                    {prompt.variables.length > 0 && (
                      <span className="font-mono">{`{} ${prompt.variables.length}`}</span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
