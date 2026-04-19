'use client';

import { useEffect, useRef, useState } from 'react';
import ArkaLogo from '@/components/ArkaLogo';
import { useAuth } from '@/lib/auth-context';
import { communities, meetups, memberships, currentUserId, formatDate } from '@/lib/mock-data';
import { CommunityIcon, MeetupIcon, TrophyIcon, QrIcon } from '@/components/Icons';

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user, isConnected, openSignIn, signOut } = useAuth();
  const [showTelegramPrompt, setShowTelegramPrompt] = useState<string | null>(null);

  // If signed in, show dashboard
  if (isConnected && user) {
    return (
      <WebDashboard
        user={user}
        signOut={signOut}
        onEventClick={(name) => setShowTelegramPrompt(name)}
        telegramPrompt={showTelegramPrompt}
        onClosePrompt={() => setShowTelegramPrompt(null)}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-screen w-full snap-y snap-mandatory overflow-y-auto"
      style={{ scrollBehavior: 'smooth' }}
    >
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-4 lg:px-12 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <ArkaLogo size={28} />
          <span className="text-base font-bold text-arka-text lg:hidden">arka</span>
        </div>
        <button
          onClick={openSignIn}
          className="rounded-full bg-arka-pink px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-arka-pink/90"
        >
          Sign In
        </button>
      </header>

      {/* Section 1 — Hero + Phone Mockup */}
      <section className="relative flex h-screen w-full snap-start flex-col items-center justify-center overflow-hidden px-5">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <div className="w-full max-w-md lg:max-w-lg">
            <h1 className="text-4xl font-bold leading-tight text-arka-text sm:text-5xl lg:text-6xl">
              Real connections,<br />
              <span className="text-arka-pink">Real events.</span>
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-black/55">
              Arka brings communities together through engaging events and reputation.
            </p>
            <p className="mt-2 text-lg font-medium text-arka-text">
              Join for free.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={openSignIn}
                className="inline-flex items-center gap-2 rounded-full bg-arka-pink px-6 py-3 text-sm font-semibold text-white transition hover:bg-arka-pink/90"
              >
                Get Started
              </button>
              <a
                href="https://t.me/arka_telegram_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#2AABEE] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#229ED9]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.53 8.15l-1.8 8.5c-.13.6-.5.75-.99.47l-2.76-2.04-1.33 1.28c-.15.15-.27.27-.56.27l.2-2.8 5.1-4.6c.22-.2-.05-.3-.34-.13l-6.3 3.97-2.72-.85c-.59-.18-.6-.59.12-.87l10.63-4.1c.5-.18.93.12.77.87z"/></svg>
                Open in Telegram
              </a>
            </div>
          </div>

          <div className="mt-8 lg:mt-0 lg:flex-shrink-0">
            <PhoneMockup>
              <div className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <ArkaLogo size={20} />
                  <span className="text-sm font-bold text-arka-text">arka</span>
                </div>
                <div className="rounded-xl bg-arka-pink/10 p-3">
                  <p className="text-xs font-semibold text-arka-pink">Next Event</p>
                  <p className="mt-1 text-sm font-bold text-arka-text">ETH Budapest Meetup</p>
                  <p className="text-xs text-black/50">Tomorrow, 18:00 · 23 attending</p>
                </div>
                <div className="rounded-xl bg-arka-card p-3">
                  <p className="text-xs font-semibold text-black/40">Your Match</p>
                  <p className="mt-1 text-center text-3xl font-black text-arka-pink">#7</p>
                  <p className="text-center text-xs text-black/40">Find your partner!</p>
                </div>
                <div className="rounded-xl bg-arka-card p-3">
                  <p className="text-xs font-semibold text-black/40">Reputation</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-bold">2,450 rep</span>
                    <span className="rounded-full bg-arka-green/15 px-2 py-0.5 text-xs font-semibold text-arka-green">#3</span>
                  </div>
                </div>
              </div>
            </PhoneMockup>
          </div>
        </div>

        <div className="absolute bottom-8 flex animate-bounce flex-col items-center text-black/20">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 14l-7 7m0 0l-7-7"/></svg>
        </div>
      </section>

      {/* Section 2 — Leaderboard + Events */}
      <section className="flex h-screen w-full snap-start flex-col items-center justify-center px-5">
        <div className="mx-auto w-full max-w-md space-y-6">
          <h2 className="text-3xl font-bold text-arka-text">
            Show up.<br />
            <span className="text-arka-cyan">Get recognized.</span>
          </h2>
          <p className="text-base text-black/55">
            Every event builds your on-chain reputation. Rise on the leaderboard. Earn badges.
          </p>
          <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-black/30">Leaderboard</p>
            {[
              { rank: 1, name: 'alex.eth', rep: 3200, color: 'text-yellow-500' },
              { rank: 2, name: 'sarah.arb', rep: 2800, color: 'text-gray-400' },
              { rank: 3, name: 'You', rep: 2450, color: 'text-amber-600', highlight: true },
              { rank: 4, name: 'danny.dev', rep: 1900, color: 'text-black/30' },
              { rank: 5, name: 'kate.web3', rep: 1650, color: 'text-black/30' },
            ].map((r) => (
              <div
                key={r.rank}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm ${
                  r.highlight ? 'bg-arka-pink/10 font-bold text-arka-pink' : 'text-black/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-black ${r.color}`}>#{r.rank}</span>
                  <span>{r.name}</span>
                </div>
                <span className="font-semibold">{r.rep}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-black/30">Upcoming</p>
            {[
              { name: 'Web3 Workshop', time: 'Mon, 18:00', count: 12 },
              { name: 'DeFi Deep Dive', time: 'Wed, 19:30', count: 8 },
            ].map((e) => (
              <div key={e.name} className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5">
                <div>
                  <p className="text-sm font-semibold">{e.name}</p>
                  <p className="text-xs text-black/40">{e.time}</p>
                </div>
                <span className="rounded-full bg-arka-green/10 px-2 py-1 text-xs font-semibold text-arka-green">{e.count} going</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3 — Pricing */}
      <section className="flex h-screen w-full snap-start flex-col items-center justify-center px-5">
        <div className="mx-auto w-full max-w-md">
          <h2 className="mb-2 text-3xl font-bold text-arka-text">Simple pricing.</h2>
          <p className="mb-8 text-base text-black/55">Free forever for users. Pro for community hosts.</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-black/5">
              <p className="text-xs font-bold uppercase tracking-wider text-black/30">User</p>
              <p className="mt-2 text-2xl font-black text-arka-text">Free</p>
              <p className="text-xs text-black/40">forever</p>
              <div className="mt-4 space-y-2 text-xs text-black/55">
                <p>· Browse communities</p>
                <p>· Attend events</p>
                <p>· Create meetings</p>
                <p>· QR matching</p>
                <p>· Earn reputation</p>
                <p>· Leaderboard</p>
              </div>
            </div>
            <div className="rounded-2xl bg-arka-pink p-5 text-white shadow-lg">
              <p className="text-xs font-bold uppercase tracking-wider text-white/60">Pro Host</p>
              <p className="mt-2 text-2xl font-black">$15</p>
              <p className="text-xs text-white/60">/month</p>
              <div className="mt-4 space-y-2 text-xs text-white/80">
                <p>· Create communities</p>
                <p>· Charge memberships</p>
                <p>· Meeting rooms</p>
                <p>· Coffee tabs</p>
                <p>· Content vault</p>
                <p>· Arweave backup</p>
                <p>· Calendar + RSVPs</p>
                <p>· Analytics</p>
              </div>
            </div>
          </div>
          <button
            onClick={openSignIn}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-arka-pink py-4 text-base font-bold text-white transition hover:bg-arka-pink/90"
          >
            Get Started
          </button>
          <p className="mt-3 text-center text-xs text-black/30">
            Built on Arbitrum · Powered by Dynamic
          </p>
        </div>
      </section>
    </div>
  );
}

// --- Web Dashboard (shown after sign-in) ---
function WebDashboard({
  user,
  signOut,
  onEventClick,
  telegramPrompt,
  onClosePrompt,
}: {
  user: NonNullable<ReturnType<typeof useAuth>['user']>;
  signOut: () => void;
  onEventClick: (name: string) => void;
  telegramPrompt: string | null;
  onClosePrompt: () => void;
}) {
  const joinedCommunities = communities.filter((c) =>
    memberships.some((m) => m.userId === currentUserId && m.communityId === c.id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-white/90 px-5 py-4 shadow-sm backdrop-blur-sm lg:px-12">
        <div className="flex items-center gap-2">
          <ArkaLogo size={28} />
          <span className="text-base font-bold text-arka-text lg:hidden">arka</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-black/40">{user.username}</span>
          <button
            onClick={signOut}
            className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black/50 transition hover:bg-black/5"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-8">
        {/* Welcome */}
        <h1 className="text-2xl font-bold text-arka-text">
          Welcome back, {user.username.replace('@', '')} 👋
        </h1>
        <p className="mt-1 text-sm text-black/40">
          {user.address ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}` : ''}
        </p>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-black/5">
            <p className="text-2xl font-black text-arka-pink">{joinedCommunities.length}</p>
            <p className="text-[11px] text-black/40">Communities</p>
          </div>
          <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-black/5">
            <p className="text-2xl font-black text-arka-cyan">{meetups.length}</p>
            <p className="text-[11px] text-black/40">Events</p>
          </div>
          <div className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-black/5">
            <p className="text-2xl font-black text-arka-green">2,450</p>
            <p className="text-[11px] text-black/40">Reputation</p>
          </div>
        </div>

        {/* Communities */}
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-black/30">Your Communities</h2>
          <div className="space-y-3">
            {(joinedCommunities.length > 0 ? joinedCommunities : communities.slice(0, 3)).map((c) => (
              <div key={c.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-arka-text">{c.name}</p>
                    <p className="text-xs text-black/40">{c.members} members</p>
                  </div>
                  <span className="rounded-full bg-arka-cyan/10 px-2 py-0.5 text-xs font-semibold text-arka-cyan">
                    Joined
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Events */}
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-black/30">Upcoming Events</h2>
          <div className="space-y-3">
            {meetups.map((m) => (
              <button
                key={m.id}
                onClick={() => onEventClick(m.name)}
                className="w-full rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-black/5 transition hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-arka-text">{m.name}</p>
                    <p className="text-xs text-black/40">
                      {formatDate(m.datetime)} · {m.attendeeIds?.length || 0} attending
                    </p>
                  </div>
                  <svg className="h-4 w-4 text-black/20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Telegram CTA */}
        <section className="mt-8 rounded-2xl bg-[#2AABEE]/10 p-5 text-center">
          <p className="text-sm font-semibold text-[#2AABEE]">📱 Get the full experience</p>
          <p className="mt-1 text-xs text-black/40">QR matching, check-ins, and notifications work best in the Telegram mini app.</p>
          <a
            href="https://t.me/arka_telegram_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#2AABEE] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#229ED9]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.53 8.15l-1.8 8.5c-.13.6-.5.75-.99.47l-2.76-2.04-1.33 1.28c-.15.15-.27.27-.56.27l.2-2.8 5.1-4.6c.22-.2-.05-.3-.34-.13l-6.3 3.97-2.72-.85c-.59-.18-.6-.59.12-.87l10.63-4.1c.5-.18.93.12.77.87z"/></svg>
            Open in Telegram
          </a>
        </section>
      </main>

      {/* Telegram prompt modal */}
      {telegramPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClosePrompt}>
          <div className="mx-5 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-arka-text">Open in Telegram</h3>
            <p className="mt-2 text-sm text-black/50">
              <strong>{telegramPrompt}</strong> — RSVP, QR matching, and check-ins are available in the Telegram mini app.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <a
                href="https://t.me/arka_telegram_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#2AABEE] py-3 text-sm font-bold text-white transition hover:bg-[#229ED9]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.53 8.15l-1.8 8.5c-.13.6-.5.75-.99.47l-2.76-2.04-1.33 1.28c-.15.15-.27.27-.56.27l.2-2.8 5.1-4.6c.22-.2-.05-.3-.34-.13l-6.3 3.97-2.72-.85c-.59-.18-.6-.59.12-.87l10.63-4.1c.5-.18.93.12.77.87z"/></svg>
                Open in Telegram
              </a>
              <button
                onClick={onClosePrompt}
                className="rounded-xl py-3 text-sm font-medium text-black/40 transition hover:bg-black/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PhoneMockup({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transform = 'translateX(0)';
          el.style.opacity = '1';
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{ transform: 'translateX(60px)', opacity: 0 }}
    >
      <div className="mx-auto w-[220px] rounded-[28px] border-[6px] border-black/80 bg-white shadow-2xl lg:w-[280px]">
        <div className="mx-auto mt-1 h-[14px] w-[60px] rounded-full bg-black/80" />
        <div className="h-[380px] overflow-hidden rounded-b-[22px] lg:h-[480px]">
          {children}
        </div>
      </div>
    </div>
  );
}
