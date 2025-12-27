'use client';

import * as React from 'react';
import { X, Sparkles, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Variable } from '@/types';

interface TestCasePanelProps {
  isOpen: boolean;
  onClose: () => void;
  variables: Variable[];
  onRun: (values: Record<string, string>) => void;
  isRunning: boolean;
}

export function TestCasePanel({
  isOpen,
  onClose,
  variables,
  onRun,
  isRunning,
}: TestCasePanelProps) {
  const [values, setValues] = React.useState<Record<string, string>>({});

  // Initialize values when variables change
  React.useEffect(() => {
    const initial: Record<string, string> = {};
    variables.forEach((v) => {
      initial[v.name] = values[v.name] || v.defaultValue || '';
    });
    setValues(initial);
  }, [variables]);

  const handleValueChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleRun = () => {
    onRun(values);
  };

  const handleGenerate = () => {
    // TODO: Implement AI-generated test values
    console.log('Generate test values');
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[500px] p-0 flex flex-col" showCloseButton={false}>
        <SheetHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle>Test Case</SheetTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleGenerate}>
                <Sparkles className="size-4 mr-1" />
                Generate
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={onClose}>
                <X className="size-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          {variables.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No variables detected in your prompt.</p>
              <p className="text-sm mt-2">
                Use {'{{VARIABLE_NAME}}'} syntax to add variables.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {variables.map((variable) => (
                <div key={variable.name} className="space-y-2">
                  <Label className="text-sm font-medium text-primary">
                    {`{{${variable.name}}}`}
                  </Label>
                  <Input
                    placeholder="Enter an example value..."
                    value={values[variable.name] || ''}
                    onChange={(e) => handleValueChange(variable.name, e.target.value)}
                    className="border-primary/30 focus:border-primary"
                  />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="px-6 py-4 border-t border-border bg-muted/30">
          <Button
            className="w-full bg-foreground text-background hover:bg-foreground/90"
            onClick={handleRun}
            disabled={isRunning || variables.length === 0}
          >
            <Play className="size-4 mr-1" />
            Run
            <span className="ml-2 text-xs opacity-70">⌘ + ↵</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
