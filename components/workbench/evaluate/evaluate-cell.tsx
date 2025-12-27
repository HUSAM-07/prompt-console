'use client';

import * as React from 'react';
import { Loader2, Copy, MoreHorizontal, ChevronDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { EvaluationResult } from '@/types';
import { toast } from 'sonner';

interface EvaluateCellProps {
  result?: EvaluationResult;
  onRun: () => void;
  onViewDetails?: () => void;
  className?: string;
}

export function EvaluateCell({
  result,
  onRun,
  onViewDetails,
  className,
}: EvaluateCellProps) {
  const handleCopy = () => {
    if (result?.content) {
      navigator.clipboard.writeText(result.content);
      toast.success('Copied to clipboard');
    }
  };

  // Pending or no result state
  if (!result || result.status === 'pending') {
    return (
      <div
        className={cn(
          'p-4 min-h-[120px] flex items-center justify-center text-muted-foreground text-sm',
          className
        )}
      >
        Click Run All to generate
      </div>
    );
  }

  // Running state
  if (result.status === 'running') {
    return (
      <div
        className={cn(
          'p-4 min-h-[120px] flex items-center justify-center',
          className
        )}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-sm">Generating...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (result.status === 'error') {
    return (
      <div
        className={cn(
          'p-4 min-h-[120px] flex flex-col items-center justify-center gap-2',
          className
        )}
      >
        <span className="text-sm text-destructive">{result.error || 'Error'}</span>
        <Button variant="outline" size="sm" onClick={onRun}>
          <RotateCcw className="size-3 mr-1" />
          Retry
        </Button>
      </div>
    );
  }

  // Completed state
  return (
    <div className={cn('relative group', className)}>
      {/* Content */}
      <div className="p-4 min-h-[120px] max-h-[300px] overflow-y-auto">
        <p className="text-sm whitespace-pre-wrap break-words">{result.content}</p>
      </div>

      {/* Actions */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="size-7 bg-background/80">
              <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onRun}>
              <RotateCcw className="size-4 mr-2" />
              Re-run
            </DropdownMenuItem>
            {onViewDetails && (
              <DropdownMenuItem onClick={onViewDetails}>
                View details
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="size-7 bg-background/80">
              <MoreHorizontal className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopy}>
              <Copy className="size-4 mr-2" />
              Copy
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats footer */}
      {result.latencyMs > 0 && (
        <div className="px-4 pb-2 text-xs text-muted-foreground">
          {(result.latencyMs / 1000).toFixed(2)}s • {result.usage.totalTokens} tokens
        </div>
      )}
    </div>
  );
}
