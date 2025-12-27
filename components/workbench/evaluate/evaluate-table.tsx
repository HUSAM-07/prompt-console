'use client';

import * as React from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { EvaluateRow } from './evaluate-row';
import { cn } from '@/lib/utils';
import type { TestCase, PromptVersion, EvaluationResult, Variable } from '@/types';

interface EvaluateTableProps {
  testCases: TestCase[];
  promptVersions: PromptVersion[];
  variables: Variable[];
  results: Map<string, EvaluationResult>;
  showIdealOutputs: boolean;
  onUpdateTestCase: (id: string, updates: Partial<TestCase>) => void;
  onDeleteTestCase: (id: string) => void;
  onDeleteVersion: (id: string) => void;
  onAddComparison: () => void;
  onRunCell: (testCaseId: string, promptVersionId: string) => void;
  className?: string;
}

export function EvaluateTable({
  testCases,
  promptVersions,
  variables,
  results,
  showIdealOutputs,
  onUpdateTestCase,
  onDeleteTestCase,
  onDeleteVersion,
  onAddComparison,
  onRunCell,
  className,
}: EvaluateTableProps) {
  return (
    <ScrollArea className={cn('flex-1', className)}>
      <div className="min-w-max">
        <table className="w-full border-collapse">
          {/* Header */}
          <thead>
            <tr className="border-b-2 border-border bg-muted/50">
              {/* Row number header */}
              <th className="p-3 text-left text-sm font-medium text-muted-foreground w-12 border-r border-border">
                #
              </th>

              {/* Variable headers */}
              {variables.map((variable) => (
                <th
                  key={variable.name}
                  className="p-3 text-left text-sm font-medium min-w-[200px] border-r border-border"
                >
                  <span className="text-primary font-mono">
                    {`{{${variable.name}}}`}
                  </span>
                </th>
              ))}

              {/* Ideal output header (conditional) */}
              {showIdealOutputs && (
                <th className="p-3 text-left text-sm font-medium min-w-[200px] border-r border-border">
                  Ideal Output
                </th>
              )}

              {/* Prompt version headers */}
              {promptVersions.map((version) => (
                <th
                  key={version.id}
                  className="p-3 text-left min-w-[300px] border-r border-border"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{version.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="size-6 text-muted-foreground hover:text-destructive"
                      onClick={() => onDeleteVersion(version.id)}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Model output
                  </div>
                </th>
              ))}

              {/* Add comparison header */}
              <th className="p-3 w-[150px]">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={onAddComparison}
                >
                  <Plus className="size-3" />
                  Add Comparison
                </Button>
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {testCases.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    2 +
                    variables.length +
                    promptVersions.length +
                    (showIdealOutputs ? 1 : 0)
                  }
                  className="p-8 text-center text-muted-foreground"
                >
                  <p>No test cases yet.</p>
                  <p className="text-sm mt-1">
                    Add a row to start evaluating your prompt.
                  </p>
                </td>
              </tr>
            ) : (
              testCases.map((testCase, index) => (
                <EvaluateRow
                  key={testCase.id}
                  rowNumber={index + 1}
                  testCase={testCase}
                  variables={variables}
                  promptVersions={promptVersions}
                  results={results}
                  showIdealOutputs={showIdealOutputs}
                  onUpdateTestCase={(updates) =>
                    onUpdateTestCase(testCase.id, updates)
                  }
                  onDeleteTestCase={() => onDeleteTestCase(testCase.id)}
                  onRunCell={(versionId) => onRunCell(testCase.id, versionId)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
