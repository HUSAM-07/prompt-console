'use client';

import * as React from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Prompt } from '@/types';

interface CodeExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt;
}

function generatePythonCode(prompt: Prompt): string {
  const messages = [];

  if (prompt.systemPrompt) {
    messages.push(`    {"role": "system", "content": """${prompt.systemPrompt}"""}`);
  }

  prompt.messages.forEach((msg) => {
    if (msg.content) {
      messages.push(`    {"role": "${msg.role}", "content": """${msg.content}"""}`);
    }
  });

  return `import requests

OPENROUTER_API_KEY = "your-api-key-here"

response = requests.post(
    url="https://openrouter.ai/api/v1/chat/completions",
    headers={
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    },
    json={
        "model": "${prompt.modelId}",
        "messages": [
${messages.join(',\n')}
        ]
    }
)

print(response.json())`;
}

function generateTypeScriptCode(prompt: Prompt): string {
  const messages = [];

  if (prompt.systemPrompt) {
    messages.push(`      { role: 'system', content: \`${prompt.systemPrompt}\` }`);
  }

  prompt.messages.forEach((msg) => {
    if (msg.content) {
      messages.push(`      { role: '${msg.role}', content: \`${msg.content}\` }`);
    }
  });

  return `const OPENROUTER_API_KEY = 'your-api-key-here';

async function runPrompt() {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${OPENROUTER_API_KEY}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: '${prompt.modelId}',
      messages: [
${messages.join(',\n')}
      ]
    })
  });

  const data = await response.json();
  console.log(data);
}

runPrompt();`;
}

function generateCurlCode(prompt: Prompt): string {
  const messages = [];

  if (prompt.systemPrompt) {
    messages.push(`{"role": "system", "content": "${prompt.systemPrompt.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"}`);
  }

  prompt.messages.forEach((msg) => {
    if (msg.content) {
      messages.push(`{"role": "${msg.role}", "content": "${msg.content.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"}`);
    }
  });

  return `curl https://openrouter.ai/api/v1/chat/completions \\
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${prompt.modelId}",
    "messages": [${messages.join(', ')}]
  }'`;
}

export function CodeExportDialog({ isOpen, onClose, prompt }: CodeExportDialogProps) {
  const [copied, setCopied] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState('python');

  const codes = {
    python: generatePythonCode(prompt),
    typescript: generateTypeScriptCode(prompt),
    curl: generateCurlCode(prompt),
  };

  const handleCopy = async (tab: string) => {
    const code = codes[tab as keyof typeof codes];
    await navigator.clipboard.writeText(code);
    setCopied(tab);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Export Code</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <TabsList>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="typescript">TypeScript</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
            </TabsList>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(activeTab)}
              className="w-full sm:w-auto"
            >
              {copied === activeTab ? (
                <>
                  <Check className="size-4 mr-1 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="size-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>

          <TabsContent value="python" className="flex-1 mt-0 overflow-hidden">
            <ScrollArea className="h-full w-full rounded-md border bg-muted/50">
              <pre className="p-4 text-sm overflow-x-auto">
                <code className="font-mono block whitespace-pre">{codes.python}</code>
              </pre>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="typescript" className="flex-1 mt-0 overflow-hidden">
            <ScrollArea className="h-full w-full rounded-md border bg-muted/50">
              <pre className="p-4 text-sm overflow-x-auto">
                <code className="font-mono block whitespace-pre">{codes.typescript}</code>
              </pre>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="curl" className="flex-1 mt-0 overflow-hidden">
            <ScrollArea className="h-full w-full rounded-md border bg-muted/50">
              <pre className="p-4 text-sm overflow-x-auto">
                <code className="font-mono block whitespace-pre">{codes.curl}</code>
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
