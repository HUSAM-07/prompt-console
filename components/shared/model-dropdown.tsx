'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DEFAULT_MODELS } from '@/lib/constants';

interface ModelDropdownProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ModelDropdown({ value, onChange, className }: ModelDropdownProps) {
  const selectedModel = DEFAULT_MODELS.find((m) => m.id === value) || DEFAULT_MODELS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn('justify-between gap-2 font-normal', className)}
        >
          <Sparkles className="size-4 text-muted-foreground" />
          <span className="truncate">{selectedModel.name}</span>
          <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {DEFAULT_MODELS.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onChange(model.id)}
            className="flex items-center justify-between"
          >
            <div className="flex flex-col">
              <span>{model.name}</span>
              <span className="text-xs text-muted-foreground">
                {model.description}
              </span>
            </div>
            {value === model.id && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
