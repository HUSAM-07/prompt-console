'use client';

import { useMemo, useState, useEffect } from 'react';

/**
 * Hook that returns a time-based greeting
 */
export function useGreeting(name: string): string {
  const [hour, setHour] = useState(() => new Date().getHours());

  // Update hour every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setHour(new Date().getHours());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    if (hour >= 5 && hour < 12) {
      return `Good morning, ${name}`;
    }
    if (hour >= 12 && hour < 17) {
      return `Good afternoon, ${name}`;
    }
    if (hour >= 17 && hour < 21) {
      return `Good evening, ${name}`;
    }
    return `Good night, ${name}`;
  }, [hour, name]);
}

/**
 * Format relative time for "last saved" displays
 */
export function formatLastSaved(dateString: string | undefined): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins === 1) return '1 minute ago';
  if (diffMins < 60) return `${diffMins} minutes ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;

  // Format as date and time
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Format date for display in lists
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
