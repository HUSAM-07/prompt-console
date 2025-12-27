'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Prompt } from '@/types';

interface AddComparisonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: Prompt;
  onAdd: (name: string) => void;
}

export function AddComparisonDialog({
  open,
  onOpenChange,
  prompt,
  onAdd,
}: AddComparisonDialogProps) {
  const [name, setName] = React.useState('');

  React.useEffect(() => {
    if (open) {
      setName(`${prompt.name} v2`);
    }
  }, [open, prompt.name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Comparison</DialogTitle>
          <DialogDescription>
            Create a snapshot of the current prompt to compare different versions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="version-name">Version Name</Label>
            <Input
              id="version-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., UX Persona v2"
              autoFocus
            />
          </div>

          <div className="rounded-md bg-muted p-3">
            <p className="text-sm text-muted-foreground">
              This will create a snapshot of:
            </p>
            <ul className="text-sm mt-2 space-y-1">
              <li>• System prompt</li>
              <li>• Messages ({prompt.messages.length})</li>
              <li>• Model: {prompt.modelId}</li>
              {prompt.temperature !== undefined && (
                <li>• Temperature: {prompt.temperature}</li>
              )}
            </ul>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              Add Comparison
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
