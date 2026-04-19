'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { QRCodeSVG } from 'qrcode.react';

const API_URL = 'https://arka-api.claws.page';

export default function MiniAppPage() {
  const [isTelegram, setIsTelegram] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'events' | 'communities' | 'leaderboard'>('home');
  const [showAllUpdates, setShowAllUpdates] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [managedEvents, setManagedEvents] = useState<any[]>([]);
  const [openEventModal, setOpenEventModal] = useState<string | null>(null);
  const [highlightCommunity, setHighlightCommunity] = useState<string | null>(null);
  const router = useRouter();

  // Poll managed events for attendee updates
  useEffect(() => {
    if (managedEvents.length === 0) return;
    const interval = setInterval(async () => {
      const updated = await Promise.all(
        managedEvents.map(async (e: any) => {
          try {
            const res = await fetch(`${API_URL}/events/${e.id}`);
            if (res.ok) {
              const data = await res.json();
              return { ...e, attendees: data.attendees || e.attendees, chatMessages: data.chatMessages || e.chatMessages };
            }
          } catch {}
          return e;
        })
      );
      setManagedEvents(updated);
    }, 3000);
    return () => clearInterval(interval);
  }, [managedEvents.length]);
  const { user, openSignIn, isProHost, isConnected } = useAuth();

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      setIsTelegram(true);
      tg.ready();
      tg.expand();
      tg.setHeaderColor('#ffffff');
      // Handle deep link: startapp=event_EVENT_ID OR ?join=EVENT_ID
      const urlParams = new URLSearchParams(window.location.search);
      const joinParam = urlParams.get('join');
      const startParam = joinParam ? `event_${joinParam}` : (tg.initDataUnsafe as any)?.start_param;
      if (startParam && startParam.startsWith('event_')) {
        const eventId = startParam.replace('event_', '');
        // Auto-join the event
        const tgId = tg.initDataUnsafe?.user?.id?.toString();
        if (tgId) {
          fetch(`${API_URL}/events/${eventId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: tgId }),
          }).catch(() => {});
        }
        // Load the event and add to managed events
        fetch(`${API_URL}/events/${eventId}`)
          .then(r => r.ok ? r.json() : null)
          .then(eventData => {
            if (eventData) {
              setManagedEvents((prev: any[]) => {
                if (prev.find((e: any) => e.id === eventId)) return prev;
                return [eventData, ...prev];
              });
            }
          }).catch(() => {});
        setActiveTab('events');
        setExpandedEvent(eventId);
      }
    } else {
      setIsTelegram(false);
    }
  }, []);

  if (isTelegram === null) return null;

  const tgUser = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user : null;
  const displayName = tgUser?.first_name || user?.username?.replace('@', '') || 'there';

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

  const goToTab = (tab: typeof activeTab, focus?: string) => {
    setActiveTab(tab);
    if (focus && tab === 'events') setExpandedEvent(focus);
  };

  const updates = [
    { emoji: '🎉', title: 'New Event: ETH Budapest Meetup', sub: 'Tomorrow, 18:00 · 23 attending', action: () => goToTab('events', 'eth-budapest-meetup') },
    { emoji: '📈', title: 'Your reputation rose +120 this week', sub: "You're now #3 in ETH Budapest", action: () => goToTab('leaderboard') },
    { emoji: '👥', title: '3 new members joined Arbitrum Builders', sub: 'Community now has 127 members', action: () => { setHighlightCommunity('arb-builders'); setActiveTab('communities'); } },
    { emoji: '🏆', title: 'alex.eth overtook you on the leaderboard', sub: 'Attend more events to reclaim #2!', action: () => goToTab('leaderboard') },
    { emoji: '🎯', title: '+80 rep from DeFi Deep Dive check-in', sub: 'Total reputation: 2,450', action: () => goToTab('events', 'defi-deep-dive') },
    { emoji: '🔔', title: 'Reminder: RSVP to Web3 Nomads', sub: 'Next Wednesday, 19:00', action: () => goToTab('events') },
    { emoji: '✅', title: 'Badge earned: Early Adopter', sub: 'Joined 3+ communities', action: () => goToTab('leaderboard') },
  ];

  const visibleUpdates = showAllUpdates ? updates : updates.slice(0, 3);

  return (
    <main className="flex h-screen w-full flex-col bg-white max-w-md mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-black/5 shrink-0">
        <button onClick={() => setActiveTab('home')}>
          <img src="/arka-logo.png" alt="arka" className="h-12" />
        </button>
        <button
          onClick={() => router.push('/miniapp/profile')}
          className="flex items-center gap-1.5 rounded-full bg-arka-pink/10 px-3 py-1.5"
        >
          <span className="text-sm font-bold text-arka-pink">{isConnected ? displayName : 'Profile'}</span>
          <svg className="h-3 w-3 text-arka-pink" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 relative">
        {activeTab === 'home' && (
          <>
            {!isProHost && (
              <div className="mb-4 rounded-2xl bg-gradient-to-br from-arka-pink to-[#7B61FF] p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold">🌟 Go Pro</h3>
                    <p className="mt-0.5 text-[10px] opacity-90">Create communities & host events</p>
                    <p className="text-[9px] opacity-70">0.001 ETH · one-time</p>
                  </div>
                  <button onClick={() => router.push('/miniapp/profile')} className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-arka-pink">
                    Upgrade
                  </button>
                </div>
              </div>
            )}

            <div className="mb-4">
              <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-black/25">Next Event</p>
              <button
                onClick={() => goToTab('events', 'eth-budapest-meetup')}
                className="w-full rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-black/5 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-arka-text">ETH Budapest Meetup</p>
                    <p className="text-[10px] text-black/40">Tomorrow, 18:00 · 23 attending</p>
                  </div>
                  <span className="rounded-full bg-[#8DC63F]/15 px-2 py-0.5 text-[10px] font-bold text-arka-green">RSVP&apos;d</span>
                </div>
              </button>
            </div>

            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-black/25">Updates</p>
              <div className={`space-y-2 ${showAllUpdates ? 'max-h-[40vh] overflow-y-auto pr-1' : ''}`}>
                {visibleUpdates.map((u, i) => (
                  <button key={i} onClick={u.action} className="w-full rounded-xl bg-gray-50 p-3 text-left ring-1 ring-black/5 active:bg-gray-100">
                    <div className="flex items-start gap-2">
                      <span className="text-sm">{u.emoji}</span>
                      <div>
                        <p className="text-xs font-semibold text-arka-text">{u.title}</p>
                        <p className="text-[10px] text-black/40">{u.sub}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {!showAllUpdates && updates.length > 3 && (
                <button onClick={() => setShowAllUpdates(true)} className="mt-2 w-full text-center text-[10px] font-semibold text-arka-pink">
                  Show more ↓
                </button>
              )}
              {showAllUpdates && (
                <button onClick={() => setShowAllUpdates(false)} className="mt-2 w-full text-center text-[10px] font-semibold text-black/30">
                  Show less ↑
                </button>
              )}
            </div>
          </>
        )}

        {activeTab === 'events' && (
          <EventsTab
            expandedEvent={expandedEvent}
            setExpandedEvent={setExpandedEvent}
            managedEvents={managedEvents}
            setManagedEvents={setManagedEvents}
            openEventModal={openEventModal}
            setOpenEventModal={setOpenEventModal}
            showCreateEvent={showCreateEvent}
            setShowCreateEvent={setShowCreateEvent}
            userId={tgUser?.id?.toString() || user?.address || ''}
            userAddress={user?.address}
            isProHost={isProHost}
          />
        )}
        {activeTab === 'communities' && <CommunitiesTab highlightCommunity={highlightCommunity || undefined} />}
        {activeTab === 'leaderboard' && <LeaderboardTab />}
      </div>

      {/* Bottom nav */}
      <nav className="grid grid-cols-3 gap-3 px-5 py-3 border-t border-black/5 shrink-0 bg-white">
        <button onClick={() => setActiveTab('communities')} className={`rounded-xl p-2.5 text-center transition active:scale-95 ${activeTab === 'communities' ? 'ring-2 ring-arka-pink/30 bg-arka-pink/10' : 'bg-arka-pink/5'}`}>
          <p className="text-2xl font-black text-arka-pink">3</p>
          <p className="text-xs font-bold text-black/40">Communities</p>
        </button>
        <button onClick={() => { setActiveTab('events'); setExpandedEvent(null); }} className={`rounded-xl p-2.5 text-center transition active:scale-95 ${activeTab === 'events' ? 'ring-2 ring-[#00AEEF]/30 bg-[#00AEEF]/10' : 'bg-[#00AEEF]/5'}`}>
          <p className="text-2xl font-black text-arka-cyan">5</p>
          <p className="text-xs font-bold text-black/40">Events</p>
        </button>
        <button onClick={() => setActiveTab('leaderboard')} className={`rounded-xl p-2.5 text-center transition active:scale-95 ${activeTab === 'leaderboard' ? 'ring-2 ring-[#8DC63F]/30 bg-[#8DC63F]/10' : 'bg-[#8DC63F]/5'}`}>
          <p className="text-2xl font-black text-arka-green">#3</p>
          <p className="text-xs font-bold text-black/40">Rank</p>
        </button>
      </nav>
    </main>
  );
}

/* ── Events Tab ── */
function EventsTab({ expandedEvent, setExpandedEvent, managedEvents, setManagedEvents, openEventModal, setOpenEventModal, showCreateEvent, setShowCreateEvent, userId, userAddress, isProHost }: any) {
  const [eventName, setEventName] = useState('');
  const [creating, setCreating] = useState(false);
  const [mingleQREvent, setMingleQREvent] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState<string | null>(null);

  const tgUser = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user : null;
  const displayName = tgUser?.first_name || 'User';

  const pastEvents = [
    { id: 'eth-budapest-meetup', name: 'ETH Budapest Meetup', date: 'Tomorrow, 18:00', attendees: 23, rep: null, upcoming: true, location: 'Brody Studios, Budapest', desc: 'Monthly ETH Budapest community meetup.' },
    { id: 'eth-budapest-demo', name: 'ETH Budapest Demo Day', date: 'Apr 16', attendees: 67, rep: '+100', upcoming: false, location: 'Akvarium Klub', desc: 'Demo your projects.' },
    { id: 'defi-deep-dive', name: 'DeFi Deep Dive', date: 'Apr 10', attendees: 41, rep: '+90', upcoming: false, location: 'Online', desc: 'Deep dive into DeFi.' },
    { id: 'arb-builders', name: 'Arbitrum Builders Call', date: 'Mar 22', attendees: 56, rep: '+120', upcoming: false, location: 'Online', desc: 'Weekly builders call.' },
    { id: 'eth-kickoff', name: 'ETH Budapest Kickoff', date: 'Mar 15', attendees: 34, rep: '+80', upcoming: false, location: 'Brody Studios', desc: 'Season kickoff.' },
  ];

  const handleCreate = async () => {
    if (!eventName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostTgId: userId, hostAddress: userAddress,
          name: eventName, datetime: new Date().toISOString(),
          location: 'Live', ephemeral: !isProHost,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setManagedEvents((prev: any[]) => [{ ...data.event, chatMessages: [], poll: null }, ...prev]);
        setShowCreateEvent(false);
        setEventName('');
      }
    } catch (e) { alert('Failed to create event'); }
    setCreating(false);
  };

  return (
    <div className="space-y-2 pb-16">
      {/* Managed events */}
      {managedEvents.length > 0 && (
        <>
          <p className="text-[9px] font-bold uppercase tracking-wider text-black/25 mb-1">Managed Events</p>
          {managedEvents.map((e: any) => (
            <div key={e.id}>
              <button
                onClick={() => setExpandedEvent(expandedEvent === e.id ? null : e.id)}
                className={`w-full rounded-2xl bg-white p-3.5 text-left shadow-sm ring-1 transition ${expandedEvent === e.id ? 'ring-arka-cyan/30' : 'ring-black/5'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-arka-text">{e.name}</p>
                    <p className="text-[10px] text-black/40">Now · {Object.keys(e.attendees || {}).length} attendees</p>
                  </div>
                  <span className="rounded-full bg-arka-cyan/15 px-2 py-0.5 text-[10px] font-bold text-arka-cyan">Live</span>
                </div>
              </button>
              {expandedEvent === e.id && (
                <div className="mt-1 mb-1 rounded-2xl bg-gray-50 p-4 ring-1 ring-black/5 relative">
                  <button onClick={() => setExpandedEvent(null)} className="absolute top-3 right-3 text-lg text-black/30">✕</button>
                  <p className="text-xs text-black/50">{!isProHost ? '⚡ Ephemeral — data won\'t persist' : 'Persistent event'}</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => setOpenEventModal(e.id)} className="flex-1 rounded-lg bg-arka-pink py-2.5 text-xs font-bold text-white active:scale-95">💬 Chat & Poll</button>
                    <button onClick={() => setMingleQREvent(mingleQREvent === e.id ? null : e.id)} className="flex-1 rounded-lg bg-arka-cyan py-2.5 text-xs font-bold text-white active:scale-95">🤝 Mingle</button>
                  </div>
                  {mingleQREvent === e.id && (
                    <div className="mt-3 flex flex-col items-center rounded-xl bg-white p-4 ring-1 ring-black/5">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-black/25 mb-2">Your Mingle QR</p>
                      <QRCodeSVG value={JSON.stringify({ type: 'arka', action: 'mingle-scan', eventId: e.id, userId, username: displayName, address: userAddress })} size={160} level="M" />
                      <p className="mt-2 text-xs font-semibold text-arka-text">{displayName}</p>
                      <p className="text-[10px] text-black/30">Other attendees scan this to mingle</p>
                      <button onClick={() => { setMingleQREvent(null); setShowScanner(e.id); }} className="mt-3 w-full rounded-lg bg-arka-green py-2.5 text-xs font-bold text-white active:scale-95">📷 Scan someone\'s QR</button>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      const link = `https://t.me/arka_telegram_bot?startapp=event_${e.id}`;
                      if (navigator.share) {
                        navigator.share({ title: e.name, text: `Join ${e.name} on arka!`, url: link });
                      } else {
                        navigator.clipboard.writeText(link);
                        alert('Link copied!');
                      }
                    }}
                    className="mt-2 w-full rounded-lg bg-gray-100 py-2 text-xs font-semibold text-black/50 active:scale-95"
                  >📤 Share invite link</button>
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* Your events */}
      <p className="text-[9px] font-bold uppercase tracking-wider text-black/25 mb-1">{managedEvents.length > 0 ? 'Attended Events' : 'Your Events'}</p>
      {pastEvents.map((e) => (
        <div key={e.id}>
          <button
            onClick={() => setExpandedEvent(expandedEvent === e.id ? null : e.id)}
            className={`w-full rounded-2xl bg-white p-3.5 text-left shadow-sm ring-1 transition ${expandedEvent === e.id ? 'ring-arka-cyan/30' : 'ring-black/5'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-arka-text">{e.name}</p>
                <p className="text-[10px] text-black/40">{e.date} · {e.attendees} attendees</p>
              </div>
              {e.upcoming ? (
                <span className="rounded-full bg-[#8DC63F]/15 px-2 py-0.5 text-[10px] font-bold text-arka-green">Upcoming</span>
              ) : (
                <span className="text-xs font-bold text-arka-green">{e.rep}</span>
              )}
            </div>
          </button>
          {expandedEvent === e.id && (
            <div className="mt-1 mb-1 rounded-2xl bg-gray-50 p-4 ring-1 ring-black/5 relative">
              <button onClick={() => setExpandedEvent(null)} className="absolute top-3 right-3 text-lg text-black/30">✕</button>
              <p className="text-xs text-black/60 pr-6">{e.desc}</p>
              <div className="mt-2 flex items-center gap-3 text-[10px] text-black/40">
                <span>📍 {e.location}</span>
                <span>👥 {e.attendees}</span>
              </div>
              {e.upcoming && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-2">
                    <button className="flex-1 rounded-lg bg-arka-pink py-2.5 text-xs font-bold text-white active:scale-95">✓ Check In</button>
                    <button onClick={() => setMingleQREvent(mingleQREvent === e.id ? null : e.id)} className="flex-1 rounded-lg bg-arka-cyan py-2.5 text-xs font-bold text-white active:scale-95">🤝 Mingle</button>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 rounded-lg bg-gray-100 py-2 text-xs font-semibold text-black/50">💬 Chat</button>
                    <button className="flex-1 rounded-lg bg-gray-100 py-2 text-xs font-semibold text-black/50">📊 Poll</button>
                    <button className="flex-1 rounded-lg bg-gray-100 py-2 text-xs font-semibold text-black/50">📤 Share</button>
                  </div>
                </div>
              )}
              {!e.upcoming && (
                <div className="mt-3 rounded-lg bg-[#8DC63F]/10 p-2">
                  <p className="text-[10px] text-arka-green font-semibold">✓ Attended · {e.rep} rep earned</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      <p className="text-center text-[10px] text-black/30 pt-1">Total: <span className="font-bold text-arka-green">+490 rep</span> from 5 events</p>

      {/* FAB */}
      <button
        onClick={() => setShowCreateEvent(true)}
        className="fixed bottom-24 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-arka-pink text-white text-3xl shadow-lg active:scale-90 z-30"
      >
        +
      </button>

      {/* Create event modal */}
      {showCreateEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCreateEvent(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="mx-5 w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-arka-text">Create Event</h3>
              <button onClick={() => setShowCreateEvent(false)} className="text-xl text-black/30">✕</button>
            </div>
            {!isProHost && (
              <p className="text-[10px] text-amber-600 bg-amber-50 rounded-lg p-2 mb-3">⚡ As a free user, event data won&apos;t persist after it ends</p>
            )}
            <input
              type="text" value={eventName} onChange={e => setEventName(e.target.value)}
              placeholder="Event name" autoFocus
              className="w-full rounded-xl border border-black/10 px-4 py-3 text-base focus:border-arka-pink focus:outline-none"
            />
            <button
              onClick={handleCreate} disabled={creating || !eventName.trim()}
              className="mt-3 w-full rounded-xl bg-arka-pink py-3 text-sm font-bold text-white disabled:opacity-50 active:scale-95"
            >
              {creating ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </div>
      )}

      {/* Scanner modal */}
      {showScanner && (
        <ScannerModal
          eventId={showScanner}
          userId={userId}
          onClose={() => setShowScanner(null)}
          onSuccess={(data: any) => {
            setShowScanner(null);
            alert(`✅ Mingle match with ${data.partnerName || 'attendee'}! Both reputations bumped.`);
          }}
        />
      )}

      {/* Event modal (chat + poll) */}
      {openEventModal && <EventModal eventId={openEventModal} onClose={() => setOpenEventModal(null)} userId={userId} />}
    </div>
  );
}

/* ── Event Modal (Chat + Poll) ── */
function EventModal({ eventId, onClose, userId }: { eventId: string; onClose: () => void; userId: string }) {
  const [tab, setTab] = useState<'chat' | 'poll'>('chat');
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [pollQ, setPollQ] = useState('');
  const [pollOpts, setPollOpts] = useState(['', '']);
  const [poll, setPoll] = useState<any>(null);
  const [voted, setVoted] = useState(false);

  const sendMsg = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { user: userId.slice(0, 8), text: input, ts: Date.now() }]);
    // Also send to API
    fetch(`${API_URL}/events/${eventId}/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, text: input }),
    }).catch(() => {});
    setInput('');
  };

  const createPoll = () => {
    if (!pollQ.trim() || pollOpts.filter(o => o.trim()).length < 2) return;
    const p = { question: pollQ, options: pollOpts.filter(o => o.trim()).map(o => ({ text: o, votes: 0 })) };
    setPoll(p);
    fetch(`${API_URL}/events/${eventId}/poll`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, question: pollQ, options: pollOpts.filter(o => o.trim()) }),
    }).catch(() => {});
  };

  const vote = (i: number) => {
    if (voted || !poll) return;
    const updated = { ...poll, options: poll.options.map((o: any, j: number) => j === i ? { ...o, votes: o.votes + 1 } : o) };
    setPoll(updated);
    setVoted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white max-w-md mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-black/5 shrink-0">
        <div className="flex gap-3">
          <button onClick={() => setTab('chat')} className={`text-sm font-bold ${tab === 'chat' ? 'text-arka-pink' : 'text-black/30'}`}>💬 Chat</button>
          <button onClick={() => setTab('poll')} className={`text-sm font-bold ${tab === 'poll' ? 'text-arka-pink' : 'text-black/30'}`}>📊 Poll</button>
        </div>
        <button onClick={onClose} className="text-xl text-black/30">✕</button>
      </header>

      {tab === 'chat' && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.length === 0 && <p className="text-center text-xs text-black/30 mt-8">No messages yet. Say hi!</p>}
            {messages.map((m, i) => (
              <div key={i} className="rounded-xl bg-gray-50 px-3 py-2">
                <p className="text-[10px] font-bold text-arka-pink">{m.user}</p>
                <p className="text-xs text-arka-text">{m.text}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 px-4 py-3 border-t border-black/5 shrink-0">
            <input
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMsg()}
              placeholder="Message..." className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm focus:border-arka-pink focus:outline-none"
            />
            <button onClick={sendMsg} className="rounded-xl bg-arka-pink px-4 py-2 text-sm font-bold text-white active:scale-95">Send</button>
          </div>
        </>
      )}

      {tab === 'poll' && (
        <div className="flex-1 overflow-y-auto p-4">
          {!poll ? (
            <div className="space-y-3">
              <p className="text-xs font-bold text-arka-text">Create a Poll</p>
              <input value={pollQ} onChange={e => setPollQ(e.target.value)} placeholder="Question"
                className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:border-arka-pink focus:outline-none" />
              {pollOpts.map((o, i) => (
                <input key={i} value={o} onChange={e => { const n = [...pollOpts]; n[i] = e.target.value; setPollOpts(n); }}
                  placeholder={`Option ${i + 1}`}
                  className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:border-arka-pink focus:outline-none" />
              ))}
              <button onClick={() => setPollOpts(p => [...p, ''])} className="text-xs text-arka-pink font-semibold">+ Add option</button>
              <button onClick={createPoll} disabled={!pollQ.trim()} className="w-full rounded-xl bg-arka-pink py-3 text-sm font-bold text-white disabled:opacity-50">
                Create Poll
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm font-bold text-arka-text mb-3">{poll.question}</p>
              <div className="space-y-2">
                {poll.options.map((o: any, i: number) => {
                  const total = poll.options.reduce((s: number, x: any) => s + x.votes, 0);
                  const pct = total > 0 ? Math.round((o.votes / total) * 100) : 0;
                  return (
                    <button key={i} onClick={() => vote(i)} disabled={voted}
                      className={`w-full rounded-xl p-3 text-left ring-1 transition ${voted ? 'ring-black/5' : 'ring-arka-pink/20 active:bg-arka-pink/5'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-arka-text">{o.text}</span>
                        <span className="text-xs font-bold text-arka-pink">{pct}%</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full bg-arka-pink transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>
              {voted && <p className="mt-3 text-center text-[10px] text-black/30">✓ Vote recorded</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Communities Tab ── */
/* ── Scanner Modal ── */
function ScannerModal({ eventId, userId, onClose, onSuccess }: { eventId: string; userId: string; onClose: () => void; onSuccess: (data: any) => void }) {
  const videoRef = useState<HTMLVideoElement | null>(null);
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        const video = document.getElementById('qr-scanner-video') as HTMLVideoElement;
        if (video) {
          video.srcObject = stream;
          video.play();
        }
        // Scan using canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const scan = () => {
          if (!scanning || !video || video.readyState !== 4) { requestAnimationFrame(scan); return; }
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx?.drawImage(video, 0, 0);
          // Use BarcodeDetector if available
          if ('BarcodeDetector' in window) {
            const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
            detector.detect(canvas).then((barcodes: any[]) => {
              if (barcodes.length > 0) {
                handleScan(barcodes[0].rawValue);
              } else {
                requestAnimationFrame(scan);
              }
            }).catch(() => requestAnimationFrame(scan));
          } else {
            requestAnimationFrame(scan);
          }
        };
        requestAnimationFrame(scan);
      } catch (e) {
        console.error('Camera error:', e);
      }
    };
    startCamera();
    return () => { stream?.getTracks().forEach(t => t.stop()); };
  }, [scanning]);

  const handleScan = async (raw: string) => {
    if (!scanning) return;
    setScanning(false);
    try {
      const data = JSON.parse(raw);
      if (data.type === 'arka' && data.action === 'mingle-scan') {
        // Call API to record mingle
        const res = await fetch(`${API_URL}/events/${data.eventId || eventId}/mingle/quick`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, partnerId: data.userId }),
        });
        const result = await res.json();
        onSuccess({ partnerName: data.username, ...result });
      } else {
        setResult('Invalid QR code');
        setTimeout(() => { setScanning(true); setResult(null); }, 2000);
      }
    } catch {
      setResult('Could not read QR');
      setTimeout(() => { setScanning(true); setResult(null); }, 2000);
    }
  };

  // Manual input fallback
  const [manualCode, setManualCode] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black max-w-md mx-auto">
      <header className="flex items-center justify-between px-5 py-3 shrink-0">
        <p className="text-sm font-bold text-white">Scan Mingle QR</p>
        <button onClick={onClose} className="text-2xl text-white/50">✕</button>
      </header>
      <div className="flex-1 relative">
        <video id="qr-scanner-video" className="w-full h-full object-cover" playsInline muted />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-48 w-48 rounded-2xl border-2 border-white/50" />
        </div>
        {result && (
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-sm font-bold text-white bg-red-500/80 mx-auto px-4 py-2 rounded-full inline-block">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CommunitiesTab({ highlightCommunity }: { highlightCommunity?: string }) {
  const [expanded, setExpanded] = useState<string | null>(highlightCommunity || null);
  const communities = [
    { id: 'eth-budapest', name: 'ETH Budapest', members: 48, events: 12, fee: '2 USDC/mo', role: 'Member', desc: 'Budapest\'s premier Ethereum community. Monthly meetups, hackathons, and builder sessions.' },
    { id: 'arb-builders', name: 'Arbitrum Builders', members: 127, events: 34, fee: '5 USDC/mo', role: 'Member', desc: 'For builders on Arbitrum. Weekly calls, code reviews, and ecosystem updates.' },
    { id: 'web3-nomads', name: 'Web3 Nomads', members: 89, events: 8, fee: null, role: 'Member', desc: 'Digital nomads building in web3. Meetups across Europe, coworking sessions.' },
  ];
  return (
    <div className="space-y-3">
      <p className="text-[9px] font-bold uppercase tracking-wider text-black/25">Your Communities</p>
      {communities.map((c) => (
        <div key={c.id}>
          <button
            onClick={() => setExpanded(expanded === c.id ? null : c.id)}
            className={`w-full rounded-2xl bg-white p-4 text-left shadow-sm ring-1 transition ${expanded === c.id ? 'ring-arka-pink/30' : 'ring-black/5'}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-arka-text">{c.name}</h3>
              {c.fee ? (
                <span className="rounded-full bg-[#00AEEF]/10 px-2 py-0.5 text-[10px] font-semibold text-arka-cyan">{c.fee}</span>
              ) : (
                <span className="rounded-full bg-[#8DC63F]/10 px-2 py-0.5 text-[10px] font-semibold text-arka-green">Free</span>
              )}
            </div>
            <p className="mt-1 text-[10px] text-black/40">{c.members} members · {c.events} events · {c.role}</p>
          </button>
          {expanded === c.id && (
            <div className="mt-1 rounded-2xl bg-gray-50 p-4 ring-1 ring-black/5 relative">
              <button onClick={() => setExpanded(null)} className="absolute top-3 right-3 text-lg text-black/30">✕</button>
              <p className="text-xs text-black/60 pr-6">{c.desc}</p>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 rounded-lg bg-arka-pink py-2 text-xs font-bold text-white active:scale-95">View Events</button>
                <button className="flex-1 rounded-lg bg-gray-100 py-2 text-xs font-semibold text-black/50">Leaderboard</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Leaderboard Tab ── */
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
      <p className="text-[9px] font-bold uppercase tracking-wider text-black/25">Global Leaderboard</p>
      {leaderboard.map((r) => (
        <div key={r.rank} className={`flex items-center justify-between rounded-xl px-4 py-2.5 ${r.highlight ? 'bg-arka-pink/10 ring-1 ring-arka-pink/20' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-3">
            <span className={`text-base font-black ${r.rank === 1 ? 'text-yellow-500' : r.rank === 2 ? 'text-gray-400' : r.rank === 3 ? 'text-amber-600' : 'text-black/20'}`}>#{r.rank}</span>
            <span className={`text-sm font-semibold ${r.highlight ? 'text-arka-pink' : 'text-arka-text'}`}>{r.medal} {r.name}</span>
          </div>
          <span className={`text-sm font-bold ${r.highlight ? 'text-arka-pink' : 'text-arka-green'}`}>{r.rep}</span>
        </div>
      ))}
    </div>
  );
}
