'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ArkaMiniLogo } from '@/components/ArkaLogo';
import { BackButton } from '@/components/BackButton';
import { SectionCard } from '@/components/SectionCard';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ToastProvider';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { pushToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'meetups'>('overview');
  const [showCreateMeetup, setShowCreateMeetup] = useState(false);

  if (!user) {
    router.replace('/');
    return null;
  }

  return (
    <AppShell activeTab="home">
      <header className="flex items-center justify-between">
        <ArkaMiniLogo />
        <BackButton />
      </header>

      <SectionCard>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-arka-text">Host Dashboard</h1>
            <span className="mt-1 inline-block rounded-full bg-arka-pink/10 px-2 py-0.5 text-xs font-semibold text-arka-pink">
              Pro Host
            </span>
          </div>
          <button
            onClick={() => setShowCreateMeetup(true)}
            className="rounded-xl bg-arka-pink px-4 py-2 text-sm font-semibold text-white transition hover:bg-arka-pink/90"
          >
            + Event
          </button>
        </div>
      </SectionCard>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-arka-card p-1">
        {(['overview', 'members', 'meetups'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold capitalize transition ${
              activeTab === tab
                ? 'bg-white text-arka-pink shadow-sm'
                : 'text-black/40 hover:text-black/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-card bg-arka-card p-3 text-center shadow-card">
              <p className="text-2xl font-bold text-arka-text">0</p>
              <p className="text-xs text-black/50">Members</p>
            </div>
            <div className="rounded-card bg-arka-card p-3 text-center shadow-card">
              <p className="text-2xl font-bold text-arka-text">0</p>
              <p className="text-xs text-black/50">Events</p>
            </div>
            <div className="rounded-card bg-arka-card p-3 text-center shadow-card">
              <p className="text-2xl font-bold text-arka-text">0</p>
              <p className="text-xs text-black/50">Revenue</p>
            </div>
          </div>

          {/* Pro Modules */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-arka-purple">Pro Modules</h3>
            {[
              { name: 'Meeting Rooms', desc: 'Book and manage rooms for your events', active: true },
              { name: 'Coffee Tabs', desc: 'Members run tabs, settle monthly on-chain', active: true },
              { name: 'Content Vault', desc: 'Monetize slides, recordings, and resources', active: true },
              { name: 'Facility Manager', desc: 'Equipment, spaces, and resource scheduling', active: true },
              { name: 'Events Calendar', desc: 'Advanced calendar with RSVPs and reminders', active: true },
              { name: 'Analytics', desc: 'Member engagement, retention, and growth metrics', active: true },
              { name: 'Arweave Backup', desc: 'Encrypted event data persistence on Arweave', active: true },
              { name: 'Membership Fees', desc: 'Charge members for community access', active: true },
            ].map((mod) => (
              <div key={mod.name} className="flex items-center justify-between rounded-card bg-arka-card p-4 shadow-card">
                <div>
                  <p className="font-semibold">{mod.name}</p>
                  <p className="text-xs text-black/50">{mod.desc}</p>
                </div>
                <button
                  onClick={() => pushToast(`${mod.name} — coming soon!`)}
                  className="rounded-lg bg-arka-purple/10 px-3 py-1.5 text-xs font-semibold text-arka-purple"
                >
                  Open
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Members */}
      {activeTab === 'members' && (
        <SectionCard>
          <p className="text-center text-sm text-black/40">No members yet. Share your community link to invite people!</p>
        </SectionCard>
      )}

      {/* Meetups */}
      {activeTab === 'meetups' && (
        <SectionCard>
          <p className="text-center text-sm text-black/40">No events yet. Create your first event!</p>
          <button
            onClick={() => setShowCreateMeetup(true)}
            className="mt-3 w-full rounded-xl bg-arka-pink py-3 text-sm font-semibold text-white"
          >
            Create Event
          </button>
        </SectionCard>
      )}

      {/* Create Meetup Modal */}
      {showCreateMeetup && (
        <CreateMeetupModal
          onClose={() => setShowCreateMeetup(false)}
          onSuccess={() => {
            setShowCreateMeetup(false);
            pushToast('Event created!');
          }}
        />
      )}
    </AppShell>
  );
}

function CreateMeetupModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = () => {
    if (!name.trim() || !date) return;
    setCreating(true);
    // TODO: Call CommunityRegistry.createEvent on-chain
    setTimeout(() => onSuccess(), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-arka-text">Create Event</h2>
        <p className="mt-1 text-sm text-black/50">On-chain event, verifiable attendance</p>
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-black/70">Event Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. April Meetup"
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
        </div>
        <button
          onClick={handleCreate}
          disabled={!name.trim() || !date || creating}
          className="mt-4 w-full rounded-xl bg-arka-pink py-3 text-sm font-semibold text-white disabled:opacity-40"
        >
          {creating ? 'Creating on-chain...' : 'Create Event'}
        </button>
      </div>
    </div>
  );
}
