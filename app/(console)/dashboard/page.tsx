import { Greeting } from '@/components/dashboard/greeting';
import { ActionCards } from '@/components/dashboard/action-cards';
import { PromptList } from '@/components/dashboard/prompt-list';

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content */}
      <main className="flex-1 px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Greeting */}
          <div className="text-center">
            <Greeting />
          </div>

          {/* Action Cards */}
          <ActionCards />

          {/* Prompt List */}
          <PromptList />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <a href="https://www.mohusam.com/" className="hover:text-foreground transition-colors">
            Contact Developer
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Help & support
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Feedback
          </a>
        </div>
      </footer>
    </div>
  );
}
