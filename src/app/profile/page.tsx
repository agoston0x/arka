'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ArkaMiniLogo } from '@/components/ArkaLogo';
import { SectionCard } from '@/components/SectionCard';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ToastProvider';
import { HostIcon } from '@/components/Icons';
import { truncateAddress } from '@/lib/mock-data';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { pushToast } = useToast();
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showHostModal, setShowHostModal] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [communities, setCommunities] = useState<{ name: string; desc: string }[]>([]);

  if (!user) {
    router.replace('/');
    return null;
  }

  return (
    <AppShell activeTab="home">
      <header className="flex items-center justify-between">
        <ArkaMiniLogo size={36} />
        <button
          onClick={() => setShowUserInfo(!showUserInfo)}
          className="text-sm font-semibold text-arka-pink"
        >
          {user.username}
        </button>
      </header>

      {/* Wallet info */}
      {showUserInfo && (
        <SectionCard>
          <p className="text-sm text-black/70">Wallet</p>
          <p className="mt-1 font-mono text-sm font-semibold">{truncateAddress(user.address)}</p>
          <p className="mt-2 text-xs text-black/40">Connected via Dynamic</p>
          <button
            onClick={signOut}
            className="mt-3 w-full rounded-xl border border-black/10 py-2 text-sm text-black/50 transition hover:bg-black/5"
          >
            Sign Out
          </button>
        </SectionCard>
      )}

      {/* Host section */}
      {!isHost ? (
        <SectionCard>
          <button onClick={() => setShowHostModal(true)} className="w-full text-left">
            <p className="font-semibold text-arka-text">Become a Community Host</p>
            <p className="mt-1 text-sm text-black/55">
              Create your own community, manage events, charge memberships, and more.
            </p>
            <span className="mt-2 inline-block rounded-full bg-arka-pink/10 px-3 py-1 text-xs font-semibold text-arka-pink">
              15 USDC/mo →
            </span>
          </button>
        </SectionCard>
      ) : (
        <>
          <SectionCard>
            <Link href="/dashboard" className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <HostIcon className="h-4 w-4 text-arka-pink" />
                  <p className="font-semibold text-arka-pink">Host Dashboard</p>
                </div>
                <p className="mt-1 text-sm text-black/55">
                  {communities.length} {communities.length === 1 ? 'community' : 'communities'}
                </p>
              </div>
              <span className="text-black/30">→</span>
            </Link>
          </SectionCard>
        </>
      )}

      {/* Communities */}
      {communities.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">My Communities</h2>
          {communities.map((c, i) => (
            <div key={i} className="rounded-card bg-arka-card p-4 shadow-card">
              <p className="font-semibold">{c.name}</p>
              <p className="mt-1 text-sm text-black/55">{c.desc}</p>
            </div>
          ))}
        </section>
      )}

      {/* Empty state for new users */}
      {!isHost && communities.length === 0 && (
        <SectionCard>
          <p className="text-center text-sm text-black/40">
            You haven&apos;t joined any communities yet. Explore or become a host!
          </p>
          <Link
            href="/communities"
            className="mt-3 block w-full rounded-xl bg-arka-card py-3 text-center text-sm font-semibold text-arka-text transition hover:bg-black/5"
          >
            Explore Communities
          </Link>
        </SectionCard>
      )}

      {/* Create event — anyone can do this */}
      <SectionCard>
        <button
          onClick={() => pushToast('Event creation coming soon!')}
          className="w-full text-left"
        >
          <p className="font-semibold text-arka-text">Create an Event</p>
          <p className="mt-1 text-sm text-black/55">
            Start a standalone meetup — no community needed.
          </p>
        </button>
      </SectionCard>

      {/* Host Modal */}
      {showHostModal && (
        <HostSubscriptionModal
          onClose={() => setShowHostModal(false)}
          onSuccess={(name, desc) => {
            setShowHostModal(false);
            setIsHost(true);
            setIsPremium(true);
            setCommunities((prev) => [...prev, { name, desc }]);
            pushToast(`${name} created! You are now a host.`);
          }}
        />
      )}
    </AppShell>
  );
}

function HostSubscriptionModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (name: string, desc: string) => void;
}) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [paying, setPaying] = useState(false);

  const handleSubscribe = () => {
    if (!name.trim() || !desc.trim()) return;
    setPaying(true);
    // TODO: Real USDC payment via Dynamic wallet
    setTimeout(() => {
      onSuccess(name, desc);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-arka-text">Become a Host</h2>
        <p className="mt-1 text-sm text-black/50">Create your community with all pro features</p>

        <div className="mt-4 rounded-xl bg-arka-card p-4">
          <p className="text-sm font-semibold">What you get:</p>
          <div className="mt-2 space-y-1 text-sm text-black/55">
            <p>· Create & manage communities</p>
            <p>· Charge membership fees</p>
            <p>· Meeting room & facility management</p>
            <p>· Coffee tabs with on-chain settlement</p>
            <p>· Content monetization (slides, recordings)</p>
            <p>· Persistent event data on Arweave</p>
            <p>· Advanced calendar with RSVPs</p>
            <p>· Engagement analytics</p>
          </div>
          <p className="mt-3 text-lg font-bold text-arka-pink">15 USDC/mo</p>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-black/70">Community Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ETH Budapest"
              className="w-full rounded-xl border border-black/10 bg-arka-card px-4 py-3 text-sm outline-none focus:border-arka-pink focus:ring-1 focus:ring-arka-pink"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-black/70">Description</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What's your community about?"
              rows={3}
              className="w-full resize-none rounded-xl border border-black/10 bg-arka-card px-4 py-3 text-sm outline-none focus:border-arka-pink focus:ring-1 focus:ring-arka-pink"
            />
          </div>
        </div>

        <button
          onClick={handleSubscribe}
          disabled={!name.trim() || !desc.trim() || paying}
          className="mt-4 w-full rounded-xl bg-arka-pink py-3 text-sm font-semibold text-white transition hover:bg-arka-pink/90 disabled:opacity-40"
        >
          {paying ? 'Processing payment...' : 'Subscribe & Create — 15 USDC/mo'}
        </button>
        <p className="mt-2 text-center text-xs text-black/30">Cancel anytime. Data persists even after cancellation.</p>
      </div>
    </div>
  );
}
