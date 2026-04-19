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
      setIsTelegram(false);
      router.replace('/');
    }
  }, [router]);

  if (isTelegram === null) return null;
  if (isTelegram === false) return null;

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const displayName = tgUser?.first_name || 'there';

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <ArkaLogo size={28} />
          <span className="text-base font-bold text-arka-text">arka</span>
        </div>
        <button
          onClick={() => router.push('/demo/profile')}
          className="rounded-full bg-arka-pink px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-arka-pink/90"
        >
          Profile
        </button>
      </header>

      {/* Welcome + Stats */}
      <section className="px-5 pb-4 pt-2">
        <h1 className="text-xl font-bold text-arka-text">
          Hey {displayName} 👋
        </h1>
      </section>

      {/* Quick stats */}
      <section className="grid grid-cols-3 gap-3 px-5 pb-5">
        <div className="rounded-xl bg-arka-pink/10 p-3 text-center">
          <p className="text-2xl font-black text-arka-pink">2</p>
          <p className="text-[10px] text-black/40">Communities</p>
        </div>
        <div className="rounded-xl bg-arka-cyan/10 p-3 text-center">
          <p className="text-2xl font-black text-arka-cyan">5</p>
          <p className="text-[10px] text-black/40">Events</p>
        </div>
        <button
          onClick={() => router.push('/demo/communities')}
          className="rounded-xl bg-arka-green/10 p-3 text-center transition active:scale-95"
        >
          <p className="text-2xl font-black text-arka-green">#3</p>
          <p className="text-[10px] text-black/40">Rank →</p>
        </button>
      </section>

      {/* Notifications / Updates */}
      <section className="px-5 pb-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-black/30">Updates</p>
        <div className="space-y-2">
          <div className="rounded-xl bg-arka-pink/5 p-3 ring-1 ring-arka-pink/10">
            <div className="flex items-start gap-2">
              <span className="text-sm">🎉</span>
              <div>
                <p className="text-xs font-semibold text-arka-text">New Event: ETH Budapest Meetup</p>
                <p className="text-[10px] text-black/40">Tomorrow, 18:00 · 23 attending</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-arka-green/5 p-3 ring-1 ring-arka-green/10">
            <div className="flex items-start gap-2">
              <span className="text-sm">📈</span>
              <div>
                <p className="text-xs font-semibold text-arka-text">Your reputation rose +120 this week</p>
                <p className="text-[10px] text-black/40">You&apos;re now #3 in ETH Budapest</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-arka-cyan/5 p-3 ring-1 ring-arka-cyan/10">
            <div className="flex items-start gap-2">
              <span className="text-sm">👥</span>
              <div>
                <p className="text-xs font-semibold text-arka-text">3 new members joined Arbitrum Builders</p>
                <p className="text-[10px] text-black/40">Community now has 127 members</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200/30">
            <div className="flex items-start gap-2">
              <span className="text-sm">🏆</span>
              <div>
                <p className="text-xs font-semibold text-arka-text">alex.eth overtook you on the leaderboard</p>
                <p className="text-[10px] text-black/40">Attend more events to reclaim #2!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Next Event */}
      <section className="px-5 pb-5">
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

      {/* Leaderboard preview */}
      <section className="px-5 pb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold uppercase tracking-wider text-black/30">Leaderboard</p>
          <button
            onClick={() => router.push('/demo/communities')}
            className="text-[10px] font-semibold text-arka-pink"
          >
            View All →
          </button>
        </div>
        <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
          {[
            { rank: 1, name: 'alex.eth', rep: 3200, color: 'text-yellow-500' },
            { rank: 2, name: 'sarah.arb', rep: 2800, color: 'text-gray-400' },
            { rank: 3, name: 'You', rep: 2450, color: 'text-amber-600', highlight: true },
          ].map((r) => (
            <div
              key={r.rank}
              className={`flex items-center justify-between rounded-lg px-2 py-2 text-xs ${
                r.highlight ? 'bg-arka-pink/10 font-bold text-arka-pink' : 'text-black/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-sm font-black ${r.color}`}>#{r.rank}</span>
                <span>{r.name}</span>
              </div>
              <span className="font-semibold">{r.rep}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section className="space-y-3 px-5 pb-10">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-black/30">Quick Actions</p>
        {[
          { Icon: CommunityIcon, color: 'cyan', title: 'Browse Communities', path: '/demo/communities' },
          { Icon: MeetupIcon, color: 'green', title: 'Upcoming Events', path: '/miniapp/event/mock-eth-budapest' },
          { Icon: TrophyIcon, color: 'purple', title: 'Leaderboard', path: '/demo/communities' },
          { Icon: QrIcon, color: 'orange', title: 'Scan QR Code', path: '/miniapp/event/mock-eth-budapest' },
        ].map(({ Icon, color, title, path }) => (
          <button
            key={title}
            onClick={() => router.push(path)}
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
