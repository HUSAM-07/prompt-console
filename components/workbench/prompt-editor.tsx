'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WorkbenchHeader } from './workbench-header';
import { WorkbenchToolbar } from './workbench-toolbar';
import { SystemPromptSection } from './system-prompt-section';
import { MessageList } from './message-editor';
import { TestCasePanel } from './test-case-panel';
import { ResponsePanel } from './response-panel';
import { CodeExportDialog } from './code-export-dialog';
import { GeneratePromptDialog } from './generate-prompt-dialog';
import { EvaluatePanel } from './evaluate';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { usePromptStore } from '@/stores/prompt-store';
import { useWorkbenchStore } from '@/stores/workbench-store';
import { useSettingsStore } from '@/stores/settings-store';
import { useRunPrompt, useGeneratePrompt } from '@/hooks/use-openrouter';
import { useKeyboardShortcut, shortcuts } from '@/hooks/use-keyboard-shortcut';
import { useVariablesFromPrompt } from '@/hooks/use-variable-parser';
import type { Prompt } from '@/types';

interface PromptEditorProps {
  prompt: Prompt;
}

export function PromptEditor({ prompt }: PromptEditorProps) {
  const [isCodeDialogOpen, setIsCodeDialogOpen] = React.useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = React.useState(false);

  const { updatePrompt, updateMessage, updateMessageAttachments, deleteMessage, addMessage } = usePromptStore();
  const {
    isTestCasePanelOpen,
    setTestCasePanelOpen,
    isRunning,
    lastResponse,
    streamingContent,
    activeTab,
  } = useWorkbenchStore();
  const getActiveApiKey = useSettingsStore((state) => state.getActiveApiKey);

  const { runPrompt } = useRunPrompt();
  const { generatePrompt, isGenerating } = useGeneratePrompt();

  // Parse variables from prompt content
  const variables = useVariablesFromPrompt(
    prompt.systemPrompt,
    prompt.messages
  );

  // Handle model change
  const handleModelChange = (modelId: string) => {
    updatePrompt(prompt.id, { modelId });
  };

  // Handle system prompt change
  const handleSystemPromptChange = (systemPrompt: string) => {
    updatePrompt(prompt.id, { systemPrompt });
  };

  // Handle message updates
  const handleUpdateMessage = (messageId: string, content: string) => {
    updateMessage(prompt.id, messageId, content);
  };

  // Handle attachment updates
  const handleUpdateAttachments = (messageId: string, attachments: any[]) => {
    updateMessageAttachments(prompt.id, messageId, attachments);
  };

  // Handle message deletion
  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(prompt.id, messageId);
  };

  // Handle adding message pair
  const handleAddMessagePair = () => {
    addMessage(prompt.id, 'assistant');
    addMessage(prompt.id, 'user');
  };

  // Handle run
  const handleRun = async (variableValues: Record<string, string> = {}) => {
    const apiKey = getActiveApiKey();
    if (!apiKey) {
      toast.error('No API key configured. Please add an OpenRouter API key in Settings.');
      return;
    }

    await runPrompt(prompt, variableValues);
  };

  // Handle opening generate prompt dialog
  const handleOpenGenerateDialog = () => {
    setIsGenerateDialogOpen(true);
  };

  // Handle generate prompt from dialog
  const handleGeneratePrompt = async (
    description: string,
    options: { thinkingEnabled: boolean; suggestionType?: string }
  ) => {
    const generatedPrompt = await generatePrompt(description, options);
    if (generatedPrompt) {
      // Update the first user message with the generated prompt
      const firstUserMessage = prompt.messages.find((m) => m.role === 'user');
      if (firstUserMessage) {
        updateMessage(prompt.id, firstUserMessage.id, generatedPrompt);
        toast.success('Prompt generated successfully!');
      }
    }
  };

  // Handle improve prompt
  const handleImprovePrompt = async () => {
    const firstUserMessage = prompt.messages.find((m) => m.role === 'user');
    if (!firstUserMessage?.content) {
      toast.error('No prompt content to improve');
      return;
    }

    const improved = await generatePrompt(
      `Improve this prompt to be more effective and clear:\n\n${firstUserMessage.content}`
    );
    if (improved) {
      updateMessage(prompt.id, firstUserMessage.id, improved);
      toast.success('Prompt improved!');
    }
  };

  // Keyboard shortcut for run
  useKeyboardShortcut(shortcuts.runPrompt, () => {
    if (variables.length > 0) {
      setTestCasePanelOpen(true);
    } else {
      handleRun();
    }
  });

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <WorkbenchHeader
        prompt={prompt}
        onRun={() => {
          if (variables.length > 0) {
            setTestCasePanelOpen(true);
          } else {
            handleRun();
          }
        }}
        onGetCode={() => setIsCodeDialogOpen(true)}
        isRunning={isRunning}
      />

      {/* Conditional rendering based on active tab */}
      {activeTab === 'prompt' ? (
        <>
          {/* Toolbar */}
          <WorkbenchToolbar
            prompt={prompt}
            variables={variables}
            onModelChange={handleModelChange}
            onImprovePrompt={handleImprovePrompt}
            onOpenTestCase={() => setTestCasePanelOpen(true)}
          />

          {/* Main Content Area with Resizable Panels */}
          <div className="flex-1 overflow-hidden">
            <ResizablePanelGroup direction="horizontal">
            {/* Editor Panel */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <ScrollArea className="h-full p-4">
                <div className="max-w-2xl mx-auto space-y-4">
                  {/* System Prompt */}
                  <SystemPromptSection
                    value={prompt.systemPrompt}
                    onChange={handleSystemPromptChange}
                  />

                  {/* Messages */}
                  <MessageList
                    messages={prompt.messages}
                    onUpdateMessage={handleUpdateMessage}
                    onUpdateAttachments={handleUpdateAttachments}
                    onDeleteMessage={handleDeleteMessage}
                    onAddMessagePair={handleAddMessagePair}
                    onGeneratePrompt={handleOpenGenerateDialog}
                  />
                </div>
              </ScrollArea>
            </ResizablePanel>

            {/* Resize Handle */}
            <ResizableHandle withHandle />

            {/* Response Panel */}
            <ResizablePanel defaultSize={50} minSize={30}>
              <ResponsePanel
                response={lastResponse}
                streamingContent={streamingContent}
                isLoading={isRunning}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
          </div>
        </>
      ) : (
        <EvaluatePanel prompt={prompt} />
      )}

      {/* Test Case Panel */}
      <TestCasePanel
        isOpen={isTestCasePanelOpen}
        onClose={() => setTestCasePanelOpen(false)}
        variables={variables}
        onRun={handleRun}
        isRunning={isRunning}
      />

      {/* Code Export Dialog */}
      <CodeExportDialog
        isOpen={isCodeDialogOpen}
        onClose={() => setIsCodeDialogOpen(false)}
        prompt={prompt}
      />

      {/* Generate Prompt Dialog */}
      <GeneratePromptDialog
        open={isGenerateDialogOpen}
        onOpenChange={setIsGenerateDialogOpen}
        onGenerate={handleGeneratePrompt}
        isGenerating={isGenerating}
      />
    </div>
  );
}
