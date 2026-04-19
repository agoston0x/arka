'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ArkaLogo, { ArkaMiniLogo } from '@/components/ArkaLogo';
import { SectionCard } from '@/components/SectionCard';
import { BackButton } from '@/components/BackButton';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ToastProvider';
import { RankBadge } from '@/components/Icons';

const mockMembers = [
  { id: 'm1', username: '@ethberlin_sarah', rep: 2400, joinedAt: '2024-06-12' },
  { id: 'm2', username: '@web3_marcus', rep: 1650, joinedAt: '2024-07-01' },
  { id: 'm3', username: '@defi_diana', rep: 2800, joinedAt: '2024-05-20' },
  { id: 'm4', username: '@nft_nikolai', rep: 780, joinedAt: '2024-08-15' },
  { id: 'm5', username: '@sol_olivia', rep: 1100, joinedAt: '2024-09-03' },
  { id: 'm6', username: '@dao_jamal', rep: 560, joinedAt: '2024-10-11' },
  { id: 'm7', username: '@zk_priya', rep: 920, joinedAt: '2024-08-28' },
];

const mockMeetups = [
  {
    id: 'dm1',
    name: 'Welcome Mixer',
    date: '2026-03-15T18:00:00Z',
    attendees: 12,
    status: 'finalized' as const,
    repAwarded: 100,
  },
  {
    id: 'dm2',
    name: 'Builder Workshop #1',
    date: '2026-04-05T17:00:00Z',
    attendees: 8,
    status: 'finalized' as const,
    repAwarded: 150,
  },
  {
    id: 'dm3',
    name: 'Community Townhall',
    date: '2026-05-02T16:00:00Z',
    attendees: 0,
    status: 'upcoming' as const,
    repAwarded: 120,
  },
  {
    id: 'dm4',
    name: 'QR Networking Night',
    date: '2026-05-18T19:00:00Z',
    attendees: 0,
    status: 'upcoming' as const,
    repAwarded: 200,
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { pushToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'meetups'>('overview');
  const [showCreateMeetup, setShowCreateMeetup] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  if (!user?.isHost) {
    router.replace('/profile');
    return null;
  }

  const totalRep = mockMembers.reduce((sum, m) => sum + m.rep, 0);

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-white px-4 pb-8 pt-4">
      <div className="fade-up space-y-4">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BackButton />
            <ArkaMiniLogo size={28} />
          </div>
          <span className="text-sm font-semibold text-arka-pink">Host Dashboard</span>
        </header>

        {/* Community info */}
        <SectionCard>
          <h2 className="text-xl font-bold text-arka-text">My Community</h2>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-white p-3">
              <p className="text-2xl font-bold text-arka-pink">{mockMembers.length}</p>
              <p className="text-xs text-black/50">Members</p>
            </div>
            <div className="rounded-xl bg-white p-3">
              <p className="text-2xl font-bold text-arka-cyan">{mockMeetups.length}</p>
              <p className="text-xs text-black/50">Meetups</p>
            </div>
            <div className="rounded-xl bg-white p-3">
              <p className="text-2xl font-bold text-arka-green">{totalRep}</p>
              <p className="text-xs text-black/50">Total Rep</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-black/50">
            <span>Staked: 5 USDC</span>
            <span>Active for 14 days</span>
          </div>
        </SectionCard>

        {/* Premium upgrade */}
        {!isPremium && (
          <button
            onClick={() => setShowPremiumModal(true)}
            className="w-full rounded-2xl border-2 border-dashed border-arka-purple/30 bg-arka-purple/5 p-4 text-left transition hover:border-arka-purple/50"
          >
            <p className="font-semibold text-arka-purple">Upgrade to Premium Host</p>
            <p className="mt-1 text-sm text-black/50">Unlock meeting rooms, coffee tabs, content monetization & more</p>
            <span className="mt-2 inline-block rounded-full bg-arka-purple/10 px-3 py-1 text-xs font-semibold text-arka-purple">15 USDC/mo →</span>
          </button>
        )}

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-arka-card p-1">
          {(['overview', 'members', 'meetups'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition ${
                activeTab === tab
                  ? 'bg-white text-arka-pink shadow-sm'
                  : 'text-black/50 hover:text-black/70'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <div className="space-y-3">
            <SectionCard>
              <h3 className="font-semibold">Quick Actions</h3>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setActiveTab('meetups'); setShowCreateMeetup(true); }}
                  className="rounded-xl bg-arka-pink py-3 text-sm font-semibold text-white"
                >
                  + New Meetup
                </button>
                <button
                  onClick={() => pushToast('QR matching will be available during meetups')}
                  className="rounded-xl bg-arka-card py-3 text-sm font-semibold text-arka-text"
                >
                  Start QR Match
                </button>
              </div>
            </SectionCard>

            <SectionCard>
              <h3 className="font-semibold">Recent Activity</h3>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between text-black/60">
                  <span>@zk_priya joined</span>
                  <span className="text-xs">2 days ago</span>
                </div>
                <div className="flex items-center justify-between text-black/60">
                  <span>Builder Workshop #1 finalized</span>
                  <span className="text-xs">5 days ago</span>
                </div>
                <div className="flex items-center justify-between text-black/60">
                  <span>@sol_olivia earned 150 rep</span>
                  <span className="text-xs">5 days ago</span>
                </div>
                <div className="flex items-center justify-between text-black/60">
                  <span>@dao_jamal joined</span>
                  <span className="text-xs">1 week ago</span>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-2">
            {mockMembers
              .sort((a, b) => b.rep - a.rep)
              .map((member, i) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-card bg-arka-card px-4 py-3 shadow-card"
                >
                  <div className="flex items-center gap-3">
                    <RankBadge rank={i + 1} />
                    <div>
                      <p className="text-sm font-semibold">{member.username}</p>
                      <p className="text-xs text-black/40">Joined {new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-arka-pink">{member.rep} rep</span>
                </div>
              ))}
          </div>
        )}

        {activeTab === 'meetups' && (
          <div className="space-y-3">
            <button
              onClick={() => setShowCreateMeetup(true)}
              className="w-full rounded-xl bg-arka-pink py-3 text-sm font-semibold text-white"
            >
              + Create New Meetup
            </button>

            {mockMeetups.map((meetup) => (
              <div key={meetup.id} className="rounded-card bg-arka-card p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{meetup.name}</p>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      meetup.status === 'finalized'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-arka-cyan/10 text-arka-cyan'
                    }`}
                  >
                    {meetup.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-black/55">
                  {new Date(meetup.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                {meetup.status === 'finalized' && (
                  <p className="mt-1 text-xs text-black/40">
                    {meetup.attendees} attendees · {meetup.repAwarded} rep awarded each
                  </p>
                )}
                {meetup.status === 'upcoming' && (
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => pushToast('QR matching started for this meetup!')}
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-arka-pink shadow-sm"
                    >
                      Start QR Match
                    </button>
                    <button
                      onClick={() => pushToast('Meetup finalized!')}
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black/60 shadow-sm"
                    >
                      Finalize
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Premium modules */}
        {isPremium && activeTab === 'overview' && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-arka-purple">Premium Modules</h3>
            {[
              { name: 'Meeting Rooms', desc: 'Book and manage rooms for your events', active: true },
              { name: 'Coffee Tabs', desc: 'Members run tabs, settle monthly on-chain', active: true },
              { name: 'Content Vault', desc: 'Monetize slides, recordings, and resources', active: false },
              { name: 'Facility Manager', desc: 'Equipment, spaces, and resource scheduling', active: false },
              { name: 'Events Calendar', desc: 'Advanced calendar with RSVPs and reminders', active: true },
              { name: 'Analytics', desc: 'Member engagement, retention, and growth metrics', active: false },
            ].map((mod) => (
              <div key={mod.name} className="flex items-center justify-between rounded-card bg-arka-card p-4 shadow-card">
                <div>
                  <p className="font-semibold">{mod.name}</p>
                  <p className="text-xs text-black/50">{mod.desc}</p>
                </div>
                <button
                  onClick={() => pushToast(mod.active ? `${mod.name} opened` : `${mod.name} coming soon`)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    mod.active
                      ? 'bg-arka-purple/10 text-arka-purple'
                      : 'bg-black/5 text-black/30'
                  }`}
                >
                  {mod.active ? 'Open' : 'Soon'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Premium Modal */}
        {showPremiumModal && (
          <PremiumModal
            onClose={() => setShowPremiumModal(false)}
            onSuccess={() => {
              setShowPremiumModal(false);
              setIsPremium(true);
              pushToast('Premium Host activated!');
            }}
          />
        )}

        {/* Create Meetup Modal */}
        {showCreateMeetup && (
          <CreateMeetupModal
            onClose={() => setShowCreateMeetup(false)}
            onSuccess={() => {
              setShowCreateMeetup(false);
              pushToast('Meetup created!');
            }}
          />
        )}
      </div>
    </main>
  );
}

function PremiumModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [paying, setPaying] = useState(false);

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => onSuccess(), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-arka-purple">Premium Host</h2>
        <p className="mt-1 text-sm text-black/50">Unlock advanced modules — paid to Arka</p>

        <div className="mt-4 space-y-2 text-sm text-black/55">
          <div className="flex items-center gap-2"><span className="text-arka-purple">+</span> Meeting room management</div>
          <div className="flex items-center gap-2"><span className="text-arka-purple">+</span> Coffee tabs & on-chain settlement</div>
          <div className="flex items-center gap-2"><span className="text-arka-purple">+</span> Content monetization (slides, recordings)</div>
          <div className="flex items-center gap-2"><span className="text-arka-purple">+</span> Facility & equipment scheduling</div>
          <div className="flex items-center gap-2"><span className="text-arka-purple">+</span> Advanced events calendar with RSVPs</div>
          <div className="flex items-center gap-2"><span className="text-arka-purple">+</span> Engagement analytics & metrics</div>
        </div>

        <button
          onClick={handlePay}
          disabled={paying}
          className="mt-5 w-full rounded-xl bg-arka-purple py-3 text-sm font-semibold text-white transition hover:bg-arka-purple/90 disabled:opacity-50"
        >
          {paying ? 'Activating...' : 'Upgrade — 15 USDC/mo'}
        </button>
        <p className="mt-2 text-center text-xs text-black/30">Cancel anytime. Billed monthly on-chain.</p>
      </div>
    </div>
  );
}

function CreateMeetupModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [qrEnabled, setQrEnabled] = useState(false);
  const [qrCount, setQrCount] = useState('3');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-xl font-bold text-arka-text">Create Meetup</h2>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-black/70">Event Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Builder Night"
              className="w-full rounded-xl border border-black/10 bg-arka-card px-4 py-3 text-sm outline-none focus:border-arka-pink"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-black/70">Date & Time</label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-arka-card px-4 py-3 text-sm outline-none focus:border-arka-pink"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-black/70">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Tech Hub, Budapest"
              className="w-full rounded-xl border border-black/10 bg-arka-card px-4 py-3 text-sm outline-none focus:border-arka-pink"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl bg-arka-card p-3">
            <div>
              <p className="text-sm font-medium">QR Matching</p>
              <p className="text-xs text-black/40">Participants find & scan each other</p>
            </div>
            <button
              onClick={() => setQrEnabled(!qrEnabled)}
              className={`h-6 w-11 rounded-full transition ${qrEnabled ? 'bg-arka-pink' : 'bg-black/20'}`}
            >
              <div className={`h-5 w-5 rounded-full bg-white shadow transition ${qrEnabled ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
            </button>
          </div>

          {qrEnabled && (
            <div>
              <label className="mb-1 block text-sm font-medium text-black/70">
                How many scans per user?
              </label>
              <input
                type="number"
                value={qrCount}
                onChange={(e) => setQrCount(e.target.value)}
                min="1"
                max="20"
                className="w-full rounded-xl border border-black/10 bg-arka-card px-4 py-3 text-sm outline-none focus:border-arka-pink"
              />
            </div>
          )}

          <button
            onClick={onSuccess}
            disabled={!name.trim() || !date || !location.trim()}
            className="w-full rounded-xl bg-arka-pink py-3 text-sm font-semibold text-white transition disabled:opacity-40"
          >
            Create Meetup
          </button>
        </div>
      </div>
    </div>
  );
}
