'use client';

import { useRouter } from 'next/navigation';
import { Plus, Sparkles, Key } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { usePromptStore } from '@/stores/prompt-store';

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}

function ActionCard({ icon, title, onClick }: ActionCardProps) {
  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/20 bg-card"
      onClick={onClick}
    >
      <CardContent className="flex items-center justify-center gap-3 py-6 px-8">
        <span className="text-muted-foreground">{icon}</span>
        <span className="font-medium text-foreground">{title}</span>
      </CardContent>
    </Card>
  );
}

export function ActionCards() {
  const router = useRouter();
  const createPrompt = usePromptStore((state) => state.createPrompt);

  const handleCreatePrompt = () => {
    const newPrompt = createPrompt();
    router.push(`/workbench/${newPrompt.id}`);
  };

  const handleGeneratePrompt = () => {
    // Navigate to workbench with generate mode
    const newPrompt = createPrompt('Generated Prompt');
    router.push(`/workbench/${newPrompt.id}?generate=true`);
  };

  const handleGetApiKey = () => {
    router.push('/api-keys');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ActionCard
        icon={<Plus className="size-5" />}
        title="Create a prompt"
        onClick={handleCreatePrompt}
      />
      <ActionCard
        icon={<Sparkles className="size-5" />}
        title="Generate a prompt"
        onClick={handleGeneratePrompt}
      />
      <ActionCard
        icon={<Key className="size-5" />}
        title="Add API Key"
        onClick={handleGetApiKey}
      />
    </div>
  );
}
