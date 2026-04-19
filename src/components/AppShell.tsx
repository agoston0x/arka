'use client';

import { BottomTabBar } from '@/components/BottomTabBar';

export function AppShell({
  children,
  activeTab,
}: {
  children: React.ReactNode;
  activeTab: 'home' | 'explore' | 'profile';
}) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-white px-4 pb-24 pt-4">
      <div className="fade-up space-y-4">{children}</div>
      <BottomTabBar activeTab={activeTab} />
    </main>
  );
}
