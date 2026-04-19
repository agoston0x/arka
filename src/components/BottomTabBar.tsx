'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type TabKey = 'home' | 'explore' | 'profile';

const tabs: { key: TabKey; label: string; href: string }[] = [
  { key: 'home', label: 'Home', href: '/profile' },
  { key: 'explore', label: 'Explore', href: '/communities' },
  { key: 'profile', label: 'Profile', href: '/profile' },
];

function Icon({ label }: { label: string }) {
  if (label === 'Home') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5.5 9.5V20h13V9.5" />
      </svg>
    );
  }
  if (label === 'Explore') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21c.8-3.8 3.8-6 7.5-6s6.7 2.2 7.5 6" />
    </svg>
  );
}

export function BottomTabBar({ activeTab }: { activeTab: TabKey }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-20 w-full max-w-md -translate-x-1/2 border-t border-black/10 bg-white/95 px-3 pb-4 pt-2 backdrop-blur-sm">
      <ul className="grid grid-cols-3 gap-1">
        {tabs.map((tab) => {
          const active = activeTab === tab.key || pathname === tab.href;
          return (
            <li key={tab.key}>
              <Link
                href={tab.href}
                className={`flex flex-col items-center justify-center rounded-xl px-2 py-2 text-xs transition ${
                  active ? 'bg-arka-pink/10 text-arka-pink' : 'text-black/65 hover:bg-black/5'
                }`}
              >
                <Icon label={tab.label} />
                <span className="mt-1 font-medium">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
