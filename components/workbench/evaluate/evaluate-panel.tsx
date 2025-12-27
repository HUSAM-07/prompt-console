'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { EvaluateHeader } from './evaluate-header';
import { EvaluateTable } from './evaluate-table';
import { EvaluateFooter } from './evaluate-footer';
import { AddComparisonDialog } from './add-comparison-dialog';
import { usePromptStore } from '@/stores/prompt-store';
import { useEvaluateStore } from '@/stores/evaluate-store';
import { useEvaluateRunner, useTestCaseGenerator, useCSVImportExport } from '@/hooks/use-evaluate';
import { useKeyboardShortcut, shortcuts } from '@/hooks/use-keyboard-shortcut';
import type { Prompt, TestCase, EvaluationResult, Variable } from '@/types';

interface EvaluatePanelProps {
  prompt: Prompt;
}

export function EvaluatePanel({ prompt }: EvaluatePanelProps) {
  const [isAddComparisonOpen, setIsAddComparisonOpen] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Stores
  const { testCases, addTestCase, updateTestCase, deleteTestCase, getTestCasesForPrompt } =
    usePromptStore();
  const {
    promptVersions,
    results,
    viewConfig,
    isRunningAll,
    runProgress,
    createPromptVersion,
    deletePromptVersion,
    getVersionsForPrompt,
    getResultForCell,
    setShowPrompt,
    setShowIdealOutputs,
  } = useEvaluateStore();

  // Hooks
  const { runSingleEvaluation, runAllEvaluations, cancelEvaluations } = useEvaluateRunner();
  const { generateTestCases } = useTestCaseGenerator();
  const { importFromCSV, exportToCSV } = useCSVImportExport();

  // Get test cases for this prompt
  const promptTestCases = React.useMemo(
    () => getTestCasesForPrompt(prompt.id),
    [getTestCasesForPrompt, prompt.id, testCases]
  );

  // Get prompt versions for this prompt
  const promptVersionsList = React.useMemo(
    () => getVersionsForPrompt(prompt.id),
    [getVersionsForPrompt, prompt.id, promptVersions]
  );

  // Build results map for quick lookup
  const resultsMap = React.useMemo(() => {
    const map = new Map<string, EvaluationResult>();
    results.forEach((result) => {
      const key = `${result.testCaseId}-${result.promptVersionId}`;
      map.set(key, result);
    });
    return map;
  }, [results]);

  // Get variables from prompt
  const variables: Variable[] = React.useMemo(() => {
    return prompt.variables || [];
  }, [prompt.variables]);

  // Ensure at least one prompt version exists
  React.useEffect(() => {
    if (promptVersionsList.length === 0) {
      createPromptVersion(prompt, `${prompt.name} v1`);
    }
  }, [prompt, promptVersionsList.length, createPromptVersion]);

  // Handle add row
  const handleAddRow = () => {
    const variableValues: Record<string, string> = {};
    variables.forEach((v) => {
      variableValues[v.name] = '';
    });
    addTestCase(prompt.id, variableValues);
  };

  // Handle update test case
  const handleUpdateTestCase = (id: string, updates: Partial<TestCase>) => {
    updateTestCase(id, updates);
  };

  // Handle delete test case
  const handleDeleteTestCase = (id: string) => {
    deleteTestCase(id);
  };

  // Handle add comparison
  const handleAddComparison = (name: string) => {
    createPromptVersion(prompt, name);
    toast.success('Comparison added');
  };

  // Handle delete version
  const handleDeleteVersion = (id: string) => {
    if (promptVersionsList.length <= 1) {
      toast.error('Cannot delete the last version');
      return;
    }
    deletePromptVersion(id);
    toast.success('Version removed');
  };

  // Handle run cell
  const handleRunCell = async (testCaseId: string, promptVersionId: string) => {
    const testCase = promptTestCases.find((tc) => tc.id === testCaseId);
    const version = promptVersionsList.find((v) => v.id === promptVersionId);

    if (!testCase || !version) return;

    try {
      await runSingleEvaluation(version, testCase);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to run evaluation');
    }
  };

  // Handle run all
  const handleRunAll = async () => {
    if (promptTestCases.length === 0) {
      toast.error('Add test cases first');
      return;
    }

    if (promptVersionsList.length === 0) {
      toast.error('No prompt versions available');
      return;
    }

    try {
      await runAllEvaluations(promptVersionsList, promptTestCases);
      toast.success('All evaluations completed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to run evaluations');
    }
  };

  // Handle generate test cases
  const handleGenerateTestCase = async (count: number) => {
    if (variables.length === 0) {
      toast.error('No variables in prompt to generate test cases for');
      return;
    }

    setIsGenerating(true);
    try {
      const userMessage = prompt.messages.find((m) => m.role === 'user')?.content || '';
      const generated = await generateTestCases(
        prompt.systemPrompt,
        userMessage,
        variables.map((v) => v.name),
        count
      );

      generated.forEach((variableValues) => {
        addTestCase(prompt.id, variableValues);
      });

      toast.success(`Generated ${generated.length} test case${generated.length > 1 ? 's' : ''}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate test cases');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle import CSV
  const handleImportCSV = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importFromCSV(file);
      imported.forEach((variableValues) => {
        addTestCase(prompt.id, variableValues);
      });
      toast.success(`Imported ${imported.length} test case${imported.length > 1 ? 's' : ''}`);
    } catch (err) {
      toast.error('Failed to import CSV');
    }

    // Reset input
    e.target.value = '';
  };

  // Handle export CSV
  const handleExportCSV = () => {
    if (promptTestCases.length === 0) {
      toast.error('No test cases to export');
      return;
    }

    const csv = exportToCSV(promptTestCases, resultsMap);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prompt.name}-test-cases.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Exported to CSV');
  };

  // Keyboard shortcut for Run All
  useKeyboardShortcut(shortcuts.runPrompt, handleRunAll);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header with toggles and Run All */}
      <EvaluateHeader
        showPrompt={viewConfig.showPrompt}
        showIdealOutputs={viewConfig.showIdealOutputs}
        isRunningAll={isRunningAll}
        runProgress={runProgress}
        onToggleShowPrompt={setShowPrompt}
        onToggleShowIdealOutputs={setShowIdealOutputs}
        onRunAll={handleRunAll}
        onCancel={cancelEvaluations}
      />

      {/* Main table */}
      <EvaluateTable
        testCases={promptTestCases}
        promptVersions={promptVersionsList}
        variables={variables}
        results={resultsMap}
        showIdealOutputs={viewConfig.showIdealOutputs}
        onUpdateTestCase={handleUpdateTestCase}
        onDeleteTestCase={handleDeleteTestCase}
        onDeleteVersion={handleDeleteVersion}
        onAddComparison={() => setIsAddComparisonOpen(true)}
        onRunCell={handleRunCell}
      />

      {/* Footer with actions */}
      <EvaluateFooter
        onAddRow={handleAddRow}
        onGenerateTestCase={handleGenerateTestCase}
        onImportCSV={handleImportCSV}
        onExportCSV={handleExportCSV}
        isGenerating={isGenerating}
      />

      {/* Hidden file input for CSV import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Add Comparison Dialog */}
      <AddComparisonDialog
        open={isAddComparisonOpen}
        onOpenChange={setIsAddComparisonOpen}
        prompt={prompt}
        onAdd={handleAddComparison}
      />
    </div>
  );
}
