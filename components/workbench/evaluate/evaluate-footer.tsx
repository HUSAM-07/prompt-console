'use client';

import * as React from 'react';
import { Plus, Sparkles, Upload, Download, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface EvaluateFooterProps {
  onAddRow: () => void;
  onGenerateTestCase: (count: number) => void;
  onImportCSV: () => void;
  onExportCSV: () => void;
  isGenerating?: boolean;
  className?: string;
}

export function EvaluateFooter({
  onAddRow,
  onGenerateTestCase,
  onImportCSV,
  onExportCSV,
  isGenerating = false,
  className,
}: EvaluateFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-3 border-t border-border bg-muted/30',
        className
      )}
    >
      {/* Add Row */}
      <Button variant="outline" size="sm" onClick={onAddRow}>
        <Plus className="size-4 mr-1" />
        Add Row
      </Button>

      {/* Generate Test Case with dropdown */}
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          className="rounded-r-none border-r-0"
          onClick={() => onGenerateTestCase(1)}
          disabled={isGenerating}
        >
          <Sparkles className="size-4 mr-1" />
          Generate Test Case
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="rounded-l-none px-2"
              disabled={isGenerating}
            >
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => onGenerateTestCase(1)}>
              Generate 1 test case
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onGenerateTestCase(3)}>
              Generate 3 test cases
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onGenerateTestCase(5)}>
              Generate 5 test cases
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Import Test Cases */}
      <Button variant="outline" size="sm" onClick={onImportCSV}>
        <Upload className="size-4 mr-1" />
        Import Test Cases
      </Button>

      {/* Export to CSV */}
      <Button variant="outline" size="sm" onClick={onExportCSV}>
        <Download className="size-4 mr-1" />
        Export to CSV
      </Button>
    </div>
  );
}
