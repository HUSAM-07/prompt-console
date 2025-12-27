'use client';

import * as React from 'react';
import { FileText, Mail, Code, MoreHorizontal, Loader2, X, BarChart, ListChecks, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { SUGGESTION_TEMPLATES, type SuggestionType } from '@/lib/meta-prompts';

interface GeneratePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (description: string, options: { thinkingEnabled: boolean; suggestionType?: string }) => Promise<void>;
  isGenerating?: boolean;
}

const ICON_MAP = {
  FileText,
  Mail,
  Code,
  BarChart,
  ListChecks,
  Sparkles,
} as const;

// Primary suggestions shown as pills
const PRIMARY_SUGGESTIONS: SuggestionType[] = ['summarize', 'email', 'translate-code'];

// Additional suggestions in the "more" dropdown
const MORE_SUGGESTIONS: SuggestionType[] = ['analyze-data', 'create-plan', 'review-improve'];

export function GeneratePromptDialog({
  open,
  onOpenChange,
  onGenerate,
  isGenerating = false,
}: GeneratePromptDialogProps) {
  const [description, setDescription] = React.useState('');
  const [thinkingEnabled, setThinkingEnabled] = React.useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = React.useState<string | undefined>();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setDescription('');
      setThinkingEnabled(false);
      setSelectedSuggestion(undefined);
    }
  }, [open]);

  // Focus textarea when dialog opens
  React.useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSuggestionClick = (suggestionKey: SuggestionType) => {
    const suggestion = SUGGESTION_TEMPLATES[suggestionKey];
    setDescription(suggestion.description);
    setSelectedSuggestion(suggestionKey);
    textareaRef.current?.focus();
  };

  const handleGenerate = async () => {
    if (!description.trim()) return;

    await onGenerate(description, {
      thinkingEnabled,
      suggestionType: selectedSuggestion,
    });

    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey && !isGenerating && description.trim()) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const renderSuggestionButton = (suggestionKey: SuggestionType) => {
    const suggestion = SUGGESTION_TEMPLATES[suggestionKey];
    const IconComponent = ICON_MAP[suggestion.icon as keyof typeof ICON_MAP];

    return (
      <Button
        key={suggestionKey}
        variant="outline"
        size="sm"
        className={cn(
          'gap-2 text-sm font-normal rounded-full px-4',
          selectedSuggestion === suggestionKey && 'border-primary bg-primary/5'
        )}
        onClick={() => handleSuggestionClick(suggestionKey)}
      >
        {IconComponent && <IconComponent className="size-4" />}
        {suggestion.label}
      </Button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                Generate a prompt
              </DialogTitle>
              <DialogDescription className="mt-1.5 text-muted-foreground">
                You can generate a prompt template by sharing basic details about your task.
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-8 -mt-1 -mr-2"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          {/* Textarea */}
          <div className="space-y-2">
            <Textarea
              ref={textareaRef}
              placeholder="Describe your task..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setSelectedSuggestion(undefined);
              }}
              onKeyDown={handleKeyDown}
              className="min-h-[140px] resize-none text-base"
              disabled={isGenerating}
            />
          </div>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap items-center gap-2">
            {PRIMARY_SUGGESTIONS.map(renderSuggestionButton)}

            {/* More dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-3"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {MORE_SUGGESTIONS.map((suggestionKey) => {
                  const suggestion = SUGGESTION_TEMPLATES[suggestionKey];
                  const IconComponent = ICON_MAP[suggestion.icon as keyof typeof ICON_MAP];

                  return (
                    <DropdownMenuItem
                      key={suggestionKey}
                      onClick={() => handleSuggestionClick(suggestionKey)}
                      className="gap-2"
                    >
                      {IconComponent && <IconComponent className="size-4" />}
                      {suggestion.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Thinking checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="thinking"
              checked={thinkingEnabled}
              onCheckedChange={(checked) => setThinkingEnabled(checked === true)}
              disabled={isGenerating}
            />
            <Label
              htmlFor="thinking"
              className="text-sm text-muted-foreground cursor-pointer select-none"
            >
              This prompt will be used with models that have{' '}
              <span className="font-medium text-foreground">thinking</span> enabled
            </Label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-start gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !description.trim()}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
