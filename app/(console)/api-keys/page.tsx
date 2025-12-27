import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiKeyForm } from '@/components/api-keys/api-key-form';
import { ApiKeyList } from '@/components/api-keys/api-key-list';

export default function ApiKeysPage() {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">API Keys</h1>
          <p className="text-muted-foreground mt-1">
            Manage your OpenRouter API keys for accessing language models
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Add Key Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add API Key</CardTitle>
              <CardDescription>
                Add a new OpenRouter API key to use with Prompt Console
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApiKeyForm />
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>About OpenRouter</CardTitle>
              <CardDescription>
                Access multiple AI models through a single API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                OpenRouter provides a unified API to access models from Anthropic,
                OpenAI, Google, Meta, and more.
              </p>
              <p>
                Your API key is stored locally in your browser and is never sent
                to our servers.
              </p>
              <div className="pt-2">
                <a
                  href="https://openrouter.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Learn more about OpenRouter →
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key List */}
        <div>
          <h2 className="text-lg font-medium mb-4">Your API Keys</h2>
          <ApiKeyList />
        </div>
      </div>
    </div>
  );
}
