import { SettingsForm } from '@/components/settings/settings-form';

export default function SettingsPage() {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and preferences
          </p>
        </div>

        {/* Settings Form */}
        <SettingsForm />
      </div>
    </div>
  );
}
