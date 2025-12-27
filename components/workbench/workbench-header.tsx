'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { List, Plus, ChevronDown, Play, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePromptStore } from '@/stores/prompt-store';
import { useWorkbenchStore } from '@/stores/workbench-store';
import { formatTimestamp } from '@/hooks/use-greeting';
import { RenamePromptDialog } from './rename-prompt-dialog';
import { DeleteConfirmDialog } from './delete-confirm-dialog';
import type { Prompt } from '@/types';

interface WorkbenchHeaderProps {
  prompt: Prompt;
  onRun: () => void;
  onGetCode: () => void;
  isRunning: boolean;
}

export function WorkbenchHeader({
  prompt,
  onRun,
  onGetCode,
  isRunning,
}: WorkbenchHeaderProps) {
  const router = useRouter();
  const { createPrompt, updatePrompt, deletePrompt, duplicatePrompt } = usePromptStore();
  const { activeTab, setActiveTab } = useWorkbenchStore();
  const [isRenameDialogOpen, setIsRenameDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const handleNewPrompt = () => {
    const newPrompt = createPrompt();
    router.push(`/workbench/${newPrompt.id}`);
  };

  const handleRename = (newName: string) => {
    if (newName && newName !== prompt.name) {
      updatePrompt(prompt.id, { name: newName });
    }
  };

  const handleDuplicate = () => {
    const duplicate = duplicatePrompt(prompt.id);
    if (duplicate) {
      router.push(`/workbench/${duplicate.id}`);
    }
  };

  const handleDelete = () => {
    deletePrompt(prompt.id);
    router.push('/dashboard');
  };

  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-2 bg-background">
      {/* Left Side */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push('/workbench')}
          title="Back to list"
        >
          <List className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleNewPrompt}
          title="New prompt"
        >
          <Plus className="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <span className="text-muted-foreground">Default</span>
              <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>Default</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Center */}
      <div className="flex flex-col items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 font-medium">
              {prompt.name}
              <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem onClick={() => setIsRenameDialogOpen(true)}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDuplicate}>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {prompt.lastSavedAt && (
          <span className="text-xs text-muted-foreground">
            Last saved {formatTimestamp(prompt.lastSavedAt)}
          </span>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'prompt' | 'evaluate')}>
          <TabsList>
            <TabsTrigger value="prompt">Prompt</TabsTrigger>
            <TabsTrigger value="evaluate">Evaluate</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button variant="outline" size="sm" onClick={onGetCode}>
          <Code className="size-4 mr-1" />
          Get Code
        </Button>

        <Button
          size="sm"
          onClick={onRun}
          disabled={isRunning}
          className="bg-foreground text-background hover:bg-foreground/90"
        >
          <Play className="size-4 mr-1" />
          Run
          <span className="ml-2 text-xs opacity-70">⌘ + ↵</span>
        </Button>
      </div>

      {/* Dialogs */}
      <RenamePromptDialog
        open={isRenameDialogOpen}
        onOpenChange={setIsRenameDialogOpen}
        currentName={prompt.name}
        onRename={handleRename}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        promptName={prompt.name}
        onConfirm={handleDelete}
      />
    </header>
  );
}
