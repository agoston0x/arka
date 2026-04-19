'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import ArkaLogo from '@/components/ArkaLogo';

const API_URL = 'https://arka-api.claws.page';

export default function MiniAppPage() {
  const [isTelegram, setIsTelegram] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'events' | 'communities' | 'leaderboard'>('home');
  const [showAllUpdates, setShowAllUpdates] = useState(false);
  const router = useRouter();
  const { user, openSignIn, isProHost, isConnected } = useAuth();

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      setIsTelegram(true);
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#ffffff');
    } else {
      setIsTelegram(false);
    }
  }, []);

  if (isTelegram === null) return null;

  const tgUser = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user : null;
  const displayName = tgUser?.first_name || user?.username?.replace('@', '') || 'there';

  // Not signed in
  if (!isConnected && !tgUser) {
    return (
      <main className="flex h-screen w-full flex-col items-center justify-center bg-white px-8">
        <img src="/arka-logo.png" alt="arka" className="h-20" />
        <h1 className="mt-6 text-2xl font-bold text-arka-text">Welcome to arka</h1>
        <p className="mt-2 text-center text-sm text-black/50">Real connections, real events.</p>
        <button onClick={openSignIn} className="mt-8 w-full max-w-xs rounded-xl bg-arka-pink py-3 text-sm font-bold text-white">
          Sign In with Email
        </button>
      </main>
    );
  }

  const updates = [
    { emoji: '🎉', title: 'New Event: ETH Budapest Meetup', sub: 'Tomorrow, 18:00 · 23 attending', bg: 'bg-arka-pink/5', ring: 'ring-arka-pink/10' },
    { emoji: '📈', title: 'Your reputation rose +120 this week', sub: "You're now #3 in ETH Budapest", bg: 'bg-[#8DC63F]/5', ring: 'ring-[#8DC63F]/10' },
    { emoji: '👥', title: '3 new members joined Arbitrum Builders', sub: 'Community now has 127 members', bg: 'bg-[#00AEEF]/5', ring: 'ring-[#00AEEF]/10' },
    { emoji: '🏆', title: 'alex.eth overtook you on the leaderboard', sub: 'Attend more events to reclaim #2!', bg: 'bg-amber-50', ring: 'ring-amber-200/30' },
    { emoji: '🎯', title: '+80 rep from DeFi Deep Dive check-in', sub: 'Total reputation: 2,450', bg: 'bg-[#8DC63F]/5', ring: 'ring-[#8DC63F]/10' },
  ];

  const visibleUpdates = showAllUpdates ? updates : updates.slice(0, 3);

  return (
    <main className="flex h-screen w-full flex-col bg-white max-w-md mx-auto">
      {/* Header — fixed */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-black/5 shrink-0">
        <img src="/arka-logo.png" alt="arka" className="h-12" />
        <button
          onClick={() => router.push('/miniapp/profile')}
          className="flex items-center gap-1.5 rounded-full bg-arka-pink/10 px-3 py-1.5"
        >
          <span className="text-sm font-bold text-arka-pink">{displayName}</span>
          <svg className="h-3 w-3 text-arka-pink" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </header>

      {/* Content — scrollable middle */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {activeTab === 'home' && (
          <>
            {/* Go Pro */}
            {!isProHost && (
              <div className="mb-5 rounded-2xl bg-gradient-to-br from-arka-pink to-[#7B61FF] p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold">🌟 Go Pro</h3>
                    <p className="mt-1 text-xs opacity-90">Create communities & host events</p>
                    <p className="mt-1 text-[10px] opacity-70">0.001 ETH · one-time</p>
                  </div>
                  <button
                    onClick={() => router.push('/miniapp/profile')}
                    className="rounded-full bg-white px-4 py-2 text-xs font-bold text-arka-pink"
                  >
                    Upgrade
                  </button>
                </div>
              </div>
            )}

            {/* Next Event */}
            <div className="mb-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-black/30">Next Event</p>
              <button
                onClick={() => router.push('/miniapp/event/mock-eth-budapest')}
                className="w-full rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-black/5 transition active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-arka-text">ETH Budapest Meetup</p>
                    <p className="mt-0.5 text-xs text-black/40">Tomorrow, 18:00 · 23 attending</p>
                  </div>
                  <span className="rounded-full bg-arka-green/15 px-2 py-0.5 text-[10px] font-bold text-arka-green">RSVP&apos;d</span>
                </div>
              </button>
            </div>

            {/* Updates */}
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-black/30">Updates</p>
              <div className="space-y-2">
                {visibleUpdates.map((u, i) => (
                  <div key={i} className={`rounded-xl ${u.bg} p-3 ring-1 ${u.ring}`}>
                    <div className="flex items-start gap-2">
                      <span className="text-sm">{u.emoji}</span>
                      <div>
                        <p className="text-xs font-semibold text-arka-text">{u.title}</p>
                        <p className="text-[10px] text-black/40">{u.sub}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {!showAllUpdates && updates.length > 3 && (
                <button
                  onClick={() => setShowAllUpdates(true)}
                  className="mt-2 w-full text-center text-[10px] font-semibold text-arka-pink"
                >
                  Show more ↓
                </button>
              )}
              {showAllUpdates && (
                <button
                  onClick={() => setShowAllUpdates(false)}
                  className="mt-2 w-full text-center text-[10px] font-semibold text-black/30"
                >
                  Show less ↑
                </button>
              )}
            </div>
          </>
        )}

        {activeTab === 'events' && <EventsTab />}
        {activeTab === 'communities' && <CommunitiesTab />}
        {activeTab === 'leaderboard' && <LeaderboardTab />}
      </div>

      {/* Bottom nav — fixed */}
      <nav className="grid grid-cols-3 gap-3 px-5 py-3 border-t border-black/5 shrink-0 bg-white">
        <button
          onClick={() => setActiveTab('communities')}
          className={`rounded-xl p-3 text-center transition active:scale-95 ${activeTab === 'communities' ? 'ring-2 ring-arka-pink/30 bg-arka-pink/10' : 'bg-arka-pink/5'}`}
        >
          <p className="text-xl font-black text-arka-pink">2</p>
          <p className="text-[9px] text-black/40">Communities →</p>
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`rounded-xl p-3 text-center transition active:scale-95 ${activeTab === 'events' ? 'ring-2 ring-[#00AEEF]/30 bg-[#00AEEF]/10' : 'bg-[#00AEEF]/5'}`}
        >
          <p className="text-xl font-black text-arka-cyan">5</p>
          <p className="text-[9px] text-black/40">Events →</p>
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`rounded-xl p-3 text-center transition active:scale-95 ${activeTab === 'leaderboard' ? 'ring-2 ring-[#8DC63F]/30 bg-[#8DC63F]/10' : 'bg-[#8DC63F]/5'}`}
        >
          <p className="text-xl font-black text-arka-green">#3</p>
          <p className="text-[9px] text-black/40">Rank →</p>
        </button>
      </nav>
    </main>
  );
}

/* ── Tab Components ── */

function EventsTab() {
  const router = useRouter();
  const events = [
    { name: 'ETH Budapest Meetup', date: 'Tomorrow, 18:00', attendees: 23, rep: '+100', upcoming: true },
    { name: 'ETH Budapest Demo Day', date: 'Apr 16', attendees: 67, rep: '+100', upcoming: false },
    { name: 'DeFi Deep Dive', date: 'Apr 10', attendees: 41, rep: '+90', upcoming: false },
    { name: 'Arbitrum Builders Call', date: 'Mar 22', attendees: 56, rep: '+120', upcoming: false },
    { name: 'ETH Budapest Kickoff', date: 'Mar 15', attendees: 34, rep: '+80', upcoming: false },
  ];
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-black/30">Your Events</p>
      {events.map((e) => (
        <button
          key={e.name}
          onClick={() => e.upcoming ? router.push('/miniapp/event/mock-eth-budapest') : null}
          className="w-full rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-black/5 transition active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-arka-text">{e.name}</p>
              <p className="text-[10px] text-black/40">{e.date} · {e.attendees} attendees</p>
            </div>
            {e.upcoming ? (
              <span className="rounded-full bg-arka-green/15 px-2 py-0.5 text-[10px] font-bold text-arka-green">Upcoming</span>
            ) : (
              <span className="text-xs font-bold text-arka-green">{e.rep}</span>
            )}
          </div>
        </button>
      ))}
      <p className="text-center text-[10px] text-black/30">Total: <span className="font-bold text-arka-green">+490 rep</span> from 5 events</p>
    </div>
  );
}

function CommunitiesTab() {
  const communities = [
    { name: 'ETH Budapest', members: 48, events: 12, fee: '2 USDC/mo', role: 'Member' },
    { name: 'Arbitrum Builders', members: 127, events: 34, fee: '5 USDC/mo', role: 'Member' },
    { name: 'Web3 Nomads', members: 89, events: 8, fee: null, role: 'Member' },
  ];
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-black/30">Your Communities</p>
      {communities.map((c) => (
        <div key={c.name} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-arka-text">{c.name}</h3>
            {c.fee ? (
              <span className="rounded-full bg-[#00AEEF]/10 px-2 py-0.5 text-[10px] font-semibold text-arka-cyan">{c.fee}</span>
            ) : (
              <span className="rounded-full bg-[#8DC63F]/10 px-2 py-0.5 text-[10px] font-semibold text-arka-green">Free</span>
            )}
          </div>
          <p className="mt-1 text-[10px] text-black/40">{c.members} members · {c.events} events · {c.role}</p>
        </div>
      ))}
    </div>
  );
}

function LeaderboardTab() {
  const leaderboard = [
    { rank: 1, name: 'alex.eth', rep: 3200, medal: '🥇' },
    { rank: 2, name: 'sarah.arb', rep: 2800, medal: '🥈' },
    { rank: 3, name: 'You', rep: 2450, medal: '🥉', highlight: true },
    { rank: 4, name: 'danny.dev', rep: 2100, medal: '' },
    { rank: 5, name: 'maria.eth', rep: 1950, medal: '' },
    { rank: 6, name: 'jake.base', rep: 1800, medal: '' },
    { rank: 7, name: 'nina.arb', rep: 1650, medal: '' },
    { rank: 8, name: 'tom.eth', rep: 1400, medal: '' },
  ];
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-black/30">Global Leaderboard</p>
      {leaderboard.map((r) => (
        <div
          key={r.rank}
          className={`flex items-center justify-between rounded-xl px-4 py-3 ${
            r.highlight ? 'bg-arka-pink/10 ring-1 ring-arka-pink/20' : 'bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className={`text-base font-black ${r.rank === 1 ? 'text-yellow-500' : r.rank === 2 ? 'text-gray-400' : r.rank === 3 ? 'text-amber-600' : 'text-black/20'}`}>
              #{r.rank}
            </span>
            <span className={`text-sm font-semibold ${r.highlight ? 'text-arka-pink' : 'text-arka-text'}`}>
              {r.medal} {r.name}
            </span>
          </div>
          <span className={`text-sm font-bold ${r.highlight ? 'text-arka-pink' : 'text-arka-green'}`}>{r.rep}</span>
        </div>
      ))}
    </div>
  );
}
