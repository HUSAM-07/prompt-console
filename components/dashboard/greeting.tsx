'use client';

import { useGreeting } from '@/hooks/use-greeting';
import { useSettingsStore } from '@/stores/settings-store';

export function Greeting() {
  const settings = useSettingsStore((state) => state.settings);
  const greeting = useGreeting(settings.userName);

  return (
    <h1 className="text-4xl font-semibold text-foreground tracking-tight">
      {greeting}
    </h1>
  );
}
