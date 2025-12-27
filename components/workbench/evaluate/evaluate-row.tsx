'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EvaluateCell } from './evaluate-cell';
import { cn } from '@/lib/utils';
import type { TestCase, PromptVersion, EvaluationResult, Variable } from '@/types';

interface EvaluateRowProps {
  rowNumber: number;
  testCase: TestCase;
  variables: Variable[];
  promptVersions: PromptVersion[];
  results: Map<string, EvaluationResult>;
  showIdealOutputs: boolean;
  onUpdateTestCase: (updates: Partial<TestCase>) => void;
  onDeleteTestCase: () => void;
  onRunCell: (promptVersionId: string) => void;
  className?: string;
}

export function EvaluateRow({
  rowNumber,
  testCase,
  variables,
  promptVersions,
  results,
  showIdealOutputs,
  onUpdateTestCase,
  onDeleteTestCase,
  onRunCell,
  className,
}: EvaluateRowProps) {
  const handleVariableChange = (varName: string, value: string) => {
    onUpdateTestCase({
      variableValues: {
        ...testCase.variableValues,
        [varName]: value,
      },
    });
  };

  const handleIdealOutputChange = (value: string) => {
    onUpdateTestCase({ idealOutput: value });
  };

  return (
    <tr className={cn('border-b border-border hover:bg-muted/30', className)}>
      {/* Row number */}
      <td className="p-3 text-center text-sm text-muted-foreground w-12 border-r border-border">
        {rowNumber}
      </td>

      {/* Variable columns */}
      {variables.map((variable) => (
        <td
          key={variable.name}
          className="p-3 border-r border-border min-w-[200px] align-top"
        >
          <Textarea
            value={testCase.variableValues[variable.name] || ''}
            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
            placeholder={`Enter ${variable.name}...`}
            className="min-h-[80px] text-sm resize-none border-none shadow-none focus-visible:ring-0 p-0 bg-transparent"
          />
        </td>
      ))}

      {/* Ideal output column (conditional) */}
      {showIdealOutputs && (
        <td className="p-3 border-r border-border min-w-[200px] align-top">
          <Textarea
            value={testCase.idealOutput || ''}
            onChange={(e) => handleIdealOutputChange(e.target.value)}
            placeholder="Enter ideal output..."
            className="min-h-[80px] text-sm resize-none border-none shadow-none focus-visible:ring-0 p-0 bg-transparent"
          />
        </td>
      )}

      {/* Result columns for each prompt version */}
      {promptVersions.map((version) => {
        const resultKey = `${testCase.id}-${version.id}`;
        const result = results.get(resultKey);

        return (
          <td
            key={version.id}
            className="p-0 border-r border-border min-w-[300px] align-top"
          >
            <EvaluateCell
              result={result}
              onRun={() => onRunCell(version.id)}
            />
          </td>
        );
      })}

      {/* Actions column */}
      <td className="p-3 w-12">
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-6 text-muted-foreground hover:text-destructive"
          onClick={onDeleteTestCase}
        >
          <X className="size-3" />
        </Button>
      </td>
    </tr>
  );
}
