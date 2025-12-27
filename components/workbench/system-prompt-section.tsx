'use client';

import * as React from 'react';
import { Info, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SystemPromptSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export function SystemPromptSection({ value, onChange }: SystemPromptSectionProps) {
  const [isOpen, setIsOpen] = React.useState(!!value);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border border-border rounded-lg bg-card">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">System Prompt</span>
              {!value && (
                <span className="text-muted-foreground text-sm">
                  Define a role, tone or context (optional)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="size-6">
                    <Info className="size-3.5 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    The system prompt sets the context and behavior for the AI.
                    Use it to define the assistant's role, tone, and constraints.
                  </p>
                </TooltipContent>
              </Tooltip>
              <ChevronRight
                className={cn(
                  'size-4 text-muted-foreground transition-transform',
                  isOpen && 'rotate-90'
                )}
              />
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <Textarea
              placeholder="You are a helpful assistant..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="min-h-[100px] resize-y"
            />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
