'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ArkaLogo from '@/components/ArkaLogo';
import { CommunityIcon, MeetupIcon, TrophyIcon, QrIcon } from '@/components/Icons';
import { useAuth } from '@/lib/auth-context';

export default function MiniAppPage() {
  const [isTelegram, setIsTelegram] = useState<boolean | null>(null);
  const router = useRouter();
  const { user, openSignIn } = useAuth();

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      setIsTelegram(true);
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#ffffff');
      tg.MainButton.setParams({ color: '#E5007D', text_color: '#ffffff' });
    } else {
      // Not in Telegram — redirect to landing
      setIsTelegram(false);
      router.replace('/');
    }
  }, [router]);

  // Show nothing while detecting
  if (isTelegram === null) return null;
  // Redirecting...
  if (isTelegram === false) return null;

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const displayName = tgUser?.first_name || 'there';

  const handleAction = (path: string) => {
    router.push(`/demo${path}`);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <ArkaLogo size={28} />
          <span className="text-base font-bold text-arka-text">arka</span>
        </div>
        <button
          onClick={() => handleAction('/profile')}
          className="rounded-full bg-arka-pink px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-arka-pink/90"
        >
          Profile
        </button>
      </header>

      {/* Welcome */}
      <section className="px-5 pb-6 pt-4">
        <h1 className="text-2xl font-bold text-arka-text">
          Hey {displayName} 👋
        </h1>
        <p className="mt-1 text-sm text-black/50">
          Here&apos;s what&apos;s happening in your communities.
        </p>
      </section>

      {/* Quick stats */}
      <section className="grid grid-cols-3 gap-3 px-5 pb-6">
        <div className="rounded-xl bg-arka-pink/10 p-3 text-center">
          <p className="text-2xl font-black text-arka-pink">2</p>
          <p className="text-[10px] text-black/40">Communities</p>
        </div>
        <div className="rounded-xl bg-arka-cyan/10 p-3 text-center">
          <p className="text-2xl font-black text-arka-cyan">5</p>
          <p className="text-[10px] text-black/40">Events</p>
        </div>
        <div className="rounded-xl bg-arka-green/10 p-3 text-center">
          <p className="text-2xl font-black text-arka-green">#3</p>
          <p className="text-[10px] text-black/40">Rank</p>
        </div>
      </section>

      {/* Upcoming event */}
      <section className="px-5 pb-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-black/30">Next Event</p>
        <button
          onClick={() => router.push('/miniapp/event/mock-eth-budapest')}
          className="w-full rounded-2xl bg-white p-4 text-left shadow-md ring-1 ring-black/5 transition active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-arka-text">ETH Budapest Meetup</p>
              <p className="mt-0.5 text-xs text-black/40">Tomorrow, 18:00 · 23 attending</p>
            </div>
            <span className="rounded-full bg-arka-green/15 px-2 py-0.5 text-xs font-semibold text-arka-green">RSVP&apos;d</span>
          </div>
        </button>
      </section>

      {/* Your match */}
      <section className="px-5 pb-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-black/30">Your Match</p>
        <div className="rounded-2xl bg-arka-card p-4 text-center">
          <p className="text-4xl font-black text-arka-pink">#7</p>
          <p className="mt-1 text-xs text-black/40">Find your partner at the event!</p>
          <button
            onClick={() => handleAction('/dashboard')}
            className="mt-3 rounded-full bg-arka-pink px-6 py-2 text-xs font-semibold text-white"
          >
            Scan QR
          </button>
        </div>
      </section>

      {/* Quick actions */}
      <section className="space-y-3 px-5 pb-10">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-black/30">Quick Actions</p>
        {[
          { Icon: CommunityIcon, color: 'cyan', title: 'Browse Communities', path: '/communities' },
          { Icon: MeetupIcon, color: 'green', title: 'Upcoming Events', path: '/dashboard' },
          { Icon: TrophyIcon, color: 'purple', title: 'Leaderboard', path: '/communities' },
          { Icon: QrIcon, color: 'orange', title: 'Scan QR Code', path: '/dashboard' },
        ].map(({ Icon, color, title, path }) => (
          <button
            key={title}
            onClick={() => handleAction(path)}
            className="flex w-full items-center gap-3 rounded-xl bg-arka-card p-4 text-left transition active:scale-[0.98]"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-arka-${color}/15`}>
              <Icon className={`h-5 w-5 text-arka-${color}`} />
            </div>
            <span className="text-sm font-semibold text-arka-text">{title}</span>
          </button>
        ))}
      </section>
    </main>
  );
}
