'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, ArrowRight, Settings2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { LLMResponse } from '@/types';

interface ResponsePanelProps {
  response: LLMResponse | null;
  streamingContent: string;
  isLoading: boolean;
}

export function ResponsePanel({
  response,
  streamingContent,
  isLoading,
}: ResponsePanelProps) {
  const [copied, setCopied] = React.useState(false);

  const content = streamingContent || response?.content || '';

  const handleCopy = async () => {
    if (content) {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Show welcome state when no response
  if (!response && !streamingContent && !isLoading) {
    return (
      <div className="h-full flex flex-col justify-center p-8 pl-12 border-l border-border">
        <h2 className="text-xl font-semibold mb-6">Welcome to Workbench</h2>
        <div className="space-y-4 text-sm text-muted-foreground max-w-2xl">
          <div className="flex items-start gap-3">
            <ArrowRight className="size-4 mt-0.5 shrink-0" />
            <p>
              Write a prompt in the left column, and click{' '}
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                <Play className="size-3" /> Run
              </span>{' '}
              to see Claude's response.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <ArrowRight className="size-4 mt-0.5 shrink-0" />
            <p>
              Editing the prompt, or changing{' '}
              <Settings2 className="inline size-3" /> model parameters creates a
              new version.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <ArrowRight className="size-4 mt-0.5 shrink-0" />
            <p>
              Write variables like this:{' '}
              <code className="text-primary font-mono">{'{{VARIABLE_NAME}}'}</code>
            </p>
          </div>
          <div className="flex items-start gap-3">
            <ArrowRight className="size-4 mt-0.5 shrink-0" />
            <p>
              Add messages using the message pair button to simulate a
              conversation.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <ArrowRight className="size-4 mt-0.5 shrink-0" />
            <p>
              High quality examples greatly improve performance. After drafting
              a prompt, click <code className="font-mono">EXAMPLES</code> to add
              some.
            </p>
          </div>
        </div>
        <Button variant="outline" className="mt-8 w-fit" asChild>
          <a href="https://docs.anthropic.com/claude/docs/prompt-engineering" target="_blank" rel="noopener noreferrer">
            Learn about prompt design
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col border-l border-border">
      {/* Header */}
      {(response || streamingContent) && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <span className="text-sm text-muted-foreground">
            {isLoading ? 'Generating...' : 'Response'}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleCopy}
            disabled={!content}
          >
            {copied ? (
              <Check className="size-4 text-green-500" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
        </div>
      )}

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading && !streamingContent ? (
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
              <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
            </div>
          ) : (
            <div className={cn('prose prose-sm dark:prose-invert max-w-none', isLoading && 'animate-pulse')}>
              <ReactMarkdown>{content}</ReactMarkdown>
              {isLoading && <span className="animate-pulse">▊</span>}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer with stats */}
      {response && !isLoading && (
        <div className="px-4 py-2 border-t border-border bg-muted/30">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              Tokens: {response.usage.totalTokens.toLocaleString()} (
              {response.usage.promptTokens.toLocaleString()} prompt,{' '}
              {response.usage.completionTokens.toLocaleString()} completion)
            </span>
            <span>Latency: {(response.latencyMs / 1000).toFixed(2)}s</span>
          </div>
        </div>
      )}
    </div>
  );
}
